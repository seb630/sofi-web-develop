import mirror, { actions, connect } from 'mirrorx'
import { globalConstants } from '@/_constants'
import GlancePage from '../pages/Glance/GlancePage'
import { requireActivate } from '@/utility/Common'

let interval1 = 0
let interval2 = 0

mirror.hook((action, getState) => {
    const {routing: {location}, hub: { hubs }} = getState()
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname === '/glance') {
        hubs && hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchData(getState()))
            : fetchData(getState())
        clearInterval(interval1)
        interval1 = setInterval(() =>
            actions.hub.getHubAnomalies({hubId: getState().hub.selectedHub.hub_id}), 60000) //1 min
        clearInterval(interval2)
        interval2 = setInterval(() =>
            fetchSensorAndHub(getState().hub.selectedHub.hub_id), 180000) //3 mins
    }


    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname !== '/glance') {
        clearInterval(interval1)
        clearInterval(interval2)
    }
})

function fetchData(state) {
    const { billing: { bypassPayment, bypassDisable }, SIM: {bypassSIMActivation}, hub} = state
    const {selectedHub} = hub
    const hubId = selectedHub.hub_id
    if (selectedHub) {
        fetchSensorAndHub(hubId)
        actions.hub.getHubAnomalies({hubId})
        actions.billing.fetchDisableStatus(hubId).then((disabledStatus)=>{
            if( !bypassDisable && (disabledStatus?.is_disabled)){
                actions.routing.push('/disabled/Home')
            }else {
                actions.billing.fetchSubscription(hubId).then((paymentRequired)=>{
                    if( !bypassPayment && paymentRequired){
                        actions.routing.push('/unpaid/Home')
                    }else {
                        actions.SIM.fetchSIMByProduct({ type: 'HUB', macOrImei: selectedHub.mac_address }).then((activation) => {
                            if (!bypassSIMActivation && requireActivate(activation)) {
                                actions.routing.push('/SIM-activation/Home')
                            }
                        })
                    }
                })}
        })
    }
}

function fetchSensorAndHub(hubId) {
    actions.hub.getSensors(hubId)
    actions.hub.getHubStatus(hubId)
}

export default connect(state => state.hub) (GlancePage)

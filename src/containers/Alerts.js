import mirror, { actions } from 'mirrorx'
import { globalConstants } from '@/_constants'
import AlertsPage from '../pages/Anomaly/AlertsPage'
import moment from 'moment'
import { requireActivate } from '@/utility/Common'

// listen to route change,
// when is entering `/dashboard`, load data
mirror.hook((action, getState) => {
    const {routing: {location}} = getState()
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname === '/alerts') {
        getState().hub.hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchData(getState()))
            : fetchData(getState())
    }
})

function fetchData(state) {
    const { billing: { bypassPayment, bypassDisable }, SIM: {bypassSIMActivation}, hub} = state
    const {selectedHub} = hub
    const hubId = selectedHub.hub_id
    const date = hub.anomalyMonth
    const fromTime = moment(date).startOf('month')
    const toTime = moment(date).endOf('month')
    actions.hub.getDetailedAnomalies({hubId, fromTime, toTime, size: globalConstants.TIMELINE_SIZE, page: 0 })
    actions.hub.getUnResolvedAnomalies(hubId)
    actions.billing.fetchDisableStatus(hubId).then((disabledStatus)=>{
        if( !bypassDisable && (disabledStatus?.is_disabled)){
            actions.routing.push('/disabled/Home')
        }else {
            actions.SIM.fetchSIMByProduct({type: 'HUB', macOrImei: selectedHub.mac_address}) .then((activation)=>{
                if( !bypassSIMActivation && requireActivate(activation)){
                    actions.routing.push('/SIM-activation/Home')
                }else if (bypassSIMActivation || !activation || activation?.sim_status==='ACTIVE' || activation?.skip_activation){
                    actions.billing.fetchSubscription(hubId).then((paymentRequired)=>{
                        if( !bypassPayment && paymentRequired ){
                            actions.routing.push('/unpaid/Home')
                        }
                    })
                }
            })
        }
    })
}

export default AlertsPage

import mirror, { actions, connect } from 'mirrorx'
import { globalConstants } from '@/_constants'
import MedicationPage from '../pages/Activity/MedicationPage'
import moment from 'moment/moment'
import { requireActivate } from '@/utility/Common'

mirror.hook((action, getState) => {
    const {routing: {location}} = getState()
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname === '/medication') {
        getState().hub.hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchData(getState()))
            : fetchData(getState())
    }
})

function fetchData(state) {

    const { billing: { bypassPayment, bypassDisable }, SIM: {bypassSIMActivation}, hub} = state
    const {selectedHub} = hub
    const hubId = selectedHub.hub_id
    if (selectedHub) {
        const fromTime = moment().day(1).weeks(moment().local().weeks()).set({hour:0,minute:0,second:0})
        const toTime = moment().day(0).weeks(moment().local().weeks() + 1).set({hour:23,minute:59,second:59})
        actions.hub.getDetailedMedication({hubId,fromTime, toTime, size: globalConstants.TIMELINE_SIZE, page: 0 })
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

export default connect(state => state.hub) (MedicationPage)

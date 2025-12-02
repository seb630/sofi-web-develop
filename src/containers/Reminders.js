import mirror, { actions, connect } from 'mirrorx'
import ReminderPage from '../pages/Reminder/RemindersPage'
import { globalConstants } from '@/_constants'
import { requireActivate } from '@/utility/Common'

// listen to route change,
// when is entering `/dashboard`, load data
mirror.hook((action, getState) => {
    const {routing: {location}} = getState()
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname === '/reminders') {
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
        actions.setting.getSettings(hubId)
        actions.setting.getReminders(hubId)
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
                })
            }
        })
    }
}


export default connect(state => state.setting) (ReminderPage)

import mirror, { actions, connect } from 'mirrorx'
import EventRulePage from '../pages/EventRule/EventRulePage'
import { globalConstants } from '@/_constants'
import { requireActivate } from '@/utility/Common'

// listen to route change,
// when is entering `/dashboard`, load data
mirror.hook((action, getState) => {
    const {routing: {location}, hub: {hubs}} = getState()
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/rules')) {
        hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchEventRuleData(getState))
            : fetchEventRuleData(getState)
    }

    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/rules/history')) {
        hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchEventRuleLogData(getState))
            : fetchEventRuleLogData(getState)
    }

})

function fetchEventRuleData(getState) {
    const { hub: { selectedHub },billing: { bypassPayment, bypassDisable }, SIM: {bypassSIMActivation}, } = getState()
    if (selectedHub) {
        const hubId = selectedHub.hub_id
        actions.hub.getEventRules(selectedHub.hub_id)
        actions.hub.getSensors(selectedHub.hub_id)
        actions.hub.getHubSpaces(selectedHub.hub_id)
        actions.hub.getHubDevices(selectedHub.hub_id)
        actions.hub.getHubUsers(selectedHub.hub_id)

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

function fetchEventRuleLogData(getState) {
    const { hub: { selectedHub }} = getState()
    if (selectedHub) {
        fetchEventRuleData(getState)
        actions.hub.getEventRuleLogs(selectedHub.hub_id)
    }
}

export default connect(state => state.hub) (EventRulePage)

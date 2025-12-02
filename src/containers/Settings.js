import mirror, { actions, connect } from 'mirrorx'
import SettingPage from '../pages/Settings/SettingsPage'
import { globalConstants } from '@/_constants'
import { requireActivate } from '@/utility/Common'

// listen to route change,
// when is entering `/dashboard`, load data
mirror.hook((action, getState) => {
    const {routing: {location}, hub: {hubs}} = getState()
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/settings')) {
        hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchPersonalData(getState))
            : fetchPersonalData(getState)
    }

    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/settings/anomaly')) {
        hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchAnomalyData(getState))
            : fetchAnomalyData(getState)
    }
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/settings/advanced')) {
        hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchAdvanceData(getState))
            : fetchAdvanceData(getState)
    }
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/settings/sensor')) {
        hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchSensorData(getState))
            : fetchSensorData(getState)
    }
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/settings/subscription')) {
        hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchSubscriptionData(getState))
            : fetchSubscriptionData(getState)
    }
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/settings/notification')) {
        hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchNotificationData(getState))
            : fetchNotificationData(getState)
    }
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/settings/beacon')) {
        hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchBeaconData(getState))
            : fetchBeaconData(getState)
    }
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/settings/carer')) {
        hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchCarerData(getState))
            : fetchCarerData(getState)
    }
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/settings/holiday')) {
        hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchHolidayData(getState))
            : fetchHolidayData(getState)
    }
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/settings/wifi')) {
        hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchNetworkData(getState))
            : fetchNetworkData(getState)
    }
})

function fetchUserData (userId){
    actions.sofiBeacon.fetchBeaconByUser()
    actions.user.getUserHubs(userId)
}

function fetchPersonalData(getState) {
    const { billing: { bypassPayment, bypassDisable }, SIM: {bypassSIMActivation}, hub} = getState()
    const {selectedHub} = hub
    const hubId = selectedHub.hub_id
    if (selectedHub) {
        actions.setting.getSettings(hubId)
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

function fetchAdvanceData(getState) {
    const { hub: { selectedHub }, setting: {ttsSpeed, ttsVoice}} = getState()
    if (selectedHub) {
        actions.setting.getSettings(selectedHub.hub_id)
        actions.setting.getFeatureFlags(selectedHub.hub_id)
        !ttsVoice && actions.setting.getTTSVoice()
        !ttsSpeed && actions.setting.getTTSSpeed()
    }
}

function fetchAnomalyData(getState) {
    const { hub: { selectedHub }} = getState()
    if (selectedHub) {
        actions.hub.getHubUsers(selectedHub.hub_id)
        actions.hub.getHubSpaces(selectedHub.hub_id)
        actions.hub.getHubDevices(selectedHub.hub_id)
        actions.setting.getSettings(selectedHub.hub_id)
        actions.setting.getFeatureFlags(selectedHub.hub_id)
        actions.setting.getAnomalyPreferences(selectedHub.hub_id)
    }
}

function fetchSubscriptionData(getState) {
    const { hub: { selectedHub }} = getState()
    if (selectedHub) {
        actions.billing.fetchSubscription(selectedHub.hub_id)
        actions.billing.fetchStripePlan('hub')
    }
}

function fetchSensorData(getState) {
    const { hub: { selectedHub }} = getState()
    if (selectedHub) {
        actions.hub.getSensors(selectedHub.hub_id)
        actions.hub.getHubSpaces(selectedHub.hub_id)
        actions.hub.getHubDevices(selectedHub.hub_id)
        actions.hub.getHubNewDevices(selectedHub.hub_id)
        actions.hub.getHubUsers(selectedHub.hub_id)
        actions.user.dashboardOverview()
    }
}

function fetchBeaconData(getState) {
    const { hub: { selectedHub }, user: { me }} = getState()
    if (selectedHub) {
        actions.hub.fetchHubBeacon(selectedHub.hub_id)
        actions.user.dashboardOverview()
    }

    me ?  fetchUserData (me.user_id) : actions.user.me().then(() => {
        fetchUserData (getState().user.me.user_id)
    })
}

function fetchCarerData(getState) {
    const { hub: { selectedHub }} = getState()
    if (selectedHub) {
        actions.hub.getHubUsers(selectedHub.hub_id)
        actions.user.getInvitationByHub (selectedHub.hub_id)
    }
}

function fetchNetworkData(getState) {
    const { hub: { selectedHub }} = getState()
    if (selectedHub) {
        actions.hub.getHubNetwork(selectedHub.hub_id)
    }
}

function fetchHolidayData(getState) {
    const { hub: { selectedHub }} = getState()
    if (selectedHub) {
        actions.setting.getHolidays(selectedHub.hub_id)
    }
}

function fetchNotificationData(getState) {
    const { hub: { selectedHub }, user: { me }} = getState()
    if (selectedHub) {
        actions.setting.getFeatureFlags(selectedHub.hub_id)
        actions.hub.getHubUsers(selectedHub.hub_id)
    }

    me ?  actions.user.getUserHubs(me.user_id) : actions.user.me().then(() => {
        actions.user.getUserHubs (getState().user.me.user_id)
    })
}

export default connect(state => state.setting) (SettingPage)

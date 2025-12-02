import mirror, { actions, connect } from 'mirrorx'
import AdminPage from '../pages/Admin/AdminPage'
import { globalConstants } from '@/_constants'

// listen to route change,
// when is entering `/dashboard`, load data
mirror.hook((action, getState) => {
    const {routing: {location}, hub: {hubs}} = getState()
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/admin')) {
        hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchData(getState().hub.selectedHub))
            : fetchData(getState().hub.selectedHub)
    }
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/admin/anomaly')) {
        hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchAnomalyData(getState().hub.selectedHub))
            : fetchAnomalyData(getState().hub.selectedHub)
    }
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/admin/features')) {
        hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchAnomalyData(getState().hub.selectedHub))
            : fetchAnomalyData(getState().hub.selectedHub)
    }
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/admin/users')) {
        hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchUserData(getState().hub.selectedHub))
            : fetchUserData(getState().hub.selectedHub)
    }if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/admin/resource')) {
        hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchStatusData(getState().hub.selectedHub))
            : fetchStatusData(getState().hub.selectedHub)
    }
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/admin/billing')) {
        hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchBillingData(getState().hub.selectedHub))
            : fetchBillingData(getState().hub.selectedHub)
    }
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/admin/tpi')) {
        hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchTPIData(getState))
            : fetchTPIData(getState)
    }
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith( '/admin/orgs')) {
        hubs.length === 0 ? actions.hub.getSofiDevices().then(() => fetchOrgData(getState().hub.selectedHub))
            : fetchOrgData(getState().hub.selectedHub)
    }
})

function fetchData(selectedHub) {
    if (selectedHub){
        actions.hub.getHubStatus(selectedHub.hub_id)
        actions.setting.getSettings(selectedHub.hub_id)
        actions.hub.getHubOrgs(selectedHub.hub_id)
        actions.billing.fetchDisableStatus(selectedHub.hub_id)
        actions.billing.fetchSubscription(selectedHub.hub_id)
        actions.billing.fetchSubscriptionStatus()
        actions.billing.fetchSubscriptionConditions()
        actions.hub.getHubOrgs(selectedHub.hub_id)
        actions.hub.getHubUsers(selectedHub.hub_id)
        actions.SIM.fetchSIMByProduct({type: 'HUB', macOrImei: selectedHub.mac_address})
        actions.SIM.fetchProviders()
    }
}

function fetchStatusData(selectedHub) {
    if (selectedHub){
        actions.hub.getHubStatus(selectedHub.hub_id)
    }
}

function fetchBillingData(selectedHub) {
    if (selectedHub){
        actions.billing.fetchSubscription(selectedHub.hub_id)
        actions.billing.fetchSubscriptionStatus()
        actions.billing.fetchSubscriptionConditions()
    }
}

function fetchAnomalyData(selectedHub) {
    if (selectedHub){
        actions.hub.getHubUsers(selectedHub.hub_id)
        actions.setting.getFeatureFlags(selectedHub.hub_id)
        actions.setting.getAnomalyPreferences(selectedHub.hub_id)
    }
}

function fetchUserData(selectedHub) {
    if (selectedHub){
        actions.user.getAllUsers()
    }
}

function fetchOrgData(selectedHub) {
    if (selectedHub){
        actions.hub.getHubOrgs(selectedHub.hub_id)
        actions.organisation.fetchAllOrgs()
    }
}

function fetchTPIData(getState) {
    const {hub:{selectedHub}, thirdParty: {TPDestinations, TPKinds}, user:{me}} = getState()
    const isAdmin = me?.authorities.some(role=>role.includes('ADMIN'))
    if (selectedHub){
        actions.hub.getTPAccounts(selectedHub.hub_id)
        !TPDestinations && actions.thirdParty.fetchAllDestination()
        !isAdmin && actions.hub.getHubTPCandidates(selectedHub.hub_id)
        !TPKinds && actions.thirdParty.fetchAllKinds()
    }
}


export default connect(state => state.setting) (AdminPage)

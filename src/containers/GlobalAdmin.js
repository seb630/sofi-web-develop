import mirror, { actions, connect } from 'mirrorx'
import GlobalAdminPage from '../pages/GlobalAdmin/GlobalAdmin'
import { globalConstants } from '@/_constants'

// listen to route change,
// when is entering `/dashboard`, load data
mirror.hook((action, getState) => {
    const {routing: {location} , APN: { adminAPN }, sofiBeacon: {beaconModels}, billing: {subscriptionStatus}} = getState()
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/globalAdmin/user')) {
        fetchData(getState())
    }
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/globalAdmin/hub-invite')) {
        actions.user.getAllInvitation()
        actions.common.save({
            adminPortal: true
        })
    }
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/globalAdmin/beacon-invite')) {
        actions.user.getAllBeaconInvitation()
        actions.common.save({
            adminPortal: true
        })
    }
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/globalAdmin/radar-invite')) {
        actions.user.getAllRadarInvitation()
        actions.common.save({
            adminPortal: true
        })
    }
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/globalAdmin/release')) {
        actions.release.getReleases()
        actions.common.save({
            adminPortal: true
        })
    }

    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/globalAdmin/release-dashboard')) {
        actions.hub.getHubs()
    }

    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/globalAdmin/brelease')) {
        actions.release.getBeaconReleases()
        actions.sofiBeacon.fetchAllBeacons()
        !beaconModels &&actions.sofiBeacon.getBeaconModels()
        actions.common.save({
            adminPortal: true
        })
    }
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/globalAdmin/rrelease')) {
        actions.release.getRadarReleases()
        actions.radar.fetchAllRadars()
        actions.common.save({
            adminPortal: true
        })
    }

    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/globalAdmin/hub')) {
        actions.hub.getHubs()
        actions.common.save({
            adminPortal: true
        })
    }

    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/globalAdmin/beacon')) {
        actions.sofiBeacon.fetchAllBeacons()
        actions.organisation.fetchAllOrgs()
        !beaconModels && actions.sofiBeacon.getBeaconModels()
        !subscriptionStatus && actions.billing.fetchSubscriptionStatus()
        actions.billing.fetchSubscriptionConditions()
        actions.common.save({
            adminPortal: true
        })

        if(adminAPN === null) {
            actions.APN.fetchAllApn()
        }
    }

    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/globalAdmin/radar')) {
        actions.radar.fetchAllRadars()
        actions.organisation.fetchAllOrgs()
        !subscriptionStatus && actions.billing.fetchSubscriptionStatus()
        actions.common.save({
            adminPortal: true
        })
    }


    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/globalAdmin/apn')) {
        actions.APN.fetchAllApn()
        actions.organisation.fetchAllOrgs()
        actions.sofiBeacon.fetchAllBeacons()
        actions.common.save({
            adminPortal: true
        })
    }

    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/globalAdmin/tp')) {
        actions.thirdParty.fetchAllDestination()
        actions.thirdParty.fetchAllKinds()
        actions.organisation.fetchAllOrgs()
        actions.common.save({
            adminPortal: true
        })
    }

    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/globalAdmin/SIM')) {
        actions.SIM.fetchAllActivations()
        actions.SIM.fetchProviders()
        actions.SIM.fetchSSDeactivations()
        actions.common.save({
            adminPortal: true
        })
    }

    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/globalAdmin/organisation')) {
        actions.organisation.fetchAllOrgs()
        // !orgContactType && actions.organisation.fetchContactTypes()
        actions.common.save({
            adminPortal: true
        })
    }

    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/globalAdmin/subscriptions')) {
        actions.billing.fetchAllSubscriptions()
        actions.sofiBeacon.fetchAllBeacons()
        actions.hub.getHubs()
        actions.common.save({
            adminPortal: true
        })
    }

    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/globalAdmin/features')) {
        actions.common.save({
            adminPortal: true
        })
    }

    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/globalAdmin/bulk-upload')) {
        actions.sofiBeacon.fetchBulkUploadBeaconList()
        actions.common.save({
            adminPortal: true
        })
    }

    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/globalAdmin/bulk-phone')) {
        actions.sofiBeacon.fetchBatchUpdateList()
        actions.sofiBeacon.fetchAllBeacons()
        actions.organisation.fetchAllOrgs()
        actions.common.save({
            adminPortal: true
        })
    }
})

function fetchData(state) {
    actions.user.getAllUsers()
    state.sofiBeacon.headStates == null && actions.sofiBeacon.fetchAllBeacons()
    actions.common.save({
        adminPortal: true
    })
}

export default connect(state => state) (GlobalAdminPage)

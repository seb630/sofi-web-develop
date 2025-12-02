import mirror, { actions, connect } from 'mirrorx'
import SofiBeaconPage from '../pages/SofiBeacon/SofiBeaconPage'
import { globalConstants } from '@/_constants'
import { requireActivate, timeout } from '@/utility/Common'
import moment from 'moment'

let interval = 0

// listen to route change,
// when is entering `/beacon/{...}`, load data
mirror.hook((action, getState) => {
    const {routing: { location }, sofiBeacon: {beacons}, auth: {authToken} } = getState()
    if (authToken)
    {
        if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith('/beacon') ) {
            beacons.length===0 ? actions.hub.getSofiDevices().then(() => fetchBeaconGeneral(getState))
                : fetchBeaconGeneral(getState)
        }

        if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith('/beacon/history') ) {
            beacons.length===0 ? actions.hub.getSofiDevices().then(() => fetchBeaconHistory(getState))
                : fetchBeaconHistory(getState)
        }
        else if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith('/beacon/settings') ) {
            beacons.length===0 ? actions.hub.getSofiDevices().then(() => fetchBeaconSettings(getState))
                : fetchBeaconSettings(getState)
        }
        else if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith('/beacon/geofence') ) {
            beacons.length===0 ? actions.hub.getSofiDevices().then(() => fetchBeaconGeofence(getState))
                : fetchBeaconGeofence(getState)
        }
        else if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith('/beacon/alerts') ) {
            beacons.length===0 ? actions.hub.getSofiDevices().then(() => fetchBeaconAlerts(getState))
                : fetchBeaconAlerts(getState)
        }
        else if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith('/beacon/admin') ) {
            beacons.length===0 ? actions.hub.getSofiDevices().then(() => fetchBeaconAdmin(getState))
                : fetchBeaconAdmin(getState)
        } else if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith('/beacon/dashboard') ) {
            beacons.length===0 ? actions.hub.getSofiDevices().then(() => fetchBeaconDashboard(getState))
                : fetchBeaconDashboard(getState)

            clearInterval(interval)
            interval = setInterval(async () => {
                const { sofiBeacon:{ selectedBeacon }, common: {loneWorkerEnabled}, user: {me} } = getState()
                await actions.sofiBeacon.fetchBeaconHeadState(selectedBeacon?.pub_id)
                await loneWorkerEnabled && actions.user.getLoneWorkerMonitors(me?.user_id)
            }, globalConstants.BEACON_AUTO_REFRESH_TIME)
        }

        if (action.type === globalConstants.LOCATION_CHANGE && location.pathname !=='/beacon/dashboard') {
            clearInterval(interval)
        }
    }

})

function fetchBeaconGeneral(getState) {
    const { sofiBeacon: { selectedBeacon }, billing: {bypassPayment, bypassDisable}, SIM: {bypassSIMActivation}, } = getState()
    let promises = []

    if (selectedBeacon) {
        actions.sofiBeacon.setLoading(true)
        Object.keys(globalConstants.PORTAL_FUNCTIONS).map(feature =>
            promises.push(actions.common.fetchProductFunctions({function: feature, productType:'BEACON', productId: selectedBeacon.pub_id}))
        )
        promises.push(actions.billing.fetchDisableStatus(selectedBeacon.pub_id).then((disabledStatus)=>{
            if( !bypassDisable && (disabledStatus?.is_disabled)){
                actions.routing.push('/disabled/Beacon')
            }else {
                actions.billing.fetchSubscription(selectedBeacon.pub_id).then((paymentRequired)=>{
                    if( !bypassPayment && paymentRequired){
                        actions.routing.push('/unpaid/Beacon')
                    }else{
                        actions.SIM.fetchSIMByProduct({type: 'BEACON', macOrImei: selectedBeacon.imei}).then((activation)=>{
                            if( !bypassSIMActivation && requireActivate(activation)){
                                actions.routing.push('/SIM-activation/Beacon')
                            }
                        })
                    }
                })
            }
        }))
        timeout(Promise.all(promises), globalConstants.DASHBOARD_TIMEOUT_TIME).finally(()=>{
            actions.sofiBeacon.setLoading(false)
        })
    }
}

function fetchBeaconDashboard(getState) {
    const { sofiBeacon: { selectedBeacon }} = getState()
    actions.sofiBeacon.fetchBeaconHeadState(selectedBeacon?.pub_id)
}


function fetchBeaconAlerts(getState) {
    const { sofiBeacon: { selectedBeacon, anomalyDate }, routing: { location }} = getState()
    if (selectedBeacon) {
        actions.sofiBeacon.fetchBeaconHeadState(selectedBeacon.pub_id)
        actions.sofiBeacon.fetchBeaconEmergencyContacts(selectedBeacon.pub_id)
        let date
        if (location?.state?.backDate){
            date = anomalyDate
        }else {
            actions.sofiBeacon.save({anomalyDate: moment()})
            date = moment()
        }
        actions.sofiBeacon.fetchBeaconAlertHistory({beaconId: selectedBeacon.id,
            startDate: date.clone().startOf(globalConstants.BEACON_HISTORY_TIME_UNIT).add(globalConstants.BEACON_BANNER_TIMEOUT * -1, 'minute'),
            endDate: date.clone().endOf(globalConstants.BEACON_HISTORY_TIME_UNIT).add(globalConstants.BEACON_BANNER_TIMEOUT, 'minute'),
        })
    }
}


function fetchBeaconGeofence(getState) {
    const { sofiBeacon: { selectedBeacon }} = getState()
    if (selectedBeacon) {
        actions.sofiBeacon.fetchBeaconHeadState(selectedBeacon.pub_id)
        actions.sofiBeacon.getBeaconGeofence(selectedBeacon.pub_id)
        actions.sofiBeacon.fetchBeaconUsers(selectedBeacon.pub_id)
    }
}

function fetchBeaconHistory(getState) {
    const { sofiBeacon: { selectedBeacon }} = getState()
    // const startDate = moment().hour(0).minute(0).second(0).toDate()
    // const endDate = moment()
    if (selectedBeacon) {
        actions.sofiBeacon.fetchBeaconHeadState(selectedBeacon.pub_id)
        // actions.sofiBeacon.fetchBeaconGpsHistory({ beaconId : selectedBeacon.pub_id, startDate , endDate })
    }
}

function fetchBeaconSettings(getState) {
    const { sofiBeacon: {selectedBeacon, beaconFeatures, powerOptions}, routing: {location}} = getState()
    actions.sofiBeacon.fetchBeaconHeadState(selectedBeacon?.pub_id)

    if (selectedBeacon) {
        actions.sofiBeacon.getBeaconSettings(selectedBeacon.pub_id)
        !beaconFeatures && actions.sofiBeacon.getBeaconFeatures()
        !powerOptions && actions.sofiBeacon.getBeaconPowerOptions(selectedBeacon.pub_id)
        if (location.pathname.startsWith('/beacon/settings/general') ) {
            actions.sofiBeacon.fetchBeaconEmergencyContacts(selectedBeacon.pub_id)
        }
        if (location.pathname.startsWith('/beacon/settings/subscription') ) {
            actions.billing.fetchSubscription(selectedBeacon.pub_id)
            actions.billing.fetchStripePlanByPubId({product:'beacon',pub_id:selectedBeacon.pub_id})
        }
        if (location.pathname.startsWith('/beacon/settings/carer') ) {
            actions.sofiBeacon.fetchBeaconUsers(selectedBeacon.pub_id)
            actions.user.getInvitationByBeacon(selectedBeacon.pub_id)
        }
        if (location.pathname.startsWith('/beacon/settings/hub') ) {
            actions.user.dashboardOverview()
            actions.sofiBeacon.fetchLinkedHub(selectedBeacon.pub_id)
            selectedBeacon.hub_id && actions.setting.getReminders(selectedBeacon.hub_id)
            actions.sofiBeacon.getBeaconAlert(selectedBeacon.pub_id)
        }
    }
}

function fetchBeaconAdmin(getState) {
    fetchBeaconDashboard(getState)
    const { sofiBeacon: {selectedBeacon, beaconModels, beaconFeatures, powerOptions}, routing: {location}, thirdParty: {TPDestinations, TPKinds}, user:{me}, SIM: {providers}} = getState()
    const isAdmin = me?.authorities.some(role=>role.includes('ADMIN'))
    actions.sofiBeacon.fetchBeaconHeadState(selectedBeacon?.pub_id)
    if (selectedBeacon) {
        actions.sofiBeacon.getBeaconOrgs(selectedBeacon.pub_id)
        actions.sofiBeacon.getBeaconSettings(selectedBeacon.pub_id)
        !beaconFeatures && actions.sofiBeacon.getBeaconFeatures()
        !powerOptions && actions.sofiBeacon.getBeaconPowerOptions(selectedBeacon.pub_id)
        if (location.pathname.startsWith('/beacon/admin/detail') ) {
            isAdmin ? actions.APN.fetchAllApn() : actions.APN.fetchBeaconApn(selectedBeacon.pub_id)
            actions.billing.fetchDisableStatus(selectedBeacon.pub_id)
            !beaconModels && actions.sofiBeacon.getBeaconModels()
            actions.billing.fetchSubscription(selectedBeacon.pub_id)
            actions.billing.fetchSubscriptionStatus()
            actions.billing.fetchSubscriptionConditions()
            !providers && actions.SIM.fetchProviders()
            actions.SIM.fetchSIMByProduct({type: 'BEACON', macOrImei: selectedBeacon.imei})
        }
        if (location.pathname.startsWith('/beacon/admin/carer') ) {
            actions.sofiBeacon.fetchBeaconUsers(selectedBeacon.pub_id)
            actions.user.getAllUsers()
        }
        if (location.pathname.startsWith('/beacon/admin/billing') ) {
            actions.sofiBeacon.fetchBeaconUsers(selectedBeacon.pub_id)
            actions.billing.fetchSubscription(selectedBeacon.pub_id)
            actions.billing.fetchSubscriptionStatus()
            actions.billing.fetchSubscriptionConditions()
        }
        if (location.pathname.startsWith('/beacon/admin/orgs') ) {
            actions.organisation.fetchAllOrgs()
        }
        if (location.pathname.startsWith('/beacon/admin/history') ) {
            actions.sofiBeacon.fetchBeaconECChangeLogs(selectedBeacon.id)
        }
        if (location.pathname.startsWith('/beacon/admin/rawdata') ) {
            isAdmin && actions.sofiBeacon.fetchBeaconRawHistory({beaconId: selectedBeacon.pub_id})
        }
        if (location.pathname.startsWith('/beacon/admin/tpi') ) {
            actions.sofiBeacon.getTPAccounts(selectedBeacon.pub_id)
            !isAdmin && actions.sofiBeacon.getBeaconTPCandidates(selectedBeacon.pub_id)
            !TPDestinations && actions.thirdParty.fetchAllDestination()
            !TPKinds && actions.thirdParty.fetchAllKinds()
        }
    }
}

export default connect(state => state.sofiBeacon) (SofiBeaconPage)

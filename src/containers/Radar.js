import mirror, { actions, connect } from 'mirrorx'
import RadarPage from '../pages/Radar'
import { globalConstants } from '@/_constants'
import {timeout} from '@/utility/Common'

let interval = 0

// listen to route change,
// when is entering `/beacon/{...}`, load data
mirror.hook((action, getState) => {
    const {routing: { location }, radar: {radars}, auth: {authToken} } = getState()
    if (authToken) {
        if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith('/radar') ) {
            radars.length===0 ? actions.hub.getSofiDevices().then(() => fetchRadarGeneral(getState))
                : fetchRadarGeneral(getState)
        }

        if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith('/radar/settings') ) {
            radars.length===0 ? actions.hub.getSofiDevices().then(() => fetchRadarSettings(getState))
                : fetchRadarSettings(getState)
        }
        else if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith('/radar/dashboard') ) {
            radars.length===0 ? actions.hub.getSofiDevices().then(() => fetchRadarDashboard(getState))
                : fetchRadarDashboard(getState)
            clearInterval(interval)
            interval = setInterval(() => {
                fetchRadarDashboard(getState)
            }, globalConstants.RADAR_AUTO_REFRESH_TIME)

        }
        else if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith('/radar/histories') ) {
            radars.length===0 ? actions.hub.getSofiDevices().then(() => fetchRadarAnomaly(getState))
                : fetchRadarAnomaly(getState)
        }
        else if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.startsWith('/radar/admin') ) {
            radars.length===0 ? actions.hub.getSofiDevices().then(() => fetchRadarAdmin(getState))
                : fetchRadarAdmin(getState)
        }

        if (action.type === globalConstants.LOCATION_CHANGE && location.pathname !=='/radar/dashboard') {
            clearInterval(interval)
        }
    }
})


function fetchRadarGeneral(getState) {
    const { billing: { bypassPayment, bypassDisable }, radar: {selectedRadar}} = getState()
    let promises = []
    actions.radar.setLoading(true)
    promises.push(actions.radar.selectRadar(selectedRadar))
    selectedRadar && promises.push(actions.radar.fetchRadarConfig(selectedRadar.id))

    selectedRadar && promises.push(actions.billing.fetchDisableStatus(selectedRadar.pub_id).then((disabledStatus)=>{
        if(!bypassDisable && (disabledStatus?.is_disabled)){
            actions.routing.push('/disabled/Radar')
        }else{
            actions.billing.fetchSubscription(selectedRadar.pub_id).then((paymentRequired)=>{
                if( !bypassPayment && paymentRequired){
                    actions.routing.push('/unpaid/Radar')
                }
            })
        }
    }))
    timeout(Promise.all(promises), globalConstants.DASHBOARD_TIMEOUT_TIME).finally(()=>{
        actions.radar.setLoading(false)
    })
}

function fetchRadarDashboard(getState) {
    const { radar: {selectedRadar}} = getState()
    actions.radar.selectRadar(selectedRadar)
    fetchRadarAnomaly(getState)
}

function fetchRadarAnomaly(getState) {
    const { radar: {selectedRadar, anomalyMonth}} = getState()
    const fromTime = anomalyMonth.clone().startOf('month')
    const toTime = anomalyMonth.clone().endOf('month')
    actions.radar.getRadarAnomalies({
        radarId:selectedRadar.id,
        page:1,
        fromTime,
        toTime
    })
    actions.radar.getActiveRadarAnomalies({radarId:selectedRadar.id})
}

function fetchRadarSettings(getState) {
    // eslint-disable-next-line
    const { radar: {selectedRadar, radarUsers}, routing: {location}, user: {me}} = getState()

    if (selectedRadar) {
        !radarUsers && actions.radar.fetchRadarUsers(selectedRadar.id)

        if (location.pathname.startsWith('/radar/settings/general') ) {
            actions.radar.fetchRadarConfig(selectedRadar.id)
        }

        if (location.pathname.startsWith('/radar/settings/overview') ) {
            actions.radar.fetchAllRadars()
        }

        if (location.pathname.startsWith('/radar/settings/carer') ) {
            actions.user.getInvitationByRadar (selectedRadar.id)
            // actions.radar.fetchRadarHub(selectedRadar.id)
        }

        if (location.pathname.startsWith('/radar/settings/subscription') ) {
            actions.billing.fetchSubscription(selectedRadar.pub_id)
            actions.billing.fetchStripePlan('radar')
            actions.billing.fetchUserRadarSubscriptions(me.email)
        }

        if (location.pathname.startsWith('/radar/settings/notification') ) {
            if (me){
                const notificationPayload = {
                    productId: selectedRadar.id,
                    userId: me.user_id
                }
                actions.radar.fetchRadarNotifications(notificationPayload)
            }
        }
    }
}

function fetchRadarAdmin(getState) {
    const { radar: {selectedRadar}, routing: {location}, user: {me},  thirdParty: {TPDestinations, TPKinds},} = getState()
    const isAdmin = me?.authorities.some(role=>role.includes('ADMIN'))

    if (selectedRadar) {
        actions.radar.fetchRadarConfig(selectedRadar.id)
        actions.radar.getRadarOrgs(selectedRadar.id)
        if (location.pathname.startsWith('/radar/admin/user') ) {
            actions.radar.fetchRadarUsers(selectedRadar.id)
            actions.user.getAllUsers()
        }
        if (location.pathname.startsWith('/radar/admin/billing') ) {
            actions.radar.fetchRadarUsers(selectedRadar.id)
            actions.billing.fetchSubscription(selectedRadar.pub_id)
            actions.billing.fetchSubscriptionStatus()
        }
        if (location.pathname.startsWith('/radar/admin/tpi') ) {
            actions.radar.getTPAccounts(selectedRadar.id)
            !isAdmin && actions.radar.getRadarTPCandidates(selectedRadar.id)
            !TPDestinations && actions.thirdParty.fetchAllDestination()
            !TPKinds && actions.thirdParty.fetchAllKinds()
        }
        if (location.pathname.startsWith('/radar/admin/actions') ) {
            actions.radar.fetchRadarCommands(selectedRadar.id)
        }
    }
}


export default connect(state => state.radar) (RadarPage)

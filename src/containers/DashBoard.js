import mirror, { actions, connect } from 'mirrorx'
import DashboardPage from '../pages/Dashboard/DashboardPage'
import { globalConstants } from '@/_constants'
import moment from 'moment'
import { requireActivate, timeout } from '@/utility/Common'

let interval = 0
// listen to route change,
// when is entering `/dashboard`, load data
mirror.hook((action, getState) => {
    const { hub: { hubs } , routing: {location}, auth: {authToken}, user: {dashboardOverview}} = getState()
    const authenticated = !!(authToken?.access_token)
    const noHub = hubs?.length === 0 || dashboardOverview?.hubs?.length === 0
    if (authenticated){
        if (action.type === globalConstants.LOCATION_CHANGE && location.pathname === '/') {
            noHub ? actions.hub.getSofiDevices()
                .then(() => fetchData(getState()))
                : fetchData(getState())
            clearInterval(interval)
            interval = setInterval(() =>
                autoRefreshData(getState()), globalConstants.HUB_AUTO_REFRESH_TIME)
        }

        if (action.type === globalConstants.LOCATION_CHANGE && location.pathname === '/dashboard') {
            noHub ? actions.hub.getSofiDevices()
                .then(() => {fetchData(getState())})
                : fetchData(getState())
            clearInterval(interval)
            interval = setInterval(() =>
                autoRefreshData(getState()), globalConstants.HUB_AUTO_REFRESH_TIME)
        }

        if (action.type === globalConstants.LOCATION_CHANGE && location.pathname !== '/dashboard') {
            clearInterval(interval)
        }
    }
})

async function fetchData(state) {
    const selectedHub = state.hub.selectedHub
    const hubId = selectedHub && selectedHub.hub_id
    const { billing: { bypassPayment, bypassDisable }, SIM: {bypassSIMActivation}, } = state
    let promises = []

    actions.hub.setLoading(true)
    hubId && promises.push(actions.hub.getHubLastKnown(hubId))
    hubId && promises.push(actions.hub.selectHub(selectedHub))
    hubId && promises.push(actions.hub.getLastOccupancies({hubId, size: 5, toTime: moment()}))
    hubId && promises.push(actions.hub.fetchHubBeaconHeadstates(hubId))
    hubId && promises.push(actions.setting.getSettings(hubId))
    hubId && promises.push(actions.hub.getSensors(hubId))
    hubId && promises.push(actions.hub.getHubMessages({hubId, page: state.hub.messagePage}))
    hubId && promises.push(actions.hub.getHubAnomalies({hubId}))
    hubId && promises.push( actions.hub.getHubStatus(hubId))
    hubId && promises.push( actions.billing.fetchDisableStatus(hubId).then((disabledStatus)=>{
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
    }))
    timeout(Promise.all(promises), globalConstants.DASHBOARD_TIMEOUT_TIME).finally(()=>{
        actions.hub.setLoading(false)
    })
}

async function autoRefreshData(state) {
    const selectedHub = state.hub.selectedHub
    const hubId = selectedHub && selectedHub.hub_id
    let promises = []
    hubId && promises.push(actions.hub.getHubLastKnown(hubId))
    hubId && promises.push(actions.hub.selectHub(selectedHub))
    hubId && promises.push(actions.hub.getLastOccupancies({hubId, size: 5, toTime: moment()}))
    hubId && promises.push(actions.hub.fetchHubBeaconHeadstates(hubId))
    hubId && promises.push(actions.hub.getSensors(hubId))
    hubId && promises.push(actions.hub.getHubMessages({hubId, page: state.hub.messagePage}))
    hubId && promises.push(actions.hub.getHubAnomalies({hubId}))
    hubId && promises.push( actions.hub.getHubStatus(hubId))
}

export default connect(state => state.hub) (DashboardPage)

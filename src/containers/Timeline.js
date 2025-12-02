import mirror, { actions, connect } from 'mirrorx'
import TimelinePage from '../pages/Timeline/TimelinePage4'
import { globalConstants } from '@/_constants'
import moment from 'moment/moment'
import { requireActivate } from '@/utility/Common'

let interval = 0
// listen to route change,
// when is entering `/dashboard`, load data
mirror.hook((action, getState) => {
    const {routing: {location}} = getState()
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname === '/timeline') {
        getState().hub.hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchInitialData(getState()))
            : fetchInitialData(getState())
        clearInterval(interval)
        interval = setInterval(() =>
            fetchData(getState().hub.selectedHub), globalConstants.HUB_AUTO_REFRESH_TIME)
    }

    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname !== '/timeline') {
        clearInterval(interval)
    }
})

function fetchInitialData(state) {
    const { billing: { bypassPayment, bypassDisable }, SIM: {bypassSIMActivation}, hub} = state
    const {selectedHub} = hub
    const hubId = selectedHub.hub_id
    if (selectedHub) {
        fetchData(selectedHub)
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

function fetchData(selectedHub) {
    const condensed = false
    const fromTime = moment().subtract(2, 'days').startOf('day')
    const toTime = moment().add(1, 'days').startOf('day')
    if (selectedHub) {
        actions.setting.getReminders(selectedHub.hub_id)
        actions.setting.getSettings(selectedHub.hub_id)
        actions.hub.getHubLastKnown(selectedHub.hub_id)
        actions.hub.getDetailedAnomalies({
            hubId: selectedHub.hub_id,
            fromTime,
            toTime,
            size: globalConstants.TIMELINE_SIZE,
            page: 0
        })
        actions.hub.getDetailedActionState({
            hubId: selectedHub.hub_id,
            fromTime,
            toTime,
            size: globalConstants.TIMELINE_SIZE,
            page: 0
        })
        actions.hub.getDetailedMedication({
            hubId: selectedHub.hub_id,
            fromTime,
            toTime,
            size: globalConstants.TIMELINE_SIZE,
            page: 0
        })
        actions.hub.getDetailedMessage({
            hubId: selectedHub.hub_id,
            fromTime,
            toTime,
            size: globalConstants.TIMELINE_SIZE,
            page: 0
        })
        actions.hub.getDetailedOccupancies({
            hubId: selectedHub.hub_id,
            fromTime,
            toTime,
            size: globalConstants.TIMELINE_SIZE,
            page: 0,
            condensed
        })
    }
}

export default connect(state => state.hub) (TimelinePage)

import mirror, {actions, connect} from 'mirrorx'
import {globalConstants} from '@/_constants'
import AlertsDetailsPage from '../pages/Anomaly/AlertDetailsPage'
import moment from 'moment'

// listen to route change,
// when is entering `/dashboard`, load data
mirror.hook((action, getState) => {
    const {routing: {location}} = getState()
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname === '/alert-details') {
        let selectedAnomaly = ''
        location.state ? selectedAnomaly = location.state.sessionData : actions.routing.push('/alerts')
        actions.hub.selectAnomaly(selectedAnomaly)
        getState().hub.hubs.length === 0 ? actions.hub.getSofiDevices()
            .then(() => fetchData(getState().hub.selectedHub.hub_id, selectedAnomaly))
            : fetchData(getState().hub.selectedHub.hub_id, selectedAnomaly)
    }
})

function fetchData(hubId, anomaly) {
    const occurTime = moment(anomaly.occurred_at)
    const fromTime = occurTime.clone().subtract(1, 'days').startOf('day')
    const toTime = occurTime.clone().add(3, 'days').startOf('day')
    actions.hub.getDetailedOccupancies({hubId,fromTime, toTime, size: globalConstants.TIMELINE_SIZE, page: 0, condensed: false })

    // actions.hub.getActivities({hubId, pageNumber:0, detailed:false,
    //     toDate: moment(anomaly.occurred_at), fromDate: moment(anomaly.occurred_at).subtract(3, 'days')})
}

export default connect(state => state.hub) (AlertsDetailsPage)

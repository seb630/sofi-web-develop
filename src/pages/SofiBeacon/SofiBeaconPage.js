import { Component, Suspense, lazy } from 'react'
import PortalLayout from '../Common/Layouts/PortalLayout'
import { connect, Route } from 'mirrorx'
import './beacon.scss'
import { Spin } from 'antd'
import BeaconRedirect from '@/pages/Redirect/BeaconRedirect'
import { globalConstants } from '@/_constants'
import beaconService from '../../services/Beacon'

const SofiBeaconDashboard = lazy(() => import('./Dashboard'))
const SofiBeaconHistory = lazy(() => import('./History'))
const SofiBeaconAdmin = lazy(() => import('./Admin'))
const Alerts = lazy(() => import('./Alert'))
const AlarmDetailPage = lazy(() => import('./Alert/AlarmDetail'))
const GeofenceAlertDetailsPage = lazy(() => import('./Alert/GeofenceAlarmDetail'))
const OfflineAlertDetailsPage = lazy(() => import('./Alert/OfflineAlarmDetail'))
const GeoFence = lazy(() => import('./Geofence'))
const SofiBeaconSetting = lazy(() => import('./Setting'))
const SignalHistory = lazy(() => import('@/pages/SofiBeacon/History/SignalHistory'))


const mapStateToProps = state => ({
    pathname: state.routing.location.pathname
})

class SofiBeaconPage extends Component {
    constructor(props) {
        super(props)
        beaconService.getEmergencyCallNumbers().then((res) => {
            globalConstants.EMERGENCY_CALL_NUMBERS = res
        })
    }

    /** render page content */
    renderPageContent() {
        return (
            <Suspense fallback={<Spin />}>
                <Route exact path='/beacon/dashboard' component={SofiBeaconDashboard} />
                <Route path='/beacon/geofence' component={GeoFence} />
                <Route path='/beacon/history/gps' component={SofiBeaconHistory} />
                <Route path='/beacon/history/signal' component={SignalHistory} />
                <Route path='/beacon/alerts' component={Alerts} />
                <Route path='/beacon/alert/geo/:alarmId' component={GeofenceAlertDetailsPage} />
                <Route path='/beacon/alert/offline/:alarmId' component={OfflineAlertDetailsPage} />
                <Route exact path='/beacon/alert/:alarmId' component={AlarmDetailPage} />
                <Route path='/beacon/settings' component={SofiBeaconSetting} />
                <Route path='/beacon/admin' component={SofiBeaconAdmin} />
                <Route path='/beacon/:beaconId/*' component={BeaconRedirect} />
                <Route path='/beacon/:beaconId' component={BeaconRedirect} />
            </Suspense>
        )
    }

    render() {
        let page = this.props.pathname.split('/')[2]
        page = page && page.charAt(0).toUpperCase() + page.slice(1)
        return (
            <PortalLayout
                menu='beacon'
                page={page}
                contentClass="settingsBlock"
                content={this.renderPageContent()} />
        )
    }
}

export default connect(mapStateToProps, {})(SofiBeaconPage)

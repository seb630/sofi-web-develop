import { Component } from 'react'
import { connect, Route } from 'mirrorx'
import { Skeleton } from 'antd'
import './GlobalAdmin.scss'
import Users from './Users'
import User from './Users/User'
import Releases from './Releases'
import Release from './Releases/Release'
import AdminHubs from './Hubs'
import AdminBeacons from './Beacons'
import AdminAPNs from './APNs'
import { BeaconInvite, HubInvite, RadarInvite } from './Invites/'
import PortalLayout from '../Common/Layouts/PortalLayout'
import PreventAccess from '../../components/PreventAccess'
import ApnDashboard from './APNs/ApnDashboard'
import ReleaseDashboard from './Releases/ReleaseDashboard'
import BeaconDashboard from './Beacons/BeaconDashboard'
import RadarDashboard from './Radars/RadarDashboard'
import HubDashboard from './Hubs/HubDashboard'
import TPTable from './ThirdParties'
import Organisations from './Organisation'
import Organisation from './Organisation/Organisations'
import SubscriptionTable from './Billings/Subscriptions'
import BeaconReleases from './BeaconReleases'
import BeaconRelease from './BeaconReleases/Release'
import BeaconReleaseDashboard from './BeaconReleases/BeaconReleaseDashboard'
import EmailForm from './Users/Email'
import HiddenFeatures from './HiddenFeatures'
import SIMActivationTable from './SIM/SIMActivation'
import AdminRadars from '@/pages/GlobalAdmin/Radars'
import BulkEmergencyEditCard from '@/pages/GlobalAdmin/Beacons/BulkEmergencyEdit'
import GlobalAdminHome from './Home'
import BulkUploadList from '@/pages/GlobalAdmin/Beacons/BulkUpload'
import BulkPhoneSettings from '@/pages/GlobalAdmin/Beacons/BulkPhoneSettings'
import SIMTerminationTable from '@/pages/GlobalAdmin/SIM/Terminations'
import ExportUsers from '@/pages/GlobalAdmin/Users/ExportUser'
import ExportBeacon from '@/pages/GlobalAdmin/Beacons/ExportBeacon'
import RadarReleases from './RadarReleases'
import RadarRelease from './RadarReleases/Release'
import RadarReleaseStats from './RadarReleases/RadarReleaseStats'
import StripeUpdate from './Billings/Stripe'

const mapStateToProps = state => ({
    me: state.user.me,
    admin: state.user.me ? state.user.me.authorities.some(role=>role.includes('ADMIN')) : false,
    loading: state.user.loading
})

class GlobalAdmin extends Component {
    constructor(props) {
        super(props)
    }

    /** render Page content */
    renderPageContent () {
        const { admin , me } = this.props
        return (<Skeleton className="skeleton" loading={me == null} active>
            {
                <PreventAccess allowAccess={admin}>
                    <Route exact path='/globalAdmin/home' component={GlobalAdminHome} />
                    <Route exact path='/globalAdmin/user' component={Users} />
                    <Route path='/globalAdmin/user/:userId' component={User} />
                    <Route exact path='/globalAdmin/release' component={Releases} />
                    <Route exact path='/globalAdmin/release-dashboard' component={ReleaseDashboard} />
                    <Route path='/globalAdmin/release/:releaseId' component={Release} />
                    <Route exact path='/globalAdmin/brelease' component={BeaconReleases} />
                    <Route exact path='/globalAdmin/brelease-dashboard' component={BeaconReleaseDashboard} />
                    <Route path='/globalAdmin/brelease/:releaseId' component={BeaconRelease} />
                    <Route exact path='/globalAdmin/rrelease' component={RadarReleases} />
                    <Route exact path='/globalAdmin/rrelease-dashboard' component={RadarReleaseStats} />
                    <Route path='/globalAdmin/rrelease/:releaseId' component={RadarRelease} />
                    <Route exact path='/globalAdmin/hub' component={AdminHubs} />
                    <Route exact path='/globalAdmin/hub-dashboard' component={HubDashboard} />
                    <Route exact path='/globalAdmin/beacon' component={AdminBeacons} />
                    <Route exact path='/globalAdmin/export-beacon' component={ExportBeacon} />
                    <Route exact path='/globalAdmin/radar' component={AdminRadars} />
                    <Route exact path='/globalAdmin/radar-dashboard' component={RadarDashboard} />
                    <Route exact path='/globalAdmin/beacon-dashboard' component={BeaconDashboard} />
                    <Route exact path='/globalAdmin/apn' component={AdminAPNs} />
                    <Route exact path='/globalAdmin/apn-dashboard' component={ApnDashboard} />
                    <Route exact path='/globalAdmin/export-user' component={ExportUsers} />
                    <Route exact path='/globalAdmin/hub-invite' component={HubInvite} />
                    <Route exact path='/globalAdmin/beacon-invite' component={BeaconInvite} />
                    <Route exact path='/globalAdmin/radar-invite' component={RadarInvite} />
                    <Route exact path='/globalAdmin/tp-destination' component={TPTable} />
                    <Route exact path='/globalAdmin/SIM-activation' component={SIMActivationTable} />
                    <Route exact path='/globalAdmin/SIM-termination' component={SIMTerminationTable} />
                    <Route exact path='/globalAdmin/organisations' component={Organisations} />
                    <Route exact path='/globalAdmin/subscriptions' component={SubscriptionTable} />
                    <Route exact path='/globalAdmin/stripe' component={StripeUpdate} />
                    <Route exact path='/globalAdmin/bulk-emergency-edit' component={BulkEmergencyEditCard} />
                    <Route exact path='/globalAdmin/bulk-upload' component={BulkUploadList} />
                    <Route exact path='/globalAdmin/bulk-phone-setting' component={BulkPhoneSettings} />
                    <Route path='/globalAdmin/organisation/:orgId' component={Organisation} />
                    <Route exact path='/globalAdmin/email' component={EmailForm} />
                    <Route exact path='/globalAdmin/features' component={HiddenFeatures} />
                </PreventAccess>
            }
        </Skeleton>)
    }

    render() {
        return (
            <PortalLayout
                contentClass="contentPage"
                menu='globalAdmin'
                content={ this.renderPageContent()}/>
        )
    }
}

export default connect(mapStateToProps, null) (GlobalAdmin)


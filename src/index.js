import './scss/ant.less'
import './scss/style.scss'
import ReactGA from 'react-ga4'

import { lazy, Suspense } from 'react'
import { Spin } from 'antd'
import * as Sentry from '@sentry/react'
import { Integrations  } from '@sentry/tracing'
import mirror, { Redirect, render, Router, Switch } from 'mirrorx'
import { AllRoute, NonPrivateRoute, PrivateRoute } from './utility/PrivateRoute'
/** MODELS*/
import initModels from './models/'


/** CONTAINERs */
import DashboardContainer from './containers/DashBoard'
import MedicationContainer from './containers/Medication'
import AlertsContainer from './containers/Alerts'
import ReminderContainer from './containers/Reminders'
import SettingsContainer from './containers/Settings'
import AlertDetailsContainer from './containers/AlertDetails'
import TimelineContainer from './containers/Timeline'
import AdminContainer from './containers/Admin'
import GlobalAdminContainer from './containers/GlobalAdmin'
import SofiBeaconContainer from './containers/SofiBeacon'
import RadarContainer from './containers/Radar'
import GlanceContainer from './containers/Glance'
import OrganisationContainer from './containers/Organisation'
import EventRulePageContainer from './containers/EventRules'
import SIMActivationPage from './pages/Common/SIMActivationPage'
import DisabledPage from './pages/Common/DisabledPage'
import BeaconsMap from './pages/DeviceSelection/BeaconsMap'

/** REDUX MIDDLEWARES */
import logger from 'redux-logger'
import { globalConstants } from '@/_constants'

/** SERVICE WORKER */
import * as serviceWorker from './serviceWorkerRegistration'

const LoginPage = lazy(()=> import('./pages/Login/LoginPage'))
const ResetPage = lazy(()=> import( './pages/Login/ResetPage'))
const noDevice = lazy(()=> import( './pages/Static/noDevice'))
const EmailVerify = lazy(()=> import( './pages/Login/EmailVerify'))
const DownTimePage = lazy(()=> import( './pages/Common/Exception'))
const ExceptionPage = lazy(()=> import( './pages/Common/Exception/Exception'))
const Exception403 = lazy(()=> import( './pages/Common/Exception/Exception403'))
const Exception404 = lazy(()=> import( './pages/Common/Exception/Exception404'))
const OutageDetail = lazy(()=> import( './pages/Common/Exception/OutageDetail'))
const NotSupportedBrowser = lazy(()=> import( './pages/Common/NotSupportedBrowser'))
const RegionSelectionPage = lazy(()=> import( './components/RegionSelection'))
const DeviceSelection = lazy(()=> import( './pages/DeviceSelection'))
const UnpaidPage = lazy(()=> import( './pages/Common/UnpaidPage'))
const HubRedirect = lazy(()=> import( './pages/Redirect/HubRedirect'))
const RadarRedirect = lazy(()=> import( '@/pages/Redirect/RadarRedirect'))
const BeaconRedirect = lazy(()=> import( './pages/Redirect/BeaconRedirect'))

const trackPage = page => {
    ReactGA.gtag('event', 'page_view', {
        page_path: page
    })
}

const gaTrackingMiddleware = () => next => action => {
    if (action.type === globalConstants.LOCATION_CHANGE) {
        const nextPage = `${action.payload.location?.pathname}${action.payload.location?.search}`
        trackPage(nextPage)
    }
    return next(action)
}

const middlewares =  process.env.NODE_ENV === 'development' ? [logger, gaTrackingMiddleware] : [gaTrackingMiddleware]

ReactGA.initialize(globalConstants.GA_TRACKING_ID)
ReactGA.send('pageview')

mirror.defaults({
    middlewares : middlewares
})

initModels(mirror)

Sentry.init({
    dsn: 'https://965148b46e15421ea48072f302821335@o1417609.ingest.sentry.io/6761518',
    integrations: [
        new Integrations.BrowserTracing(),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV === 'development' ||  window.location.hostname.includes('develop') ? 'develop' : 'production',
})
render(
    <Suspense fallback={<Spin/>}>
        <NotSupportedBrowser>
            <Router getUserConfirmation={() => {
                /* Empty callback to block the default browser prompt */
            }}>
                <Switch>
                    <NonPrivateRoute path='/region-selection' component={RegionSelectionPage}/>
                    <AllRoute path='/login' component={LoginPage}/>
                    <NonPrivateRoute path='/reg' component={LoginPage} reg={true}/>
                    <NonPrivateRoute path='/forgot' component={LoginPage} forgot={true}/>
                    <NonPrivateRoute path='/reset' component={ResetPage}/>
                    <NonPrivateRoute path='/email_verify' component={EmailVerify}/>

                    <Redirect exact from='/' to='/deviceSelection'/>
                    <PrivateRoute path='/dashboard' component={DashboardContainer}/>
                    <PrivateRoute path='/glance' component={GlanceContainer}/>
                    <PrivateRoute path='/medication' component={MedicationContainer}/>
                    <PrivateRoute path='/alerts' component={AlertsContainer}/>
                    <PrivateRoute path='/reminders' component={ReminderContainer}/>
                    <PrivateRoute path='/rules' component={EventRulePageContainer}/>
                    <PrivateRoute path='/settings' component={SettingsContainer}/>
                    <PrivateRoute path='/alert-details' component={AlertDetailsContainer}/>
                    <PrivateRoute path='/timeline' component={TimelineContainer}/>
                    <PrivateRoute path='/admin' component={AdminContainer}/>
                    <PrivateRoute path='/noDevice' component={noDevice}/>
                    <PrivateRoute path='/organisationSettings' component={OrganisationContainer}/>
                    <PrivateRoute path='/deviceSelection' component={DeviceSelection}/>
                    <PrivateRoute path='/beaconsMap' component={BeaconsMap}/>
                    <PrivateRoute path='/unPaid/:product' component={UnpaidPage}/>
                    <PrivateRoute path='/disabled/:product' component={DisabledPage}/>
                    <PrivateRoute path='/SIM-activation/:product' component={SIMActivationPage}/>
                    <Redirect exact from='/globalAdmin' to='/globalAdmin/hub'/>
                    <PrivateRoute path='/globalAdmin' component={GlobalAdminContainer} />

                    <Redirect exact from='/beacon' to='/beacon/dashboard'/>
                    <Redirect exact from='/radar' to='/radar/dashboard'/>
                    <AllRoute path='/offline' component={DownTimePage}/>
                    <AllRoute path='/maintenance' component={OutageDetail}/>
                    <AllRoute exact path='/exception/403' component={Exception403}/>
                    <AllRoute exact path='/exception/404' component={Exception404}/>
                    <AllRoute path='/exception' component={ExceptionPage}/>
                    <PrivateRoute path='/hubs/:hubId/*' component={HubRedirect}/>
                    <PrivateRoute path='/hubs/:hubId' component={HubRedirect}/>
                    <PrivateRoute path='/hub/:hubId/*' component={HubRedirect}/>
                    <PrivateRoute path='/hub/:hubId' component={HubRedirect}/>
                    <AllRoute path='/beacons/:beaconId/*' component={BeaconRedirect}/>
                    <AllRoute path='/beacon/alert/:alarmId' component={SofiBeaconContainer}/>
                    <AllRoute path='/beacons/:beaconId' component={BeaconRedirect}/>
                    <AllRoute path='/radars/:radarId/*' component={RadarRedirect}/>
                    <AllRoute path='/radars/:radarId' component={RadarRedirect}/>
                    <PrivateRoute path='/beacon' component={SofiBeaconContainer} />
                    <PrivateRoute path='/radar' component={RadarContainer} />
                    <AllRoute path='*' component={Exception404} />
                </Switch>
            </Router>
        </NotSupportedBrowser>
    </Suspense>, document.getElementById('root'))

serviceWorker.register()

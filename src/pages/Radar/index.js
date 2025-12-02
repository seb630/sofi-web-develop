import { Component } from 'react'
import PortalLayout from '../Common/Layouts/PortalLayout'
import { connect, Route } from 'mirrorx'
import RadarSetting from './Setting'
import RadarAdmin from './Admin'
import RadarAlerts from './Anomaly/AlertsPage'
import RadarDashboard from './Dashboard/DashboardPage'
import RadarRedirect from '@/pages/Redirect/RadarRedirect'
import './index.scss'

const mapStateToProps = state => ({
    pathname: state.routing.location.pathname
})

class RadarPage extends Component {

    /** render page content */
    renderPageContent() {
        return (
            <div style={{overflowX: 'hidden'}}>
                <Route exact path='/radar/dashboard' component={RadarDashboard} />
                <Route exact path='/radar/histories' component={RadarAlerts} />
                <Route path='/radar/settings' component={RadarSetting} />
                <Route path='/radar/admin' component={RadarAdmin}/>
                <Route path='/radar/:radarId/*' component={RadarRedirect}/>
                <Route path='/radar/:radarId' component={RadarRedirect}/>
            </div>
        )
    }

    render() {
        let page = this.props.pathname.split('/')[2]
        page = page && page.charAt(0).toUpperCase() + page.slice(1)
        return (
            <PortalLayout
                menu='radar'
                page={ page }
                content={this.renderPageContent()} />
        )
    }
}

export default connect(mapStateToProps,{})(RadarPage)

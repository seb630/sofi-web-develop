import { Component, Fragment } from 'react'
import { Col, Row, Tabs } from 'antd'
import { actions, connect, Redirect, Route } from 'mirrorx'
import RadarOverview from '@/pages/Radar/Setting/Overview'
import ChangeCard from '@/pages/Radar/Setting/Overview/ChangeCard'
import RadarCarer from '@/pages/Radar/Setting/Carer'
import RadarLogo from '../../../images/radar_sensor_icon.png'
import RadarGeneralSettings from '@/pages/Radar/Setting/General'
import RadarNotification from './Notification'
import RadarPayment from '@/pages/Radar/Setting/Payment'
import { removeDuplicateDevices } from '@/utility/Common'

const mapStateToProps = state => ({
    selectedRadar: state.radar.selectedRadar,
    radarConfig: state.radar.radarConfig,
    sideButton: state.common.SideButton,
    radarUsers: state.radar.radarUsers,
    radarHubUsers: state.radar.radarHubUsers,
    hubs: removeDuplicateDevices(state.user.dashboardOverview.hubs),
    radarHubs: state.radar.radarHubs,
    radarSpaces: state.radar.radarSpaces,
    hubSpaces: state.hub.hubSpaces,
    me: state.user.me,
    loading: state.radar.loading
})

class SofiRadarSetting extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeKey: props.location.pathname.split('/').length>3 ? props.location.pathname.split('/').pop() : 'overview'
        }
    }

    componentDidUpdate (prevProps) {
        prevProps.location!==this.props.location && this.setState({
            activeKey: this.props.location.pathname.split('/').length>3 ? this.props.location.pathname.split('/').pop() : 'overview'
        })
    }

    onTabChanged = (key, scrollTo=false) => {
        let scrollToBottom = false
        let scrollToCalibrate = false
        if (scrollTo ==='calibrate' ){
            scrollToCalibrate = true
        }else if(scrollTo ==='bottom' ) {
            scrollToBottom=true
        }
        actions.routing.push({
            pathname: '/radar/settings/' + key,
            state: {scrollToBottom, scrollToCalibrate}
        })
        this.setState({activeKey: key})
    }

    renderOverview = () => <Row justify="center">
        <Col xs={22} lg={16}>
            <Row justify="center">
                <img src={RadarLogo} alt="logo" style={{width: 180, marginBottom: 24}} />
            </Row>
            <RadarOverview />
            <ChangeCard onTabChanged={this.onTabChanged}/>
        </Col>
    </Row>

    renderGeneral = () => <Row justify="center">
        <Col xs={22} lg={16}>
            <RadarGeneralSettings {...this.props}/>
        </Col>
    </Row>

    renderCarer = () => <Row justify="center">
        <Col xs={22} lg={16}>
            <RadarCarer />
        </Col>
    </Row>

    render() {
        const items = [
            {
                label: 'Overview',
                key:'overview',
                children: <Route exact path="/radar/settings/overview" component={this.renderOverview}/>
            },

            {
                label: 'General Settings',
                key:'general',
                children: <Route exact path="/radar/settings/general" component={this.renderGeneral}/>
            },
            {
                label: 'Carers',
                key:'carer',
                children: <Route exact path="/radar/settings/carer" component={this.renderCarer}/>
            },
            {
                label: 'Notification',
                key:'notification',
                children: <Route exact path="/radar/settings/notification" component={RadarNotification}/>,
            },
            {
                label: 'Subscription',
                key:'subscription',
                children:  <Route exact path="/radar/settings/subscription" component={RadarPayment}/>,
            },
            // {
            //     label: 'Objects And Furniture',
            //     key:'objectsFurniture',
            //     children: <Route exact path="/radar/settings/objectsFurniture" component={this.renderObjectsFurniture}/>,
            //     disabled: true,
            // },
            // {
            //     label: 'Security',
            //     key:'security',
            //     children: <Route exact path="/radar/settings/security" component={this.renderSecurity}/>,
            //     disabled: true
            // },
            // {
            //     label: `Link To ${globalConstants.HUB_SOFIHUB}`,
            //     key:'hub',
            //     children: <Route exact path="/radar/settings/hub" component={this.renderHub}/>,
            //     disabled: true
            // },

        ]
        return (<Fragment>
            <Tabs activeKey={this.state.activeKey} onChange={this.onTabChanged} items={items}/>
            <Route
                exact
                path="/radar/settings"
                render={() => (<Redirect exact to='/radar/settings/overview' />)}
            />
        </Fragment>)
    }
}

export default connect(mapStateToProps)(SofiRadarSetting)

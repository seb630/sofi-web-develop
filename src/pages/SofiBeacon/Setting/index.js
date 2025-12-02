import { Component, Fragment } from 'react'
import { Col, Row, Tabs } from 'antd'

import BeaconInforCard from './BeaconInforCard'
import BeaconHubCard from './BeaconHubCard'
import BeaconSmartReminderCard from './BeaconSmartRemindersCard'
import BeaconCarers from './BeaconCarers'
import BeaconLockCard from './BeaconLockCard'
import BeaconRemindersCard from './BeaconRemindersCard'
import { actions, connect, Redirect, Route } from 'mirrorx'
import BeaconFallDetection from './BeaconFallDetection'
import BeaconPayment from './Payment'
import BeaconPowerOption from './BeaconPowerOption'
import { globalConstants } from '@/_constants'
import BeaconTimeZoneCard from './BeaconTimeZoneCard'
import BeaconSideButtonCard from './BeaconSideButtonCard'
import BeaconPrefixCard from '@/pages/SofiBeacon/Setting/BeaconPrefixCard'
import EmergencyContactCard from '@/pages/SofiBeacon/Setting/EmergencyContact/EmergencyContactCard'
import BeaconOverview from '@/pages/SofiBeacon/Setting/Overview'
import ChangeCard from '@/pages/SofiBeacon/Setting/Overview/ChangeCard'
import BeaconIcon from '@/images/beacon_icon.svg'
import LifeIcon from '@/images/beacon_teq_life.png'
import WatchIcon from '@/images/beacon_watch_icon.png'
import CallSettingCard from '@/pages/SofiBeacon/Setting/CallSettings/CallSettingCard'
import { checkBeaconFunction, isLife, isWatch } from '@/utility/Common'

const mapStateToProps = state => ({
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    sideButton: state.common.SideButton,
    settings: state.sofiBeacon.settings,
    beaconFeatures: state.sofiBeacon.beaconFeatures,
    powerOptions: state.sofiBeacon.powerOptions
})

const TabPane = Tabs.TabPane

class SofiBeaconSetting extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeKey: props.location.pathname.split('/').length > 3 ? props.location.pathname.split('/').pop() : 'overview'
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.location !== this.props.location && this.setState({
            activeKey: this.props.location.pathname.split('/').length > 3 ? this.props.location.pathname.split('/').pop() : 'overview'
        })
    }

    onTabChanged = (key, scrollTo = false) => {
        let scrollToEC = false
        if (scrollTo === 'ec') {
            scrollToEC = true
        }
        actions.routing.push({
            pathname: '/beacon/settings/' + key,
            state: { scrollToEC }
        })
        this.setState({ activeKey: key })
    }

    renderOverview = () => {
        const { selectedBeacon } = this.props
        return <Row justify="center">
            <Col xs={22} xxl={12}>
                <Row justify="center">
                    {
                        isLife(selectedBeacon) ? 
                            <img className='beacon' alt="logo" style={{ fontSize: 180, marginBottom: 24, width: '1em' }} src={LifeIcon} /> : 
                            isWatch(selectedBeacon) ? <img src={WatchIcon} alt='logo' className='beacon' style={{fontSize: 180, marginBottom: 24, width: '1em'}}/>: <BeaconIcon className='beacon' alt="logo" style={{ fontSize: 180, marginBottom: 24 }} />
                    }
                </Row>
                <BeaconOverview />
                <ChangeCard onTabChanged={this.onTabChanged} />
            </Col>
        </Row>
    }

    renderGeneral = () => {
        const { selectedBeacon, beaconFeatures, powerOptions, sideButton } = this.props
        return <Row type="flex" justify="center">
            <Col xs={22} lg={22}>
                <BeaconInforCard />
                <EmergencyContactCard />
                {checkBeaconFunction(selectedBeacon, beaconFeatures, powerOptions, 'timezone') && <BeaconTimeZoneCard selectedBeacon={selectedBeacon} />}
                {checkBeaconFunction(selectedBeacon, beaconFeatures, powerOptions, 'call_settings') && <CallSettingCard {...this.props} />}
                {(!sideButton || sideButton.rule_action === 'settings') && checkBeaconFunction(selectedBeacon, beaconFeatures, powerOptions, 'side_button') && <BeaconSideButtonCard />}
                {checkBeaconFunction(selectedBeacon, beaconFeatures, powerOptions, 'sms_prefix') && <BeaconPrefixCard {...this.props} />}
                <BeaconLockCard selectedBeacon={selectedBeacon} />
            </Col>
        </Row>
    }

    renderPower = () => <Row type="flex" justify="center">
        <Col xs={22} lg={16}>
            <BeaconPowerOption />
        </Col>
    </Row>

    renderDetection = () => <Row type="flex" justify="center">
        <Col xs={22} lg={16}>
            <BeaconFallDetection />
        </Col>
    </Row>

    renderCarer = () => <Row type="flex" justify="center">
        <Col xs={22} lg={16}>
            <BeaconCarers onTabChanged={this.onTabChanged} />
        </Col>
    </Row>

    renderHub = () => <Row type="flex" justify="center">
        <Col xs={22} lg={16}>
            <BeaconHubCard />
            <BeaconRemindersCard />
            <BeaconSmartReminderCard />
        </Col>
    </Row>

    render() {
        const { selectedBeacon, beaconFeatures, powerOptions } = this.props

        return (<Fragment>
            <Tabs activeKey={this.state.activeKey} onChange={this.onTabChanged}>
                <TabPane tab="Overview" key="overview">
                    <Route exact path="/beacon/settings/overview" component={this.renderOverview} />
                </TabPane>
                <TabPane tab="General Settings" key="general">
                    <Route exact path="/beacon/settings/general" component={this.renderGeneral} />
                </TabPane>
                {checkBeaconFunction(selectedBeacon, beaconFeatures, powerOptions, 'update') && <TabPane tab="Power Options" key="power">
                    <Route exact path="/beacon/settings/power" component={this.renderPower} />
                </TabPane>}
                {checkBeaconFunction(selectedBeacon, beaconFeatures, powerOptions, 'fall_down') && <TabPane tab="Fall Detection" key="detection">
                    <Route exact path="/beacon/settings/detection" component={this.renderDetection} />
                </TabPane>}
                <TabPane tab="Subscription" key="subscription">
                    <Route exact path="/beacon/settings/subscription" component={BeaconPayment} />
                </TabPane>
                <TabPane tab="Account Managers" key='carer'>
                    <Route exact path="/beacon/settings/carer" component={this.renderCarer} />
                </TabPane>
                {/* <TabPane tab={`Link to ${globalConstants.HUB_SOFIHUB}`} key="hub">
                    <Route exact path="/beacon/settings/hub" component={this.renderHub} />
                </TabPane> */}
            </Tabs>
            <Route
                exact
                path="/beacon/settings"
                render={() => (<Redirect exact to='/beacon/settings/overview' />)}
            />
        </Fragment>)
    }
}

export default connect(mapStateToProps)(SofiBeaconSetting)

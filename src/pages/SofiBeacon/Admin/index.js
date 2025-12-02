import { Component } from 'react'
import { actions, connect, Redirect, Route } from 'mirrorx'
import { Col, Row, Skeleton, Tabs } from 'antd'
import moment from 'moment'
import BeaconDetailCard from './Detail'
import BeaconRawDataCard from './BeaconRawData'
import BeaconHeadStateData from './BeaconHeadStateData'
import BeaconCarers from './BeaconCarers'
import AddBeaconModal from './Modals/AddBeaconModal'
import PreventAccess from '../../../components/PreventAccess'
import { globalConstants } from '@/_constants'
import TPAccount from './ThirdParties'
import RabbitMQ from './RabbitMQ'
import Billing from './Billing'
import BeaconOobeCard from './BeaconOobeCard'
import BeaconOrgs from './Organisation'
import { DisableCard } from '../../Admin/Detail/DisableDevice'
import BeaconSideButtonCard from '../Setting/BeaconSideButtonCard'
import GetBeaconSettings from '@/pages/SofiBeacon/Admin/GetBeaconSettings'
import BeaconChangeLogs from '@/pages/SofiBeacon/Admin/ChangeLog'
import { SIMStatusCard } from '@/pages/Admin/Detail/SIM'
import { titleCase } from 'change-case'
import ResendDefaultConfig from '@/pages/SofiBeacon/Admin/Detail/ResendDefaultConfig'
import CallSettingCard from '@/pages/SofiBeacon/Setting/CallSettings/CallSettingCard'
import { isWatch } from '@/utility/Common'

const TabPane = Tabs.TabPane

const mapStateToProps = state => ({
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    allAPNs: state.APN.adminAPN,
    beaconAPN: state.APN.beaconAPN,
    isAdmin: state.user.me ? state.user.me.authorities.some(role=>role.includes('ADMIN')) : false,
    beaconOrgs: state.sofiBeacon.beaconOrgs,
    beaconUsers: state.sofiBeacon.selectedBeaconUsers,
    allUsers: state.user.allUsers,
    latestRawData: state.sofiBeacon.latestRawData,
    headState: state.sofiBeacon.selectedBeaconHeadState,
    historicalGps: state.sofiBeacon.historicalGps,
    beaconModels: state.sofiBeacon.beaconModels,
    me: state.user.me,
    disabledProduct: state.billing.disabledProduct,
    settings: state.sofiBeacon.settings,
    sideButton: state.common.SideButton,
    subscription:state.billing.subscription,
    stripeEnabled: state.common.stripeEnabled,
    providers: state.SIM.providers,
    carriers: state.SIM.carriers,
    iccids: state.SIM.iccids,
    productActivation: state.SIM.productActivation,
    activeDeactivation: state.SIM.activeDeactivation,
})

class SofiBeaconAdmin extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeKey: props.location.pathname.split('/').length>3 ? props.location.pathname.split('/').pop() : 'detail'
        }
    }

    componentDidUpdate (prevProps) {
        prevProps.location!==this.props.location && this.setState({
            activeKey: this.props.location.pathname.split('/').length>3 ? this.props.location.pathname.split('/').pop() : 'detail'
        })
    }

    onTabChanged = (key) => {
        actions.routing.push('/beacon/admin/' + key)
        this.setState({activeKey: key})
    }

    renderDetail = () => {
        const { selectedBeacon, me, beaconModels, disabledProduct, isAdmin, sideButton,subscription, beaconOrgs, stripeEnabled } = this.props

        return <Row type="flex" justify="center">
            <Col xs={22} lg={16}>
                {isAdmin && <BeaconDetailCard selectedBeacon={selectedBeacon} me={me} beaconModels = {beaconModels}/>}

                {isAdmin && <SIMStatusCard
                    selectedDevice={selectedBeacon}
                    {...this.props}
                />
                }
                {sideButton?.rule_action==='admin' && <BeaconSideButtonCard />}
                <ResendDefaultConfig {...this.props} />

                {isAdmin && <CallSettingCard {...this.props} admin={true} />}

                {isAdmin &&<GetBeaconSettings selectedBeacon={selectedBeacon}/>}
                {isAdmin &&<RabbitMQ selectedBeacon={selectedBeacon}/>}
                {selectedBeacon && isAdmin && <BeaconOobeCard selectedBeacon={selectedBeacon} />}
                {selectedBeacon && isAdmin && <DisableCard
                    selectedDevice={selectedBeacon}
                    disableStatus={disabledProduct}
                    subscription={subscription}
                    stripeEnabled={stripeEnabled}
                    orgs={beaconOrgs}
                />}
            </Col>
        </Row>
    }

    renderUser = () => {
        const { selectedBeacon, beaconUsers, allUsers } = this.props
        const unincludedUsers  = allUsers && beaconUsers ?
            allUsers.filter(x => !beaconUsers.find(y => y.user_id === x.user_id)): []

        return <Skeleton loading={beaconUsers === null}>
            <div className="contentPage">
                <Row type="flex" justify="center">
                    <Col xs={24} sm={18}>
                        <BeaconCarers beacon={selectedBeacon} users={beaconUsers}/>
                        <AddBeaconModal beacon={selectedBeacon} allUsers={unincludedUsers} />
                    </Col>
                </Row>
            </div>
        </Skeleton>
    }

    renderRawData = () => {
        const { latestRawData, historicalGps, headState, settings } = this.props

        return <div className="contentPage">
            {historicalGps && historicalGps.length>0 && <BeaconRawDataCard
                receivedTime={moment(historicalGps[historicalGps.length-1].server_received_at).format(globalConstants.LONGDATETIME_FORMAT)}
                rawData={JSON.stringify(historicalGps[historicalGps.length-1])}
                title="Most Recent (Processed) Location History"/>}
            {latestRawData && <BeaconRawDataCard
                rawData={latestRawData.raw_pendant_data}
                receivedTime={moment(latestRawData.server_received_at).format(globalConstants.LONGDATETIME_FORMAT)}
                title="Most Recent (Raw) Data"/>}
            {headState && <BeaconHeadStateData
                headState={headState}
                title="HeadState"
                receivedTime={moment(headState?.last_message_server_received_at).format(globalConstants.LONGDATETIME_FORMAT)}
            />}
            {settings && <BeaconHeadStateData
                headState={settings}
                title="Settings"
                receivedTime={moment(headState?.last_message_server_received_at).format(globalConstants.LONGDATETIME_FORMAT)}
            />}
        </div>
    }

    render() {
        const { isAdmin, beaconOrgs, } = this.props

        return (<PreventAccess allowAccess={isAdmin || beaconOrgs.length>0}>
            <Tabs activeKey={this.state.activeKey} onChange={this.onTabChanged}>
                <TabPane tab="Detail" key='detail'>
                    <Route exact path="/beacon/admin/detail" component={this.renderDetail}/>
                </TabPane>
                {isAdmin && <TabPane tab={`${titleCase(isWatch(this.props.selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC)} Carers`} key='carer'>
                    <Route exact path="/beacon/admin/carer" component={this.renderUser}/>
                </TabPane>
                }
                {isAdmin && <Tabs.TabPane tab="Organisations" key="orgs">
                    <Route exact path="/beacon/admin/orgs" component={()=> <BeaconOrgs />}/>
                </Tabs.TabPane>}
                {isAdmin && <TabPane tab="Raw Data" key='rawdata'>
                    <Route exact path="/beacon/admin/rawdata" component={this.renderRawData}/>
                </TabPane>}
                {isAdmin && <Tabs.TabPane tab="Billing" key="billing">
                    <Route exact path="/beacon/admin/billing" component={()=> <Billing {...this.props} />}/>
                </Tabs.TabPane>
                }

                <Tabs.TabPane tab="History Log" key="history">
                    <Route exact path="/beacon/admin/history" component={()=> <BeaconChangeLogs />}/>
                </Tabs.TabPane>


                <Tabs.TabPane tab="Third Party Integration" key="tpi">
                    <Route exact path="/beacon/admin/tpi" component={()=> <TPAccount />}/>
                </Tabs.TabPane>
            </Tabs>
            <Route
                exact
                path="/beacon/admin"
                render={() => (<Redirect exact to='/beacon/admin/detail' />)}
            />
        </PreventAccess>)
    }
}

export default connect(mapStateToProps)(SofiBeaconAdmin)

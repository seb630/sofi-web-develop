import { Component } from 'react'
import { actions, connect, Redirect, Route } from 'mirrorx'
import { Col, Row, Skeleton, Tabs } from 'antd'
import RadarUsers from './Users/RadarUsers'
import AddRadarUserModal from './Users/AddRadarUserModal'
import PreventAccess from '../../../components/PreventAccess'
import RadarTPAccount from './ThirdParties'
import RadarAdminDetails from './Details'
import RadarActions from './Actions'
import NewActions from './Actions/newIndex'
import { DisableCard } from '../../Admin/Detail/DisableDevice'
import Billing from './Billing'
import Coordinates from '@/pages/Radar/Admin/Coordinates'
import RadarSettingAdminCard from '@/pages/Radar/Admin/Settings'
import { globalConstants } from '@/_constants'
import { titleCase } from 'change-case'

const TabPane = Tabs.TabPane

const mapStateToProps = state => ({
    selectedRadar: state.radar.selectedRadar,
    isAdmin: state.user.me ? state.user.me.authorities.some(role=>role.includes('ADMIN')) : false,
    radarUsers: state.radar.radarUsers,
    radarCommands: state.radar.radarCommands,
    allUsers: state.user.allUsers,
    me: state.user.me,
    disabledProduct: state.billing.disabledProduct,
    radarConfig: state.radar.radarConfig,
    stripeEnabled: state.common.stripeEnabled,
    subscription:state.billing.subscription,
    radarOrgs: state.radar.radarOrgs
})

class RadarAdmin extends Component {
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
        actions.routing.push('/radar/admin/' + key)
        this.setState({activeKey: key})
    }

    renderDetail = () =>{
        const {selectedRadar, isAdmin, disabledProduct, stripeEnabled, subscription} = this.props
        return <Row justify="center" className="contentPage">
            <Col xs={22} xxl={18}>
                <RadarAdminDetails />
                {selectedRadar && isAdmin && <DisableCard
                    selectedDevice={selectedRadar}
                    disableStatus={disabledProduct}
                    stripeEnabled={stripeEnabled}
                    subscription={subscription}
                />}
            </Col>
        </Row>
    }

    renderUser = () => {
        const { selectedRadar, radarUsers, allUsers } = this.props
        const unIncludedUsers  = allUsers && radarUsers ?
            allUsers.filter(x => !radarUsers.find(y => y.user_id === x.user_id)): []

        return <Skeleton loading={radarUsers === null}>
            <Row justify="center" className="contentPage">
                <Col xs={22} xxl={18}>
                    <RadarUsers {...this.props}/>
                    <AddRadarUserModal radar={selectedRadar} allUsers={unIncludedUsers} />
                </Col>
            </Row>
        </Skeleton>
    }

    renderCoordinates = () =>{
        return <Row justify="center" className="contentPage">
            <Col xs={22} xxl={18}>
                <Coordinates {...this.props}/>
            </Col>
        </Row>
    }

    renderSettings = () =>{
        return <Skeleton loading={this.props.radarConfig === null} active><Row justify="center" className="contentPage">
            <Col xs={22} xxl={18}>
                <RadarSettingAdminCard settings={this.props.radarConfig}/>
            </Col>
        </Row>
        </Skeleton>
    }

    renderActions = () => {
        const hostname = window.location.hostname
        const isDevelop = hostname.includes('develop') || hostname.includes('localhost')
        return <Row justify="center" className="contentPage">
            <Col xs={22} xxl={18}>
                {isDevelop ? <NewActions {...this.props} /> : <RadarActions {...this.props} />}
            </Col></Row>
    }

    render() {
        const { isAdmin, radarOrgs, } = this.props

        return (<PreventAccess allowAccess={isAdmin || radarOrgs?.length>0}>
            <Tabs activeKey={this.state.activeKey} onChange={this.onTabChanged}>
                <TabPane tab="Detail" key='detail'>
                    <Route exact path="/radar/admin/detail" component={this.renderDetail}/>
                </TabPane>
                {isAdmin && <TabPane tab={`${titleCase(globalConstants.RADAR_GENERIC)} Users`} key='user'>
                    <Route exact path="/radar/admin/user" component={this.renderUser}/>
                </TabPane>
                }
                {isAdmin && <TabPane tab="All Settings" key='settings'>
                    <Route exact path="/radar/admin/settings" component={this.renderSettings}/>
                </TabPane>
                }
                {isAdmin && <TabPane tab="Actions" key='actions'>
                    <Route exact path="/radar/admin/actions" component={this.renderActions}/>
                </TabPane>
                }
                {/*{isAdmin && <TabPane tab="Coordinates" key='coordinates' disabled>*/}
                {/*    <Route exact path="/radar/admin/coordinates" component={this.renderCoordinates}/>*/}
                {/*</TabPane>*/}
                {/*}*/}
                {isAdmin && <Tabs.TabPane tab="Billing" key="billing">
                    <Route exact path="/radar/admin/billing" component={()=> <Billing {...this.props}/>}/>
                </Tabs.TabPane>}
                <Tabs.TabPane tab="Third Party Integration" key="tpi">
                    <Route exact path="/radar/admin/tpi" component={()=> <RadarTPAccount />}/>
                </Tabs.TabPane>

            </Tabs>
            <Route
                exact
                path="/radar/admin"
                render={() => (<Redirect exact to='/radar/admin/detail' />)}
            />
        </PreventAccess>)
    }
}

export default connect(mapStateToProps)(RadarAdmin)

import { Component } from 'react'
import HeaderBar from '../HeaderBar/'
import { actions, connect, Link } from 'mirrorx'
import { LoadingOutlined } from '@ant-design/icons'
import { Breadcrumb, Layout, message, Spin } from 'antd'
import PropTypes from 'prop-types'
import Sidebar from '../Sidebar/'
import DeviceStatus from '../../../components/DeviceStatus'
import { DownTimeBanner, NewEmailBanner, VerificationBanner } from '../Banner'
import HubInitModal from '../../HubInit'
import BeaconInitModal from '../../SofiBeacon/BeaconInit'
import LifeInitModal from '../../SofiBeacon/LifeInit'
import RadarInitModal from '../../Radar/RadarInit'
import DeviceSelectionModal from '../../HubInit/DeviceSelectionModal'
import { globalConstants } from '@/_constants'
import { isLife, isWatch } from '@/utility/Common'

const { Header, Content } = Layout

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    selectedBeaconHeadState: state.sofiBeacon.selectedBeaconHeadState,
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    selectedRadar: state.radar.selectedRadar,
    sideMenuCollapsed: state.common.sideMenuCollapsed,
    me: state.user.me,
    newHubModal: state.common.newHubModal,
    loading: state.user.loading,
    timezone: state.user.useHubTimeZone && state.setting.settings?.preferences?.timezone
})

class PortalLayout extends Component {
    constructor(props) {
        super(props)
        this.state = {
            mobileModal: false,
        }
    }

    handleRollback = () => {
        actions.user.rollbackNewEmail(this.props.me.user_id).then(() => {
            actions.user.me()
            message.success('Roll back successes!')
        })
    }

    openMobileModal = () => this.setState({ mobileModal: true })

    calculateTimezone = (menu) => {
        let timezone = null
        if (menu === 'hub') {
            timezone = this.props.timezone
        } else if (menu === 'beacon') {
            timezone = this.props.selectedBeacon?.timezone
        }
        return timezone
    }

    /** render Bread Crumb */
    renderBreadCrumb() {
        let menu = this.props.menu || 'hub'
        const { selectedHub, selectedBeaconHeadState, selectedRadar, selectedBeacon } = this.props
        return (
            <Breadcrumb separator=">">
                <Breadcrumb.Item>
                    <Link to={'/deviceSelection'}>
                        {
                            menu === 'hub' ? 
                                globalConstants.HUB_SOFIHUB : 
                                menu === 'radar' ? 
                                    globalConstants.RADAR_HOBA : 
                                    isLife(selectedBeacon)?  
                                        globalConstants.LIFE_SOFIHUB :
                                        isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB
                        }
                    </Link>
                </Breadcrumb.Item>
                {
                    menu === 'hub' && selectedHub &&
                    <Breadcrumb.Item>
                        <Link to={'/dashboard'}>
                            {this.props.selectedHub.display_name}
                            <DeviceStatus status={selectedHub.connectivity_state} />
                        </Link>
                    </Breadcrumb.Item>
                }
                {
                    menu === 'beacon' && selectedBeacon &&
                    <Breadcrumb.Item>
                        <Link to={'/beacon/dashboard'}>
                            {selectedBeacon.display_name}
                            <DeviceStatus status={selectedBeaconHeadState?.beacon_status} />
                        </Link>
                    </Breadcrumb.Item>
                }
                {
                    menu === 'life' && selectedBeacon &&
                    <Breadcrumb.Item>
                        <Link to={'/beacon/dashboard'}>
                            {selectedBeacon.display_name}
                            <DeviceStatus status={selectedBeaconHeadState?.beacon_status} />
                        </Link>
                    </Breadcrumb.Item>
                }
                {
                    menu === 'radar' && selectedRadar &&
                    <Breadcrumb.Item>
                        <Link to={'/radar/dashboard'}>
                            {selectedRadar.display_name}
                            <DeviceStatus status={selectedRadar?.status} />
                        </Link>
                    </Breadcrumb.Item>
                }
                <Breadcrumb.Item>{this.props.page}</Breadcrumb.Item>
            </Breadcrumb>
        )
    }

    render() {
        const { menu, sideMenuCollapsed, page, ctmBreadCrumb
            , aboveContent, content, contentClass, me, loading } = this.props
        const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />
        const timeZone = this.calculateTimezone(menu)
        return (
            <Spin
                tip="This is taking longer than usual, we'll need another minute"
                indicator={antIcon}
                delay={2000}
                spinning={loading}
            >
                <Layout className="fullscreen">
                    <Sidebar onCollapse={() => {
                        actions.common.toggleSideMenu()
                    }} menu={menu} collapsed={sideMenuCollapsed} />
                    <Layout>
                        <Header style={{ background: '#fff', padding: 0 }}>
                            <HeaderBar
                                showToggle
                                breadCrumb={ctmBreadCrumb ? ctmBreadCrumb : page && this.renderBreadCrumb()}
                                mobileModal={this.state.mobileModal}
                                onCloseModal={(state) => this.setState({ mobileModal: state })}
                            />
                        </Header>
                        <Content>
                            <DownTimeBanner timezone={timeZone} />
                            {me &&
                                <VerificationBanner
                                    mobile={me.mobile}
                                    verified={me.phone_verified}
                                    openModal={this.openMobileModal}
                                />
                            }
                            {me &&
                                <NewEmailBanner
                                    newEmail={me.new_email}
                                    rollback={() => this.handleRollback()}
                                />}
                            {aboveContent}
                            <div className={contentClass}>
                                {content}
                            </div>
                            <HubInitModal />
                            <BeaconInitModal />
                            <LifeInitModal />
                            <RadarInitModal />
                            <DeviceSelectionModal />
                        </Content>
                    </Layout>
                </Layout>
            </Spin>
        )
    }
}

PortalLayout.propTypes = {
    page: PropTypes.string,
    selectedHub: PropTypes.object,
    content: PropTypes.node,
    contentClass: PropTypes.string,
    aboveContent: PropTypes.node,
    menu: PropTypes.string,
    ctmBreadCrumb: PropTypes.node,
}

export default connect(mapStateToProps, null)(PortalLayout)

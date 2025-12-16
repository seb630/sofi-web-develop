import { Component } from 'react'
import HeaderBar from '../HeaderBar/'
import { actions, connect, Link } from 'mirrorx'
import { LoadingOutlined } from '@ant-design/icons'
import { Layout, message, Spin } from 'antd'
import PropTypes from 'prop-types'
import { DownTimeBanner, NewEmailBanner, VerificationBanner } from '../Banner'
import HubInitModal from '../../HubInit'
import BeaconInitModal from '../../SofiBeacon/BeaconInit'
import NewClaimModal from '../../SofiBeacon/NewClaimModal'
import LifeInitModal from '../../SofiBeacon/LifeInit'
import DeviceSelectionModal from '../../HubInit/DeviceSelectionModal'
import Logo from '../../../images/logo.svg'
import { isMobile } from 'react-device-detect'
import RadarInitModal from '@/pages/Radar/RadarInit'
import { globalConstants } from '@/_constants'

const { Header, Content } = Layout

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    selectedBeaconHeadState: state.sofiBeacon.selectedBeaconHeadState,
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    sideMenuCollapsed: state.common.sideMenuCollapsed,
    me: state.user.me,
    newHubModal: state.common.newHubModal,
    newBeaconModal: state.common.newBeaconModal,
    newWatchModal: state.common.newWatchModal,
    newLifeModal: state.common.newLifeModal,
    loading: state.user.loading,
})

class DeviceSelectionLayout extends Component {
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

    render() {
        const { ctmBreadCrumb, aboveContent, content, contentClass, me, loading } = this.props
        const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />
        return (
            <Spin
                tip="This is taking longer than usual, we'll need another minute"
                indicator={antIcon}
                delay={2000}
                spinning={loading}
            >
                <Layout className="fullscreen">
                    <Layout>
                        <Header style={{ background: '#fff', padding: 0 }}>
                            <div className="deviceSelection">
                                <div className="deviceSelection__logo">
                                    <Link to="/deviceSelection"><Logo width={125} height={79} /></Link>
                                    {/* {!isMobile && <span className='deviceSelection__version'>{process.env.APP_VERSION}</span>} */}
                                </div>
                                <HeaderBar
                                    {...this.props}
                                    breadCrumb={ctmBreadCrumb}
                                    mobileModal={this.state.mobileModal}
                                    onCloseModal={(state) => this.setState({ mobileModal: state })}
                                />
                            </div>
                        </Header>
                        <Content>
                            <DownTimeBanner />
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
                            {((globalConstants.EV07_CLAIM_FLOW_V2 || globalConstants.EV12_CLAIM_FLOW_V2) && this.props.newBeaconModal) || 
                             (globalConstants.EV06_CLAIM_FLOW_V2 && this.props.newWatchModal) || 
                             (globalConstants.EV04_CLAIM_FLOW_V2 && this.props.newLifeModal) ? 
                                <NewClaimModal /> : null
                            }
                            {((!globalConstants.EV07_CLAIM_FLOW_V2 && !globalConstants.EV12_CLAIM_FLOW_V2) && this.props.newBeaconModal) || 
                             (!globalConstants.EV06_CLAIM_FLOW_V2 && this.props.newWatchModal) ? 
                                <BeaconInitModal /> : null
                            }
                            {!globalConstants.EV04_CLAIM_FLOW_V2 && this.props.newLifeModal ? 
                                <LifeInitModal /> : null
                            }
                            {(!this.props.newBeaconModal && !this.props.newWatchModal && !this.props.newLifeModal) ? 
                                <>
                                    <BeaconInitModal />
                                    <LifeInitModal />
                                </> : null
                            }
                            <RadarInitModal />
                            <DeviceSelectionModal />
                        </Content>
                    </Layout>
                </Layout>
            </Spin>
        )
    }
}

DeviceSelectionLayout.propTypes = {
    selectedHub: PropTypes.object,
    content: PropTypes.node,
    contentClass: PropTypes.string,
    aboveContent: PropTypes.node,
    menu: PropTypes.string,
    ctmBreadCrumb: PropTypes.node,
    showToggle: PropTypes.bool,
}

export default connect(mapStateToProps, null)(DeviceSelectionLayout)

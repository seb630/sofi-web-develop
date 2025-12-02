import { Component, createRef, Fragment } from 'react'
import PortalLayout from '../Common/Layouts/PortalLayout'
import Anomalies from './Anomalies'
import Messages from './Messages'
import Sensors from './Sensors'
import Status from './Status'
import Occupancies from './Occupancies'

import { Col, Row, Spin } from 'antd'
import { actions, connect } from 'mirrorx'
import DownTime from '../../_constants/downtime'
import moment from 'moment'
import LinkedBeacons from './LinkedBeacons'
import { ExpiryBanner, WelcomeBanner } from '../Common/Banner'
import HubWelcomePage from '../Welcome'
import OobeModal from '@/pages/Welcome/Modal'
import { getOobeStorage } from '@/utility/Storage'

const latestDownTime = DownTime[DownTime.length - 1]
const start = moment(latestDownTime.outageDateTimeStart)
const end = moment(latestDownTime.outageDateTimeEnd)
const blockAccess = latestDownTime.blockPortalAccess


const mapStateToProps = state => ({
    admin: state.user.me?.authorities.some(role=>role.includes('ADMIN')),
    timezone: state.user.useHubTimeZone && state.setting.settings?.preferences?.timezone,
    productActivation: state.SIM.productActivation,
    subscription: state.billing.subscription,
    stripeEnabled: state.common.stripeEnabled
})

class DashboardPage extends Component {
    constructor(props) {
        super(props)
        this.state={
            oobeModal: false
        }
        this.left = createRef()
        this.right = createRef()
    }

    componentDidMount () {
        if (moment().isBetween(start,end) && blockAccess){
            actions.routing.push('/offline')
        }
    }

    componentDidUpdate = (prevProps) => {
        const { selectedHub } = this.props
        if(prevProps.selectedHub !== selectedHub){
            this.checkOobeModal()
        }
    }

    checkOobeModal = () => {
        const deviceOobe = getOobeStorage().find(item=>item.device_id === this.props.selectedHub.hub_id)
        if (!deviceOobe || deviceOobe && !deviceOobe.skip){
            this.setState({oobeModal: true})
        }
    }

    /** render page content */
    renderPageContent() {
        const { selectedHub , hubStatus, lastKnown, sensors, admin, selectedHubBeacons, loading, timezone } = this.props
        const leftHeight= this.left.clientHeight
        const rightHeight= this.right.clientHeight

        return (
            <Spin spinning={loading} >
                <Row gutter={24} >
                    <Col sm={24} xl={12} >
                        <div ref={left=>this.left=left}>
                            {selectedHub &&
                <Status
                    hubStatus={hubStatus || {}}
                    hub={selectedHub}
                    lastKnown={lastKnown}
                    admin={admin}
                    timezone={timezone}
                />
                            }
                            <Row style={{marginBottom:24}}>
                                <Col span={24}>
                                    <Sensors sensors={sensors} hub={selectedHub} admin={admin}/>
                                </Col>
                            </Row>
                            {leftHeight < rightHeight && selectedHubBeacons.length>0 && <LinkedBeacons />}
                        </div>

                    </Col>
                    <Col sm={24} xl={12} >
                        <div ref={right=>this.right=right}>
                            <Row style={{marginBottom:24}}>
                                <Col span={24}>
                                    <Messages />
                                </Col>
                            </Row>
                            <Row style={{marginBottom:24}}>
                                <Col span={24}>
                                    <Occupancies />
                                </Col>
                            </Row>
                            {leftHeight >= rightHeight && selectedHubBeacons.length>0 && <LinkedBeacons />
                            }
                        </div>
                    </Col>
                </Row>
            </Spin>
        )
    }

    render() {
        const { anomalies,selectedHub, subscription, stripeEnabled } = this.props
        const oobe = selectedHub && selectedHub.oobe_state==='NONE'
        const deviceOobe = getOobeStorage()?.find(item=>item.device_id === selectedHub?.hub_id)
        return (
            <PortalLayout
                menu='hub'
                page="Dashboard"
                contentClass="contentPage"
                content={ this.renderPageContent()}
                aboveContent={<Fragment>{anomalies && <Anomalies anomalies={anomalies}/>}
                    {oobe && <WelcomeBanner
                        oobe={oobe}
                        openModal={()=>actions.common.changeHubWelcomeModal(true)}
                    />}
                    {oobe && <OobeModal
                        open={this.state.oobeModal}
                        openModal={()=>actions.common.changeHubWelcomeModal(true)}
                        onCancel={()=>this.setState({oobeModal: false})}
                        deviceOobe={deviceOobe}
                        selectedDevice={selectedHub}
                    />}
                    {oobe && <HubWelcomePage />}
                    {stripeEnabled && <ExpiryBanner subscription={subscription}/>}
                </Fragment>
                }/>
        )
    }
}

export default connect(mapStateToProps, null) (DashboardPage)

import { Component } from 'react'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Card, Col, Modal, Row, Tooltip } from 'antd'
import TwoSwitchCard from './twoSwitchCard'
import { connect } from 'mirrorx'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    userHubs: state.user.userHubs,
    me: state.user.me
})

class Notification extends Component{
    constructor(props) {
        super(props)
        this.state = {
            noAccess: !props.userHubs.find(hub => hub.hub_id === props.selectedHub.hub_id),
            modal: true
        }
    }

    componentDidUpdate (prevProps) {
        if (prevProps.userHubs !== this.props.userHubs){
            const noAccess = !this.props.userHubs.find(hub => hub.hub_id === this.props.selectedHub.hub_id)
            this.setState({noAccess: noAccess,})
            noAccess && this.adminModal()
        }
    }

    renderTitle = () => {
        return <div className="advanced_block">
            <div>
                Get notified when something happens on this {globalConstants.HUB_SOFIHUB}
            </div>
            <span className="desc">
                Get notified when something happens on the {globalConstants.HUB_SOFIHUB} or sensors. Please note these notification settings apply
                to only you, if another carer would like to be notified about these settings, they must login and change
                these settings themselves.
            </span>
        </div>
    }

    adminModal = () => Modal.info({
        title: 'Hold on there admin user!',
        content: (
            <div>
                You are an admin user, and you can see this hub, but you are not a carer for this {globalConstants.HUB_SOFIHUB}.
                Changing any settings on this page will not have any effect until you assign yourself
                as a carer for this {globalConstants.HUB_SOFIHUB}.
            </div>
        ),
        okText: 'I understand'
    })

    render(){
        const hubUserSetting = this.props.userHubs.find(hub => hub.hub_id === this.props.selectedHub.hub_id)
        return this.props.selectedHub && this.props.me &&
        <Row type="flex" justify="center">
            <Col xs={22} xl={16}>
                <Card title={this.renderTitle()} className="notificationCard">
                    <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}}>
                        <Col xs={24} sm={12}>
                            <TwoSwitchCard
                                selectedHub={hubUserSetting}
                                userId={this.props.me.user_id}
                                feature="hub_offline"
                                featureTitle={`${globalConstants.HUB_SOFIHUB} Status`}
                                featureDescription={`When enabled, email notifications are sent when the ${globalConstants.HUB_SOFIHUB} goes offline`}
                            />
                        </Col>
                        <Col xs={24} sm={12}>
                            <TwoSwitchCard
                                selectedHub={hubUserSetting}
                                userId={this.props.me.user_id}
                                feature="hub_low_battery"
                                featureTitle={`${globalConstants.HUB_SOFIHUB} Low Battery`}
                                featureDescription={`When enabled, email notifications are sent when the ${globalConstants.HUB_SOFIHUB} battery is low`}
                            />
                        </Col>
                    </Row>
                    <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}}>
                        <Col xs={24} sm={12}>
                            <TwoSwitchCard
                                selectedHub={hubUserSetting}
                                userId={this.props.me.user_id}
                                feature="sensor_offline"
                                featureTitle="Sensor Status"
                                featureDescription={`When enabled, email notifications are sent when the ${globalConstants.HUB_SOFIHUB} sensor goes offline. 
                        (Will not message when ${globalConstants.HUB_SOFIHUB} is offline)`}
                            />
                        </Col>
                        <Col xs={24} sm={12}>
                            <TwoSwitchCard
                                selectedHub={hubUserSetting}
                                userId={this.props.me.user_id}
                                feature="sensor_low_battery"
                                featureTitle="Sensor Low Battery"
                                featureDescription={`When enabled, email notifications are sent when the ${globalConstants.HUB_SOFIHUB} sensor battery is low`}
                            />
                        </Col>
                    </Row>
                    <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}}>
                        <Col xs={24} sm={12}>
                            <TwoSwitchCard
                                selectedHub={hubUserSetting}
                                userId={this.props.me.user_id}
                                feature="hub_power"
                                featureTitle={`${globalConstants.HUB_SOFIHUB} Power`}
                                featureDescription={<div>
                                    When enabled, email notifications are sent when the {globalConstants.HUB_SOFIHUB} loses main power. &nbsp;
                                    <Tooltip
                                        title={`Before we send a notification letting you know that the power cable has been unplugged or that there is a power 
                                        outage, we will check that the ${globalConstants.HUB_SOFIHUB} has not been connected to power for 5 minutes or more. If after a five minutes the power has not come back we will then notify you.`}>
                                        <InfoCircleOutlined />
                                    </Tooltip>
                                </div>
                                }
                            />
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    }
}

export default connect(mapStateToProps, null) (Notification)

import { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Col, Row, Tooltip } from 'antd'
import TwoSwitchCard from './twoSwitchCard'
import { globalConstants } from '@/_constants'
import { titleCase } from 'change-case'

export default class Notifications extends Component{

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render(){
        return (
            <Fragment>
                <Row>
                    <Col xs={24} sm={12} lg={{offset:2, span:8}} className="zeroPadding">
                        <TwoSwitchCard
                            hubId={this.props.hubId}
                            userId={this.props.userId}
                            hubUser={this.props.hubUser}
                            feature="hub_offline"
                            featureTitle={`${titleCase(globalConstants.HUB_GENERIC)} Status`}
                            featureDescription={`Tell me when the ${globalConstants.HUB_GENERIC} is offline and has come back online`}
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={{offset:2, span:8}} className="zeroPadding">
                        <TwoSwitchCard
                            hubId={this.props.hubId}
                            userId={this.props.userId}
                            hubUser={this.props.hubUser}
                            feature="hub_low_battery"
                            featureTitle={`${titleCase(globalConstants.HUB_GENERIC)} Low Battery`}
                            featureDescription={`Tell me when the battery in the ${globalConstants.HUB_GENERIC} is low`}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={24} sm={12} lg={{offset:2, span:8}} className="zeroPadding">
                        <TwoSwitchCard
                            hubId={this.props.hubId}
                            userId={this.props.userId}
                            hubUser={this.props.hubUser}
                            feature="sensor_offline"
                            featureTitle="Sensor Status"
                            featureDescription={`Tell me when a sensor is offline and has come back online
                            (Will not message when ${globalConstants.HUB_GENERIC} is offline)`}
                        />
                    </Col>
                    <Col xs={24} sm={12} lg={{offset:2, span:8}} className="zeroPadding">
                        <TwoSwitchCard
                            hubId={this.props.hubId}
                            userId={this.props.userId}
                            hubUser={this.props.hubUser}
                            feature="sensor_low_battery"
                            featureTitle="Sensor Low Battery"
                            featureDescription="Tell me when the battery in a sensor is low"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={24} sm={12} lg={{offset:2, span:8}} className="zeroPadding">
                        <TwoSwitchCard
                            hubId={this.props.hubId}
                            userId={this.props.userId}
                            hubUser={this.props.hubUser}
                            feature="hub_power"
                            featureTitle="Hub Power"
                            featureDescription={<div>
                                Tell me when the {globalConstants.HUB_GENERIC} is unplugged from main power &nbsp;
                                <Tooltip title="Before we send a notification letting you know that the power cable has been unplugged or that there is a power outage, we will check that the hub has not been connected to power for 5 minutes or more. If after a five minutes the power has not come back we will then notify you.">
                                    <InfoCircleOutlined />
                                </Tooltip>
                            </div>
                            }
                        />
                    </Col>
                </Row>
            </Fragment>
        )
    }
}

Notifications.propTypes = {
    hubUser: PropTypes.object.isRequired,
    hubId: PropTypes.string.isRequired,
    userId: PropTypes.number.isRequired,
}

import { Component } from 'react'
import { connect } from 'mirrorx'
import { Row, Col } from 'antd'
import FeatureSwitchCard from '../../Settings/Advance/oneSwitchCard'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
})

class Feature extends Component{
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render(){
        return (
            <div>
                <Row className="systemDetails">
                    <Col xs={12} lg={{offset:2, span:8}} className="zeroPadding">
                        <FeatureSwitchCard
                            selectedHub={this.props.selectedHub}
                            featureFlags={this.props.featureFlags}
                            feature="anomaly_debugging"
                            featureTitle="Announce Raised Anomalies"
                            featureDescription="Announce Raised Anomalies"
                        />
                    </Col>
                    <Col xs={12} lg={{offset:2, span:8}} className="zeroPadding">
                        <FeatureSwitchCard
                            selectedHub={this.props.selectedHub}
                            featureFlags={this.props.featureFlags}
                            feature="increase_anomaly_volume"
                            featureTitle="Increase Anomaly Volume"
                            featureDescription="Play Anomaly Messages at 100% volume"
                        />
                    </Col>
                </Row>
                <Row className="systemDetails">
                    <Col xs={12} lg={{offset:2, span:8}} className="zeroPadding">
                        <FeatureSwitchCard
                            selectedHub={this.props.selectedHub}
                            featureFlags={this.props.featureFlags}
                            feature="non_production_hardware"
                            featureTitle="Non-Production Hub"
                            featureDescription="i.e. RPi with no button/volume dial"
                        />
                    </Col>
                    <Col xs={12} lg={{offset:2, span:8}} className="zeroPadding">
                        <FeatureSwitchCard
                            selectedHub={this.props.selectedHub}
                            featureFlags={this.props.featureFlags}
                            feature="domoticz_event_tracking"
                            featureTitle="Domoticz Event Tracking"
                            featureDescription="Include Domoticz Events in Trace Files"
                        />
                    </Col>
                </Row>
            </div>)
    }
}


export default connect(mapStateToProps, null) (Feature)

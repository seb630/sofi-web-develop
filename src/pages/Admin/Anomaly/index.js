import { Component } from 'react'
import { connect } from 'mirrorx'
import { Row, Col } from 'antd'
import AnomalyOneSwitchCard from './oneSwitchCard'
import FeatureSwitchCard from '../../Settings/Advance/oneSwitchCard'


const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    hubUsers: state.hub.hubUsers || [],
})

class Anomaly extends Component{
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
                        <AnomalyOneSwitchCard
                            selectedHub={this.props.selectedHub}
                            anomalyPreferences={this.props.anomalyPreferences}
                            feature="long_bathroom"
                            featureTitle="Long Bathroom Duration"
                            featureDescription="Enable Long Bathroom Duration anomaly"
                        />
                    </Col>
                    <Col xs={12} lg={{offset:2, span:8}} className="zeroPadding">
                        <AnomalyOneSwitchCard
                            selectedHub={this.props.selectedHub}
                            anomalyPreferences={this.props.anomalyPreferences}
                            feature="not_woken_up"
                            featureTitle="Late to Wake"
                            featureDescription="Enable Late to Wake anomaly"
                        />
                    </Col>
                </Row>
                <Row className="systemDetails">
                    <Col xs={12} lg={{offset:2, span:8}} className="zeroPadding">
                        <AnomalyOneSwitchCard
                            selectedHub={this.props.selectedHub}
                            anomalyPreferences={this.props.anomalyPreferences}
                            feature="not_gone_to_bed"
                            featureTitle="Late to Bed"
                            featureDescription="Enable Late to Bed anomaly"
                        />
                    </Col>
                    <Col xs={12} lg={{offset:2, span:8}} className="zeroPadding">
                        <AnomalyOneSwitchCard
                            selectedHub={this.props.selectedHub}
                            anomalyPreferences={this.props.anomalyPreferences}
                            feature="night_wandering"
                            featureTitle="Night Wandering"
                            featureDescription="Enable Night Wandering anomaly"
                        />
                    </Col>

                </Row>
                <Row className="systemDetails">
                    <Col xs={12} lg={{offset:2, span:8}} className="zeroPadding">
                        <FeatureSwitchCard
                            carers={this.props.hubUsers}
                            selectedHub={this.props.selectedHub}
                            featureFlags={this.props.featureFlags}
                            feature="notify_carer_on_anomaly"
                            featureTitle="Notify Carer On Anomaly"
                            featureDescription="Notify Carer On Anomaly"
                        />
                    </Col>
                    <Col xs={12} lg={{offset:2, span:8}} className="zeroPadding">
                        <FeatureSwitchCard
                            warning={this.props.featureFlags.notify_resident_on_anomaly==='DISABLED' && this.props.featureFlags.notify_carer_on_anomaly==='DISABLED'}
                            selectedHub={this.props.selectedHub}
                            featureFlags={this.props.featureFlags}
                            feature="notify_resident_on_anomaly"
                            featureTitle="Notify Resident On Anomaly"
                            featureDescription="Notify Resident On Anomaly"
                        />
                    </Col>
                </Row>
            </div>)
    }
}


export default connect(mapStateToProps, null) (Anomaly)

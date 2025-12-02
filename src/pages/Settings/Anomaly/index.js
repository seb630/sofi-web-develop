import { Component } from 'react'
import {connect, actions} from 'mirrorx'
import {Row, Col, Card, Modal} from 'antd'
import OneSwitchComponent from './oneSwitchComponent'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    featureFlags: state.setting.featureFlags,
    anomalyPreferences: state.setting.anomalyPreferences,
    settings: state.setting.settings,
    hubDevices: state.hub.hubDevices || [],
    hubSpaces: state.hub.hubSpaces || [],
    hubUsers: state.hub.hubUsers || [],
    admin: state.user.me?.authorities.some(role=>role.includes('ADMIN')),
})

class Anomaly extends Component{
    constructor(props) {
        super(props)
        this.state = {
            bath: this.props.settings && parseInt(this.props.settings.routine.bathing.duration/60000,10)
        }
    }

    hasRequiredSensors = () => {
        return this.hasBathroom() || this.hasBedroom()
    }

    hasBathroom = () => {
        const {hubDevices, hubSpaces} = this.props
        let bathroom = false
        hubDevices.map((sensor)=>{
            const space = hubSpaces.find(space=> space.space_id === sensor.space_id)
            const kind = space && space.kind
            bathroom = bathroom || kind === 'BATHROOM'
        })
        return bathroom
    }

    hasBedroom = () => {
        const {hubDevices, hubSpaces} = this.props
        let bedroom = false
        hubDevices.map((sensor)=>{
            const space = hubSpaces.find(space=> space.space_id === sensor.space_id)
            const kind = space && space.kind
            bedroom = bedroom || kind === 'BEDROOM'
        })
        return bedroom
    }

    showDisabledInfo = () => {
        Modal.info({
            title:'You must turn on notify carer to turn on this feature.',
            okText: 'Okay',
            content: 'You cannot enable notify resident without notifying the carer when an anomaly occurs. ' +
                'Please make sure you have the notify carers option switched on.'
        })
    }

    render(){
        const {admin, selectedHub, settings, featureFlags, anomalyPreferences, hubUsers} = this.props
        const sensorFlag = this.hasRequiredSensors()
        const available = (sensorFlag || admin) && settings && featureFlags && anomalyPreferences
        const disableAnomaly = featureFlags?.notify_carer_on_anomaly==='DISABLED' && featureFlags.notify_resident_on_anomaly==='DISABLED'
        return (
            available ?
                <div>
                    <Row align="middle" justify="center" type="flex" >
                        <Col xs={22} md={16} className="zeroPadding">
                            <Card className="advanced_block" title="1. Before getting started with anomalies">
                                <p>Before getting started with anomalies there are a few things you should know:</p>
                                <ol>
                                    <li>
                                    Anomalies are based on the <a onClick={()=>this.props.onKeyChange('routine')}>residents routine</a>.
                                    Make sure that its correct and up to date.
                                    </li>
                                    <li>Anomalies can be set to notify the resident, the carer, or both.
                                        SofiHub recommends that both are notified.
                                    </li>
                                    <li>When an anomaly is detected it can be dismissed by pressing Sofi&#39;s top button.
                                        Alternatively it can be dismissed via the <a onClick={()=>actions.routing.push('/alerts')}>portal</a>
                                    </li>
                                    <li>When an anomaly is detected the resident has a five minute window where they can dismiss
                                        the anomaly before carers are notified.
                                    </li>
                                    <li>If anomalies are set off to often make sure the <a onClick={()=>this.props.onKeyChange('routine')}>
                                        resident routine</a> is up to date, or perhaps sensors may need to be repositioned.
                                    </li>

                                </ol>
                                Let&#39;s get started!
                            </Card>
                        </Col>
                    </Row>
                    <Row align="middle" justify="center" type="flex" >
                        <Col xs={22} md={16} className="zeroPadding">
                            <Card className="advanced_block" title='2. Who should be notified?'>
                                <OneSwitchComponent
                                    type="feature"
                                    selectedHub={selectedHub}
                                    carers={hubUsers}
                                    featureFlags={featureFlags}
                                    feature="notify_carer_on_anomaly"
                                    featureTitle={
                                        <div>Notify Carer On Anomaly -
                                            <span className="redTooltip"> Sofihub recommends turning on this setting</span>
                                        </div>
                                    }
                                    featureDescription={
                                        <div>
                                            <p>
                                                When turned on, all carers which can access this SofiHub will be notified about
                                                anomalies in progress.
                                            </p>
                                        </div>
                                    }
                                />

                                <OneSwitchComponent
                                    type="feature"
                                    disabled={disableAnomaly}
                                    selectedHub={selectedHub}
                                    featureFlags={featureFlags}
                                    feature="notify_resident_on_anomaly"
                                    featureTitle={
                                        <div>Notify Resident On Anomaly -
                                            <span className="redTooltip"> {featureFlags.notify_carer_on_anomaly==='ENABLED' ?
                                                'Sofihub recommends turning on this setting':
                                                <span onClick={this.showDisabledInfo}>You must enable notify carer to enable this feature
                                                </span>}</span>
                                        </div>
                                    }
                                    featureDescription={
                                        <div>
                                            <p>
                                                When turned on, residents will hear Sofi speak to them asking them if they are okay.
                                                It will also let them know that pressing the top button will let Sofi know they are okay.
                                                This feature is only available when notify carer on anomaly is turned on.
                                            </p>
                                        </div>
                                    }
                                />


                            </Card>
                        </Col>
                    </Row>
                    <Row align="middle" justify="center" type="flex" >
                        <Col xs={22} md={16} className="zeroPadding">
                            <Card className="advanced_block" title='3. What anomalies should Sofihub try to detect?'>
                                {disableAnomaly && <span className="redTooltip title margin-bottom">
                                    You cannot turn these options on without first at least turning on notifying carers on anomaly above
                                </span>}
                                <OneSwitchComponent
                                    disabled={disableAnomaly}
                                    type="anomaly"
                                    selectedHub={selectedHub}
                                    anomalyPreferences={anomalyPreferences}
                                    feature="long_bathroom"
                                    featureTitle="Long Bathroom Duration"
                                    featureDescription={
                                        <div><p>
                                            Long bathroom duration anomalies are based on the resident’s bathroom activity and the <a
                                                onClick={()=>this.props.onKeyChange('routine')}>routine</a> saved on the hub.
                                            If the resident spends longer than {this.state.bath} minutes in the bathroom the anomaly will
                                            be raised.
                                        </p></div>
                                    }
                                />

                                <OneSwitchComponent
                                    disabled={disableAnomaly}
                                    type="anomaly"
                                    selectedHub={selectedHub}
                                    anomalyPreferences={anomalyPreferences}
                                    feature="not_gone_to_bed"
                                    featureTitle="Late To Bed"
                                    featureDescription={
                                        <div><p>
                                            Late to bed anomalies are based on bedroom activity and
                                            the <a onClick={()=>this.props.onKeyChange('routine')}>routine</a> saved on the hub.
                                            A late to bed anomaly may be raised if the resident is not in their bedroom
                                            by {settings.routine.sleeping.weekdays.latest} on a weeknight
                                            or {settings.routine.sleeping.weekends.latest} on a weekend.
                                        </p></div>
                                    }
                                />

                                <OneSwitchComponent
                                    disabled={disableAnomaly}
                                    type="anomaly"
                                    selectedHub={selectedHub}
                                    anomalyPreferences={anomalyPreferences}
                                    feature="not_woken_up"
                                    featureTitle="Late To Wake"
                                    featureDescription={
                                        <div><p>
                                            Late to wake anomalies are based on
                                            the <a onClick={()=>this.props.onKeyChange('routine')}>routine</a> and whether or not the resident
                                            has left their bedroom and entered the {settings.preferences.speaker_spaces[0]} by {
                                                settings.routine.waking.weekdays.latest} on weekdays and {
                                                settings.routine.waking.weekends.latest} on a weekend.
                                        </p>
                                        </div>
                                    }
                                />
                            </Card>
                        </Col>
                    </Row>
                </div>
                : <Row align="middle" justify="center" type="flex" >
                    <Col xs={22} md={16} className="zeroPadding">
                        <Card className="advanced_block" title="Anomalies are not available on your hub">
                            <p>Your hub does not support anomalies because it does not have enough sensors. You need at least one
                                sensor allocated to a room of type bedroom, and one sensor allocated to a room of type bathroom.</p>
                        </Card>
                    </Col>
                </Row>)
    }
}


export default connect(mapStateToProps, null) (Anomaly)

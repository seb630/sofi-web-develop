import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { AlertOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import {Button, Card, Col, Divider, Modal, Row, Slider, Switch} from 'antd'
import { globalConstants } from '@/_constants'
import OldBeaconFall from './OldBeaconFall'
import { sliderFormatter, isLife, isWatch } from '@/utility/Common'

const mapStateToProps = state => ({
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    selectedBeaconHeadState: state.sofiBeacon.selectedBeaconHeadState,
    parsedBeaconSettings: state.sofiBeacon.selectedBeaconHeadState?.device_settings && JSON.parse(state.sofiBeacon.selectedBeaconHeadState.device_settings),
    beaconFeatures: state.sofiBeacon.beaconFeatures
})

class BeaconFallDetection extends Component {
    constructor(props) {
        super(props)

        this.state = {
            sensitivity: props.parsedBeaconSettings?.enabled ? props.parsedBeaconSettings?.fall_down_level : '0'
        }
    }

    reset = () => {
        this.setState({
            sensitivity: this.props.parsedBeaconSettings?.fall_detection_on ? this.props.parsedBeaconSettings?.fall_down_level : '0'
        })
    }


    componentDidUpdate(prevProps) {
        prevProps.parsedBeaconSettings !== this.props.parsedBeaconSettings && this.setState({
            sensitivity: this.props.parsedBeaconSettings?.fall_detection_on ? this.props.parsedBeaconSettings?.fall_down_level : '0'
        })
    }

    renderSwitchedOn = () => (
        <Row  justify="center">
            <Col>
                <Row  align="middle">
                    <Col><CheckCircleOutlined className="good fallIcon" /> </Col>
                    <Col>
                        Fall detection is switched on.
                    </Col>
                </Row>
            </Col>
        </Row>
    )

    renderSwitchedOff = () =>(
        <Row  justify="center">
            <Col>
                <Row  align="middle">
                    <Col><CloseCircleOutlined className="fallIcon" /> </Col>
                    <Col>Fall detection is switched off.</Col>
                </Row>
            </Col>
        </Row>
    )

    handleSend = () =>{
        let payload = {}
        payload.beacon_id = this.props.selectedBeacon.pub_id
        payload.enabled = this.state.sensitivity!==0
        payload.level = this.state.sensitivity
        actions.sofiBeacon.updateBeaconFall(payload).then(()=>{
            Modal.success({
                title: `Fall detection settings are being sent to the ${globalConstants.PENDANT_GENERIC}.`,
                content: 'This may take 30 minutes or more depending on your settings.'
            })
            actions.sofiBeacon.fetchBeaconHeadState(this.props.selectedBeacon.pub_id)
        }
        )
    }

    newBeaconSetting = () => {
        const {parsedBeaconSettings, beaconFeatures, selectedBeacon} = this.props
        const switchedOn = parsedBeaconSettings?.fall_detection_on
        const deviceType = isLife(selectedBeacon) ?
            globalConstants.LIFE_SOFIHUB :
            isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB

        return (
            selectedBeacon && beaconFeatures && <Row justify="center" align="middle">
                <Col xs={24} >
                    <Card
                        className="beacon-card"
                        title={<span><AlertOutlined className="fallIcon" />Fall Detection</span>}
                    >
                        {switchedOn ? this.renderSwitchedOn() : this.renderSwitchedOff()}
                        <Divider />
                        <h4>Change Fall Detection Settings</h4>
                        {beaconFeatures[selectedBeacon.model]?.min_fall_level !== 0 && beaconFeatures[selectedBeacon.model]?.max_fall_level !== 0  ? <>
                            <p>To turn on fall detection you need to set the sensitivity level and press &quot;Send&quot;.
                                Turn off fall detection by changing the sensitivity to off and press &quot;Send&quot;.
                            </p>
                            <ol>
                                <li>First tell how sensitive you&#39;d like the fall detection to be, where 1 is the least
                                    sensitive and 9 is the most sensitive.</li>
                                <Row  justify="center">
                                    <Col xs={20} lg={16}>
                                        <Slider
                                            min={0}
                                            max={9}
                                            tooltip={{
                                                formatter: sliderFormatter
                                            }}
                                            value={Number.parseInt(this.state.sensitivity)}
                                            onChange={v=>this.setState({sensitivity: v})}
                                            marks={{1: 'Least', 9: 'Most', 0: 'Off'}}
                                        />
                                    </Col>
                                </Row>
                                <li>Press send and wait for your {deviceType} to receive the command:</li>
                                <Row  justify="center">
                                    <Col>
                                        <Button onClick={this.reset} className="margin-right">Cancel</Button>
                                        <Button type="primary" onClick={this.handleSend}>Send</Button>
                                    </Col>
                                </Row>
                            </ol>
                            <p>Your {deviceType} will receive the command the next time it checks in with the Cloud. Depending on your battery
                                settings, this could take more than 30 minutes.</p>
                            <p>
                                We recommend you drop your {deviceType} onto a pillow to test it, if you are an emergency contact
                                for the {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : 'beacon'} you should receive an SMS or phone call or both, if you do not try turning
                                up the sensitivity to the desired level. Likewise if it is too sensitive you can turn it
                                down to your the desired level.
                            </p>
                        </> : <>
                            <p>To turn on or off fall detection you need to click the switch below and press &quot;Send&quot;.</p>

                            <Row justify="center" className="margin-bottom">
                                <Col>Fall Detection: </Col>
                                <Col>
                                    <Switch
                                        checked={this.state.sensitivity>0}
                                        checkedChildren="On"
                                        unCheckedChildren="off"
                                        onChange={checked=>this.setState({sensitivity: checked?1:0})}
                                    />
                                </Col>
                            </Row>

                            <Row  justify="center">
                                <Col>
                                    <Button onClick={this.reset} className="margin-right">Cancel</Button>
                                    <Button type="primary" onClick={this.handleSend}>Send</Button>
                                </Col>
                            </Row>

                            <p>Your {deviceType} will receive the command the next time it checks in with the Cloud. Depending on your battery
                                settings, this could take more than 30 minutes.</p>
                        </>}
                    </Card>
                </Col>
            </Row>
        )
    }

    render() {
        const oldBeacon = this.props.selectedBeacon && this.props.selectedBeacon.model === globalConstants._3G_BEACON_MODEL
        return (
            oldBeacon ? <OldBeaconFall settings/>: this.newBeaconSetting()
        )
    }

}

export default connect(mapStateToProps, null) (BeaconFallDetection)

import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { ControlOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { Button, Card, Col, Collapse, Divider, Modal, Row, Slider } from 'antd'
import { isMobile } from 'react-device-detect'
import Gps3Min from '@/images/gps_3mins-min.webp'
import Gps5Min from '@/images/gps_5mins-min.webp'
import Gps10Min from '@/images/gps_10mins-min.webp'
import Media from 'react-media'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import { isLife, isWatch } from '@/utility/Common'

const mapStateToProps = state => ({
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    settings: state.sofiBeacon.settings,
    powerOptions: state.sofiBeacon.powerOptions,
})

class BeaconPowerOption extends Component {
    constructor(props) {
        super(props)

        this.state = {
            time: props.settings?.upload ? 
                moment.duration(props.settings.upload).asMinutes() : 
                props.powerOptions?.suggest_reporting_interval_in_minutes ?? 10
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.settings !== this.props.settings && this.setState({
            time: this.props.settings?.upload ? 
                moment.duration(this.props.settings.upload).asMinutes() : 
                this.props.powerOptions?.suggest_reporting_interval_in_minutes ?? 10
        })
    }

    reset = () => {
        this.setState({
            time: this.props.settings?.upload ? 
                moment.duration(this.props.settings.upload).asMinutes() : 
                this.props.powerOptions?.suggest_reporting_interval_in_minutes ?? 10
        })
    }

    handleSend = () => {
        const { settings, selectedBeacon, powerOptions } = this.props
        const currentUploadTimeInMinute = powerOptions?.suggest_reporting_interval_in_minutes ?? 10
        let payload = {}
        payload.beacon_id = selectedBeacon.pub_id
        payload.feature = 'workmode'
        payload.mode = 2
        payload.heartbeat_interval = 'PT5M'
        payload.upload_interval = `PT${this.state.time}M`
        actions.sofiBeacon.postTCPSettings(payload).then(() => {
            Modal.success({
                content: <div>We&#39;re saving your changes, it might take {currentUploadTimeInMinute} minutes or more. While the changes are
                    being saved you will see the old setting of {currentUploadTimeInMinute} minutes.</div>
            })
            actions.sofiBeacon.getBeaconSettings(payload.beacon_id)
        })
    }

    calculateBatteryLife = (time) => {
        try {
            const { powerOptions } = this.props
            console.log(this.props)
            console.log(powerOptions)
            const options = new Map(Object.entries(powerOptions?.battery_life_interval_estimate))
            var last = 10
            for (let [key, value] of options) {
                if (time <= key) return value
                last = value
            }
            return last
        } catch (e) {
            return 0
        }
    }

    renderWorkMode = (deviceType) => {
        return<> 
            <Row  justify="center">
                <Col>
                    <Row  align="middle">
                        <Col><CheckCircleOutlined className="good fallIcon" /> </Col>
                        <Col>
                        Your {deviceType} is already configured for the best battery life.
                        </Col>
                    </Row>
                </Col>
            </Row></>
    }

    renderNormalMode = (deviceType, time, min, max, marks) => {
        return <><p>
            Here you can change power and battery options to get more frequent updates or better battery life. Battery life
            on your {deviceType} can depend on how good 3G / 4G reception is where you currently are as well as how
            active your lifestyle is.
        </p><Divider /><h4>Change Update frequency</h4><p>Changing the update frequency affects your battery life. Less updates means longer battery life, more updates
            means less battery life. A person with a more active lifestyle may need to have less frequent updates to ensure
                their {deviceType} can last a number of days without charging. Your {deviceType} is currently set to an
                update frequency of {time} minutes.
        </p><Media query='(max-width:800px)'>
            {matches => matches ?
                <Fragment>
                    <h4>Update frequency: {time} minutes</h4>
                    <Row type="flex" justify="center" className="margin-bottom">
                        <Col xs={20} lg={16}>
                            <Slider
                                min={min}
                                max={max}
                                tooltip={{
                                    formatter: value => `${value} minutes`
                                }}
                                value={this.state.time}
                                onChange={v => this.setState({ time: v })}
                                marks={marks} />
                        </Col>
                    </Row>
                    <Row type="flex" justify="center" className="margin-bottom">
                        <Col>
                            <Button onClick={this.reset} className="margin-right">Cancel</Button>
                            <Button type="primary" onClick={this.handleSend}>Save and Send</Button>
                        </Col>
                    </Row>
                    <Row type="flex" className="batteryLife">
                        <Col className="estimateMobile">
                            <div className="textBox">
                                <h4>Battery life estimate</h4>
                                <span>Around {this.calculateBatteryLife(time)} hours</span>
                            </div>
                        </Col>
                    </Row>
                    <Row type="flex" className="batteryLife">
                        <Col className="estimateMobile">
                            <div className="textBox">
                                <h4>What GPS history might look like</h4>
                                <span>When traveling down a free way at high speeds</span>
                            </div>
                            {<img src={time <= 3 ? Gps3Min : time <= 9 ? Gps5Min : Gps10Min} alt='gps' />}
                        </Col>
                    </Row>
                </Fragment>
                :
                <Fragment>
                    <Row type="flex" className="batteryLife" gutter={[12, 12]}>
                        <Col style={{ flex: 1 }}>
                            <div className="estimate">
                                <h4>Battery life estimate</h4>
                                <span>Around {this.calculateBatteryLife(time)} hours</span>
                            </div>
                        </Col>
                        <Col className="estimateImage">
                            <div className="borderContainer">
                                <div className="textBox">
                                    <h4>What GPS history might look like</h4>
                                    <span>When traveling down a free way at high speeds</span>
                                </div>
                                {<img src={time <= 3 ? Gps3Min : time <= 9 ? Gps5Min : Gps10Min} alt='gps' />}
                            </div>
                        </Col>
                    </Row>
                    <h4>Update frequency: {time} minutes</h4>
                    <Row type="flex" justify="center" className="margin-bottom">
                        <Col xs={20} lg={16}>
                            <Slider
                                min={min}
                                max={max}
                                tooltip={{
                                    formatter: value => `${value} minutes`
                                }}
                                value={this.state.time}
                                onChange={v => this.setState({ time: v })}
                                marks={marks} />
                        </Col>
                    </Row>
                    <Row type="flex" justify="center" className="margin-bottom">
                        <Col>
                            <Button onClick={this.reset} className="margin-right">Cancel</Button>
                            <Button type="primary" onClick={this.handleSend}>Save and Send</Button>
                        </Col>
                    </Row>
                </Fragment>}
        </Media><Collapse>
            <Collapse.Panel key='1' header={`More information about ${deviceType} battery life`}>
                <ul style={{ marginTop: '1em' }}>
                    <li>Your {deviceType} is equipped with smart power saving technology to extend its battery life.
                        If your {deviceType} is still and not moving (i.e. it is on a table top, or on your person but you
                        are sitting still) it will go into a lower power mode. When you start moving it will resume sending
                        real time data to the SOFIHUB cloud. When it is in the low power mode its SOS button and fall down
                        alarms still are active and working.</li>
                    <br />

                    <li>If your {deviceType} is in its lower power mode it will still contact the SOFIHUB cloud
                        periodically to let us know that it is working.</li>
                    <br />
                    <li>Your lifestyle can impact on the battery life of a beacon, if you have a more active lifestyle your
                        beacon may contact the SOFIHUB cloud more frequently with real time updates. Each of these updates
                        consumes a bit of battery. Using the exact same settings a less active person may find better
                        battery life with their {deviceType}. However don&#39;t fear SOFIHUB have got you covered, if
                        you&#39;re more active and you want long battery life we suggest you turn down the update
                        frequency.</li>
                    <br />
                    <li>Every {deviceType} is equipped with a 3G / 4G connection, just like your mobile phone. And just
                        like your mobile phone if you enter a region with lower reception strength your {deviceType}&#160;
                        will need to work harder to stay connected, this can reduce battery life. Metropolitan areas tend
                        to have good coverage, however when traveling in regional areas you may find battery life can
                        reduce at a faster pace. Please note your beacon requires the 3G / 4G connection to operate
                        correctly. If you enter a reception black spot your beacon may not work correctly.
                    </li>
                    <br />
                    <li>Just like your mobile phone, and many other portable electronic devices, your {deviceType}&#160;
                        contains a Lithium battery. All Lithium batteries are consumable devices. Over time, or with use,
                        the battery can wear down resulting in reduced battery life. If you find your beacon is not
                        lasting long enough on battery SOFIHUB suggest you that you decrease update frequency to extend
                        your {deviceType}&#39;s battery life. To prolong your {deviceType}&#39;s battery life SOFIHUB
                        recommend that you do not leave your {deviceType} in a discharged state for long periods of time. Your
                        {deviceType}&#39;s battery is not user replaceable, do not attempt to disassemble your {deviceType}.
                    </li>
                </ul>
            </Collapse.Panel>
        </Collapse></>
    }

    render() {
        const { time } = this.state
        const { settings, selectedBeacon, powerOptions } = this.props
        const deviceType = isLife(selectedBeacon) ?
            globalConstants.LIFE_SOFIHUB :
            isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB

        const min = powerOptions?.min_reporting_interval_in_minutes ?? 1
        const max = powerOptions?.max_reporting_interval_in_minutes ?? 60
        const suggestion = powerOptions?.suggest_reporting_interval_in_minutes ?? 15
        let marks = new Map()
        marks[min] = `${min} ${min > 1 ? 'mins' : 'min'}`
        marks[suggestion] = `${suggestion} mins`
        marks[max] = `${max} mins`
        console.log(marks)
        const work_mode = this.props.settings?.work_mode ?? 0
        return (
            <Row type="flex" justify="center" align="middle">
                <Col xs={24} >
                    <Card
                        className="beacon-card"
                        title={<span><ControlOutlined className="fallIcon" />Power / Battery Options</span>}
                    >
                        {
                            work_mode != 2 ? this.renderWorkMode (deviceType)
                                : this.renderNormalMode(deviceType, time, min, max, marks)
                            
                        }
                    </Card>
                </Col>
            </Row>
        )
    }

}

export default connect(mapStateToProps, null)(BeaconPowerOption)

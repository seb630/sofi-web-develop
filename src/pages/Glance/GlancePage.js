import { Component } from 'react'
import PortalLayout from '../Common/Layouts/PortalLayout'
import Icon, { CheckOutlined, ExclamationOutlined, MonitorOutlined } from '@ant-design/icons'
import { Card, Col, Row, Typography } from 'antd'
import moment from 'moment'
import changeCase from 'change-case'
import { connect, Link } from 'mirrorx'
import { sensorWarning } from '@/utility/Common'
import './Glance.scss'

import GreenHub from '../../images/hub_outline_green_icon.svg'
import OrangeHub from '../../images/hub_outline_orange_icon.svg'
import RoseHub from '../../images/hub_outline_rose_icon.svg'

import GreenSensor from '../../images/sensor_outline_green_icon.svg'
import OrangeSensor from '../../images/sensor_outline_orange_icon.svg'
import RoseSensor from '../../images/sensor_outline_rose_icon.svg'
import { globalConstants } from '@/_constants'

const {Title} = Typography

const mapStateToProps = state => ({
    settings: state.setting.settings
})

class GlancePage extends Component {

    constructor(props) {
        super(props)
        this.state={
            anomaly: this.updateAnomaly(props),
            sensor: this.updateSensor(props),
            hub: this.updateHub(props)
        }
    }

    componentDidUpdate (prevProps) {
        prevProps.anomalies !== this.props.anomalies && this.setState({anomaly: this.updateAnomaly(this.props)})
        prevProps.sensors !== this.props.sensors && this.setState({sensor:this.updateSensor(this.props)})
        prevProps.hubStatus !== this.props.hubStatus && this.setState({hub: this.updateHub(this.props)})
    }


    checkBattery = (sensors) => {
        return sensors.some(sensor=>sensor.battery_level<=40) ?
            <span className='exclamation'><ExclamationOutlined />Most other sensors are reporting good battery levels</span>
            : <span style={{color:'rgba(0, 0, 0, 0.65)'}}><CheckOutlined className="good" />
                All other sensors are reporting good battery levels</span>
    }

    updateSensor = (props) => {
        const { sensors } = props
        let sensor = {}
        if (sensors.length > 0 &&
            sensors.filter(item => item.status ==='OFFLINE' || !sensorWarning(item.last_active_at)).length>0) {
            const offlineSensors = sensors.filter((item) => item.status === 'OFFLINE' || !sensorWarning(item.last_active_at))
            const onlineSensors = sensors.filter(sensor=> !offlineSensors.includes(sensor))
            sensor.action = 'now'
            sensor.title = 'Action is needed'
            sensor.subtitle2 = <span>Typically this is because its batteries have gone flat. Check the <Link to='/dashboard'>dashboard
            </Link> to check the sensors</span>
            if (offlineSensors.length === 1) {
                sensor.subtitle1 = 'A sensor has gone offline'
                sensor.body =
                    <Card className="margin-bottom" title={
                        <Row className="exclamation bodyTitle" align="middle" type="flex" justify="start">
                            <Col><Icon component={RoseSensor} /></Col>
                            <Col><span className="title">Sensors</span></Col>
                        </Row>}>
                        <Row className='bodySection'><span><ExclamationOutlined className="exclamation" />A sensor has gone offline</span></Row>
                        <Row className='bodySection'>{this.checkBattery(onlineSensors)}</Row>
                    </Card>
            } else {
                sensor.subtitle1 = 'More than one sensor has gone offline'
                sensor.body =
                    <Card className="margin-bottom" title={
                        <Row className="exclamation bodyTitle" align="middle" type="flex" justify="start">
                            <Col><Icon component={RoseSensor} /></Col>
                            <Col><span className="title">Sensors</span></Col>
                        </Row>}>
                        <Row className='bodySection exclamation'><span><ExclamationOutlined className="exclamation" />More than one sensor has gone offline</span></Row>
                        <Row className='bodySection'>{this.checkBattery(onlineSensors)}</Row>
                    </Card>
            }
        }
        else if (sensors.some(sensor=>sensor.battery_level<=40)){
            sensor.action = 'soon'
            sensor.title = 'Action will be needed soon'
            sensor.subtitle1 = 'It looks like sensor batteries may be needed soon'
            sensor.subtitle2 = <span>Take a look at the <Link to='/dashboard'>dashboard</Link> to check which sensors will need
                their batteries changed.</span>
            sensor.body =
                <Card className="margin-bottom" title={
                    <Row className="good bodyTitle" align="middle" type="flex" justify="start">
                        <Col><Icon component={OrangeSensor} /></Col>
                        <Col><span className="title">Sensors</span></Col>
                    </Row>}>
                    <Row className='bodySection'><span><CheckOutlined className="good" />All sensors are online</span></Row>
                    <Row className='bodySection'><span><ExclamationOutlined className="exclamation" />{
                        sensors.filter(sensor=>sensor.battery_level<=40).length>1 ? 'More than one sensors' : 'One sensor'} needs its batteries
                        changed soon</span></Row>
                </Card>
        }else{
            sensor.action = 'good'
            sensor.title = 'Everything looks good'
            sensor.subtitle1 = `All ${globalConstants.HUB_SOFIHUB} systems look good`
            sensor.subtitle2 = ''
            sensor.body =
                <Card className="margin-bottom" title={
                    <Row className="good bodyTitle" align="middle" type="flex" justify="start">
                        <Col><Icon component={GreenSensor} /></Col>
                        <Col><span className="title">Sensors</span></Col>
                    </Row>}>
                    <Row className='bodySection'><span><CheckOutlined className="good" />All sensors are online</span></Row>
                    <Row className='bodySection'><span><CheckOutlined className="good" />All sensors are reporting above 40% battery level</span></Row>
                </Card>
        }
        return sensor
    }

    updateHub = (props) => {
        const { hubStatus, selectedHub } = props
        let hub = {}
        if (selectedHub) {
            if (selectedHub.connectivity_state === 'OFFLINE') {
                hub.action = 'now'
                hub.title = 'Action is needed'
                hub.subtitle1 = `The ${globalConstants.HUB_SOFIHUB} has gone offline`
                hub.subtitle2 = 'This might be because there is no mains power, or because it has been switched off'
                hub.body =
                    <Card className="margin-bottom" title={
                        <Row className="exclamation bodyTitle" align="middle" type="flex" justify="start">
                            <Col><Icon component={RoseHub} style={{fontSize: '80px', width: '62px'}}/></Col>
                            <Col><span>{globalConstants.HUB_SOFIHUB}</span></Col>
                        </Row>}>
                        <Row className='bodySection'><span><ExclamationOutlined className="exclamation" />{globalConstants.HUB_SOFIHUB} is offline</span></Row>
                        <Row className='bodySection'><span><ExclamationOutlined className="exclamation" />{hubStatus.ups_capacity < 1 ?
                            `${globalConstants.HUB_SOFIHUB} last reported it was on battery power` : `${globalConstants.HUB_SOFIHUB} last reported it was on mains power`}</span></Row>
                    </Card>
            } else if (selectedHub.connectivity_state === 'ONLINE' &&
                (hubStatus.ups_status !== 'CHARGE_COMPLETE' && hubStatus.ups_status !== 'CHARGING')) {
                hub.action = 'soon'
                hub.title = 'It looks like action may be needed'
                hub.subtitle1 = `The ${globalConstants.HUB_SOFIHUB} has lost mains power`
                hub.subtitle2 = 'This might be due to a power outage, or possibly it has been unplugged'
                hub.body =
                    <Card className="margin-bottom" title={
                        <Row className="good bodyTitle" align="middle" type="flex" justify="start">
                            <Col><Icon component={OrangeHub} style={{fontSize: '80px', width: '62px'}}/></Col>
                            <Col><span>{globalConstants.HUB_SOFIHUB}</span></Col>
                        </Row>}>
                        <Row className='bodySection'><span><CheckOutlined className="good" />{globalConstants.HUB_SOFIHUB} is online</span></Row>
                        <Row className='bodySection'><span><ExclamationOutlined className="exclamation" />{globalConstants.HUB_SOFIHUB} is running on battery backup
                            and is not connected to mains power.</span></Row>
                    </Card>
            } else {
                hub.action = 'good'
                hub.title = 'Everything looks good'
                hub.subtitle1 = `All ${globalConstants.HUB_SOFIHUB} systems look good`
                hub.subtitle2 = ''
                hub.body =
                    <Card className="margin-bottom" title={
                        <Row className="good bodyTitle" align="middle" type="flex" justify="start">
                            <Col><Icon component={GreenHub} style={{fontSize: '80px', width: '62px'}}/></Col>
                            <Col><span>{globalConstants.HUB_SOFIHUB}</span></Col>
                        </Row>}>
                        <Row className='bodySection'><span><CheckOutlined className="good" />{globalConstants.HUB_SOFIHUB} is online</span></Row>
                        <Row className='bodySection'><span><CheckOutlined className="good" />{globalConstants.HUB_SOFIHUB} is connected to power</span></Row>
                    </Card>
            }
            return hub
        }
    }

    updateAnomaly = (props) => {
        const { anomalies, settings } = props
        const firstName = settings && settings.resident_profile.first_name
        let anomaly = {}
        if (anomalies && anomalies.length > 0 &&
            anomalies.find((item) => (moment(item.occurred_at).add(1,'days').isAfter(moment())) &&
                item.status !== 'RESOLVED'
            )){
            const item = anomalies.find((item) => (moment(item.occurred_at).add(1,'days').isAfter(moment())) &&
                item.status !== 'RESOLVED')
            anomaly.action = 'now'
            anomaly.title = 'Action is needed'
            anomaly.subtitle1 = 'An anomaly is in progress'
            anomaly.subtitle2 = `Make sure to check in on ${firstName} to make sure they are okay`
            anomaly.body =
                <Card className="margin-bottom" title={
                    <Row className="exclamation bodyTitle" align="middle" type="flex" justify="start">
                        <Col><MonitorOutlined /></Col>
                        <Col><span className="title">Anomalies</span></Col>
                    </Row>}>
                    <Row className='bodySection exclamation'>
                        <span><ExclamationOutlined />There is currently a {changeCase.titleCase(item.classification)} anomaly in progress</span>
                    </Row>
                </Card>

        }else {
            anomaly.action = 'good'
            anomaly.title = 'Everything looks good'
            anomaly.subtitle1 = `All ${globalConstants.HUB_SOFIHUB} systems look good`
            anomaly.subtitle2 = ''
            anomaly.body =
                <Card className="margin-bottom" title={
                    <Row className="good bodyTitle" align="middle" type="flex" justify="start">
                        <Col><MonitorOutlined /></Col>
                        <Col><span className="title">Anomalies</span></Col>
                    </Row>}>
                    <Row className='bodySection'><span><CheckOutlined className="good" />No anomalies currently in progress</span></Row>
                </Card>
        }
        return anomaly
    }

    updateFinal = () => {
        const {anomaly, sensor, hub} = this.state
        let final = {}
        if (anomaly && sensor && hub) {
            if (anomaly.action === 'now') {
                final = anomaly
            } else if (hub.action === 'now' && sensor.action === 'now') {
                final = hub
                final.subTitle1 = 'More than one area needs your attention'
                final.subTitle2 = <span>See overview below, see more details on the <Link to='/dashboard'>dashboard</Link></span>
            } else if (hub.action === 'now') {
                final = hub
            } else if (sensor.action === 'now') {
                final = sensor
            } else if (hub.action === 'soon' && sensor.action === 'soon') {
                final = hub
                final.subTitle1 = 'More than one area needs your attention soon'
                final.subTitle2 = <span>See overview below, see more details on the <Link to='/dashboard'>dashboard</Link></span>
            } else if (hub.action === 'soon') {
                final = hub
            } else {
                final = sensor
            }
        }
        return final
    }

    renderTitle = (title, urgent) => {
        return <Title style={{fontWeight:300}}>
            <span className={urgent ? 'exclamation' : 'good'}>{title} </span>
        </Title>
    }

    renderSubTitle1 = (title, urgent) => {
        return <Title level={3} style={{fontWeight:300}}>
            <span className={urgent ? 'exclamation' : 'good'}>{title} </span>
        </Title>
    }

    renderSubTitle2 = (title, urgent) => {
        return <Title level={4} style={{fontWeight:300}}>
            <span className={urgent ? 'exclamation' : 'good'}>{title} </span>
        </Title>
    }

    renderBody = (urgent) => {
        const {hub, sensor, anomaly} = this.state
        if ( hub && sensor && anomaly) {
            return <Row className={`glanceBody ${!urgent && 'good'}`} justify="center" type="flex" gutter={24} align="top">
                <Col xs={24} lg={8}>
                    {hub.body}
                </Col>
                <Col xs={24} lg={8}>
                    {sensor.body}
                </Col>
                <Col xs={24} lg={8}>
                    {anomaly.body}
                </Col>
            </Row>
        }else return null

    }
    /** render page content */
    renderPageContent(final) {
        const urgent = final.action==='now'
        return (
            <Typography>
                {this.renderTitle(final.title, urgent)}
                {this.renderSubTitle1(final.subtitle1, urgent)}
                {this.renderSubTitle2(final.subtitle2, urgent)}
                {this.renderBody(urgent)}
            </Typography>
        )
    }

    render() {
        const final = this.updateFinal()
        return (
            <PortalLayout
                menu='hub'
                contentClass={`glanceContainer ${final.action==='now' ? 'urgent' : 'normal'}`}
                page="Glance"
                content={this.renderPageContent(final)} />
        )
    }

}

export default connect(mapStateToProps, null)(GlancePage)

import { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import { Button, Card, Col, Row, Tooltip } from 'antd'
import { globalConstants } from '@/_constants'
import { actions, Link } from 'mirrorx'
import { LeftOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { isMobile } from 'react-device-detect'
import { titleCase } from 'change-case'
import { formatTime } from '@/utility/Common'

export default class AlarmComponent extends Component {

    pushAlertDetails = alert => {
        alert?.geofence_event_type ? actions.routing.push(`/beacon/alert/geo/${alert.id}`) :
            alert?.beacon_offline_alarm_type ? actions.routing.push(`/beacon/alert/offline/${alert.id}`) :
                actions.routing.push(`/beacon/alert/${alert.id}`)
    }

    renderNextStep = (alert) => {
        const {selectedBeacon} = this.props
        const resolved = alert.status === 'RESOLVED'
        const info = alert.status === 'INFO'
        let nextStep = ''
        if (resolved) {
            nextStep =
                <span>No more steps are required at this time by the {globalConstants.PENDANT_GENERIC}.</span>
        }else if (info) {
            const batteryLow = alert.battery_low
            const powerOn = alert.power_on
            const powerOff = alert.power_off
            const offline = alert.beacon_offline_alarm_type

            if (batteryLow) {
                nextStep = <span>Make sure the {globalConstants.PENDANT_GENERIC} is placed on charge</span>
            }else if (powerOff){
                nextStep = <span>The {globalConstants.PENDANT_GENERIC} may be turning off as it has run out of battery, or it may have been
                switched off by someone. Make sure the {globalConstants.PENDANT_GENERIC} is turned back on or charged.</span>
            }else if (powerOn){
                nextStep = <span>The {globalConstants.PENDANT_GENERIC} has reported it has been turned on. No action required.</span>
            }else if (offline){
                nextStep = <span>The {globalConstants.PENDANT_GENERIC} may be turning off as it has run out of battery, or it may have been
                switched off by someone. Make sure the {globalConstants.PENDANT_GENERIC} is turned back on or charged.</span>
            }
        }else {
            const fall = alert.fall_down
            const sos = alert.sos_key
            if (fall || sos) {
                nextStep = <span>The {globalConstants.PENDANT_GENERIC} will contact emergency contacts it has saved via SMS or phone call.
                This may take some time to complete. We suggest you contact {selectedBeacon?.first_name} {selectedBeacon?.last_name
                } to make sure they are okay or reach out to an emergency contact for an update.</span>
            }
        }
        return nextStep
    }

    renderHappened = alert => {
        const fall = alert.fall_down
        const sos = alert.sos_key
        const batteryLow = alert.battery_low
        const powerOn = alert.power_on
        const powerOff = alert.power_off
        const offline1 = alert.beacon_offline_alarm_type === 'FIRST_ALARM'
        const offline2 = alert.beacon_offline_alarm_type === 'FINAL_ALARM'
        const geoIn = alert?.geofence_event_type === 'GEOFENCE_IN'
        const geoOut = alert?.geofence_event_type === 'GEOFENCE_OUT'
        if (fall) {
            return <span>A fall was detected</span>
        }else if (sos) {
            return <span>The SOS button was pressed</span>
        }else if (batteryLow) {
            return <span>{titleCase(globalConstants.PENDANT_GENERIC)} reported low battery alarm</span>
        }else if (powerOn) {
            return <span>{titleCase(globalConstants.PENDANT_GENERIC)} has reported it has been turned on</span>
        }else if (powerOff) {
            return <span>{titleCase(globalConstants.PENDANT_GENERIC)} has reported it has been turned off</span>
        }else if (geoIn) {
            return <span>{titleCase(globalConstants.PENDANT_GENERIC)} has entered the geofence area {alert.geofence_name}</span>
        }else if (geoOut) {
            return <span>{titleCase(globalConstants.PENDANT_GENERIC)} has left the geofence area {alert?.geofence_name}</span>
        }else if (offline1) {
            return <span>{titleCase(globalConstants.PENDANT_GENERIC)} has been offline for more than an hour</span>
        }else if (offline2) {
            return <span>{titleCase(globalConstants.PENDANT_GENERIC)} has been offline for more than 24 hours</span>
        }
    }

    renderResolution = (alert) => {
        const fall = alert.fall_down
        const sos = alert.sos_key
        const resolved = alert.status === 'RESOLVED'
        const timeout = alert.timeout
        const resolveTime = timeout ?
            formatTime(moment(alert.pendant_sent_at).add(globalConstants.BEACON_BANNER_TIMEOUT, 'minute')):
            formatTime(moment(alert.resolved_at))
        let resolution = ''
        if (resolved){
            if (timeout){
                resolution = <span>Event timed out <Tooltip title="We did not receive an event close off, this might be due to poor reception or this feature is not supported by your model pendant">
                    <QuestionCircleOutlined />
                </Tooltip> {resolveTime}</span>
            }else{
                resolution = <span>{titleCase(globalConstants.PENDANT_GENERIC)} reported {fall?'fall': sos ? 'SOS': 'alert'} ended at {resolveTime}</span>
            }
        }
        return resolution
    }

    renderLeftIcon = () => {
        const status = this.props.alert.status
        return (
            <Col flex="80px" className={`status ${status === 'INFO'? 'blue' : status === 'RESOLVED' ? 'green' : 'red'}`}>
                <span className='status-text'>{status === 'INFO'? 'Info' : status === 'RESOLVED' ? 'Resolved' : 'Attention Required!'}</span>
            </Col>
        )
    }


    renderRightCard = () => {
        const {showDetail, alert, extraStep, selectedBeacon} = this.props
        const timezone = selectedBeacon?.timezone
        timezone ? moment.tz.setDefault(timezone) : moment.tz.setDefault(moment.tz.guess())
        const resolved = alert.status === 'RESOLVED'
        const occurredDateTime = formatTime(alert.pendant_sent_at)
        const happened = this.renderHappened (alert)
        const resolution = this.renderResolution (alert)
        const nextStep = this.renderNextStep(alert)
        return (
            <Fragment>
                <Row gutter={[6,6]}>
                    <Col className='bold' xs={24} md={12} lg={7} xxl={5}>Event</Col>
                    <Col flex="auto" xs={24}>{happened}</Col>
                    {(alert.status!=='INFO' || alert?.geofence_event_type|| alert?.beacon_offline_alarm_type) && showDetail && <Col xs={0} md={5} flex="0 1 120px">
                        <Button
                            type='primary'
                            onClick={()=>this.pushAlertDetails(alert)}
                            className="margin-bottom"
                        >More Details</Button>
                    </Col>}
                </Row>

                <Row gutter={[6,6]}>
                    <Col className='bold' md={12} lg={7} xxl={5}>Date and time</Col>
                    <Col>{occurredDateTime}</Col>
                </Row>
                {resolved &&
                <Row gutter={[6,6]}>
                    <Col className='bold' md={12} lg={7} xxl={5}>Resolution?</Col>
                    <Col>{resolution}</Col>
                </Row>
                }

                {!alert?.geofence_event_type && <Fragment><Row gutter={[6,6]}>
                    <Col className='bold' md={12} lg={7} xxl={5}>Next step:</Col>
                </Row>

                <Row gutter={[6,6]} className={extraStep?'':'marginBottom'}>
                    <Col span={24}>{isMobile ? <Link to={`/beacon/alert/${alert.id}`}>Optionally click to view event details</Link>: nextStep}</Col>
                </Row>
                </Fragment>
                }
                {extraStep && alert.status === 'RESOLVED' && <Fragment>
                    <Row gutter={[6,6]} justify="space-between">
                        <Col className='bold' md={12} lg={7} xxl={5}>Optional Steps:</Col>
                        <Col>{alert.fall_down ? <Link to='/beacon/settings/detection'><Button type="primary" className="margin-right">Change Fall Settings</Button></Link>:
                            <Link to='/beacon/settings/general'><Button type="primary">Update Emergency Contacts</Button></Link>}</Col>
                    </Row>
                    {alert.fall_down?
                        <Row>
                    If falls are being flagged too regularly but it was a false alarm, you may want to adjust the fall
                    detection sensitivity to a lower level. Don&#39;t forget to test your changes by dropping your {globalConstants.PENDANT_GENERIC}
                    on a pillow after your changes are saved and accepted by the {globalConstants.PENDANT_GENERIC}.
                        </Row>:<Row>
                            Don&#39;t forget to make sure saved emergency contacts are up to date.
                        </Row>}</Fragment>}
            </Fragment>
        )
    }


    render() {
        const {backButton, alert} = this.props
        const left = this.renderLeftIcon()
        const right = this.renderRightCard()
        return (
            <Card size="small" bordered={false} className="beaconAlertCard">
                {backButton && <Row style={{margin: 12}}>
                    <Button icon={<LeftOutlined />} type="primary" onClick={()=>actions.routing.push(
                        {pathname: '/beacon/alerts', state: {backDate: true}})}>
                        Go Back
                    </Button>
                </Row>}
                <Row wrap={false} className={`${backButton?'borderTop':''} border${alert.status === 'RESOLVED' ? 'Green' : 'Red'}`}>
                    {left}
                    <Col flex="auto" className='right-container' >
                        {right}
                    </Col>
                </Row>
            </Card>
        )
    }
}

AlarmComponent.defaultProps={
    showDetail: true,
    extraStep: false,
    backButton: false
}

AlarmComponent.propTypes= {
    alert: PropTypes.object.isRequired,
    showDetail: PropTypes.bool,
    extraStep: PropTypes.bool,
    backButton: PropTypes.bool,
}

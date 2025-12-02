import { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import styles from './alert.scss'
import moment from 'moment-timezone'
import { Button, Card, Col, Row } from 'antd'
import { globalConstants } from '@/_constants'
import { actions, Link } from 'mirrorx'
import { BrowserView, MobileView } from 'react-device-detect'

export default class AlertComponent extends Component {

    pushAlertDetails = alert => {
        actions.routing.push({
            pathname: '/alert-details',
            state: {
                sessionData: alert
            }
        })
    }

    resolveAnomaly = (alert) => {
        if (alert.status === 'RESOLVED') return
        const hubId = this.props.hubId
        const userId = this.props.userId
        actions.hub.postResolveAnomaly ({anomalyId: alert.anomaly_id, hubId, userId})
    }

    renderNextStep = (alert) => {
        const resolved = alert.status === 'RESOLVED'
        const type = alert.classification
        let nextStep = ''
        if (resolved) {
            const button = <Link to='/settings/routine'>here</Link>
            if (type==='LATE_WAKE_UP') {
                nextStep =
                    <span>No further action is required.However if {this.props.residentName} has been waking up later
                        recently it may be worth while checking on them to make sure they are okay and to see why
                        their routine has changed. If their routine has changed you can let {globalConstants.HUB_SOFIHUB} know by updating {
                        this.props.residentName}&#39;s routine {button}</span>
            }else if (type==='LATE_SLEEP'){
                nextStep =
                    <span>No further action is required.However if {this.props.residentName} has been going to bed later
                        recently it may be worth while checking on them to make sure they are okay and to see why
                        their routine has changed. If their routine has changed you can let {globalConstants.HUB_SOFIHUB} know by updating {
                        this.props.residentName}&#39;s routine {button}</span>
            }else if (type==='BATHROOM_TOO_LONG'){
                nextStep =
                    <span>No further action is required.However if {this.props.residentName} has been spending more
                        time in the bathroom recently it may be worth while checking on them to make sure they are
                        okay and to see why their routine has changed. If their routine has changed you can
                        let {globalConstants.HUB_SOFIHUB} know by updating {this.props.residentName}&#39;s routine {button}</span>
            }
        }else {
            nextStep = <span>Make sure to give {this.props.residentName} a visit or a call to make sure they are okay!
            If they are okay you can: <a onClick = {()=>this.resolveAnomaly(alert)}>Resolve this anomaly</a></span>
        }
        return nextStep
    }

    renderHappened = alert => {
        const type = alert.classification
        const occurredTime = moment(alert.occurred_at).format('h:mm a')
        if (type==='LATE_WAKE_UP') {
            return <span>{this.props.residentName} did not wake up before {occurredTime}</span>
        }else if (type==='LATE_SLEEP') {
            return <span>{this.props.residentName} did not go to bed before {occurredTime}</span>
        }else if (type==='BATHROOM_TOO_LONG') {
            return <span>{this.props.residentName} has been in the bathroom for longer than expected</span>
        }
    }

    renderResolution = (alert) => {
        const resolved = alert.status === 'RESOLVED'
        const resolutionType = alert.resolution
        const resolveTime = moment(alert.resolved_at).format(globalConstants.DATETIME_FORMAT)
        let resolution = ''
        if (resolved){
            if (resolutionType === 'BUTTON'){
                resolution = <span>{globalConstants.HUB_SOFIHUB}&#39;s top button was pressed at {resolveTime}</span>
            }else if (resolutionType === 'CARER'){
                resolution = <span>A carer resolved this anomaly online at {resolveTime}</span>
            }else if (resolutionType === 'SERVICE_PROVIDER'){
                resolution = <span>A care provider resolved this anomaly at{resolveTime}</span>
            }
        }
        return resolution
    }

    renderLeftIcon = (mobile=false) => {
        const status = this.props.alert.status
        return (
            <Col flex="80px" className={`status ${status === 'RESOLVED' ? 'green' : 'red'} ${mobile && 'mobile'}`}>
                <span className='status-text'>{status === 'RESOLVED' ? 'Resolved' : 'Attention Required!'}</span>
            </Col>
        )
    }

    renderRightCard = () => {
        this.props.timezone && moment.tz.setDefault(this.props.timezone)
        const resolved = this.props.alert.status === 'RESOLVED'
        const occurredDateTime = moment(this.props.alert.occurred_at).format(globalConstants.DATETIME_FORMAT)
        const happened = this.renderHappened (this.props.alert)
        const resolution = this.renderResolution (this.props.alert)
        const nextStep = this.renderNextStep(this.props.alert)
        return (
            <Col className='right-container' flex="auto">
                <Row>
                    <Col className='bold' md={12} lg={9} xxl={7}>Event</Col>
                    <Col>{happened}</Col>
                </Row>

                <Row>
                    <Col className='bold' md={12} lg={9} xxl={7}>Date and time</Col>
                    <Col>{occurredDateTime}</Col>
                </Row>
                {resolved &&
                    <Row>
                        <Col className='bold' md={12} lg={9} xxl={7}>Resolution?</Col>
                        <Col>{resolution}</Col>
                    </Row>
                }
                <Row>
                    <Col className='thin' md={12} lg={9} xxl={7}>Code</Col>
                    <Col className='thin'>{this.props.alert.classification}</Col>
                </Row>

                <Row>
                    <Col className='bold' md={12} lg={9} xxl={7}>Next Steps:</Col>
                </Row>

                <Row>
                    <Col>{nextStep}</Col>
                </Row>
                <Row>
                    <Col>
                        <Button
                            type='default'
                            onClick={()=>this.pushAlertDetails(this.props.alert)}
                            className="margin-bottom"
                        >See more details</Button>
                    </Col>
                </Row>
            </Col>
        )
    }

    renderMobile = () => {
        const status = this.props.alert.status
        return <Card
            className='card-radius'
            bordered={false}
            title={status === 'RESOLVED' ? 'Resolved' : 'Attention Required!'}
            headStyle={{background: status === 'RESOLVED' ? styles.green : styles.red, color:'white'}}
        >
            {this.renderRightCard()}
        </Card>
    }

    render() {
        const left = this.renderLeftIcon()
        const right = this.renderRightCard()
        const mobile = this.renderMobile()
        return (
            <Fragment>
                <MobileView style={{width: '100%', marginBottom:'12px'}}>{mobile}</MobileView>
                <BrowserView>
                    <Row className='margin-bottom' wrap={false}>
                        {left}
                        {right}
                    </Row>
                </BrowserView>
            </Fragment>
        )
    }
}

AlertComponent.propTypes= {
    alert: PropTypes.object.isRequired,
    residentName: PropTypes.string,
    userId: PropTypes.number.isRequired,
    hubId: PropTypes.string.isRequired,
    timezone: PropTypes.string,
}


AlertComponent.defaultProps= {
    residentName: 'Resident',
    timezone: ''
}

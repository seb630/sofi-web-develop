import { Component, Fragment } from 'react'
import { actions, connect, Link } from 'mirrorx'
import { Card, Col, Divider, message, Row } from 'antd'
import moment from 'moment'
import PortalLayout from '../Common/Layouts/PortalLayout'
import { globalConstants } from '@/_constants'
import Timeline from './Timeline'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    me: state.user.me,
    anomalies: state.hub.anomalies,
    residentName: state.setting.settings && state.setting.settings.resident_profile.first_name
})

class AlertDetailsPage extends Component {
    constructor(props) {
        super(props)
        if (props.location.state !== undefined) {
            this.state = {
                self: props.self,
                alert: props.location.state.sessionData,
                hubid: '',
                activities: []
            }
        }
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
            return <small>{this.props.residentName} did not wake up before {occurredTime}</small>
        }else if (type==='LATE_SLEEP') {
            return <small>{this.props.residentName} did not go to bed before {occurredTime}</small>
        }else if (type==='BATHROOM_TOO_LONG') {
            return <small>{this.props.residentName} has been in the bathroom for longer than expected</small>
        }
    }

    renderResolution = (alert) => {
        const resolved = alert.status === 'RESOLVED'
        const resolutionType = alert.resolution
        const resolveTime = moment(alert.resolved_at).format(globalConstants.DATETIME_FORMAT)
        let resolution = ''
        if (resolved){
            if (resolutionType === 'BUTTON'){
                resolution = <small>{globalConstants.HUB_SOFIHUB}&#39;s top button was pressed at {resolveTime}</small>
            }else if (resolutionType === 'CARER'){
                resolution = <small>A carer resolved this anomaly online at {resolveTime}</small>
            }else if (resolutionType === 'SERVICE_PROVIDER'){
                resolution = <small>A care provider resolved this anomaly at{resolveTime}</small>
            }
        }
        return resolution
    }

    resolveAnomaly = (alert) => {
        if (alert.status === 'RESOLVED') return
        const hubId = this.props.selectedHub.hub_id
        const userId = this.props.me.user_id
        actions.hub.postResolveAnomaly ({anomalyId: alert.anomaly_id, hubId, userId}).then(()=>{
            message.success('This anomaly has resolved')
            actions.routing.push('/alerts')
        })


    }

    renderTitle = () => {
        const status = this.state.alert.status
        const happened = this.renderHappened (this.state.alert)
        const resolved = this.state.alert.status === 'RESOLVED'
        const resolution = this.renderResolution (this.state.alert)
        const occurredDateTime = moment(this.state.alert.occurred_at).format(globalConstants.DATETIME_FORMAT)

        return (
            <Fragment>
                <Row>
                    <Col>
                        <span className='bold margin-right'>
                            Anomaly:
                        </span>
                        <span className= {`bold ${status === 'RESOLVED' ? 'fontGreen': 'fontRed'}`}>
                            {status === 'RESOLVED' ? ' Resolved' : ' Attention Required!'}
                        </span>
                    </Col>
                </Row>
                <Row>
                    <Col><span className='bold margin-right'>Event  </span>{happened}</Col>
                </Row>
                <Row>
                    <Col><span className='bold margin-right'>Date and time  </span>
                        <small>{occurredDateTime}</small></Col>
                </Row>
                {resolved ?
                    <Row>
                        <Col><span className='bold margin-right'>Resolution?  </span>{resolution}</Col>
                    </Row>
                    :
                    <Row>
                        <Col>
                            <span className='bold margin-right'>
                                If everything is okay, you can <a onClick = {()=>this.resolveAnomaly(this.state.alert)}>resolve this anomaly</a>
                            </span>
                        </Col>
                    </Row>
                }
            </Fragment>
        )
    }

    renderPageContent() {
        const title = this.renderTitle()
        const nextStep = this.renderNextStep(this.state.alert)

        return <Card title={title}>
            <Row>
                <Col className='bold'>Next Steps:</Col>
            </Row>
            <Row>
                <Col>{nextStep}</Col>
            </Row>
            <Divider />
            <Row>
                <Timeline anomaly={this.state.alert}/>
            </Row>
        </Card>
    }

    render() {
        return (
            <PortalLayout
                menu='hub'
                page="Notifications"
                contentClass="contentPage"
                content={this.renderPageContent()} />
        )
    }
}

export default connect(mapStateToProps, null) (AlertDetailsPage)

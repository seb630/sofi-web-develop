import { Component, Fragment } from 'react'
import Alert from './Alert'
import PortalLayout from '../Common/Layouts/PortalLayout'
import moment from 'moment-timezone'
import { connect } from 'mirrorx'
import { Row, Col, Divider } from 'antd'
import Filter from './Alert/Filter'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    me: state.user.me,
    anomalies: state.hub.anomalies,
    unResolvedAnomalies: state.hub.unResolvedAnomalies || [],
    useHubTimeZone: state.user.useHubTimeZone,
    timezone: state.user.useHubTimeZone && state.setting.settings ?
        state.setting.settings.preferences?.timezone : moment.tz.guess(),
    settings: state.setting.settings,
    anomalyMonth: state.hub.anomalyMonth
})

class AlertsPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            anomalies: props.anomalies,
            learningMode: false,
            date: moment().startOf('month'),
        }
    }

    componentDidUpdate (prevProps) {
        prevProps.anomalies !== this.props.anomalies && this.setState({anomalies: this.props.anomalies})
    }

    switchView = () => {
        this.setState({learningMode:!this.state.learningMode})
    }

    handleTypeFilter = (checkedValues) => {
        const codeDict = {
            'LATE_SLEEP':'Late to bed' ,
            'LATE_WAKE_UP': 'Late to wake',
            'BATHROOM_TOO_LONG': 'Bathroom too long',
            'NIGHT_WANDERING': 'Night wandering'
        }
        const filtered = this.props.anomalies.filter(alert => {
            return checkedValues.includes(codeDict[alert.classification])
        })
        this.setState({anomalies: filtered})
    }

    /** render page content */
    renderPageContent() {
        const {me,settings,selectedHub, timezone, unResolvedAnomalies} = this.props
        const {anomalies, learningMode } = this.state
        if (anomalies !== null && me){
            let filtered = learningMode ? anomalies : anomalies.filter(result=>  result.detected_during!=='LEARNING_MODE')
            let active = unResolvedAnomalies.filter(result=>  result.status!=='RESOLVED')
            let resolved = filtered.filter(result=>  result.status==='RESOLVED')
            return (
                <Fragment>
                    <Row>
                        <Filter
                            selectedHub={selectedHub}
                            handleTypeFilter={this.handleTypeFilter}
                            learningMode = {this.state.learningMode}
                            switchView = {this.switchView}
                            anomalyMonth={this.props.anomalyMonth}
                        />
                    </Row>
                    <Divider />
                    <Row>
                        <Col>
                            <div style={{fontSize: '20px', fontWeight: 700, paddingBottom: '15px'}}>Current Active Anomalies</div>
                            {active.length>0 ? active.map((anomaly, i) =>
                                <Alert
                                    key={i}
                                    alert={anomaly}
                                    residentName={settings && settings.resident_profile.first_name}
                                    userId={me.user_id}
                                    hubId={selectedHub.hub_id}
                                    timezone={timezone}
                                />):
                                <span>
                                    There are currently no active anomalies. You can see resolved anomalies below, and filter by month.
                                </span>
                            }
                            <Divider/>
                            <div style={{fontSize: '20px', fontWeight: 700, paddingBottom: '15px'}}>Recent anomalies</div>
                            {resolved.length>0 ? resolved.map((anomaly, i) =>
                                <Alert
                                    key={i}
                                    alert={anomaly}
                                    residentName={settings && settings.resident_profile.first_name}
                                    userId={me.user_id}
                                    hubId={selectedHub.hub_id}
                                    timezone={timezone}
                                />):
                                <span>
                                    No events for {moment(this.props.anomalyMonth).format('MMMM YYYY')}, You can check older events by selecting previous months in the filter above.
                                </span>
                            }
                        </Col>
                    </Row>
                </Fragment>
            )
        }
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

export default connect(mapStateToProps, null) (AlertsPage)

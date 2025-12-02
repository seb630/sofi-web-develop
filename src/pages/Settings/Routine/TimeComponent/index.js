import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import { requiredField } from '@/utility/Validation'
import { Button, Card, Col, message, Row, TimePicker } from 'antd'
import PropTypes from 'prop-types'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub
})

const format = globalConstants.LONG_TIME_FORMAT

class TimeComponent extends Component{
    constructor(props) {
        super(props)
        const type = props.type
        this.state = {
            earliestWeekdays: moment(this.props.settings.routine[type].weekdays.earliest, format),
            earliestWeekdaysRecommendation:
            this.props.settings.routine[type].weekdays.earliest_recommendation &&
                moment(this.props.settings.routine[type].weekdays.earliest_recommendation, format),

            latestWeekdays: moment(this.props.settings.routine[type].weekdays.latest, format),
            latestWeekdaysRecommendation:
            this.props.settings.routine[type].weekdays.latest_recommendation &&
                moment(this.props.settings.routine[type].weekdays.latest_recommendation, format),

            earliestWeekends: moment(this.props.settings.routine[type].weekends.earliest, format),
            earliestWeekendsRecommendation:
            this.props.settings.routine[type].weekends.earliest_recommendation &&
                moment(this.props.settings.routine[type].weekends.earliest_recommendation, format),

            latestWeekends: moment(this.props.settings.routine[type].weekends.latest, format),
            latestWeekendsRecommendation:
            this.props.settings.routine[type].weekends.latest_recommendation &&
                moment(this.props.settings.routine[type].weekends.latest_recommendation, format),
            message: '',
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.settings !== this.props.settings && this.handleReset()
    }

    componentDidMount() {
        this.handleReset()
    }

    handleReset = () => {
        const {type, recommendationSetting} = this.props
        if (recommendationSetting) {
            this.setState({
                earliestWeekdays: moment(this.props.settings.routine[type].weekdays.earliest_recommendation, format),
                latestWeekdays: moment(this.props.settings.routine[type].weekdays.latest_recommendation, format),
                earliestWeekends: moment(this.props.settings.routine[type].weekends.earliest_recommendation, format),
                latestWeekends: moment(this.props.settings.routine[type].weekends.latest_recommendation, format),
            })
        }else {
            this.setState({
                earliestWeekdays: moment(this.props.settings.routine[type].weekdays.earliest, format),
                latestWeekdays: moment(this.props.settings.routine[type].weekdays.latest, format),
                earliestWeekends: moment(this.props.settings.routine[type].weekends.earliest, format),
                latestWeekends: moment(this.props.settings.routine[type].weekends.latest, format),
            })
        }
    }

    handleValueChange = (value, tag) => {
        this.handleClearMsg()
        this.setState({[tag]:value})
    }

    handleAccept = (tag) => {
        this.setState({[tag]:this.state[tag+'Recommendation']})
    }

    handleInitialise = () => {
        let newSettings = this.props.settings
        if (this.validateFieldValue()) return
        const hubId = this.props.selectedHub.hub_id
        if (this.props.type==='sleeping') {
            newSettings.routine[this.props.type].weekdays.earliest_recommendation = globalConstants.SLEEP_EARLIEST_RECOMMENDATION
            newSettings.routine[this.props.type].weekdays.latest_recommendation = globalConstants.SLEEP_LATEST_RECOMMENDATION
            newSettings.routine[this.props.type].weekends.earliest_recommendation = globalConstants.SLEEP_EARLIEST_RECOMMENDATION
            newSettings.routine[this.props.type].weekends.latest_recommendation = globalConstants.SLEEP_LATEST_RECOMMENDATION
        }else {
            newSettings.routine[this.props.type].weekdays.earliest_recommendation = globalConstants.WAKE_EARLIEST_RECOMMENDATION
            newSettings.routine[this.props.type].weekdays.latest_recommendation = globalConstants.WAKE_LATEST_RECOMMENDATION
            newSettings.routine[this.props.type].weekends.earliest_recommendation = globalConstants.WAKE_EARLIEST_RECOMMENDATION
            newSettings.routine[this.props.type].weekends.latest_recommendation = globalConstants.WAKE_LATEST_RECOMMENDATION
        }

        actions.setting.saveSettings({hubId, settings: newSettings}).then(() => {
            this.setState({ message: globalConstants.UPDATE_SUCCESS })
        }, (error) => {
            this.setState({ message: globalConstants.WENT_WRONG + ' ' + error})
        })
    }

    handleClearMsg() {
        this.setState({ message: '' })
    }

    validateFieldValue() {
        let error = requiredField(this.state.earliestWeekdays) || requiredField(this.state.latestWeekdays) ||
            requiredField(this.state.earliestWeekends) || requiredField(this.state.latestWeekends)
        if (error) {
            this.setState({ message: globalConstants.REQUIRED_RTIME })
            return error
        }
        if (this.props.type==='waking'){
            error = this.state.earliestWeekdays.isSameOrAfter(this.state.latestWeekdays) ||
                this.state.earliestWeekends.isSameOrAfter(this.state.latestWeekends)
            if (error) {
                this.setState({ message: globalConstants.ERROR_RTIME })
                return error
            }
        }
        return false
    }

    handleSaveClick = () => {
        let newSettings = this.props.settings
        if (this.validateFieldValue()) return
        const hubId = this.props.selectedHub.hub_id
        if (this.props.recommendationSetting) {
            newSettings.routine[this.props.type].weekdays.earliest_recommendation = this.state.earliestWeekdays.format('HH:mm')
            newSettings.routine[this.props.type].weekdays.latest_recommendation = this.state.latestWeekdays.format('HH:mm')
            newSettings.routine[this.props.type].weekends.earliest_recommendation = this.state.earliestWeekends.format('HH:mm')
            newSettings.routine[this.props.type].weekends.latest_recommendation = this.state.latestWeekends.format('HH:mm')
        }else {
            newSettings.routine[this.props.type].weekdays.earliest = this.state.earliestWeekdays.format('HH:mm')
            newSettings.routine[this.props.type].weekdays.latest = this.state.latestWeekdays.format('HH:mm')
            newSettings.routine[this.props.type].weekends.earliest = this.state.earliestWeekends.format('HH:mm')
            newSettings.routine[this.props.type].weekends.latest = this.state.latestWeekends.format('HH:mm')
        }

        actions.setting.saveSettings({hubId, settings: newSettings}).then(() => {
            message.success('Information updated.')
        }, () => {
            message.error('Something went wrong. Please try again.')
        })
    }

    render() {
        return (
            this.props.settings &&
            <Card title={this.props.title} className="margin-bottom" extra={
                ((!this.state.earliestWeekdaysRecommendation && this.props.recommendationSetting) ||
                    (!this.state.earliestWeekdays && !this.props.recommendationSetting)) &&
            <Button
                className="marginLR"
                type="primary"
                onClick={this.handleInitialise}>
                Initialise</Button>}
            >
                {this.state.earliestWeekdays.isValid()
                        &&
                        <Fragment>
                            <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}}>
                                <Col xs={24} xxl={12} className="margin-bottom">
                                    <Card title="Weekdays">
                                        <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}}>
                                            <Col xs={24} md={12} className="margin-bottom">
                                                <strong>Earliest</strong><br/>
                                                <TimePicker
                                                    showSecond={false}
                                                    placeholder='HH:MM AM/PM'
                                                    defaultOpenValue={moment('00:00', globalConstants.LONG_TIME_FORMAT)}
                                                    value={this.state.earliestWeekdays}
                                                    onChange={(value) => this.handleValueChange(value, 'earliestWeekdays')}
                                                    format={globalConstants.LONG_TIME_FORMAT}
                                                    use12Hours={true}
                                                    allowClear={false}
                                                />
                                            </Col>
                                            <Col xs={24} md={12} className="margin-bottom">
                                                <strong>Latest</strong><br/>
                                                <TimePicker
                                                    allowClear={false}
                                                    showSecond={false}
                                                    placeholder='HH:MM AM/PM'
                                                    defaultOpenValue={moment('00:00', globalConstants.LONG_TIME_FORMAT)}
                                                    value={this.state.latestWeekdays}
                                                    onChange={(value) => this.handleValueChange(value, 'latestWeekdays')}
                                                    format={globalConstants.LONG_TIME_FORMAT}
                                                    use12Hours={true}/>
                                            </Col>
                                        </Row>
                                        {this.props.recommendation &&
                                    <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}} >
                                        <Col xs={24} md={12} className="margin-bottom">
                                            {this.state.earliestWeekdaysRecommendation &&
                                            this.state.earliestWeekdays.format('HH:mm') !==
                                            this.state.earliestWeekdaysRecommendation.format('HH:mm') &&
                                            <div>
                                                <strong>Recommended Earliest</strong><br/>
                                                <TimePicker
                                                    showSecond={false}
                                                    value={this.state.earliestWeekdaysRecommendation}
                                                    format={globalConstants.LONG_TIME_FORMAT}
                                                    use12Hours={true}
                                                    disabled
                                                    style={{marginBottom:6, marginRight:6}}
                                                />
                                                <Button
                                                    onClick={() => this.handleAccept('earliestWeekdays')}
                                                >Accept</Button>
                                            </div>
                                            }
                                        </Col>
                                        <Col xs={24} md={12} className="margin-bottom">
                                            {this.state.latestWeekdaysRecommendation &&
                                            this.state.latestWeekdays.format('HH:mm') !==
                                            this.state.latestWeekdaysRecommendation.format('HH:mm') &&
                                            <div>
                                                <strong>Recommended Latest</strong><br/>
                                                <TimePicker
                                                    showSecond={false}
                                                    value={this.state.latestWeekdaysRecommendation}
                                                    format={globalConstants.LONG_TIME_FORMAT}
                                                    use12Hours={true}
                                                    disabled
                                                    style={{marginBottom:6, marginRight:6}}
                                                />
                                                <Button
                                                    onClick={() => this.handleAccept('latestWeekdays')}
                                                >Accept</Button>
                                            </div>
                                            }
                                        </Col>
                                    </Row>
                                        }
                                    </Card>
                                </Col>
                                <Col xs={24} xxl={12} className="margin-bottom">
                                    <Card title="Weekends">
                                        <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}}>
                                            <Col xs={24} md={12} className="margin-bottom">
                                                <strong>Earliest</strong><br/>
                                                <TimePicker
                                                    allowClear={false}
                                                    showSecond={false}
                                                    placeholder='HH:MM AM/PM'
                                                    defaultOpenValue={moment('00:00', globalConstants.LONG_TIME_FORMAT)}
                                                    value={this.state.earliestWeekends}
                                                    onChange={(value) => this.handleValueChange(value, 'earliestWeekends')}
                                                    format={globalConstants.LONG_TIME_FORMAT}
                                                    use12Hours={true}/>
                                            </Col>
                                            <Col xs={24} md={12} className="margin-bottom">
                                                <strong>Latest</strong><br/>
                                                <TimePicker
                                                    showSecond={false}
                                                    allowClear={false}
                                                    placeholder='HH:MM AM/PM'
                                                    defaultOpenValue={moment('00:00', globalConstants.LONG_TIME_FORMAT)}
                                                    value={this.state.latestWeekends}
                                                    onChange={(value) => this.handleValueChange(value, 'latestWeekends')}
                                                    format={globalConstants.LONG_TIME_FORMAT}
                                                    use12Hours={true}/>
                                            </Col>
                                        </Row>
                                        {this.props.recommendation &&
                                    <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}}>
                                        <Col xs={24} md={12} className="margin-bottom">
                                            {this.state.earliestWeekendsRecommendation &&
                                            this.state.earliestWeekends.format('HH:mm') !==
                                            this.state.earliestWeekendsRecommendation.format('HH:mm') &&
                                            <div>
                                                <strong>Recommended Earliest</strong><br/>
                                                <TimePicker
                                                    allowClear={false}
                                                    showSecond={false}
                                                    value={this.state.earliestWeekendsRecommendation}
                                                    format={globalConstants.LONG_TIME_FORMAT}
                                                    use12Hours={true}
                                                    disabled
                                                    style={{marginBottom:6, marginRight:6}}
                                                />
                                                <Button
                                                    onClick={() => this.handleAccept('earliestWeekends')}
                                                >Accept</Button>
                                            </div>
                                            }
                                        </Col>
                                        <Col xs={24} md={12} className="margin-bottom">
                                            {this.state.latestWeekendsRecommendation &&
                                            this.state.latestWeekends.format('HH:mm') !==
                                            this.state.latestWeekendsRecommendation.format('HH:mm') &&
                                            <div>
                                                <strong>Recommended Latest</strong><br/>
                                                <TimePicker
                                                    allowClear={false}
                                                    showSecond={false}
                                                    value={this.state.latestWeekendsRecommendation}
                                                    format={globalConstants.LONG_TIME_FORMAT}
                                                    use12Hours={true}
                                                    disabled
                                                    style={{marginBottom:6, marginRight:6}}
                                                />
                                                <Button
                                                    onClick={() => this.handleAccept('latestWeekends')}
                                                >Accept</Button>
                                            </div>
                                            }
                                        </Col>
                                    </Row>
                                        }
                                    </Card>
                                </Col>
                            </Row>
                            <Row >
                                <Col xs={24} md={12} className="margin-bottom">
                                    <span className="alert">{this.state.message}</span>
                                </Col>
                            </Row>
                            <Row className='d-flex justify-content-end'>
                                <Button
                                    className="marginLR"
                                    size="large"
                                    onClick={() => this.handleReset()}>
                                    Reset
                                </Button>
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={this.handleSaveClick}>
                                    Save
                                </Button>
                            </Row>
                            <div className="clearfix"/>
                        </Fragment>
                }
            </Card>
        )
    }
}

TimeComponent.propTypes = {
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    settings: PropTypes.object.isRequired,
    recommendation: PropTypes.bool,
    recommendationSetting: PropTypes.bool.isRequired
}

export default connect(mapStateToProps, null) (TimeComponent)

import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { globalConstants } from '@/_constants'
import TimeComponent from './TimeComponent'
import { requiredField } from '@/utility/Validation'
import { changeMinsToMillsec } from '@/utility/Common'
import { Button, Card, Col, Input, message, Row } from 'antd'
import { isMobile } from 'react-device-detect'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    settings: state.setting.settings
})

class Routine extends Component{
    constructor(props) {
        super(props)
        this.state = {
            bath: this.props.settings ? parseInt(this.props.settings.routine.bathing.duration/60000,10) : 0,
            bathRecommendation: this.props.settings && this.props.settings.routine.bathing.duration_recommendation ?
                parseInt(this.props.settings.routine.bathing.duration_recommendation/60000,10): null,
            message: '',
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.settings !== this.props.settings &&
        this.setState( {
            bath: parseInt(this.props.settings.routine.bathing.duration/60000,10),
            bathRecommendation: this.props.settings.routine.bathing.duration_recommendation ?
                parseInt(this.props.settings.routine.bathing.duration_recommendation/60000,10): null,
            message: '',
        })
    }

    handleClearMsg() {
        this.setState({ message: '' })
    }

    validateFieldValue() {
        const error = requiredField(this.state.bath)
        if (error) {
            this.setState({ message: globalConstants.REQUIRED_BATHTIME })
            return error
        }
        return false
    }

    handleAccept () {
        let newSettings = this.props.settings
        if (this.validateFieldValue()) return
        const hubId = this.props.selectedHub.hub_id
        newSettings.routine.bathing.duration = changeMinsToMillsec(this.state.bathRecommendation)
        actions.setting.saveSettings({hubId, settings: newSettings}).then(() => {
            this.setState({ message: globalConstants.UPDATE_SUCCESS })
        }, (error) => {
            this.setState({ message: globalConstants.WENT_WRONG + ' ' + error})
        })
    }

    handleSaveClick = () => {
        let newSettings = this.props.settings
        if (this.validateFieldValue()) return
        const hubId = this.props.selectedHub.hub_id
        newSettings.routine.bathing.duration = changeMinsToMillsec(this.state.bath)
        actions.setting.saveSettings({hubId, settings: newSettings}).then(() => {
            message.success('Information updated.')
        }, () => {
            message.error('Something went wrong. Please try again.')
        })
    }

    render() {
        const name = this.props.settings && this.props.settings.resident_profile.first_name
        return (
            <Fragment>
                <Row className="systemDetails" type="flex" justify="center">
                    <Col xs={22} md={16} className="zeroPadding">
                        {this.props.settings &&
                                <TimeComponent
                                    settings={this.props.settings}
                                    title={`When does ${name} go to bed?`}
                                    type='sleeping'
                                    recommendation={globalConstants.ROUTINE_RECOMMENDATION}
                                    recommendationSetting={false}
                                />
                        }
                        {this.props.settings &&
                            <TimeComponent
                                settings={this.props.settings}
                                title={`When does ${name} wake up?`}
                                type='waking'
                                recommendation={globalConstants.ROUTINE_RECOMMENDATION}
                                recommendationSetting = {false}

                            />
                        }

                        <Card
                            title={`How long does ${name} spend in the bathroom?`} className="margin-bottom"
                            extra={this.state.bath===null &&
                                    <Button
                                        className="marginLR"
                                        type="primary"
                                        onClick={this.handleInitialise}>
                                        Initialise</Button>}
                        >
                            {isMobile? <p>
                                    Most Sofihub users set their bathroom duration to 45 minutes, as most people have routines,
                                    for example: using the toilet, bathing, and getting ready - one after the other.
                            </p>: <p>
                                    Most Sofihub users set their bathroom duration to 45 minutes, as most people have routines where
                                    they spend some time in the bathroom, for example: using the toilet, bathing, and getting ready -
                                    one after the other.
                            </p>}
                            <Fragment>
                                <Row>
                                    <Col md={12}>
                                        <strong>Duration (Minutes)</strong><br/>
                                        <Input
                                            style={{width: '100px'}}
                                            type="text"
                                            onChange={e => this.setState({bath: e.target.value})}
                                            value={this.state.bath}
                                            onFocus={() => this.handleClearMsg()}/>
                                    </Col>
                                    {this.state.bathRecommendation &&
                                    this.state.bath !== this.state.bathRecommendation &&
                                    <Col md={12}>
                                        <label>Recommended Duration</label><br/>
                                        <Input
                                            style={{width: '100px'}}
                                            type="text"
                                            disabled
                                            value={this.state.bathRecommendation}
                                        />
                                        <Button
                                            className="marginLR"
                                            onClick={() => this.handleAccept()}
                                        >Accept</Button>
                                    </Col>
                                    }
                                </Row>

                                <Row>
                                    <span className="alert">{this.state.message}</span>
                                </Row>
                                <Row className='d-flex justify-content-end'>
                                    <Button
                                        style={{marginTop: '20px'}}
                                        type="primary"
                                        size="large"
                                        onClick={this.handleSaveClick}>
                                        Save
                                    </Button>
                                </Row>
                                <div className="clearfix"/>
                            </Fragment>

                        </Card>
                    </Col>
                </Row>
            </Fragment>)
    }
}


export default connect(mapStateToProps, null) (Routine)

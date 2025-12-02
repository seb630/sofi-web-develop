import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { globalConstants } from '@/_constants'
import TimeComponent from '../../Settings/Routine/TimeComponent'
import { requiredField } from '@/utility/Validation'
import { changeMinsToMillsec } from '@/utility/Common'
import { Button, Card, Col, Input, Row } from 'antd'
import { isMobile } from 'react-device-detect'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    settings: state.setting.settings
})

class Routine extends Component{
    constructor(props) {
        super(props)
        this.state = {
            bath: this.props.settings && this.props.settings.routine.bathing.duration_recommendation ?
                parseInt(this.props.settings.routine.bathing.duration_recommendation/60000,10): null,
            message: '',
        }
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

    componentDidUpdate(prevProps) {
        prevProps.settings !== this.props.settings && this.setState({
            bath: parseInt(this.props.settings.routine.bathing.duration_recommendation/60000,10),
        })
    }

    handleInitialise = () => {
        let newSettings = this.props.settings
        const hubId = this.props.selectedHub.hub_id
        newSettings.routine.bathing.duration_recommendation = changeMinsToMillsec(globalConstants.BATH_RECOMMENDATION)
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
        newSettings.routine.bathing.duration_recommendation = changeMinsToMillsec(this.state.bath)
        actions.setting.saveSettings({hubId, settings: newSettings}).then(() => {
            this.setState({ message: globalConstants.UPDATE_SUCCESS })
        }, (error) => {
            this.setState({ message: globalConstants.WENT_WRONG + ' ' + error})
        })
    }

    render() {
        return (
            <div>
                <Row className="systemDetails">
                    <Col xs={24} sm={24} md={{offset:4, span:16}} className="zeroPadding">
                        {this.props.settings &&
                            <TimeComponent
                                settings={this.props.settings}
                                title='Sleeping Times'
                                type='sleeping'
                                recommendation={false}
                                recommendationSetting={true}
                            />
                        }
                        {this.props.settings &&
                            <TimeComponent
                                settings={this.props.settings}
                                title='Waking Times'
                                type='waking'
                                recommendation={false}
                                recommendationSetting={true}
                            />
                        }
                        <Card
                            title="Bathroom Duration" className="margin-bottom"
                            extra={this.state.bath===null &&
                            <Button
                                className="marginLR"
                                type="primary"
                                onClick={this.handleInitialise}>
                                Initialise</Button>}
                        >
                            {isMobile? <p>
                                Most {globalConstants.HUB_SOFIHUB} users set their bathroom duration to 45 minutes, as most people have routines,
                                for example: using the toilet, bathing, and getting ready - one after the other.
                            </p>: <p>
                                Most {globalConstants.HUB_SOFIHUB} users set their bathroom duration to 45 minutes, as most people have routines where
                                they spend some time in the bathroom, for example: using the toilet, bathing, and getting ready -
                                one after the other.
                            </p>}
                            {this.state.bath &&
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
                            }
                        </Card>
                    </Col>
                </Row>
            </div>)
    }
}


export default connect(mapStateToProps, null) (Routine)

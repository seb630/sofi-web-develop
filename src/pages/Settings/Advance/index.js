import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { Card, Col, Row, Select } from 'antd'
import OneSwitchCard from './oneSwitchCard'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    ttsVoice: state.setting.ttsVoice,
    ttsSpeed: state.setting.ttsSpeed,
    settings: state.setting.settings,
    featureFlags: state.setting.featureFlags
})

class Advance extends Component{
    constructor(props) {
        super(props)
        this.state = {
            ttsVoice: this.props.settings && this.props.settings.preferences.tts
                ? this.props.settings.preferences.tts.voice
                : null,
            ttsSpeed: this.props.settings && this.props.settings.preferences.tts
                ? this.props.settings.preferences.tts.speed
                : null,
        }
    }


    componentDidUpdate (prevProps) {
        prevProps.settings !== this.props.settings &&
        this.setState({
            ttsVoice: this.props.settings && this.props.settings.preferences.tts
                ? this.props.settings.preferences.tts.voice
                : null,
            ttsSpeed: this.props.settings && this.props.settings.preferences.tts
                ? this.props.settings.preferences.tts.speed
                : null,
        })
    }

    handleTTSVoiceChange = (value) => {
        let newSettings = this.props.settings
        const hubId = this.props.selectedHub.hub_id
        if (newSettings.preferences.tts) {
            newSettings.preferences.tts.voice = value
        }else {
            newSettings.preferences.tts = {
                speed: 'MEDIUM',
                voice: value
            }
        }
        actions.setting.saveSettings({hubId, settings: newSettings})
    }

    handleTTSSpeedChange = (value) => {
        let newSettings = this.props.settings
        const hubId = this.props.selectedHub.hub_id
        if (newSettings.preferences.tts) {
            newSettings.preferences.tts.speed = value
        }else {
            newSettings.preferences.tts = {
                speed: value,
                voice: 'AMY'
            }
        }
        actions.setting.saveSettings({hubId, settings: newSettings})
    }

    render(){
        const ttsVoiceOptions = this.props.ttsVoice && this.props.ttsVoice.map(voice=>(
            <Select.Option key={voice.name} value={voice.name}>{voice.label}</Select.Option>
        ))

        const ttsSpeedOptions = this.props.ttsSpeed && this.props.ttsSpeed.map(speed=>(
            <Select.Option key={speed.name} value={speed.name}>{speed.label}</Select.Option>
        ))
        return (
            <div>
                <Row align="middle" justify="center" type="flex" >
                    <Col xs={22} md={16} xl={12} className="zeroPadding">
                        {this.props.featureFlags &&
                        <OneSwitchCard
                            selectedHub={this.props.selectedHub}
                            featureFlags={this.props.featureFlags}
                            feature="occupancy_debugging"
                            featureTitle="Occupancy Announcement Mode"
                            featureDescription={`The ${globalConstants.HUB_SOFIHUB} will announce when it detects movement in a room for testing`}
                        />
                        }
                    </Col>
                </Row>
                <Row align="middle" justify="center" type="flex" >
                    <Col xs={22} md={16} xl={12} className="zeroPadding">
                        <Card className="advanced_block" title='TTS Voice'>
                            <Select
                                style={{minWidth: 280}}
                                showSearch
                                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                size="large"
                                value={this.state.ttsVoice}
                                onChange={ value => this.handleTTSVoiceChange(value)}
                            >{ttsVoiceOptions}
                            </Select>
                        </Card>
                    </Col>
                </Row>
                <Row align="middle" justify="center" type="flex" >
                    <Col xs={22} md={16} xl={12} className="zeroPadding">
                        <Card className="advanced_block" title='TTS Speed'>
                            <Select
                                style={{minWidth: 280}}
                                size="large"
                                value={this.state.ttsSpeed}
                                onChange={ value => this.handleTTSSpeedChange(value)}
                            >{ttsSpeedOptions}
                            </Select>
                        </Card>
                    </Col>
                </Row>
                <Row align="middle" justify="center" type="flex" >
                    <Col xs={22} md={16} xl={12} className="zeroPadding">
                        {this.props.featureFlags &&
                        <OneSwitchCard
                            flip
                            selectedHub={this.props.selectedHub}
                            featureFlags={this.props.featureFlags}
                            feature="user_request_linking"
                            featureTitle={`Lock your ${globalConstants.HUB_SOFIHUB}`}
                            featureDescription={
                                <div><p>If you lock your {globalConstants.HUB_SOFIHUB} it means that no one can claim it using the MAC code located on the
                                    bottom of the unit or on the box.</p>
                                <p>Locking your {globalConstants.HUB_SOFIHUB} does not stop you from inviting new carers, you can invite new carers at any time in
                                    the &quot;Carers&quot; tab.</p><p>The SOFIHUB team recommends that you keep your {globalConstants.HUB_SOFIHUB} locked.
                                </p></div>}
                        />
                        }
                    </Col>
                </Row>
            </div>)
    }
}


export default connect(mapStateToProps, null) (Advance)

import { PureComponent } from 'react'
import { actions, connect } from 'mirrorx'
import { Button, Card, Col, message, Modal, Row, Select, Spin } from 'antd'
import SideButtonSecure from '../../../images/beacon_side_icon_top_button.png'
import HighLightSecure from '../../../images/beacon_side_icon_top_button_highlight.png'
import SideButtonLife from '../../../images/beacon_teq_life_side_icon_top_button.png'
import HighLightLife from '../../../images/beacon_teq_life_side_icon_top_button_highlight.png'
import { globalConstants } from '@/_constants'
import moment from 'moment/moment'
import { isLife, isWatch } from '@/utility/Common'

const mapStateToProps = state => ({
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    selectedBeaconEmergencyContacts: state.sofiBeacon.selectedBeaconEmergencyContacts || [],
    settings: state.sofiBeacon.settings,
    loading: state.sofiBeacon.loading
})


class BeaconSideButtonCard extends PureComponent {

    constructor(props) {
        super(props)
        this.state = {
            isDirty: false,
            isSubmitting: false,
            sideButton: props.settings?.button1_task || 'NONE',
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.selectedBeacon !== this.props.selectedBeacon &&
            this.setState({ sideButton: this.props.settings?.button1_task || 'NONE', })
    }

    handleOptionChange(value) {
        this.setState({ sideButton: value, isDirty: true })
    }

    save = () => {
        let payload = {}
        payload.beacon_id = this.props.selectedBeacon.pub_id
        payload.feature = 'call1-button'
        payload.task = this.state.sideButton
        const currentUploadTimeInMinute = moment.duration(this.props.settings?.upload).asMinutes() || 10
        this.setState({ isSubmitting: true })
        actions.sofiBeacon.postTCPSettings(payload).then(() => {
            this.setState({ isSubmitting: false })
            Modal.success({
                content: <div>We&#39;re saving your changes, it might take {currentUploadTimeInMinute} minutes or more.</div>
            })
            actions.sofiBeacon.getBeaconSettings(payload.beacon_id)
        }).catch(err => {
            this.setState({ isSubmitting: false })
            err.global_errors.forEach(e => {
                message.error(e.message, 3)
            })
        })
        this.setState({ isDirty: false })
    }

    buildSideButtonOptions = () => {
        const notSet = [<Select.Option value='NONE' key='nothing'>Do Nothing</Select.Option>]
        const emergencyContacts = this.props.selectedBeaconEmergencyContacts
        return notSet.concat(emergencyContacts.map((contact, i) => <Select.Option value={`DIAL_${i + 1}`} key={i}>Call contact {i + 1} ({contact.name})</Select.Option>))
    }

    render() {
        const options = this.buildSideButtonOptions()
        const deviceType = isLife(this.props.selectedBeacon) ?
            globalConstants.LIFE_SOFIHUB :
            globalConstants.BEACON_SOFIHUB
        return (
            isWatch(this.props.selectedBeacon) ? <></> : 
                <Card className="advanced_block" title="Side Button Function">
                    <Spin spinning={this.state.isSubmitting} delay={500}>
                        <Row type="flex" gutter={16}>
                            <Col xs={8} md={6} lg={4}>
                                <div id="sideButton">
                                    <img className="bottom" src={isLife(this.props.selectedBeacon) ? SideButtonLife : SideButtonSecure} alt="Side Button" />
                                    <img className="top" src={isLife(this.props.selectedBeacon) ? HighLightLife : HighLightSecure} alt="Highlight" />
                                </div>
                            </Col>
                            <Col xs={16} md={18} lg={20}>
                                <div><p>Your {deviceType} has two buttons on its side. The top button can be customised to call an emergency contact. To select which contact is called please choose
                                    an option below. Please note you must have at least one emergency contact saved.
                                </p></div>
                                <Row justify="center" type="flex" className="margin-bottom">
                                    <Col>
                                        <Select
                                            style={{ minWidth: 200 }}
                                            size="large"
                                            value={this.state.sideButton}
                                            onChange={value => this.handleOptionChange(value)}
                                        >
                                            {options}
                                        </Select>
                                    </Col>
                                </Row>
                                <Row justify="end">
                                    <Col>
                                        <Button type="primary" disabled={!this.state.isDirty} onClick={this.save}>Save</Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>


                    </Spin>
                </Card>
        )
    }
}

export default connect(mapStateToProps, {})(BeaconSideButtonCard)

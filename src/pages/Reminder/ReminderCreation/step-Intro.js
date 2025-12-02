import { Component } from 'react'
import { CheckCircleOutlined } from '@ant-design/icons'
import { Col, message, Modal, Row, Switch } from 'antd'
import PropTypes from 'prop-types'
import { actions, connect } from 'mirrorx'
import UpdateSmartReminderModal from '../../SofiBeacon/Setting/UpdateSmartReminderModal'
import moment from 'moment'
import RemindToChargeBeaconModal from './step-RemindToChargeBeacon'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    selectedBeacon: state.sofiBeacon.selectedBeacon || {},
    beaconAlert: state.sofiBeacon.beaconAlert,
})

class CreateReminderIntro extends Component {

    constructor(props) {
        super(props)

        this.state = {
            chargeChecked: false,
            wearChecked: false,
            fixedChecked: true,
            fixedModal: false,
            smartModal: false,
            reminder: null,
            type: null,
            message: null,
            weekday: null,
            weekend: null,
        }
    }

    handleFixedCustomise = (message, weekday, weekend) => {
        this.setState({message, weekday, weekend})
    }

    handleSaveReminders = () => {
        const {onNext, onCancel} = this.props
        const {chargeChecked, wearChecked, fixedChecked} = this.state
        fixedChecked && this.handleSave()
        if (chargeChecked || wearChecked || fixedChecked) {
            onNext()
        }
        else onCancel()
    }

    handleSave = async () => {
        const { context } = this.props
        const { hubId } = context
        const message = this.state.message ? this.state.message : 'Hi there, don\'t forget to put your beacon on charge before you go to bed tonight.'
        const weekday = this.state.weekday ? this.state.weekday :  moment(context.beaconSuggestions.charge_on_week_day, 'HH:mm')
        const weekend = this.state.weekend ? this.state.weekend :  moment(context.beaconSuggestions.charge_on_weekend, 'HH:mm')
        try {
            actions.setting.addReminder({ hubId, payload: {
                is_beacon_reminder: true,
                hub_id: hubId,
                state: 'ACTIVE',
                config: {
                    occupancy_timer_iso: 'PT1H',
                    name: `Charge your ${globalConstants.BEACON_SOFIHUB} (weekday reminder)`,
                    message: message,
                    reminder_type: 'CUSTOM',
                    via: 'SPEAK',
                    timing: {
                        at: weekday.add(1,'hour').format('HH:mm'),
                        recurring: {
                            starting: moment().format('YYYY-MM-DD'),
                            occurs: [
                                'Monday',
                                'Tuesday',
                                'Wednesday',
                                'Thursday',
                                'Friday'
                            ]
                        }
                    }
                }
            } })
            actions.setting.addReminder({ hubId, payload: {
                is_beacon_reminder: true,
                hub_id: hubId,
                state: 'ACTIVE',
                config: {
                    occupancy_timer_iso: 'PT1H',
                    name: `Charge your ${globalConstants.BEACON_SOFIHUB} (weekend reminder)`,
                    message,
                    reminder_type: 'CUSTOM',
                    via: 'SPEAK',
                    timing: {
                        at: weekend.add(1,'hour').format('HH:mm'),
                        recurring: {
                            starting: moment().format('YYYY-MM-DD'),
                            occurs: [
                                'Saturday',
                                'Sunday'
                            ]
                        }
                    }
                }
            } })
        } catch(errors) {
            console.error(errors)
            errors.global_errors && errors.global_errors.map((msg) => {
                message.error(msg)
            })
        }
    }

    handleModalState = (type, state) => {
        type === 'fixed' && this.setState({fixedModal: state})
        type === 'charge' && this.setState({smartModal: state})
        type === 'wear' && this.setState({smartModal: state})
    }

    handleCustomise = (reminder, type) => {
        this.handleModalState (type, true)
        this.setState({reminder, type})
    }

    /** handle change smart reminder */
    handleChangeSmartReminder = async (checked, alertType) => {
        alertType==='charge' ? this.setState({chargeChecked: checked}) : this.setState({wearChecked: checked})
        try {
            const { selectedBeacon } = this.props
            const beaconId = selectedBeacon.id
            let type = alertType==='charge'? 'HUB_SPEAK_REMINDER_CHARGE_BEACON' : 'HUB_SPEAK_REMINDER_WEAR_BEACON'
            if (checked){
                const payload = {
                    beacon_pub_id: selectedBeacon.pub_id,
                    beacon_id: beaconId,
                    alert_type: type
                }
                actions.sofiBeacon.updateBeaconAlert(payload)
            }else{
                actions.sofiBeacon.deleteBeaconAlert({beaconId: selectedBeacon.pub_id, type})
            }
        } catch(err) {
            err.global_errors.forEach(e => {
                message.error(e.message,3)
            })
        }
    }

    render() {
        const { open, width, onCancel , deviceType, context, beaconAlert, selectedBeacon } = this.props
        const chargeAlert = beaconAlert ? beaconAlert.find((alert)=>alert.alert_type==='HUB_SPEAK_REMINDER_CHARGE_BEACON'): null
        const wearAlert = beaconAlert ? beaconAlert.find((alert)=>alert.alert_type==='HUB_SPEAK_REMINDER_WEAR_BEACON'): null

        const weekday = this.state.weekday ? this.state.weekday :
            context.beaconSuggestions ? moment(context.beaconSuggestions.charge_on_week_day, 'HH:mm') : moment('21:00', 'HH:mm')
        const weekend = this.state.weekend ? this.state.weekend :
            context.beaconSuggestions ? moment(context.beaconSuggestions.charge_on_weekend, 'HH:mm') : moment('22:00', 'HH:mm')
        const message = this.state.message ? this.state.message : 'Hi there, don\'t forget to put your beacon on charge before you go to bed tonight.'

        return (
            <Modal  className="createReminderModal" open={open}
                onCancel={onCancel} okText="Yes create reminders" cancelText="No do not create"
                onOk={this.handleSaveReminders}
                width={width} destroyOnClose
            >
                <div id={`modal-${deviceType}-linked`} className="createReminderModal-status">
                    <CheckCircleOutlined className="createReminderModal-logo" />
                    <div className="d-flex justify-content-center">
                        {deviceType} Linked!
                    </div>
                </div>
                <p> Now that a {deviceType} is linked. We suggest you create a few reminders so that your hub can remind you to charge your {globalConstants.BEACON_SOFIHUB} and take with you. </p>
                <p> What reminders would you like? </p>
                <Row>
                    <Col xs={4} md={3}>
                        <Switch checked={this.state.fixedChecked} onChange={(checked)=>this.setState({fixedChecked: checked})}/>
                    </Col>
                    <Col xs={20} md={21}>
                        <p><b>Daily reminder to charge your {globalConstants.BEACON_SOFIHUB} at {weekday.format('HH:mm')} (weekdays) or {
                            weekend.format('HH:mm')} (weekends) </b><br/>
                        {this.state.fixedChecked &&
                            <span>You can <a onClick={()=>this.handleModalState('fixed', true)}>
                                customise this reminder</a> now or later</span>}
                        </p>
                    </Col>
                </Row>

                <Row>
                    <Col xs={4} md={3}>
                        <Switch
                            checked={this.state.chargeChecked}
                            onChange={(value)=>this.handleChangeSmartReminder(value,'charge')}
                        />
                    </Col>
                    <Col xs={20} md={21}>
                        <p><b>Smart reminder to charge your {globalConstants.BEACON_SOFIHUB}</b> <br/>
                        This smart reminder only activates when your Beacon is low on battery. This reminder also has a
                            repeat function.<br/>
                            {this.state.chargeChecked &&
                            <span>You can <a onClick={()=>this.handleCustomise(chargeAlert, 'charge')}>
                                customise this reminder</a> now or later</span>}
                        </p>
                    </Col>
                </Row>

                <Row>
                    <Col xs={4} md={3}>
                        <Switch checked={this.state.wearChecked} onChange={(value)=>this.handleChangeSmartReminder(value,'wear')}/>
                    </Col>
                    <Col xs={20} md={21}>
                        <p><b>Smart reminder to take your {globalConstants.BEACON_SOFIHUB} with you</b> <br/>
                            This smart reminder only activates when your {globalConstants.BEACON_SOFIHUB} sufficiently charged, and still on the
                            charger. This reminder also has a repeat function.<br/>
                            {this.state.wearChecked &&
                            <span>You can <a onClick={()=>this.handleCustomise(wearAlert, 'wear')}>
                                customise this reminder</a> now or later</span>}
                        </p>
                    </Col>
                </Row>

                <Row>
                    Sofihub recommends switching on at least the daily reminder to charge your Beacon at a fixed time.
                </Row>

                <UpdateSmartReminderModal
                    beacon_pub_id={selectedBeacon.pub_id}
                    open={this.state.smartModal}
                    reminder={this.state.reminder}
                    type={this.state.type}
                    onClose={()=>this.setState({smartModal: false})}
                />

                <RemindToChargeBeaconModal
                    context={{weekday,weekend, message}} open={this.state.fixedModal}
                    onNext={this.handleFixedCustomise} onCancel={()=>this.handleModalState('fixed', false)}/>

            </Modal>
        )
    }
}

CreateReminderIntro.defaultProps = {
    width: 550
}

CreateReminderIntro.propTypes = {
    selectedBeacon: PropTypes.object,
    width : PropTypes.number,
    open: PropTypes.bool,
    onNext: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    context: PropTypes.object,
    deviceType: PropTypes.oneOf(['beacon','hub'])
}

export default connect(mapStateToProps)(CreateReminderIntro)

import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { Button, Card, Divider, message, Switch } from 'antd'
import moment from 'moment'
import UpdateSmartReminderModal from './UpdateSmartReminderModal'
import { globalConstants } from '@/_constants'
import { isLife, isWatch } from '@/utility/Common'

const mapStateToProps = state => ({
    selectedBeacon: state.sofiBeacon.selectedBeacon || {},
    beaconAlert: state.sofiBeacon.beaconAlert,
})

class BeaconSmartReminderCard extends Component {

    constructor(props) {
        super(props)
        this.state = {
            modal: false,
            reminder: null,
            type: null
        }
    }

    handleCustomise = (reminder, type) => {
        this.setState({
            reminder: {...reminder, beacon_pub_id: this.props.selectedBeacon.pub_id},
            type,
            modal: true
        })
    }
    /** handle change smart reminder */
    handleChangeSmartReminder = async (checked, alertType) => {
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
                actions.sofiBeacon.deleteBeaconAlert({beaconId:selectedBeacon.pub_id, type})
            }
        } catch(err) {
            err.global_errors.forEach(e => {
                message.error(e.message,3)
            })
        }
    }

    renderNoHubCard = () => {
        const { selectedBeacon } = this.props
        const deviceType = isLife(selectedBeacon)? globalConstants.LIFE_SOFIHUB : isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB

        return (
            <Card>
                <label>Smart Reminders </label>
                <p>Smart reminders can only be enabled when you link your {deviceType} to a {globalConstants.HUB_SOFIHUB}. When smart reminders
                    are turned on you will hear your {deviceType} speak to you to tell you to charge your {deviceType} or to
                    remind you to take it with you during the day.</p>
                <p>You can link your {deviceType} to a {globalConstants.HUB_SOFIHUB} by clicking the button in the above panel and following
                    the instructions.</p>
                <p>If you don&#39;t have a {globalConstants.HUB_SOFIHUB} and would like to know more please get in touch with the sales team
                    who helped you with your {deviceType}.</p>
            </Card>
        )
    }

    render() {
        const { selectedBeacon, beaconAlert } = this.props
        const chargeAlert = beaconAlert ? beaconAlert.find((alert)=>alert.alert_type==='HUB_SPEAK_REMINDER_CHARGE_BEACON'): null
        const wearAlert = beaconAlert ? beaconAlert.find((alert)=>alert.alert_type==='HUB_SPEAK_REMINDER_WEAR_BEACON'): null
        const deviceType = isLife(selectedBeacon)? globalConstants.LIFE_SOFIHUB : globalConstants.BEACON_SOFIHUB

        return (selectedBeacon.hub_id ? <Card className="beacon-card" title="Smart Reminders">
            <p> These settings if on, and if your {deviceType} is linked to a {globalConstants.HUB_SOFIHUB}, may result in your {globalConstants.HUB_SOFIHUB} speaking to you.</p>
            <div className="d-flex">
                <Switch id="button-switch-smartreminder" checked={!!chargeAlert} onChange={(value)=>this.handleChangeSmartReminder(value,'charge')} />
                <div style={{ marginLeft: '10px'}} >
                    <label> {deviceType} low battery smart reminder </label>
                    {chargeAlert ?
                        <div>
                            <p>When enabled your {globalConstants.HUB_SOFIHUB} will speak to you to remind you to charge your {deviceType} if it is low
                                on battery, and if it is currently awake hours (according to your {globalConstants.HUB_SOFIHUB} routine) it can
                                repeat the reminder
                            <b> every {moment.duration(chargeAlert.delay_in_second, 's').asMinutes()} minutes </b>
                                if the {deviceType} is not placed on charge.</p>
                            <Button
                                type='primary'
                                className="infoIcon"
                                onClick={()=>this.handleCustomise(chargeAlert, 'charge')}
                            >
                                Customise Reminder
                            </Button>
                        </div>
                        :
                        <p>When enabled your {globalConstants.HUB_SOFIHUB} will speak to you to remind you to charge your {deviceType} if it is low on
                            battery, and if it is currently awake hours (according to your {globalConstants.HUB_SOFIHUB} routine) it can repeat
                            the reminder periodically if the {deviceType} is not placed on charge.</p>
                    }
                </div>
            </div>
            <Divider />
            <div className="d-flex">
                <Switch id="button-switch-smartreminder" checked={!!wearAlert} onChange={(value)=>this.handleChangeSmartReminder(value,'wear')} />
                <div style={{ marginLeft: '10px'}} >
                    <label> Take your {deviceType} smart reminder </label>
                    {wearAlert ?
                        <div>
                            <p>When enabled your {globalConstants.HUB_SOFIHUB} will speak to you to remind you to take your {deviceType} if it is:
                                still in its charging dock, charged above <b>{wearAlert.battery_threshold}%</b>, and if
                                it is currently awake hours (according to your hub routine). It can repeat the reminder
                            <b> every {moment.duration(wearAlert.delay_in_second, 's').asMinutes()} minutes</b> if the
                            {deviceType} is still in its charging dock.
                            </p>
                            <Button
                                type='primary'
                                className="infoIcon"
                                onClick={()=>this.handleCustomise(wearAlert, 'wear')}
                            >
                                Customise Reminder
                            </Button>
                        </div>
                        :
                        <p>When enabled your {globalConstants.HUB_SOFIHUB} will speak to you to remind you to take your {deviceType} if it is: still in
                            its charging dock, charged above a certain threshold, and if it is currently awake hours
                            (according to your {globalConstants.HUB_SOFIHUB} routine). It can repeat the reminder periodically if the {deviceType} is
                            still in its charging dock.</p>
                    }
                </div>
            </div>
            <UpdateSmartReminderModal
                beacon_pub_id={selectedBeacon.pub_id}
                open={this.state.modal}
                reminder={this.state.reminder}
                type={this.state.type}
                onClose={()=>this.setState({modal: false})}
            />
        </Card>
            : this.renderNoHubCard()
        )
    }
}

export default connect(mapStateToProps)(BeaconSmartReminderCard)

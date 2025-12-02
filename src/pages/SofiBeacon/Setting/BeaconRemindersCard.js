import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { DeleteOutlined } from '@ant-design/icons'
import { Button, Card, message, Popconfirm, Table } from 'antd'
import ReminderCreationModal from '../../Reminder/ReminderCreation'
import HubService from '../../../services/Hub'
import OccupancyBasedReminderModal from '../../Reminder/OccupancybasedReminderModal'
import moment from 'moment'

const mapStateToProps = state => ({
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    linkedHub: state.sofiBeacon.linkedHub,
    hubs: state.hub.hubs,
    reminders: state.setting.reminders
})

class BeaconRemindersCard extends Component {

    constructor(props) {
        super(props)

        this.state = {
            createReminderStep:0,
            beaconSuggestions: {},
            remindersdata: {},
            occupancyBasedReminderModal: false,
        }
    }

    /** move to create reminder step */
    moveToCreateReminderStep = (step) => {
        this.setState({
            createReminderStep: step
        })
    }

    showBeaconRemindersData = (data) => {
        return data && data.filter(res => res.is_beacon_reminder)
    }

    createReminder = async () => {
        const { linkedHub } = this.props
        const beaconSuggestions = await HubService.fetchBeaconSuggestionsTime({ hubId:linkedHub.hub_id })
        this.setState({ beaconSuggestions })
        this.moveToCreateReminderStep(4)
    }

    deleteReminder = (reminder) => {
        const hubId = reminder.hub_id
        const reminderId = reminder.reminder_id
        actions.setting.removeReminder({
            hubId,
            reminderId
        }).then(() => {
            message.success('Reminder deleted successfully ')
        }, (error) => {
            message.error(`Something went wrong ${error}`)
        })
    }

    handleReminderModal = (state, data) => {
        if (data.item.config.reminder_type === 'CUSTOM') {
            this.setState({
                remindersdata: data,
                occupancyBasedReminderModal: state
            })
        }
    }
    render() {
        const { linkedHub, selectedBeacon, reminders } = this.props
        const { createReminderStep, beaconSuggestions } = this.state
        const reminderData = this.showBeaconRemindersData(reminders)
        const columns = [
            {
                title: 'Name',
                key: 'name',
                render: (text, reminder) => {
                    const item = reminder
                    const date = reminder.config.timing.on ? reminder.config.timing.on : reminder.config.timing.recurring.starting
                    return (
                        <span className='reminder_row_click' onClick={() => this.handleReminderModal(true, { item, date })}>{reminder.config.name}</span>
                    )
                }
            },
            {
                title: 'Message',
                key: 'message',
                render: (text, reminder) => {
                    const item = reminder
                    const date = reminder.config.timing.on ? reminder.config.timing.on : reminder.config.timing.recurring.starting
                    return (
                        <span className='reminder_row_click' onClick={() => this.handleReminderModal(true, { item, date })}>{reminder.config.message}</span>
                    )
                }
            },
            {
                title: 'Time',
                key: 'time',
                render: (text, reminder) => {
                    const item = reminder
                    const date = reminder.config.timing.on ? reminder.config.timing.on : reminder.config.timing.recurring.starting
                    return (
                        <span className='reminder_row_click' onClick={() => this.handleReminderModal(true, { item, date })}>
                            {moment(reminder.config.timing.at, 'HH:mm').subtract(1,'hour').format('h:mm A')}
                        </span>
                    )
                }
            },
            {
                title: 'Days',
                key: 'days',
                render: (text, reminder) => {
                    const item = reminder
                    const date = reminder.config.timing.on ? reminder.config.timing.on : reminder.config.timing.recurring.starting
                    if (!reminder.config.timing.on) {
                        const data = reminder.config.timing.recurring.occurs.map((val, k) => {
                            if (reminder.config.timing.recurring.occurs.length > 1) {
                                if (k === reminder.config.timing.recurring.occurs.length - 1) {
                                    return <span key={k}>{val.substring(0, 3)}</span>
                                } else {
                                    return <span key={k}>{val.substring(0, 3) + ','}</span>
                                }
                            } else {
                                return <span key={k}>{val}</span>
                            }
                        })
                        return (
                            <div className='reminder_row_click' onClick={() => this.handleReminderModal(true, { item, date })}>
                                {data}
                            </div>
                        )
                    }
                    else {
                        return (
                            <div className='reminder_row_click' onClick={() => this.handleReminderModal(true, { item, date })}>
                                None
                            </div>
                        )
                    }
                }
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, reminder) => {
                    return (
                        <Popconfirm title="Are you sure to delete this reminder?" onConfirm={() => this.deleteReminder(reminder)}>
                            <DeleteOutlined className='reminder_row_click' />
                        </Popconfirm>
                    )
                }
            }
        ]

        return (
            selectedBeacon && selectedBeacon.hub_id ?
                <Card className="beacon-card" title="Simple Reminders">
                    {linkedHub && !linkedHub.display_name ?
                        <p>Sorry, you do not have permission to view reminders</p>
                        : <Table scroll={{x: true}}
                            columns={columns}
                            dataSource={reminderData}
                            rowKey='reminder_id'
                            locale={{emptyText: 'There are no simple reminders set'}}
                            footer={()=>(!reminderData || reminderData.length===0) &&
                                <Button key="submit" type="primary"  onClick={this.createReminder}>Create</Button>}
                        />
                    }
                    {linkedHub && linkedHub.hub_id && (!reminderData || reminderData.length===0) &&
                        <ReminderCreationModal hubId={linkedHub.hub_id}
                            beaconSuggestions={beaconSuggestions}
                            deviceType='hub' step={createReminderStep}
                            moveTo={this.moveToCreateReminderStep}/> }
                    <OccupancyBasedReminderModal
                        open={this.state.occupancyBasedReminderModal}
                        onClose={() => this.setState({ occupancyBasedReminderModal: false })}
                        remindersData={this.state.remindersdata}
                        speaker_spaces={this.props.speaker_spaces}
                    />
                </Card>
                :
                null
        )
    }
}

export default connect(mapStateToProps)(BeaconRemindersCard)

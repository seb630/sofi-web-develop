import { Component, Fragment } from 'react'
import moment from 'moment/moment'
import { locale } from '../../../utility/Locale'
import { convertto12HrTimestamp, sortWeekDays } from '@/utility/Common'
import { DeleteOutlined } from '@ant-design/icons'
import { Card, Col, Collapse, Divider, message, Popconfirm, Row, Table } from 'antd'
import AddReminder from '../AddReminder'
import TimeBasedReminderModal from '../TimeBasedReminderModal'
import MedicationReminderModal from '../MedicationReminderModal'
import OccupancyBasedReminderModal from '../OccupancybasedReminderModal'
import { actions } from 'mirrorx'

const currentDate = moment()
export default class Reminders extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showPast: false,
            timeBasedReminderModal: false,
            medicationReminderModal: false,
            occupancyBasedReminderModal: false,
            showConfirmDeleteReminderModal: false,
            remindersdata: {},
            reminderId: null,
            hubId: null
        }
    }

    hidePastRemindersData = (data) => {
        return data.filter(res => moment(res.config.timing.on).isSameOrAfter(currentDate, 'days') || res.config.timing.recurring)
    }

    pastRemindersData = (data) => {
        return data.filter(res => !(moment(res.config.timing.on).isSameOrAfter(currentDate, 'days') || res.config.timing.recurring))
    }

    handleReminderModal = (state, data) => {
        if (data.item.config.reminder_type === 'TASK') {
            this.setState({
                remindersdata: data,
                timeBasedReminderModal: state
            })
        }
        if (data.item.config.reminder_type === 'MEDICATION_OPTIMISTIC') {
            this.setState({
                remindersdata: data,
                medicationReminderModal: state
            })
        }
        if (data.item.config.reminder_type === 'CUSTOM') {
            this.setState({
                remindersdata: data,
                occupancyBasedReminderModal: state
            })
        }
    }

    repeatCalculation = (reminder) => {
        const item = reminder
        const time = convertto12HrTimestamp(item.config.timing.at)
        let dayList = ''
        let days = ''
        let date = ''
        if (!item.config.timing.on) {
            date = item.config.timing.recurring.starting
            item.config.timing.recurring.occurs.sort((a, b) => sortWeekDays(a, b))
            days = item.config.timing.recurring.occurs.map((val, k) => {
                if (item.config.timing.recurring.occurs.length > 1) {
                    if (k === item.config.timing.recurring.occurs.length - 1) {
                        dayList = val.substring(0, 3)
                    } else {
                        dayList = val.substring(0, 3) + ','
                    }
                } else {
                    dayList = val
                }
                return dayList
            })
        } else {
            date = item.config.timing.on
            days = 'None'
        }
        return ({ time, date, days })
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



    render() {
        const reminderData = this.hidePastRemindersData(this.props.reminders)
        const pastRemindersData = this.pastRemindersData(this.props.reminders)
        const columns = [
            {
                title: 'Name',
                key: 'name',
                width: '15%',
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
                width: '40%',
                render: (text, reminder) => {
                    const item = reminder
                    const date = reminder.config.timing.on ? reminder.config.timing.on : reminder.config.timing.recurring.starting
                    return (
                        <span className='reminder_row_click' onClick={() => this.handleReminderModal(true, { item, date })}>{reminder.config.message}</span>
                    )
                }
            },

            {
                title: 'Date',
                key: 'Date',
                width: '10%',
                render: (text, reminder) => {
                    const item = reminder
                    const date = reminder.config.timing.on ? reminder.config.timing.on : reminder.config.timing.recurring.starting
                    return (
                        <span className='reminder_row_click' onClick={() => this.handleReminderModal(true, { item, date })}>
                            {reminder.config.timing.on ? moment(reminder.config.timing.on).format(locale.dateFormat) : moment(reminder.config.timing.recurring.starting).format(locale.dateFormat)}
                        </span>
                    )

                }
            },

            {
                title: 'Time',
                key: 'time',
                width: '10%',
                render: (text, reminder) => {
                    const item = reminder
                    const date = reminder.config.timing.on ? reminder.config.timing.on : reminder.config.timing.recurring.starting
                    return (
                        <span className='reminder_row_click' onClick={() => this.handleReminderModal(true, { item, date })}>
                            {convertto12HrTimestamp(reminder.config.timing.at)}
                        </span>
                    )

                }
            },
            {
                title: 'Days',
                key: 'days',
                width: '15%',
                render: (text, reminder) => {
                    const item = reminder
                    const date = reminder.config.timing.on ? reminder.config.timing.on : reminder.config.timing.recurring.starting
                    if (!reminder.config.timing.on) {
                        let weekdays = reminder.config.timing.recurring.occurs.sort((a, b) => sortWeekDays(a, b))
                        const data = weekdays.map((val, k) => {
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
                width: '10%',
                render: (text, reminder) => {
                    return (
                        <Popconfirm title=" Are you sure to delete this reminder?" onConfirm={() => this.deleteReminder(reminder)}>
                            <DeleteOutlined className='reminder_row_click' />
                        </Popconfirm>
                    )
                }
            }
        ]


        const mobileData = this.props.reminders.map((item, i) => {
            const { time, date } = this.repeatCalculation(item)
            return (
                <Card key={i} title={item.config.name}
                    onClick={() => this.handleReminderModal(true, { item, date })}>
                    <p className="reminder_desc">{item.config.message}</p>
                    <p className="reminder_day">{moment(item.config.timing.on).format('L')}<label className="right">{time}</label>
                    </p>
                </Card>
            )
        })

        return (
            <Fragment>
                <Row className="systemDetails">
                    <Col xs={0} md={24}>
                        <Table
                            scroll={{x: true}}
                            columns={columns}
                            dataSource={reminderData}
                            rowKey='reminder_id'
                        />

                        <Row>
                            <AddReminder
                                speaker_spaces={this.props.speaker_spaces}
                                hubId={this.props.hubId}
                            />
                        </Row>
                    </Col>
                    <Col xs={24} md={0}>
                        {mobileData}
                        <AddReminder
                            speaker_spaces={this.props.speaker_spaces}
                            hubId={this.props.hubId}
                        />
                    </Col>
                    <Divider />
                    <Row style={{width: '100%'}}>
                        <Col span={24}>
                            <Collapse>
                                <Collapse.Panel key="past" header="Past Reminders">
                                    <Table scroll={{x: true}} columns={columns} dataSource={pastRemindersData} rowKey='reminder_id' />
                                </Collapse.Panel>
                            </Collapse>
                        </Col>
                    </Row>
                </Row>


                <TimeBasedReminderModal
                    open={this.state.timeBasedReminderModal}
                    onClose={() => this.setState({ timeBasedReminderModal: false })}
                    remindersData={this.state.remindersdata}
                />
                <MedicationReminderModal
                    open={this.state.medicationReminderModal}
                    onClose={() => this.setState({ medicationReminderModal: false })}
                    remindersData={this.state.remindersdata}
                />
                <OccupancyBasedReminderModal
                    open={this.state.occupancyBasedReminderModal}
                    onClose={() => this.setState({ occupancyBasedReminderModal: false })}
                    remindersData={this.state.remindersdata}
                    speaker_spaces={this.props.speaker_spaces}
                />

            </Fragment>
        )
    }
}



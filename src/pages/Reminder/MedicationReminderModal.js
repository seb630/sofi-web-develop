import { Component } from 'react'
import { Form } from '@ant-design/compatible'
import { Button, Checkbox, Col, Input, message, Modal, Row, TimePicker } from 'antd'
import { globalConstants } from '@/_constants'
import moment from 'moment'
import { actions } from 'mirrorx'

const timeFormat = globalConstants.API_TIME_FORMAT
const dateFormat = globalConstants.API_DATE_FORMAT
let occurs = []
let payload = {}


class MedicationReminderModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isDisable: false,
            button: 'Save',
            hubId: this.props.hubId,
            reminder_id: '',
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.remindersData !== this.props.remindersData) {
            this.resetcheckbox()
            this.props.form.setFieldsValue({
                message: this.props.remindersData.item.config.message,
                name: this.props.remindersData.item.config.name,
                at: moment(this.props.remindersData.item.config.timing.at, timeFormat)
            })
            this.setState({
                button: 'Update',
                hubId: this.props.remindersData.item.hub_id,
                reminder_id: this.props.remindersData.item.reminder_id

            })
            this.props.remindersData.item.config.timing.recurring && this.handleUpdateCheckbox(this.props.remindersData.item.config.timing.recurring.occurs)
        }
    }

    handleUpdateCheckbox = (data) => {
        for (let i in data) {
            if (data[i] === 'Monday') {
                this.props.form.setFieldsValue({ isCheckedMon: true })
                occurs.push('Monday')
            }
            else if (data[i] === 'Tuesday') {
                this.props.form.setFieldsValue({ isCheckedTue: true })
                occurs.push('Tuesday')
            }
            else if (data[i] === 'Wednesday') {
                this.props.form.setFieldsValue({ isCheckedWed: true })
                occurs.push('Wednesday')
            }
            else if (data[i] === 'Thursday') {
                this.props.form.setFieldsValue({ isCheckedThu: true })
                occurs.push('Thursday')
            }
            else if (data[i] === 'Friday') {
                this.props.form.setFieldsValue({ isCheckedFri: true })
                occurs.push('Friday')
            }
            else if (data[i] === 'Saturday') {
                this.props.form.setFieldsValue({ isCheckedSat: true })
                occurs.push('Saturday')

            }
            else if (data[i] === 'Sunday') {
                this.props.form.setFieldsValue({ isCheckedSun: true })
                occurs.push('Sunday')
            }
            else {
                this.resetcheckbox()
            }

        }
    }

    resetcheckbox = () => {
        this.setState({ isDisable: true})
        this.props.form.setFieldsValue({
            isCheckedMon: false,
            isCheckedTue: false,
            isCheckedWed: false,
            isCheckedThu: false,
            isCheckedFri: false,
            isCheckedSat: false,
            isCheckedSun: false
        })
        occurs = []
    }

    removeOccursElement = element => {
        for (let i in occurs) {
            if (occurs[i] === element) {
                occurs.splice(i, 1)
            }
        }
    }

    handleCancel = () => {
        this.props.onClose()
        this.props.form.resetFields()
    }

    handleSaveOrUpdateReminders = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                if (occurs.length > 0) {
                    payload = {
                        hub_id: this.state.hubId,
                        state: 'ACTIVE',
                        config: {
                            name: values.name,
                            message: values.message,
                            via: 'SPEAK',
                            timing: {
                                'at': moment(values.at).format(timeFormat),
                                recurring: {
                                    starting: moment().format(dateFormat),
                                    occurs: occurs
                                },
                            },
                            unless: {
                                within: '60m',
                                event: 'ACCESSED_MEDICATION'
                            },
                            reminder_type: 'MEDICATION_OPTIMISTIC'
                        }
                    }
                } else {
                    payload = {
                        hub_id: this.state.hubId,
                        state: 'ACTIVE',
                        config: {
                            name: values.name,
                            message: values.message,
                            via: 'SPEAK',
                            timing: {
                                at: moment(values.at).format(timeFormat),
                                on: moment().format(dateFormat)
                            },
                            unless: {
                                within: '60m',
                                event: 'ACCESSED_MEDICATION'
                            },
                            reminder_type: 'MEDICATION_OPTIMISTIC'
                        }
                    }
                }

                this.state.reminder_id === '' ?
                    actions.setting.addReminder({
                        hubId: this.state.hubId,
                        payload
                    }).then(() => {
                        this.props.onClose()
                        this.props.form.resetFields()
                        message.success('reminder created successfully')
                        this.resetcheckbox()
                    }, (error) => {
                        message.error(`something went wrong ${error}`)
                    })
                    : actions.setting.updateReminder({
                        hubId: this.state.hubId,
                        reminderId: this.state.reminder_id,
                        payload
                    }).then(() => {
                        this.props.onClose()
                        message.success('reminder updated  successfully')
                        this.setState({ reminder_id: '' })
                        this.props.form.resetFields()
                        this.resetcheckbox()

                    }, (error) => {
                        message.error(`something went wrong ${error}`)
                    })
            }

        })

    }

    deleteReminder = () => {
        const hubId = this.state.hubId
        const reminderId = this.state.reminder_id
        actions.setting.removeReminder({
            hubId,
            reminderId
        }).then(() => {
            message.success('reminder deleted successfully ')
            this.props.onClose()
        }, (error) => {
            message.error(`something went wrong ${error}`)
        })
    }


    renderReminderDeleteButton = () => {
        if (this.state.button === 'Update')
            return <Button key="delete" danger onClick={this.deleteReminder} className="deleteButton" >Delete</Button>
    }


    popupTitle = () => {
        return <div>
            <h4>Medication Reminder</h4>
            <label>This message will play unless the medicine cabinet was accessed within an
                    hour of scheduled time.</label>
        </div>
    }
    render() {
        const { getFieldDecorator } = this.props.form
        return (
            <div>
                <Modal
                    title={this.popupTitle()}
                    open={this.props.open}
                    onOk={this.handleSaveOrUpdateReminders}
                    onCancel={this.handleCancel}
                    width='900px'
                    destroyOnClose
                    bodyStyle={{ height: 'auto' }}
                    footer={[
                        this.renderReminderDeleteButton(),
                        <Button key="back" onClick={this.handleCancel}>Cancel</Button>,
                        <Button key="submit" type="primary" onClick={this.handleSaveOrUpdateReminders}>
                            {this.state.button}
                        </Button>
                    ]}
                >

                    <Form layout="vertical">
                        <Row>
                            <Col span={24} >
                                <Form.Item
                                    label="Name"
                                >
                                    {getFieldDecorator('name', {
                                        rules: [{ required: true, message: globalConstants.REQUIRED_REMINDERNAME }],
                                    })(
                                        <Input
                                            type="text"
                                            placeholder="Reminder Name"
                                        />
                                    )}

                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    label='Message'
                                >
                                    {getFieldDecorator('message', {
                                        rules: [{ required: true, message: globalConstants.REQUIRED_RMESSAGE }],
                                    })(
                                        <Input.TextArea
                                            placeholder="Message to be read"
                                            autoSize={{ minRows: 2, maxRows: 6 }}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={{ span: 24 }} md={{ span: 12, }} lg={{ span: 12 }}>
                                <Form.Item
                                    label='Time'
                                >
                                    {getFieldDecorator('at', {
                                        rules: [{ required: true, message: globalConstants.REQUIRED_RTIME }],
                                    })(
                                        <TimePicker showSecond={false}
                                            defaultOpenValue={moment('00:00', timeFormat)}
                                            placeholder='HH:MM AM/PM'
                                            format={timeFormat} use12Hours={true}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>

                            <Col xs={{ span: 24 }} md={{ span: 3 }} lg={{ span: 3 }}>
                                <Form.Item>
                                    {getFieldDecorator('isCheckedMon', {
                                        valuePropName: 'checked',
                                        getValueFromEvent: (e) => e.target.checked ? occurs.push('Monday') : this.removeOccursElement('Monday')

                                    })(
                                        <Checkbox
                                        > Mon
                                        </Checkbox>
                                    )}
                                </Form.Item>

                            </Col>
                            <Col xs={{ span: 24 }} md={{ span: 3 }} lg={{ span: 3 }}>
                                <Form.Item>
                                    {getFieldDecorator('isCheckedTue', {
                                        valuePropName: 'checked',
                                        getValueFromEvent: (e) => e.target.checked ? occurs.push('Tuesday') : this.removeOccursElement('Tuesday')

                                    })(
                                        <Checkbox
                                        >Tue
                                        </Checkbox>
                                    )}
                                </Form.Item>

                            </Col>
                            <Col xs={{ span: 24 }} md={{ span: 3 }} lg={{ span: 3 }}>
                                <Form.Item>
                                    {getFieldDecorator('isCheckedWed', {
                                        valuePropName: 'checked',
                                        getValueFromEvent: (e) => e.target.checked ? occurs.push('Wednesday') : this.removeOccursElement('Wednesday')
                                    })(
                                        <Checkbox
                                        > Wed
                                        </Checkbox>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col xs={{ span: 24 }} md={{ span: 3 }} lg={{ span: 3 }}>
                                <Form.Item>
                                    {getFieldDecorator('isCheckedThu', {
                                        valuePropName: 'checked',
                                        getValueFromEvent: (e) => e.target.checked ? occurs.push('Thursday') : this.removeOccursElement('Thursday')
                                    })(
                                        <Checkbox
                                        >Thu
                                        </Checkbox>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col xs={{ span: 24 }} md={{ span: 3 }} lg={{ span: 3 }}>
                                <Form.Item>
                                    {getFieldDecorator('isCheckedFri', {
                                        valuePropName: 'checked',
                                        getValueFromEvent: (e) => e.target.checked ? occurs.push('Friday') : this.removeOccursElement('Friday')
                                    })(
                                        <Checkbox
                                        >Fri
                                        </Checkbox>
                                    )}
                                </Form.Item>

                            </Col>
                            <Col xs={{ span: 24 }} md={{ span: 3 }} lg={{ span: 3 }}>
                                <Form.Item>
                                    {getFieldDecorator('isCheckedSat', {
                                        valuePropName: 'checked',
                                        getValueFromEvent: (e) => e.target.checked ? occurs.push('Saturday') : this.removeOccursElement('Saturday')
                                    })(
                                        <Checkbox
                                        >Sat
                                        </Checkbox>
                                    )}
                                </Form.Item>

                            </Col>
                            <Col xs={{ span: 24 }} md={{ span: 3 }} lg={{ span: 3 }}>
                                <Form.Item>
                                    {getFieldDecorator('isCheckedSun', {
                                        valuePropName: 'checked',
                                        getValueFromEvent: (e) => e.target.checked ? occurs.push('Sunday') : this.removeOccursElement('Sunday')
                                    })(
                                        <Checkbox
                                        >Sun
                                        </Checkbox>
                                    )}
                                </Form.Item>

                            </Col>

                        </Row>
                    </Form>
                </Modal>
            </div>
        )
    }
}

export default Form.create()(MedicationReminderModal)

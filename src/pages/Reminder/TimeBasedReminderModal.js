import { Component } from 'react'
import { Form } from '@ant-design/compatible'
import { Button, Checkbox, Col, DatePicker, Input, message, Modal, Row, Select, TimePicker, } from 'antd'
import { locale } from '../../utility/Locale'
import { globalConstants } from '@/_constants'
import moment from 'moment'
import { actions } from 'mirrorx'

const timeFormat = globalConstants.API_TIME_FORMAT
const dateFormat = globalConstants.API_DATE_FORMAT
let occurs = []
let payload = {}


class TimeBasedReminderModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isDisable: true,
            button: 'Save',
            hubId: this.props.hubId,
            isRecurring: false,
            reminder_id: '',
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.remindersData !== this.props.remindersData) {

            this.resetcheckbox()
            this.props.form.setFieldsValue({
                message: this.props.remindersData.item.config.message,
                name: this.props.remindersData.item.config.name,
                at: moment(this.props.remindersData.item.config.timing.at, timeFormat),
                on: moment(this.props.remindersData.date, dateFormat),
            })
            this.setState({
                button: 'Update',
                hubId: this.props.remindersData.item.hub_id,
                reminder_id: this.props.remindersData.item.reminder_id
            })
            this.props.remindersData.item.config.timing.recurring ?
                this.handleRecurringValue(this.props.remindersData.item.config.timing.recurring.occurs):
                this.props.form.setFieldsValue({ recurring: 'Never' })
        }

    }

    handleRecurringValue = (value) => {
        value.map((option) => {
            if (option === 'Daily' || option === 'Fortnightly' || option === 'Yearly') {
                this.props.form.setFieldsValue({ recurring: option })
                this.resetcheckbox(true)
            }
            else if (option === 'None') {
                this.props.form.setFieldsValue({ recurring: 'Never' })
                this.resetcheckbox()
            }
            else {
                this.props.form.setFieldsValue({ recurring: 'Weekly' })
                this.setState({ isDisable: false, isRecurring: true })
                this.handleUpdateCheckbox(value)
            }
        })
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

    handleRecurring = (value) => {
        if (value === 'Daily' || value === 'Yearly' || value === 'Fortnightly') {
            this.resetcheckbox(true)

        }
        else if (value === 'Weekly') {
            this.setState({ isDisable: false, isRecurring: true })
        }
        else {
            this.resetcheckbox()
        }

    }

    validateRecurr = (rule, value, callback) => {
        if (value === 'Weekly' && occurs.length <= 0) {
            callback('Please select a day to repeat weekly')
        }
        else {
            callback()
        }
    }

    handleCancel = () => {
        this.props.onClose()
        this.props.form.resetFields()
    }

    resetcheckbox = (recurring=false) => {
        this.setState({ isDisable: true, isRecurring: recurring })
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

    popupTitle = () => {
        return <div>
            <h4>Time Based Reminder</h4>
            <label>This message will play at the scheduled time.</label>
        </div>
    }

    removeOccursElement = element => {
        for (let i in occurs) {
            if (occurs[i] === element) {
                occurs.splice(i, 1)
            }
        }
    }

    validateCheckbox = (rule, value, callback) => {
        const recurrValue = this.props.form.getFieldValue('recurring')
        if (occurs.length > 0) {
            this.props.form.setFields({
                recurring: {
                    value: this.props.form.getFieldValue('recurring'),
                    errors: null
                }
            })
            callback()
        }
        else if (recurrValue === 'Weekly' && occurs.length <= 0) {
            this.props.form.setFields({
                recurring: {
                    value: this.props.form.getFieldValue('recurring'),
                    errors: [new Error('Please select a day to repeat weekly')]
                }
            })
            callback()
        }
        else {
            callback()
        }

    }

    renderReminderDeleteButton = () => {
        if (this.state.button === 'Update')
            return <Button key="delete" danger onClick={this.deleteReminder} className="deleteButton" >Delete</Button>
    }

    handleSaveOrUpdateReminders = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                if (this.state.isRecurring) {
                    payload = {
                        hub_id: this.state.hubId,
                        state: 'ACTIVE',
                        config: {
                            name: values.name,
                            message: values.message,
                            via: 'SPEAK',
                            timing: {
                                at: moment(values.at).format(timeFormat),
                                recurring: {
                                    starting: moment(values.on).format(dateFormat),
                                    occurs: values.recurring === 'Weekly' ? occurs : values.recurring
                                }
                            },
                            reminder_type: 'TASK'
                        }
                    }
                }
                else {
                    payload = {
                        hub_id: this.state.hubId,
                        state: 'ACTIVE',
                        config: {
                            name: values.name,
                            message: values.message,
                            via: 'SPEAK',
                            timing: {
                                at: moment(values.at).format(timeFormat),
                                on: moment(values.on).format(dateFormat)
                            },
                            reminder_type: 'TASK'
                        }
                    }
                }

                this.state.reminder_id === '' ?
                    actions.setting.addReminder({
                        hubId: this.state.hubId,
                        payload
                    }).then(() => {
                        this.props.onClose()
                        message.success('reminder created successfully')
                        this.props.form.resetFields()
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



    render() {
        const { getFieldDecorator } = this.props.form
        return (
            <div>
                <Modal
                    destroyOnClose
                    title={this.popupTitle()}
                    open={this.props.open}
                    onOk={this.handleSaveOrUpdateReminders}
                    onCancel={this.handleCancel}
                    width='900px'
                    bodyStyle={{ height: 'auto' }}
                    footer={[
                        this.renderReminderDeleteButton(),
                        <Button key="back" onClick={this.handleCancel}>Cancel</Button>,
                        <Button key='submit' type="primary" onClick={this.handleSaveOrUpdateReminders}>
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
                            <Col xs={{ span: 24 }} md={{ span: 11 }} lg={{ span: 11 }}>
                                <Form.Item
                                    label='Start date'
                                >
                                    {getFieldDecorator('on', {
                                        rules: [{ required: true, message: globalConstants.REQUIRED_RDATE }],
                                    })(
                                        <DatePicker
                                            size="large"
                                            format={locale.dateFormat}
                                            placeholderText={locale.dateFormat}
                                        />
                                    )}
                                </Form.Item>

                            </Col>
                            <Col xs={{ span: 24 }} md={{ span: 11, offset: 2 }} lg={{ span: 11, offset: 2 }}>
                                <Form.Item
                                    label='Time'
                                >
                                    {getFieldDecorator('at', {
                                        rules: [{ required: true, message: globalConstants.REQUIRED_RTIME }],
                                    })(
                                        <TimePicker
                                            showSecond={false}
                                            defaultPickerValue={moment('00:00', timeFormat)}
                                            placeholder='HH:MM AM/PM'
                                            size="large"
                                            format={timeFormat} use12Hours={true}
                                        />
                                    )}
                                </Form.Item>
                            </Col>

                        </Row>
                        <Row>

                            <Col xs={{ span: 24 }} md={{ span: 4 }} lg={{ span: 4 }}>
                                <Form.Item>
                                    {getFieldDecorator('recurring', {
                                        initialValue: 'Never',
                                        rules: [{ validator: this.validateRecurr }],

                                    })(
                                        <Select
                                            showSearch
                                            optionFilterProp="children"
                                            onChange={this.handleRecurring}
                                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                        >
                                            <Select.Option value="Never">Never</Select.Option>
                                            <Select.Option value="Daily">Daily</Select.Option>
                                            <Select.Option value="Weekly">Weekly</Select.Option>
                                            <Select.Option value="Fortnightly">Fortnightly</Select.Option>
                                            <Select.Option value="Yearly">Yearly</Select.Option>
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>

                            <Col xs={{ span: 24 }} md={{ span: 3, offset: 1 }} lg={{ span: 3, offset: 1 }}>
                                <Form.Item>
                                    {getFieldDecorator('isCheckedMon', {
                                        valuePropName: 'checked',
                                        getValueFromEvent: (e) => e.target.checked ? occurs.push('Monday') : this.removeOccursElement('Monday'),
                                        rules: [{ validator: this.validateCheckbox }]

                                    })(
                                        <Checkbox
                                            disabled={this.state.isDisable}

                                        > Mon
                                        </Checkbox>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col xs={{ span: 24 }} md={{ span: 3 }} lg={{ span: 3 }}>
                                <Form.Item>
                                    {getFieldDecorator('isCheckedTue', {
                                        valuePropName: 'checked',
                                        getValueFromEvent: (e) => e.target.checked ? occurs.push('Tuesday') : this.removeOccursElement('Tuesday'),
                                        rules: [{ validator: this.validateCheckbox }]

                                    })(
                                        <Checkbox
                                            disabled={this.state.isDisable}
                                        >Tue
                                        </Checkbox>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col xs={{ span: 24 }} md={{ span: 3 }} lg={{ span: 3 }}>
                                <Form.Item>
                                    {getFieldDecorator('isCheckedWed', {
                                        valuePropName: 'checked',
                                        getValueFromEvent: (e) => e.target.checked ? occurs.push('Wednesday') : this.removeOccursElement('Wednesday'),
                                        rules: [{ validator: this.validateCheckbox }]
                                    })(
                                        <Checkbox
                                            disabled={this.state.isDisable}
                                        > Wed
                                        </Checkbox>
                                    )}
                                </Form.Item>

                            </Col>
                            <Col xs={{ span: 24 }} md={{ span: 3 }} lg={{ span: 3 }}>
                                <Form.Item>
                                    {getFieldDecorator('isCheckedThu', {
                                        valuePropName: 'checked',
                                        getValueFromEvent: (e) => e.target.checked ? occurs.push('Thursday') : this.removeOccursElement('Thursday'),
                                        rules: [{ validator: this.validateCheckbox }]
                                    })(
                                        <Checkbox
                                            disabled={this.state.isDisable}
                                        >Thu
                                        </Checkbox>
                                    )}
                                </Form.Item>

                            </Col>
                            <Col xs={{ span: 24 }} md={{ span: 3 }} lg={{ span: 3 }}>
                                <Form.Item>
                                    {getFieldDecorator('isCheckedFri', {
                                        valuePropName: 'checked',
                                        getValueFromEvent: (e) => e.target.checked ? occurs.push('Friday') : this.removeOccursElement('Friday'),
                                        rules: [{ validator: this.validateCheckbox }]
                                    })(
                                        <Checkbox
                                            disabled={this.state.isDisable}
                                        >Fri
                                        </Checkbox>
                                    )}
                                </Form.Item>

                            </Col>
                            <Col xs={{ span: 24 }} md={{ span: 2 }} lg={{ span: 2 }}>
                                <Form.Item>
                                    {getFieldDecorator('isCheckedSat', {
                                        valuePropName: 'checked',
                                        getValueFromEvent: (e) => e.target.checked ? occurs.push('Saturday') : this.removeOccursElement('Saturday'),
                                        rules: [{ validator: this.validateCheckbox }]
                                    })(
                                        <Checkbox
                                            disabled={this.state.isDisable}
                                        >Sat
                                        </Checkbox>
                                    )}
                                </Form.Item>

                            </Col>
                            <Col xs={{ span: 24 }} md={{ span: 2 }} lg={{ span: 2 }}>
                                <Form.Item>
                                    {getFieldDecorator('isCheckedSun', {
                                        valuePropName: 'checked',
                                        getValueFromEvent: (e) => e.target.checked ? occurs.push('Sunday') : this.removeOccursElement('Sunday'),
                                        rules: [{ validator: this.validateCheckbox }]
                                    })(
                                        <Checkbox
                                            disabled={this.state.isDisable}
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

export default Form.create()(TimeBasedReminderModal)

import { Component, Fragment } from 'react'
import { actions } from 'mirrorx'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { Form } from '@ant-design/compatible'
import { Button, Checkbox, Col, Input, InputNumber, message, Modal, Popover, Row, Spin, Switch, TimePicker, Typography, } from 'antd'
import { globalConstants } from '@/_constants'
import moment from 'moment'
import PropTypes from 'prop-types'

const timeFormat = globalConstants.API_TIME_FORMAT
const {Paragraph} = Typography

/** APN Modal HoC
 * @param {React.Component} ActionComponent
 * @param {Object} params
 * @return {React.Component}
*/
function withDefinitionModal (ActionComponent,params) {
    class DefinitionForm extends Component {
        constructor(props) {
            super(props)
            this.state = {
                isEditable: !!props.rule,
                open: false,
                submitting : false,
                indeterminate: props.rule?.config?.time_frame?.repeats?.length < 7 && props.rule?.config.time_frame.repeats?.length > 0,
                checkAll: props.rule ? props.rule?.config?.time_frame?.repeats?.length === 7 : true
            }

            this._isMount = false
        }

        componentDidMount = () => {
            this._isMount = true
        }

        componentWillUnmount = () => {
            this._isMount = false
        }

        /** handle close Modal */
        handleClose = () => {
            const { form } = this.props
            form.resetFields()
            this._isMount && this.setState({ open: false })
        }

        /** handle open Modal */
        handleOpen = () => {
            this.setState({ open: true })
        }

        handleUndelete = () => {
            const payload = {
                ...this.props.rule,
                invisible: false,
                config: JSON.stringify(this.props.rule.config)
            }
            actions.hub.updateEventRules({hubId: this.props.rule.hub_id, payload}).then(()=>actions.routing.push('/rules/definition'))
        }
        /** handle saving */
        handleSave = () => {
            const { form , rule, selectedHub} = this.props
            const { isEditable } = this.state
            form.validateFieldsAndScroll(async (err, values) => {
                if (!err) {
                    try {
                        this.setSubmit(true)
                        let payload = {...rule}
                        let config = {
                            notification: {
                                send_sms: values.notification_method.includes('sms'),
                                send_email: values.notification_method.includes('email'),
                                send_to_user_ids: values.send_to_user_ids
                            },
                            time_frame: {
                                starts_at: values.all_day ? '00:00' : values.starts_at.format(timeFormat),
                                ends_at: values.all_day ? '23:59' : values.ends_at.format(timeFormat),
                                repeats: values.repeats
                            },
                            respect_holidays: values.respect_holidays,
                            device_ids: values.device_ids,
                            space_ids: values.space_ids
                        }
                        payload.hub_id = selectedHub.hub_id
                        payload.active = values.active
                        payload.cool_down_interval = moment.duration(parseInt(values.cool_down_interval), 'minutes').toISOString()
                        payload.rule_name = values.rule_name
                        payload.rule_type = 'DEVICE_TRANSIT'
                        payload.config = JSON.stringify(config)
                        delete payload.repeat_days
                        isEditable ? await actions.hub.updateEventRules({ hubId: selectedHub.hub_id, payload}):
                            await actions.hub.createEventRules({ hubId: selectedHub.hub_id, payload})
                        await actions.hub.getEventRules(selectedHub.hub_id)
                        message.success(isEditable ? 'Rule Updated' : 'Rule Created')
                        this.handleClose()
                    } catch (err) {
                        err.global_errors?.length>0 ? err.global_errors.map(item => {
                            message.error(`${item.message}`)
                        }) : message.error(globalConstants.SERVER_ERROR_MESSAGE)
                    } finally {
                        this.setSubmit(false)
                    }
                }
            })
        }

        setSubmit = (value) => {
            this._isMount && this.setState({ submitting: value })
        }

        onCheckAllChange = e => {
            this.props.form.setFieldsValue({repeats : e.target.checked ? ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'] : []})
            this.setState({
                indeterminate: false,
                checkAll: e.target.checked,
            })
        }

        render() {
            const { form , rule, devices, spaces, carers } = this.props
            const { getFieldDecorator,  getFieldValue} = form
            const { submitting , open , isEditable, indeterminate, checkAll } = this.state

            const formItemLayout = {
                labelCol: { xs: 24, sm: 12 },
                wrapperCol: { xs: 24, sm: 12 },
            }
            const holidayContent = <Typography>
                <Paragraph>Holiday periods can be recorded on your {globalConstants.HUB_SOFIHUB}, these holiday periods let us know if no one is home so that we can avoid sending you notifications about
                    anomalies and other events. You can opt this rule to respect those holiday periods (i.e. do not send any notifications during a holiday period) or to
                    disregard holiday periods (i.e. send notifications during a holiday period).</Paragraph>
                <Paragraph>If you are leaving home on a holiday and you want to be notified about motion around the house you must select &quot;Do not respect&quot; to
                    ensure you are notified.</Paragraph>
                <Paragraph>You can add or remove holiday periods by going to the &quot;Settings&quot; page and selecting the &quot;Holiday&quot; tab.</Paragraph>
            </Typography>

            const cdContent = <Typography>
                <Paragraph>These rules trigger notifications, and if the sensors or spaces that trigger the rules are very active you can get multiple notifications in a
                    very short time period - for example if you receive a food or postal delivery there will be a lot of movement at the front door for a longer period
                    of time as you accept the delivery and sign for it.</Paragraph>
                <Paragraph>A cool down period ensures that a long event such as a delivery only sends one notification and not multiple, by making sure that we only send you
                    a new notification after a certain amount of time has passed. SOFIHUB recommends you cool down periods to 3 minutes or more.</Paragraph>
            </Typography>

            const activeContent = <Typography>
                <Paragraph>When &quot;enabled&quot; all parties will receive this event notification. If changed to &quot;Disabled&quot; all parties will temporarily stop
                    receiving notifications for this rule until it is re-enabled in the future.
                </Paragraph>
            </Typography>

            return (
                <Fragment>
                    <ActionComponent onClick={this.handleOpen} />
                    <Modal
                        width={800}
                        open={open}
                        onCancel={this.handleClose}
                        centered={false}
                        title={isEditable ? `Edit Rule: ${rule.rule_name}` : 'Add a new rule'}
                        footer={
                            [
                                rule?.invisible && <Button key="undelete" onClick={this.handleUndelete} style={{float:'left'}}>Un-Delete</Button>,
                                <Button key="back" onClick={this.handleClose}>Cancel</Button>,
                                <Button key="submit" type="primary"  onClick={this.handleSave}>
                                    Save
                                </Button>,
                            ]}
                    >
                        <Spin spinning={submitting}>
                            <Form layout="horizontal" colon={false} {...formItemLayout}>
                                <Form.Item label="What should the rule be called?">
                                    {
                                        getFieldDecorator('rule_name', {
                                            rules: [{ required: true, message: 'Please enter rule name!' }],
                                            initialValue: rule && rule.rule_name
                                        })(
                                            <Input  maxLength={globalConstants.INPUT_MAX_LENGTH} width={200}/>
                                        )
                                    }
                                </Form.Item>
                                <Form.Item
                                    label="Between what times should the rule trigger on?"
                                    labelCol= {{ xs: 24, sm: 16 }}
                                    wrapperCol={{ xs: 24, sm: 8 }}>
                                    {
                                        getFieldDecorator('all_day', {
                                            valuePropName: 'checked',
                                            initialValue: rule ? rule.starts_at ==='00:00' && rule.ends_at ==='23:59' : true
                                        })(
                                            <Switch
                                                size="default"
                                                checkedChildren="All Day"
                                                unCheckedChildren="Not All Day"
                                            />
                                        )
                                    }
                                </Form.Item>
                                {!getFieldValue('all_day') && <Fragment>
                                    <Form.Item
                                        label='Start time:'
                                    >
                                        {getFieldDecorator('starts_at', {initialValue: rule && moment(rule.starts_at, timeFormat)})(
                                            <TimePicker
                                                showSecond={false}
                                                defaultOpenValue={moment('08:00', timeFormat)}
                                                placeholder='HH:MM AM/PM'
                                                format={timeFormat}
                                                use12Hours
                                            />
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        label='End time:'
                                    >
                                        {getFieldDecorator('ends_at', {initialValue: rule && moment(rule.ends_at, timeFormat)})(
                                            <TimePicker
                                                showSecond={false}
                                                defaultOpenValue={moment('20:00', timeFormat)}
                                                placeholder='HH:MM AM/PM'
                                                format={timeFormat}
                                                use12Hours
                                            />
                                        )}
                                    </Form.Item>
                                </Fragment>
                                }
                                <Form.Item label="What days should the rule be triggered on?" >
                                    {
                                        getFieldDecorator('repeats', {
                                            initialValue: rule ? rule.repeats : ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'],
                                            rules: [{ required: true, message: 'Please select at least one day!' }],
                                        })(
                                            <Checkbox.Group
                                                style={{ width: '100%', marginBottom: '-20px'}}
                                                onChange = {checkedList=> {
                                                    this.setState({
                                                        indeterminate: !!checkedList.length && checkedList.length<7,
                                                        checkAll: checkedList.length === 7,
                                                    })
                                                }}
                                            >
                                                <Row>
                                                    <Col span={6}>
                                                        <Checkbox value="MONDAY">Mon</Checkbox>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Checkbox value="TUESDAY">Tue</Checkbox>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Checkbox value="WEDNESDAY">Wed</Checkbox>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Checkbox value="THURSDAY">Thu</Checkbox>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Checkbox value="FRIDAY">Fri</Checkbox>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Checkbox value="SATURDAY">Sat</Checkbox>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Checkbox value="SUNDAY">Sun</Checkbox>
                                                    </Col>
                                                </Row>
                                            </Checkbox.Group>
                                        )
                                    }

                                    <Checkbox
                                        style={{margin: '-10px,0'}}
                                        indeterminate={indeterminate}
                                        onChange={this.onCheckAllChange}
                                        checked={checkAll}
                                    >
                                        Everyday
                                    </Checkbox>

                                </Form.Item>

                                <Form.Item
                                    label="Should the rule respect holiday periods?"
                                >
                                    {
                                        getFieldDecorator('respect_holidays', {
                                            valuePropName: 'checked',
                                            initialValue: rule ? rule.config?.respect_holidays : true
                                        })(
                                            <Switch
                                                size="default"
                                                checkedChildren="Yes"
                                                unCheckedChildren="No"
                                            />
                                        )
                                    }
                                    <span className="question">
                                        <Popover
                                            getPopupContainer={triggerNode => triggerNode.parentNode.parentNode.parentNode}
                                            content={holidayContent}
                                            trigger="click"
                                        ><QuestionCircleOutlined />What does this mean?</Popover>
                                    </span>
                                </Form.Item>
                                <Form.Item
                                    label="Cool down time?"
                                >
                                    {
                                        getFieldDecorator('cool_down_interval', {
                                            initialValue: rule ? moment.duration(rule.cool_down_interval).asMinutes() : 10
                                        })(
                                            <InputNumber
                                                min={1}
                                                formatter={value => `${value}mins`}
                                                parser={value => value.replace('mins', '')}
                                            />
                                        )
                                    }
                                    <span className="question">
                                        <Popover
                                            getPopupContainer={triggerNode => triggerNode.parentNode.parentNode.parentNode}
                                            content={cdContent}
                                            trigger="click"
                                        ><QuestionCircleOutlined />What does this mean?</Popover>
                                    </span>
                                </Form.Item>
                                <Form.Item label="What devices should trigger this rule?" >
                                    {
                                        getFieldDecorator('device_ids', {
                                            initialValue: rule && rule.config?.device_ids
                                        })(
                                            <Checkbox.Group style={{ width: '100%' }}>
                                                <Row>
                                                    {devices?.map(device=><Col xs={24} sm={12} key={device.device_id}>
                                                        <Checkbox value={device.device_id}>{device.device_name}</Checkbox>
                                                    </Col>)}
                                                </Row>
                                            </Checkbox.Group>
                                        )
                                    }
                                </Form.Item>
                                <Form.Item label="What spaces should trigger this rule?" >
                                    {
                                        getFieldDecorator('space_ids', {
                                            initialValue: rule && rule.config?.space_ids
                                        })(
                                            <Checkbox.Group style={{ width: '100%' }}>
                                                <Row>
                                                    {spaces?.map(space=><Col xs={24} sm={12} key={space.space_id}>
                                                        <Checkbox value={space.space_id}>{space.name}</Checkbox>
                                                    </Col>)}
                                                </Row>
                                            </Checkbox.Group>
                                        )
                                    }
                                </Form.Item>
                                <Form.Item label="Who should we notify?" >
                                    {
                                        getFieldDecorator('send_to_user_ids', {
                                            initialValue: rule && rule.config?.notification?.send_to_user_ids
                                        })(
                                            <Checkbox.Group style={{ width: '100%' }}>
                                                <Row>
                                                    {carers?.map(carer=><Col xs={24} sm={12} key={carer.user_id}>
                                                        <Checkbox value={carer.user_id}>{carer.first_name+ ' '+carer.last_name}</Checkbox>
                                                    </Col>)}
                                                </Row>
                                            </Checkbox.Group>
                                        )
                                    }
                                </Form.Item>
                                <Form.Item label="How should we notify?" >
                                    {
                                        getFieldDecorator('notification_method', {
                                            initialValue: rule ? [rule.config?.notification.send_email && 'email', rule.config?.notification.send_sms && 'sms'] : ['email', 'sms']
                                        })(
                                            <Checkbox.Group style={{ width: '100%' }}>
                                                <Row>
                                                    <Col span={12}>
                                                        <Checkbox value='email'>via Email</Checkbox>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Checkbox value='sms'>via SMS</Checkbox>
                                                    </Col>
                                                </Row>
                                            </Checkbox.Group>
                                        )
                                    }
                                </Form.Item>

                                {rule && <Form.Item label="Rule enabled?">
                                    {
                                        getFieldDecorator('active', {
                                            valuePropName: 'checked',
                                            initialValue: rule?.active
                                        })(
                                            <Switch
                                                size="default"
                                                checkedChildren="Enabled"
                                                unCheckedChildren="Disabled"
                                            />
                                        )
                                    }
                                    <span className="question">
                                        <Popover
                                            getPopupContainer={triggerNode => triggerNode.parentNode.parentNode.parentNode}
                                            content={activeContent}
                                            trigger="click"
                                        ><QuestionCircleOutlined />What does this mean?</Popover>
                                    </span>
                                </Form.Item>
                                }
                            </Form>
                        </Spin>
                    </Modal>
                </Fragment>
            )
        }
    }

    return Form.create({ name: params.name })(DefinitionForm)
}

withDefinitionModal.propTypes={
    selectedHub: PropTypes.object,
    devices: PropTypes.array,
    spaces: PropTypes.array,
    carers: PropTypes.array,
    rule: PropTypes.object
}

export default withDefinitionModal

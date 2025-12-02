import { Component } from 'react'
import { actions } from 'mirrorx'
import { Form } from '@ant-design/compatible'
import { Input, InputNumber, message, Modal } from 'antd'
import PropTypes from 'prop-types'
import { globalConstants } from '@/_constants'

class UpdateSmartReminderModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    handleSaveUser = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let payload = {
                    ...this.props.reminder,
                    ...values,
                    beacon_pub_id: this.props.beacon_pub_id,
                }
                payload.delay_in_second = values.delay_in_second * 60
                actions.sofiBeacon.updateBeaconAlert(payload).then(() => {
                    this.props.onClose()
                    message.success('Smart reminder updated successfully')
                }, (error) => {
                    message.error(error.message)
                })
            }
        })
    }

    render() {
        const { form, open,onClose, reminder, type } = this.props
        const { getFieldDecorator } = form
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
        }

        return (<div>
            <Modal
                destroyOnClose
                title={type==='charge' ? 'Customise your Beacon low battery smart reminder':
                    'Customise the reminder to take your Beacon with you'}
                open={open}
                okText='Save'
                onOk={this.handleSaveUser}
                onCancel={onClose}
                width='700px'
            >
                <Form onSubmit={this.handleSaveUser} layout='vertical'>
                    <Form.Item
                        {...formItemLayout}
                        label={`At what battery percentage (or ${type==='charge' ? 'lower' : 'higher'}) should the 
                        reminder start to play? (Sofihub recommends ${type==='charge' ? '30' : '80'}%)` }
                    >
                        {getFieldDecorator('battery_threshold', {
                            rules: [{ required: true, message: 'Please enter the threshold!' }],
                            initialValue: reminder && reminder.battery_threshold
                        })(
                            <InputNumber
                                min={0}
                                max={99}
                                formatter={value => `${value}%`}
                                parser={value => value.replace('%', '')}/>
                        )}
                    </Form.Item>

                    <Form.Item
                        label={`What should the ${globalConstants.HUB_SOFIHUB} say when it reminds you to ${type==='charge' ? 
                            `place your ${globalConstants.BEACON_SOFIHUB} on charge?` : `take your ${globalConstants.BEACON_SOFIHUB}?`}`}
                    >
                        {getFieldDecorator('message', {
                            rules: [{ required: true, message: 'Please enter the message!', whitespace: true }],
                            initialValue: reminder?.message
                        })(
                            <Input.TextArea />
                        )}
                    </Form.Item>

                    <Form.Item
                        label={`How often should it repeat the reminder if the ${globalConstants.BEACON_SOFIHUB} ${type==='charge' ?
                            'is not placed on charge?' : 'has not been taken out of its charging cradle?'}`}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('delay_in_second', {
                            initialValue: parseInt(reminder && reminder.delay_in_second)/60
                        })(
                            <InputNumber
                                style={{width: 120}}
                                min={1}
                                step={15}
                                max={1440}
                                formatter={value => `${value}mins`}
                                parser={value => value.replace('mins', '')}/>
                        )}
                    </Form.Item>

                </Form>

            </Modal>
        </div>)
    }
}

const UpdateSmartReminderPage = Form.create({})(UpdateSmartReminderModal)

UpdateSmartReminderPage.propTypes = {
    beacon_pub_id: PropTypes.string,
    type: PropTypes.string,
    open: PropTypes.bool.isRequired,
    reminder: PropTypes.object,
    onClose: PropTypes.func.isRequired
}

export default UpdateSmartReminderPage

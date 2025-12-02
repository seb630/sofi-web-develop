import { Component } from 'react'
import { Form } from '@ant-design/compatible'
import { Col, Input, Modal, Row, Spin, TimePicker } from 'antd'
import PropTypes from 'prop-types'
import { globalConstants } from '@/_constants'

const { TextArea } = Input

class RemindToChargeBeaconModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isSubmitting: false
        }
    }

    /** handle Save */
    handleSave = () => {
        const { onNext, onCancel, form } = this.props
        form.validateFieldsAndScroll(async (err,values) => {
            if(!err) {
                this.setState({ isSubmitting: true })
                form.resetFields()
                onNext(values.messages, values.onWeekDays, values.onWeekendDays)
                onCancel()
            }
            this.setState({ isSubmitting: false })
        })
    }

    /** handle Close */
    handleClose = () => {
        const { onCancel, form } = this.props
        form.resetFields()
        onCancel()
    }

    render() {
        const { open, width ,form, context } = this.props
        const { getFieldDecorator } = form
        const { isSubmitting } = this.state

        return (
            <Modal className="createReminderModal test-modal-remindChargeReminder"
                onCancel={this.handleClose}
                open={open} width={width} okText="Save" onOk={this.handleSave}
            >
                <Spin spinning={isSubmitting}>

                    <label>Reminder to charge {globalConstants.BEACON_SOFIHUB} </label>
                    <p> This reminder repeats daily.We suggest the message says the following, pleas feel free to customise it:</p>
                    {
                        getFieldDecorator('messages',{
                            rules: [{ required: true , message: 'Please enter message.'}],
                            initialValue: context.message
                        })(
                            <TextArea id="input-messages" rows={4} />
                        )
                    }

                    <p> We suggest the message plays:</p>
                    <Row type="flex" justify="space-between">
                        <Col>
                            <div> On weekdays at: </div>
                            {
                                getFieldDecorator('onWeekDays',{
                                    initialValue: context.weekday
                                }) (
                                    <TimePicker id="input-weekdaystime" format={'HH:mm'} />
                                )
                            }
                        </Col>
                        <Col>
                            <div>On weekends at: </div>
                            {
                                getFieldDecorator('onWeekendDays',{
                                    initialValue: context.weekend
                                }) (
                                    <TimePicker id="input-weekenddaystime" format={'HH:mm'} />
                                )
                            }
                        </Col>
                    </Row>
                </Spin>
            </Modal>)
    }
}

RemindToChargeBeaconModal.defaultProps = {
    width: 460
}

RemindToChargeBeaconModal.propTypes = {
    open: PropTypes.bool,
    context: PropTypes.any,
    onNext: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
}
export default Form.create({ name:'frmRemindChargeBeacon' })(RemindToChargeBeaconModal)

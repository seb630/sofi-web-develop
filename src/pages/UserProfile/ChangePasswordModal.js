import { Component } from 'react'
import { actions } from 'mirrorx'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { Form } from '@ant-design/compatible'
import { Input, message, Modal, Tooltip } from 'antd'
import { globalConstants } from '@/_constants'

const FormItem = Form.Item

class ChangePassword extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form
        if (value && value !== form.getFieldValue('new_password')) {
            callback('Two passwords that you enter is inconsistent!')
        } else {
            callback()
        }
    }

    handleChangePassword = (e) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let userId = this.props.userId
                let payload = {
                    current_password: values.current_password,
                    new_password: values.new_password
                }
                actions.user.updatePassword({ userId, payload }).then(() => {
                    message.success('password updated successfully')
                    this.props.form.resetFields()
                    this.props.onClose()
                }, (error) => {
                    const errorMessage = error.response.status === 401 ?
                        'Current password is invalid.' : error.response.data.message
                    message.error(errorMessage)
                })
            }
        })
    }


    render() {
        const { open, onClose, form } = this.props
        const { getFieldDecorator } = form
        return (
            <Modal
                title="Change Password"
                open={open}
                onOk={this.handleChangePassword}
                okText="Submit"
                onCancel={onClose}

            >
                <Form layout="vertical">
                    <FormItem
                        label="Current password"
                    >
                        {getFieldDecorator('current_password', {
                            rules: [{
                                required: true, message: 'Please input your current password!',
                            }],
                        })(
                            <Input type="password"/>
                        )}
                    </FormItem>
                    <FormItem
                        label={(
                            <span>New password&nbsp;
                                <Tooltip title="Minimum 6 characters,
                                Contains at least one Lowercase Letter and Number">
                                    <QuestionCircleOutlined />
                                </Tooltip>
                            </span>
                        )}
                    >
                        {getFieldDecorator('new_password', {
                            rules: [{
                                required: true, message: 'Please input your new password!',
                            }, {
                                pattern: globalConstants.PASSWORD_REGEX,
                                message: globalConstants.PASSWORD_TOOLTIP
                            }],
                        })(
                            <Input type="password" />
                        )}
                    </FormItem>
                    <FormItem
                        label="Confirm Password"
                    >
                        {getFieldDecorator('confirm_password', {
                            rules: [{
                                required: true, message: 'Please confirm your password!',
                            }, {
                                validator: this.compareToFirstPassword,
                            }],
                        })(
                            <Input type="password" />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}


export default Form.create() (ChangePassword)

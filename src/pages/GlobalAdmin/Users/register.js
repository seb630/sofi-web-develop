import { Component } from 'react'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { Form } from '@ant-design/compatible'
import { Input, Tooltip, Modal, message } from 'antd'
import { actions } from 'mirrorx'
import { globalConstants } from '@/_constants'
import UserService from '../../../services/User'
import PhoneInput from 'react-phone-number-input'

const FormItem = Form.Item

class RegistrationForm extends Component {
    state = {
        defaultCountry: null,
    }

    componentDidMount() {
        this.getCountry()
    }

    getCountry = () => {
        UserService.getCountry().then(result=> {
            if (result.data && result.data.charAt(0)==='1'){
                this.setState({defaultCountry: result.data.slice(2,4)})
            }
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                const userInfo = {
                    username: values.email,
                    email: values.email,
                    password: values.password,
                    password_confirmation: values.confirm,
                    first_name: values.firstName,
                    last_name: values.lastName,
                    mobile: values.mobile,
                    onboarded: false
                }
                actions.user.createUser(userInfo).then(() => {
                    message.success('User Created')
                    this.props.form.resetFields()
                    this.props.onCancel()
                }, (error) => {
                    message.error(globalConstants.WENT_WRONG + '(' + error.response.data.message+')')
                })
            }
        })
    }

    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form
        if (value && value !== form.getFieldValue('password')) {
            callback('Two passwords that you enter is inconsistent!')
        } else {
            callback()
        }
    }

    render() {
        const { open, onCancel, form } = this.props
        const { getFieldDecorator } = form

        return (
            <Modal
                okText="Create"
                open={open} onCancel={onCancel}
                onOk={this.handleSubmit}
                centered={false} title="Create User"  style={{height: '500px'}}
            >
                <Form layout="vertical">
                    <FormItem
                        label="E-mail"
                    >
                        {getFieldDecorator('email', {
                            rules: [{
                                type: 'email', message: 'The input is not valid E-mail!',
                            }, {
                                required: true, message: 'Please input your E-mail!',
                            }],
                        })(
                            <Input autoComplete="off"   data-lpignore="true"/>
                        )}
                    </FormItem>
                    <FormItem
                        label={(
                            <span>Password&nbsp;
                                <Tooltip title="Minimum 6 characters,
                                Contains at least one Lowercase Letter and Number">
                                    <QuestionCircleOutlined />
                                </Tooltip>
                            </span>
                        )}
                    >
                        {getFieldDecorator('password', {
                            rules: [{
                                required: true, message: 'Please input your password!',
                            }, {
                                pattern: RegExp('(?=^.{6,128}$)(?=.*\\d)(?=.*[a-z])(?!.*\\s).*$'),
                                message: 'Minimum 6 characters, Contains at least one Lowercase Letter and Number'
                            }],
                        })(
                            <Input.Password autoComplete="off" data-lpignore="true"/>
                        )}
                    </FormItem>
                    <FormItem
                        label="Confirm Password"
                    >
                        {getFieldDecorator('confirm', {
                            rules: [{
                                required: true, message: 'Please confirm your password!',
                            }, {
                                validator: this.compareToFirstPassword,
                            }],
                        })(
                            <Input.Password autoComplete="off" data-lpignore="true"/>
                        )}
                    </FormItem>
                    <FormItem
                        label="First name"
                    >
                        {getFieldDecorator('firstName', {
                            rules: [{ required: true, message: 'Please input your first name!', whitespace: true }],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        label="Last name"
                    >
                        {getFieldDecorator('lastName', {
                            rules: [{ required: true, message: 'Please input your last name!', whitespace: true }],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        label="Mobile"
                    >
                        {getFieldDecorator('mobile', {
                            rules: [
                                { min: 8, message: 'Mobile number has a minimum length of 8' }],
                        })(
                            <PhoneInput
                                flagsPath='https://flagicons.lipis.dev/flags/4x3/' country={this.state.defaultCountry}  inputClassName="ant-input"/>
                        )}
                    </FormItem>

                </Form>
            </Modal>
        )
    }
}

export default Form.create()(RegistrationForm)

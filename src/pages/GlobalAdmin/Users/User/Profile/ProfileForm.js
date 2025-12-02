import { Component } from 'react'
import { actions } from 'mirrorx'
import { Form } from '@ant-design/compatible'
import { Input, Button, message, Row, Col, Switch } from 'antd'
import './index.scss'
import { globalConstants } from '@/_constants'
import PropTypes from 'prop-types'
import warnAboutUnsavedForm from '../../../../../components/WarnUnsavedForm'

const FormItem = Form.Item

class ProfileForm extends Component {
    componentDidMount() {
        this.setBaseInfo()
    }

    setBaseInfo = () => {
        const { currentUser, form } = this.props
        Object.keys(form.getFieldsValue()).forEach(key => {
            const obj = {}
            obj[key] = currentUser[key] || null
            form.setFieldsValue(obj)
        })
    }

    updateInfo = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                const userId = this.props.currentUser.user_id
                const payload = {
                    ...this.props.currentUser,
                    email_verified: values.email_verified,
                    email: values.email,
                    username: values.email,
                    first_name: values.first_name,
                    last_name: values.last_name,
                    mobile: values.mobile,
                    phone_verified: values.phone_verified,

                }
                actions.user.updateUser({ userId, payload }).then(() => {
                    message.success('user profile updated successfully')
                    this.props.onSave()
                }, (error) => {
                    message.error(globalConstants.WENT_WRONG + '(' + error.response.data.message+')')
                })
            }
        })
    }


    render() {
        const {
            onFormChange,
            currentUser,
            form: { getFieldDecorator },
        } = this.props

        const emailVerified = getFieldDecorator('email_verified', { valuePropName: 'checked'})(
            <Switch checkedChildren="Verified" unCheckedChildren="Not verified">
            </Switch>,
        )

        const phoneVerified = getFieldDecorator('phone_verified', { valuePropName: 'checked'})(
            <Switch checkedChildren="Verified" unCheckedChildren="Not verified">
            </Switch>,
        )

        return (<div className="contentPage">
            <Row type="flex">
                <Col xs={24} lg={12}>
                    <Form layout="vertical" hideRequiredMark colon={true}>
                        <FormItem
                            label="E-mail & Username"
                        >
                            {getFieldDecorator('email', {
                                rules: [{
                                    type: 'email', message: 'The input is not valid E-mail!',
                                }, {
                                    required: true, message: 'Please input your E-mail!',
                                }],
                            })(
                                <Input onChange={onFormChange} addonAfter={emailVerified} autoComplete="off" data-lpignore="true"/>
                            )}
                        </FormItem>

                        <FormItem
                            label="First name"
                        >
                            {getFieldDecorator('first_name', {
                                rules: [{
                                    required: true, message: 'Please input your first name!',
                                }],
                            })(
                                <Input onChange={onFormChange}/>
                            )}
                        </FormItem>

                        <FormItem
                            label="Last name"
                        >
                            {getFieldDecorator('last_name', {
                                rules: [{
                                    required: true, message: 'Please input your last name!',
                                }],
                            })(
                                <Input onChange={onFormChange}/>
                            )}
                        </FormItem>

                        <FormItem
                            label="Mobile"
                        >
                            {getFieldDecorator('mobile')(
                                <Input addonAfter={phoneVerified} onChange={onFormChange}/>
                            )}
                        </FormItem>

                        <FormItem
                            label="MFA"
                        >
                            <span>{currentUser?.mfa_enabled ? currentUser?.mfa_code_verified ? 'Enabled and is set up by the user' : 'Enabled and is not set up by the user': 'Disabled'}. To edit go to options tab.</span>
                        </FormItem>

                        <Button type="primary" onClick={this.updateInfo}>
                            Update Information
                        </Button>
                    </Form>
                </Col>
            </Row>
        </div>)
    }
}

ProfileForm.propTypes={
    currentUser: PropTypes.object.isRequired,
    onFormChange: PropTypes.func,
    onSave:PropTypes.func,
}
export default warnAboutUnsavedForm(Form.create({})(ProfileForm))

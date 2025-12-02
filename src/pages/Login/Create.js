import { createRef, Component, Fragment } from 'react'
import propTypes from 'prop-types'
import Logo from '../../images/logo.svg'
import { globalConstants } from '@/_constants'
import { QuestionCircleOutlined } from '@ant-design/icons'
import {
    Input,
    Button,
    Progress,
    Divider,
    Tooltip,
    Row,
    Col,
    message,
    Checkbox,
    Form,
    notification,
    Typography
} from 'antd'
import ReCAPTCHA from 'react-google-recaptcha'
import PhoneInput from 'react-phone-number-input'
import {actions} from 'mirrorx'
import UserService from '../../services/User'
import TCPage from '../../components/TCPage'
import PrivacyPage from '@/components/TCPage/PrivacyPage'

const FormItem = Form.Item

class UserRegPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            submit: false,
            isSubmitting: false,
            defaultCountry: null,
            tcPage: true,
            tcAgreed: false,
            tcOpen: false,
            privacyOpen: false,
            email: null,
        }
        this.recaptchaRef = createRef()
        this.formRef = createRef()
    }

    onChange = e => {
        this.setState({
            tcAgreed: e.target.checked,
        })
    }

    handleAgreeTC = () => {
        this.setState({
            tcPage: false,
            tcAgreed: false,
        })
    }

    renderTCpage = () => {
        const {tcAgreed, tcOpen, privacyOpen} = this.state
        return (<Fragment>
            <div className="margin-bottom">
                <h3>In order to use our system and before you can create an account, you must agree to both our Privacy Policy, and our Terms and Conditions.</h3>
                {/* <Typography.Paragraph>
                    In order to use our system and before you can create an account, you must agree to both our <a onClick={()=>this.setState({privacyOpen: true})}>Privacy Policy here</a>, and our  <a onClick={()=>this.setState({tcOpen: true})}>Terms and Conditions.</a>.
                </Typography.Paragraph> */}
                <Typography.Paragraph>
                    You can read our <a onClick={()=>this.setState({privacyOpen: true})}>Privacy Policy here</a>, and you can read our <a onClick={()=>this.setState({tcOpen: true})}>Terms and Conditions</a> here.
                </Typography.Paragraph>
                <Checkbox onChange={this.onChange}>I have read and agree to both the Privacy Policy and the Terms and Conditions.</Checkbox>

                <TCPage open={tcOpen} onCancel={()=>this.setState({tcOpen: false})}/>
                <PrivacyPage open={privacyOpen} onCancel={()=>this.setState({privacyOpen: false})} />
            </div>
            <div className="d-flex justify-content-between">
                <Button onClick={this.props.onBack}>Cancel</Button>
                <Button
                    disabled={!tcAgreed}
                    type="primary"
                    onClick={this.handleAgreeTC}
                >Agree, and Continue</Button>
            </div>
        </Fragment>)
    }

    getCountry = () => {
        UserService.getCountry().then(result=> {
            if (result && result.data && result.data.charAt(0)==='1'){
                this.setState({defaultCountry: result.data.slice(2,4)})
            }
        })
    }

    /** component did mount */
    componentDidMount() {
        this.getCountry()
    }

    captchaSuccess = (captcha) => {
        const values = this.formRef.current.getFieldsValue()
        const userInfo = {
            username: values.email,
            email: values.email,
            password: values.password,
            password_confirmation: values.confirm,
            first_name: values.firstName,
            last_name: values.lastName,
            mobile: values.mobile,
            onboarded: false,
            captcha: captcha
        }
        this.setState({isSubmitting: true, email: values.email})
        actions.user.registration(userInfo).then(() => {
            this.formRef.current.resetFields()
            this.setState({submit: true, isSubmitting: false})
        }, (error) => {
            this.recaptchaRef.current.reset()
            this.setState({isSubmitting: false})
            message.error(error.message, 10)
        })
    }

    /** handle submit */
    handleSubmit = () => {
        this.formRef.current.validateFields().then(()=>this.recaptchaRef.current.execute())
    }

    handleResend = () => {
        this.setState({
            isSubmitting: true,
        })
        const payload = {
            email: this.state.email
        }
        actions.user.resendVerifyEmail(payload).then(() => {
            message.success('Email Resent!')
        }).catch(() => {
            notification.error({
                message: 'Your account is not enabled',
                description: 'Please contact support@sofihub.com to remedy the issue.',
                duration: 10
            })
        }).finally(() => this.setState({
            isSubmitting: false,
        }))
    }

    renderSubmit = () => {
        return <Fragment>
            <div align="center" className='margin-bottom'>
                <Progress type="circle" percent={100}  strokeColor='#44AF86'/>
                <p className='success'>Account created!</p>
            </div>
            <div className='margin-bottom'>
                <p style={{fontWeight:700}}>Please click the verification link we have emailed to you.</p>
                <div>Didn&#39;t receive a verification email?</div>
                <br />
                <div>Click <a onClick={this.handleResend}>here</a> to resend</div>
            </div>
            <Button
                className="button button-submit" type='primary' size="large"
                onClick={this.props.onBack}>Log in</Button>
        </Fragment>
    }

    renderForm = () => {
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        }

        return (
            <Form onFinish={this.handleSubmit} ref={this.formRef} scrollToFirstError>
                <div>
                    <p style={{fontWeight:700}}>Create an account</p>
                    <div>Tell us a bit about yourself...</div>
                </div>
                <FormItem
                    {...formItemLayout}
                    label="First name"
                    name="firstName"
                    rules= {[{ required: true, message: 'Please input your first name!', whitespace: true }]}
                >

                    <Input ref={input => { this.firstName = input }}/>
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="Last name"
                    name="lastName"
                    rules={ [{ required: true, message: 'Please input your last name!', whitespace: true }]}
                >
                    <Input />
                </FormItem>
                <FormItem
                    label="Email"
                    name="email"
                    rules={[{type: 'email', message: 'The input is not valid Email!',}, {required: true, message: 'Please input your Email!',}]}
                    {...formItemLayout}
                >
                    <Input autoComplete="off" data-lpignore={true} />
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="Mobile"
                    name="mobile"
                    rules={[{ min: 8, message: 'Mobile number has a minimum length of 8' }]}
                >
                    <PhoneInput flagsPath='https://flagicons.lipis.dev/flags/4x3/' country={this.state.defaultCountry} inputClassName="ant-input"/>
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={(
                        <span>Password&nbsp;
                            <Tooltip title={globalConstants.PASSWORD_TOOLTIP}>
                                <QuestionCircleOutlined data-lpignore="true" />
                            </Tooltip>
                        </span>
                    )}
                    name="password"
                    hasFeedback
                    rules={[{
                        required: true, message: 'Please input your password!',
                    }, {
                        pattern: globalConstants.PASSWORD_REGEX,
                        message: globalConstants.PASSWORD_TOOLTIP
                    }]}
                >
                    <Input.Password autoComplete="off" data-lpignore={true} />
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="Confirm Password"
                    name="confirm"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        {
                            required: true,
                            message: 'Please confirm your password!',
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve()
                                }
                                return Promise.reject(new Error('Passwords do not match.'))
                            },
                        }),
                    ]}
                >
                    <Input.Password autoComplete="off" data-lpignore="true"/>
                </FormItem>

                <ReCAPTCHA
                    ref={this.recaptchaRef}
                    size='invisible'
                    badge='inline'
                    sitekey={globalConstants.RECAPTCHA_KEY}
                    onChange={this.captchaSuccess}
                />
                <Divider style={{margin: '16px 0'}}/>
                <Row gutter={24}>
                    <Col xs={8} md={12}>
                        <Button className="button button-submit" size="large" onClick={this.props.onBack}>Back</Button>
                    </Col>
                    <Col xs={16} md={12}>
                        <Button
                            htmlType="submit"
                            className="button button-submit"
                            type='primary' size="large"
                            loading={this.state.isSubmitting}
                        >Create Account</Button>
                    </Col>
                </Row>
            </Form>
        )
    }

    render() {
        const {submit, tcPage} = this.state
        return(
            <div className="loginPage-form" >
                <div className="loginPage-form__logo">
                    <Logo width={230} height={120}/>
                </div>
                {tcPage ? this.renderTCpage() :
                    submit ? this.renderSubmit() : this.renderForm() }
            </div>
        )
    }
}


UserRegPage.propTypes = {
    onBack:propTypes.func.isRequired
}

export default UserRegPage

import { Component, Fragment } from 'react'
import propTypes from 'prop-types'
import { actions } from 'mirrorx'
import { axiosLoginCall } from '@/utility/AxiosCalls'
import { clearStorage } from '@/utility/Storage'
import { globalConstants } from '@/_constants'
import 'url-search-params-polyfill'
import { Input, Button, Checkbox, Spin, message, Divider, Row, Col, Modal, notification, Form } from 'antd'
import './LoginPage.scss'
import VerifyModal from './VerifyModal'
import {isMobile} from 'react-device-detect'
import {DownTimeBanner} from '../Common/Banner'
import DownTime from '../../_constants/downtime'
import moment from 'moment'
import Logo from '../../images/logo.svg'
import MFAPage from '@/pages/Login/MFA'

class LoginPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            isSubmitting: false,
            submitEmail: '',
            verifyModal: false,
            mfa: false
        }
    }

    /** component did mount */
    componentDidMount() {
        this.email.focus()
    }

    resend = () => {
        this.setState({
            isSubmitting: true,
        })
        const payload = {
            email: this.state.submitEmail
        }
        actions.user.resendVerifyEmail(payload).then(() => {
            this.setState({verifyModal: false})
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

    /** handle submit */
    handleSubmit = async(values) => {

        const {email, password, rememberme} = values
        // Authentication URL
        const authUrl = globalConstants.API_LOGIN_URL

        try {
            this.setState({isSubmitting: true, submitEmail: email})
            const response = await axiosLoginCall(authUrl, email, password, rememberme)
            if (!response) {
                message.error(globalConstants.WENT_WRONG, 3)
            } else if (response.status === 200) {
                actions.user.me().then(() => this.setState({mfa: true}))
                // this.props.sourcePage && actions.routing.push(this.props.sourcePage)
            } else if (response.status === 400) {
                // setting error message for wrong credentials
                message.error(globalConstants.INCORRECT_CREDENTIAL, 3)
            } else {
                // setting error message for API failure
                message.error(globalConstants.WENT_WRONG, 3)
            }

        } catch (error) {
            //Setting error message for API failure
            if (error) {
                if (error.data?.error_description === 'Bad credentials') {
                    message.error(globalConstants.INCORRECT_CREDENTIAL, 3)
                } else if (error.data?.error_description.includes('User is disabled') ||
                    error.data?.error_description.includes('not verified')) {
                    this.setState({verifyModal: true})
                } else if (error.data?.error_description === 'Your new mail has not been verified yet.') {
                    Modal.error({
                        title: error.data.error_description,
                        width: 500,
                        content: (
                            <div>
                                <p>Hey there! We can&#39;t let you login with that email yet as you have not
                                    verified. Check your email inbox for the verification email. You can still
                                    login with your old email and cancel this email change request.</p>
                            </div>
                        )
                    })
                } else {
                    message.error(error.data.error_description, 3)
                }
            }
            clearStorage()
        } finally {
            this.setState({isSubmitting: false})
        }
    }


    render() {
        const latestDownTime = DownTime[DownTime.length-1]
        const renderAlert = isMobile && moment(latestDownTime.notificationDateTimeStart).isBefore(moment()) &&
            moment(latestDownTime.notificationDateTimeEnd).isAfter(moment())
        return(
            <Fragment>
                <DownTimeBanner login />

                <div className="loginPage-form" style={{top: renderAlert ? '60%': '50%'}}>
                    <div className="loginPage-form__logo">
                        <Logo width={230} height={120}/>
                    </div>
                    {this.state.mfa ? <MFAPage
                        {...this.props}
                        onCancel = {()=>this.setState({mfa: false})}
                    /> : <Spin spinning={this.state.isSubmitting} delay={200}>
                        <Form onFinish={this.handleSubmit} name="login_form">
                            <Form.Item name="email" rules={[{ required: true, message: globalConstants.ENTER_EMAIL },
                                {
                                    type: 'email', message: 'The input is not valid Email!',
                                }]}>
                                <Input name="email"  size="large" maxLength={globalConstants.INPUT_MAX_LENGTH} ref={input => { this.email = input }} type="email" placeholder="Email Address"/>
                            </Form.Item>
                            <Form.Item name="password" rules={[{ required: true, message: globalConstants.ENTER_PASSWORD }]}>
                                <Input name="password" size="large" maxLength={globalConstants.INPUT_MAX_LENGTH}
                                    type="password" placeholder="Password"/>
                            </Form.Item>
                            <Form.Item name="rememberme" valuePropName="checked" initialValue={false} >
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                            <Row gutter={24}>
                                {isMobile ? <Fragment>
                                    <Col xs={24} xl={12}>
                                        <Button style={{marginBottom: '12px'}} htmlType="submit" className="button button-submit" type='primary' size="large" >Log in</Button>
                                    </Col>
                                    <Col xs={24} xl={12} style={{marginBottom: 12}}>
                                        <Button className="button button-forgot" type='default' size="large" onClick={this.props.onForgot}>Forgot Password</Button>
                                    </Col>
                                </Fragment>
                                    :
                                    <Fragment>
                                        <Col xs={24} md={12} lg={24} xl={12} style={{marginBottom: 12}}>
                                            <Button className="button button-forgot" type='default' size="large" onClick={this.props.onForgot}>Forgot Password</Button>
                                        </Col>
                                        <Col xs={24} md={12} lg={24} xl={12}>
                                            <Button htmlType="submit" className="button button-submit" type='primary' size="large" >Log in</Button>
                                        </Col>
                                    </Fragment>
                                }
                            </Row>
                            <Divider>Don&#39;t have an account yet?</Divider>
                            <Button className="button button-create" size="large" onClick={this.props.onCreate}>Create Account</Button>
                        </Form>
                    </Spin>}
                    <VerifyModal
                        onClose={() => this.setState({verifyModal: false})}
                        onResend={this.resend}
                        open={this.state.verifyModal}
                        isSubmitting={this.state.isSubmitting}
                    />
                </div>
            </Fragment>
        )
    }
}

LoginPage.propTypes = {
    sourcePage: propTypes.string,
    onForgot:propTypes.func.isRequired,
    onCreate: propTypes.func.isRequired,
    beacons: propTypes.array,
    hubs: propTypes.array,
    me: propTypes.object
}

export default LoginPage

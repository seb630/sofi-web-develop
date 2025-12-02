import { createRef, Component, Fragment } from 'react'
import propTypes from 'prop-types'
import { globalConstants } from '@/_constants'
import { Input, Button, Progress, Divider, message, Row, Col, Form } from 'antd'
import ReCAPTCHA from 'react-google-recaptcha'
import {actions} from 'mirrorx'
import Logo from '../../images/logo.svg'

class ForgotPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            submit: false,
            isSubmitting: false
        }
        this.recaptchaRef = createRef()
        this.formRef = createRef()
    }

    /** component did mount */
    componentDidMount() {
        this.email.focus()
    }

    captchaSuccess = (captcha) => {
        const values = this.formRef.current.getFieldsValue()
        const payload = {
            email: values.email,
            captcha: captcha
        }
        this.setState({isSubmitting: true})
        actions.user.forgot(payload).then(() => {
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
        this.recaptchaRef.current.execute()
    }

    renderSubmit = () => {
        return <Fragment>
            <div align="center" className='margin-bottom'>
                <Progress type="circle" percent={100} strokeColor='#44AF86'/>
                <p className='success'>Done.</p>
            </div>
            <div className='margin-bottom'>
                <div>If that email address has an account we will send out a password reset email with further instructions.</div>
            </div>
            <Button
                className="button button-submit" type='primary' size="large"
                onClick={this.props.onBack}>Log in</Button>
        </Fragment>
    }

    renderForm = () => {

        return <Form onFinish={this.handleSubmit} ref={this.formRef}>
            <div>
                <div>Please enter your email address to receive a password reset link.</div>
            </div>
            <Form.Item name="email" rules={[{ required: true, message: globalConstants.ENTER_EMAIL },
                {
                    type: 'email', message: 'The input is not valid Email!',
                }]}>
                <Input name="email"  size="large" maxLength={globalConstants.INPUT_MAX_LENGTH} ref={input => { this.email = input }} type="email" placeholder="Email"/>
            </Form.Item>
            <ReCAPTCHA
                ref={this.recaptchaRef}
                size='invisible'
                badge='inline'
                sitekey={globalConstants.RECAPTCHA_KEY}
                onChange={this.captchaSuccess}
            />
            <Divider />
            <Row gutter={24}>
                <Col span={12}>
                    <Button className="button button-submit" size="large" onClick={this.props.onBack}>Back</Button>
                </Col>
                <Col span={12}>
                    <Button
                        htmlType="submit" className="button button-submit" type='primary' size="large"
                        loading={this.state.isSubmitting}>Next</Button>
                </Col>
            </Row>

        </Form>
    }

    render() {
        return(
            <div className="loginPage-form">
                <div className="loginPage-form__logo">
                    <Logo width={230} height={120}/>
                </div>
                {this.state.submit ? this.renderSubmit() : this.renderForm() }
            </div>
        )
    }
}

ForgotPage.propTypes = {
    onBack:propTypes.func.isRequired
}

export default ForgotPage

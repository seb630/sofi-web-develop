import { Component, Fragment } from 'react'
import 'url-search-params-polyfill'
import {Button, Divider, Input, Progress, Form, Alert} from 'antd'
import './LoginPage.scss'
import {actions} from 'mirrorx'
import {globalConstants} from '@/_constants'
import queryString from 'query-string'
import Logo from '../../images/logo.svg'

const FormItem = Form.Item

class ResetPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            submit: false,
            errorMessage: null,
        }
    }

    handleSubmit = (values) => {
        this.setState({errorMessage: null})
        const parsed = queryString.parse(this.props.location.search)
        const payload = {
            token: parsed.token,
            password: values.password
        }
        actions.user.resetPassword(payload).then(() => {
            this.setState({submit: true})
        }).catch((error) => {
            this.setState({errorMessage: error.message})
        })
    }

    renderSubmit = () => {
        return <Fragment>
            <div align="center" className='margin-bottom'>
                <Progress type="circle" percent={100} strokeColor='#44AF86'/>
                <p className='success'>Password Reset.</p>
            </div>
            <div className='margin-bottom'>
                <p style={{fontWeight:700}}>You&#39;re almost ready to go!</p>
                <div>Before we can take you to your dashboard, you&#39;ll need to login. Click the button below
                    to go to the login screen.</div>
            </div>
            <Button
                className="button button-submit" type='primary' size="large"
                onClick={()=>actions.routing.push('/login')}>Log in</Button>
        </Fragment>
    }

    renderForm = () => {
        return <Form onFinish={this.handleSubmit} scrollToFirstError>
            <div>
                <p style={{fontWeight:700}}>let&#39;s reset your password...</p>
                <div>Please type in a new password, and then type it in one more time.
                    When choosing a new password make sure it has:</div>
                <div>- an upper case letter</div>
                <div>- a lower case letter</div>
                <div>- a number</div>
                <div>- a symbol</div>
            </div>
            <FormItem
                name="password"
                hasFeedback
                rules={[{
                    required: true, message: 'Please input your password!',
                }, {
                    pattern: globalConstants.PASSWORD_REGEX,
                    message: globalConstants.PASSWORD_TOOLTIP
                }]}
            >
                <Input.Password placeholder="Password"/>
            </FormItem>
            <FormItem
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
                <Input.Password placeholder="Confirm"/>
            </FormItem>
            <Divider />
            {this.state.errorMessage?.includes('expire') && <><Alert
                type="error"
                message="Your password reset link has expired."
                description={<span>Please click <a onClick={()=>actions.routing.push('/forgot')}>here</a> to resend the password reset email.</span>}
            /><Divider /></>}
            {this.state.errorMessage?.includes('invalid') && <><Alert
                type="error"
                message="Your password reset link is invalid."
                description={<span>Please click <a onClick={()=>actions.routing.push('/forgot')}>here</a> to resend the password reset email.</span>}
            /><Divider /></>}
            <Button htmlType="submit" className="button button-submit" type='primary' size="large" >
                Reset Password</Button>
        </Form>
    }

    render() {
        return(
            <div id="loginPage" className="loginPage">
                <div className="loginPage-container">
                    <div className="loginPage-left-container">
                        <div className="loginPage-content">
                            <div className="loginPage-form">
                                <div className="loginPage-form__logo">
                                    <Logo width={230} height={120}/>
                                </div>
                                {this.state.submit ? this.renderSubmit() : this.renderForm() }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ResetPage

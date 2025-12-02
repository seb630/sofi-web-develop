import { Fragment, Component } from 'react'
import { Form } from '@ant-design/compatible'
import { Button, Modal, Input, Row, Col, Progress, Divider } from 'antd'
import { actions } from 'mirrorx'
import propTypes from 'prop-types'
import {globalConstants} from '@/_constants'
import style from '../../scss/colours.scss'

class mobileVerification extends Component {
    constructor(props) {
        super(props)
        this.state = {
            title: '',
            code: '',
            submit: false,
            codeSent: false,
            loading: {
                open: false,
                value: 0
            }
        }
        this.smsinterval = 0

    }

    componentWillUnmount() {
        if(this.smsinterval) {
            clearInterval(this.smsinterval)
        }
    }

    componentDidUpdate (prevProps) {
        if (prevProps.open !== this.props.open && this.props.open && this.props.userId && this.state.loading.value===0) {
            this.handleSendCode()
        }
    }

    waitForSmS = (duration) => {
        return new Promise((resolve) => {
            let count = duration/1000

            this.setState({
                loading: {
                    open: true,
                    value: count
                }
            })
            -- count
            this.smsinterval = setInterval(() => {
                if(count === 0) {
                    clearInterval(this.smsinterval)
                    this.setState({
                        loading: {
                            value: 0,
                            open: false
                        }
                    })
                    resolve()
                    return
                }

                this.setState({
                    loading: {
                        open: true,
                        value: count
                    }
                })
                --count
            },1000)
        })
    }

    renderSubmit = () => {
        return <Fragment >
            <div align="center" className='margin-bottom'>
                <Progress type="circle" percent={100} strokeColor='#44AF86'/>
                <h2>Number Verified!</h2>
            </div>
            <div align="center" className='margin-bottom'>
                <span style={{fontSize: '15px'}}>Now that your number is verified, you will receive SMS notifications.</span>
            </div>
            <div align="center" className='margin-bottom'>
                <Button
                    className="button button-submit" type='primary' onClick={this.props.onClose}>Close</Button>
            </div>
        </Fragment>
    }

    handleSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                try {
                    this.setState({codesent: true})
                    actions.user.verifyMobile({token: values.code, userId: this.props.userId})
                        .then(()=> this.setState({submit: true, codeSent: false}))
                        .catch(()=> {
                            this.setState({codeSent: false})
                            this.props.form.setFields({
                                code: {
                                    errors: [new Error(globalConstants.MOBILE_VERIFY_ERROR)]
                                }
                            })
                        }
                        )
                }catch (e) {
                    this.setState({error: globalConstants.MOBILE_VERIFY_ERROR})
                }

            }
        })
    }

    handleSendCode = () => {
        actions.user.resendVerifyMobile(this.props.userId).then(()=>{
            this.setState({
                title: <p style={{fontWeight:700}}>Hey there! We sent you a code to verify your phone number</p>
            })
        }).catch((error)=>{
            error.error === 'Bad Request' && this.setState({
                title: <p style={{fontWeight:700, color: style.red }}>{error.message}</p>
            })
        })
        this.waitForSmS(globalConstants.TIME_RESEND_SMS)
    }

    renderForm = () => {
        const { getFieldDecorator } = this.props.form

        return <Form onSubmit={this.handleSubmit}>
            <div>
                {this.state.title}
                <div>Please type in the code we sent to your mobile phone number:</div>
            </div>
            <Form.Item
                label="Code"
            >
                {
                    getFieldDecorator('code', {
                        rules: [{ required: true, message: 'Please input the code!' }],
                    })(
                        <Input placeholder="Code" />
                    )
                }
            </Form.Item>
            <div>Didn&#39;t get a code?</div>
            <div>We can resend the code, update your phone number if it&#39;s incorrect, or remove it for now.
                You don&#39;t need a mobile phone number to use Sofi products, but you need it for SMS notifications.</div>
            <Divider />
            <Row type="flex" justify="space-between">
                <Col xs={12} sm={5}>
                    <Button onClick={this.props.onChangeMobile}>Change Number</Button>
                </Col>
                <Col xs={12} sm={5}>
                    <Button type='primary' onClick={this.handleSendCode} disabled={this.state.loading.open}>
                        {this.state.loading.open ? `Resend: ${this.state.loading.value}s`: 'Resend Code'}
                    </Button>
                </Col>
                <Col xs={12} sm={5}>
                    <Button type='primary' onClick={this.handleSubmit} loading={this.state.codeSent}>Submit</Button>
                </Col>
            </Row>

        </Form>
    }

    render() {
        return (
            <Modal
                destroyOnClose
                open={this.props.open}
                onCancel={this.props.onClose}
                width='500px'
                footer={null}
            >
                {this.state.submit ? this.renderSubmit(): this.renderForm()}
            </Modal>)
    }
}

const mobileVerificationModal = Form.create({})(mobileVerification)

mobileVerificationModal.propTypes = {
    userId: propTypes.number,
    open: propTypes.bool,
    onClose: propTypes.func.isRequired,
    onChangeMobile: propTypes.func
}

export default mobileVerificationModal

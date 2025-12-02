import { Component, createRef, Fragment } from 'react'
import { Form } from '@ant-design/compatible'
import { Button, Col, Input, List, message, Modal, Row } from 'antd'
import { actions } from 'mirrorx'
import TCModal from '../../../../components/TCModal/InviteTCModal'
import { globalConstants } from '@/_constants'
import ReCAPTCHA from 'react-google-recaptcha'

class BeaconCarers extends Component {

    constructor(props) {
        super(props)
        this.state = {
            modal: false,
            tcModal: false,
            isSubmitting: false,
        }
        this.recaptchaRef = createRef()
    }

    handleTCModal = (state) => {
        this.setState({tcModal: state})
    }

    handleTCModalSubmit = () => {
        this.handleTCModal(false)
        this.recaptchaRef.current.execute()
    }

    handleClose = () => {
        this.setState({ modal: false })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err) => {
            if (!err) {
                this.handleTCModal(true)
            }
        })
    }

    captchaSuccess = (captcha) => {
        const payload = {
            captcha,
            beacon_id: this.props.selectedBeacon.id,
            email: this.props.form.getFieldValue('email'),
        }
        this.setState({isSubmitting: true})

        actions.user.inviteBeaconCarer(payload).then(() => {
            this.props.form.resetFields()
            this.recaptchaRef.current.reset()
            message.success('Invite Success')
            this.handleClose()
            actions.user.getInvitationByBeacon(this.props.selectedBeacon.pub_id)
        }, (error) => {
            this.recaptchaRef.current.reset()
            message.error(error.message, 10)
        }).finally(()=>{
            this.setState({isSubmitting: false})
        })
    }

    handleOpen = () => {
        this.setState({
            modal: true
        })
    }

    generateData = () => {
        const {carers, pending} = this.props
        let data = []
        carers.map(carer=> {
            data.push({
                id: carer.user_id,
                type: 'carer',
                email: carer.email,
                name: carer.first_name + ' '+ carer.last_name
            })
        })
        pending.map(carer=> {
            data.push({
                id: carer.id,
                type: 'invited',
                email: carer.email,
            })
        })
        return data
    }

    render() {
        const { form } = this.props
        const {getFieldDecorator} = form
        const listData = this.generateData()
        const showCarer = listData.length>1 || listData.some(item=>item.type==='invited')
        return (
            <Fragment>
                <div className="wizardContent">
                    <h4>Don&#39;t forget to invite account managers!</h4>
                    <p>Account managers are people who can see your {globalConstants.PENDANT_GENERIC} in the portal. They can also help you manage its
                        settings. Account managers can invite other account managers and remove existing ones. Make sure to only invite new account managers who you trust.</p>

                    <p>Please note that account managers only have portal access, they are not contacted in the event of a SOS
                        button press like an emergency contact. And emergency contacts do not have access to the portal. But you can always add an emergency contact as a account manager too!</p>

                    <p>{showCarer ? <span>Do you want to add another account manager?</span>: <span>You are currently the only account manager on this
                    system, add another? </span>}<Button type="primary" onClick={this.handleOpen} style={{marginLeft: '12px'}}>
                        Yes</Button></p>
                    {showCarer && <Fragment>
                        <h4>Who is currently a account manager?</h4>
                        <List
                            className="inviteList"
                            itemLayout="horizontal"
                            split={false}
                            dataSource={listData}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={item.type==='carer'?
                                            <span className="inviteStatus inviteStatus-carer">Account manager</span>:
                                            <span className="inviteStatus inviteStatus-invited">Invited</span>
                                        }
                                        title={item.type==='carer'&& item.name}
                                        description={item.email}
                                    />
                                </List.Item>
                            )}
                        />
                    </Fragment>}
                </div>

                <TCModal
                    handleModalstate={this.handleTCModal}
                    handleSubmit={this.handleTCModalSubmit}
                    modal={this.state.tcModal}  />
                <Modal
                    okText="Invite"
                    open={this.state.modal} onCancel={this.handleClose}
                    onOk={this.handleSubmit}
                    centered={false} title="Invite a new account manager"
                    okButtonProps={{loading: this.state.isSubmitting}}
                >
                    <div>
                        <Form onSubmit={this.handleSubmit}>
                            <p>In order to invite a new account manager you will need to provide their exact email address. If the
                                user is already registered they will be notified about your invitation, if they have not
                                registered yet, they will be invited to register. Please type in the new account manager&#39;s
                                email address:
                            </p>
                            <Form.Item>
                                {
                                    getFieldDecorator('email', {
                                        rules: [{
                                            type: 'email', message: 'The input is not valid Email!',
                                        }, { required: true, message: globalConstants.ENTER_EMAIL }],
                                    })(
                                        <Input
                                            autoComplete="off"
                                            data-lpignore="true"
                                            size="large" maxLength={globalConstants.INPUT_MAX_LENGTH}
                                            ref={input => { this.email = input }} type="email"
                                            placeholder="Email address"/>
                                    )
                                }
                            </Form.Item>
                            <br/>
                            <p>
                                After the invite is sent, it will expire after 7 days if no action is taken. You can
                                view pending invites at any time in the &quot;Invited Account Managers&quot; tab.
                            </p>
                            <ReCAPTCHA
                                ref={this.recaptchaRef}
                                size='invisible'
                                badge='inline'
                                sitekey={globalConstants.RECAPTCHA_KEY}
                                onChange={this.captchaSuccess}
                            />
                        </Form>
                    </div>
                </Modal>
            </Fragment>
        )
    }
}

const CarerPage = Form.create({})(BeaconCarers)

const carerStep = (selectedBeacon, carers, pending, next, prev) =>{
    const title = 'Account Managers'
    const content = <CarerPage
        selectedBeacon={selectedBeacon}
        carers={carers}
        pending={pending}
    />
    const action = <Row><Col span={24}><Button style={{ marginLeft: 8 }} onClick={prev}>
        Previous
    </Button>
    <Button
        type="primary"
        onClick={next}
        className="floatRight">Next</Button></Col>
    </Row>

    return {title,content, action}
}

export default carerStep

import { Component, createRef, Fragment } from 'react'
import { Form } from '@ant-design/compatible'
import { Button, Col, Input, List, message, Modal, Row } from 'antd'
import { actions } from 'mirrorx'
import TCModal from '../../../components/TCModal/InviteTCModal'
import { globalConstants } from '@/_constants'
import ReCAPTCHA from 'react-google-recaptcha'

class HubCarers extends Component {

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
            hub_id: this.props.selectedHub.hub_id,
            email: this.props.form.getFieldValue('email'),
        }
        this.setState({isSubmitting: true})

        actions.user.inviteCarer(payload).then(() => {
            this.props.form.resetFields()
            this.recaptchaRef.current.reset()
            message.success('Invite Success')
            this.handleClose()
            actions.user.getInvitationByHub(this.props.selectedHub.hub_id)
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
        const { form, next, prev, settings } = this.props
        const {getFieldDecorator} = form
        const listData = this.generateData()
        const firstName = settings && settings.resident_profile.first_name
        return (
            <Fragment>
                <div className="wizardContent">
                    <h4>You can invite other people to see {firstName}&#39;s {globalConstants.HUB_SOFIHUB}!</h4>
                    <p>You can invite carers to help you manage {firstName}&#39;s {globalConstants.HUB_SOFIHUB}. All carers registered with the
                    system will be reached out to if an anomaly occurs (if anomaly detection is enabled) - so it&#39;s
                    important to invite carers to your system!</p>
                    <p>
                        Carers can also see {firstName}&#39;s {globalConstants.HUB_SOFIHUB}, including their movements around their
                        home, historical data, medication or normal reminders, and more. This person can also help
                        keep the system up to date by adding new carers or removing old ones. You should only add
                        people who you trust such as family members, relatives, friends or professional carers.
                    </p>
                    <p>{listData.length>1 ? <span>Do you want to add another carer?</span>: <span>You are currently the only carer on this
                    system, add another? </span>}<Button type="primary" onClick={this.handleOpen} style={{marginLeft: '12px'}}>
                        Yes</Button></p>
                    {listData.length>1 && <Fragment>
                        <p>Who is already a carer?</p>
                        <List
                            className="inviteList"
                            itemLayout="horizontal"
                            split={false}
                            dataSource={listData}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={item.type==='carer'?
                                            <span className="inviteStatus inviteStatus-carer">Carer</span>:
                                            <span className="inviteStatus inviteStatus-invited">Invited</span>
                                        }
                                        title={item.type==='carer'&& item.name}
                                        description={item.email}
                                    />
                                </List.Item>
                            )}
                        /></Fragment>}
                </div>

                <Row><Col span={24}><Button style={{ marginLeft: 8 }} onClick={prev}>
                    Previous
                </Button>
                <Button
                    type="primary"
                    onClick={next}
                    className="floatRight">Next</Button></Col>
                </Row>

                <TCModal
                    handleModalstate={this.handleTCModal}
                    handleSubmit={this.handleTCModalSubmit}
                    modal={this.state.tcModal}  />
                <Modal
                    okText="Invite"
                    open={this.state.modal} onCancel={this.handleClose}
                    onOk={this.handleSubmit}
                    centered={false} title="Invite a new carer"
                    okButtonProps={{loading: this.state.isSubmitting}}
                >
                    <div>
                        <Form onSubmit={this.handleSubmit}>
                            <p>In order to invite a new carer you will need to provide their exact email address. If the
                                user is already registered they will be notified about your invitation, if they have not
                                registered yet, they will be invited to register. Please type in the new carer&#39;s
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
                                view pending invites at any time in the &quot;Invited Carers&quot; tab.
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

const CarerPage = Form.create({})(HubCarers)

const carerStep = (selectedHub, settings, carers, pending, next, prev) =>{
    const title = 'Carers'
    const content = <CarerPage
        settings = {settings}
        selectedHub={selectedHub}
        carers={carers}
        pending={pending}
        next={next}
        prev={prev}
    />

    return {title,content}
}

export default carerStep

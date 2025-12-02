import { Component, createRef, Fragment } from 'react'
import { actions } from 'mirrorx'
import { Form } from '@ant-design/compatible'
import { Input, message, Modal, Progress } from 'antd'
import { globalConstants } from '@/_constants'
import ReCAPTCHA from 'react-google-recaptcha'
import InviteModal from '../../components/InviteOrgModal/InviteOrgModal'
import PropTypes from 'prop-types'

class OrgInviteModal extends Component{
    constructor(props) {
        super(props)
        this.state = {
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
        this.props.byPassCaptcha ? this.captchaSuccess(null): this.recaptchaRef.current.execute()
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
            organization_id: this.props.currentOrg.organization_id,
            email: this.props.form.getFieldValue('email'),
        }
        this.setState({isSubmitting: true})

        actions.organisation.inviteOrgUser(payload).then(() => {
            this.props.form.resetFields()
            this.recaptchaRef.current.reset()
            Modal.success({
                icon: null,
                content: <div>
                    <div align="center" className='margin-bottom'>
                        <p className='title'>User Invited!</p>
                        <Progress type="circle" percent={100}  strokeColor='#44AF86'/>
                    </div>
                    <p>
                        We&#39;ve invited this user for you, they should receive an email very soon.
                    </p>
                    <p>
                        Once they&#39;ve accepted their invitation, we suggest you add them to a user group or assign some policies to them so that they can access devices in your
                        organisation. If you skip this step, for security reasons the invited user will not have access to devices or your organisation (and its details).
                    </p>
                    <p>
                        To assign this user to a user group, first get them to accept their invitation over email / via the portal, then get started by heading on over to the
                        &quot;User Groups&quot; tab.
                    </p>
                </div>,
                okText: 'Okay',
            })
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

    render(){
        const {form, currentOrg, open, onCancel} = this.props
        const { getFieldDecorator } = form
        return (
            <Fragment>
                <InviteModal
                    handleModalstate={this.handleTCModal}
                    handleSubmit={this.handleTCModalSubmit}
                    modal={this.state.tcModal}
                    orgName={currentOrg.name}
                />
                <Modal
                    destroyOnClose
                    okText="Invite"
                    open={open} onCancel={onCancel}
                    onOk={this.handleSubmit}
                    centered={false} title={`Invite a new user to ${currentOrg.name}`}
                    okButtonProps={{loading: this.state.isSubmitting}}
                >
                    <div>
                        <Form onSubmit={this.handleSubmit}>
                            <p>In order to invite a new user to your organisation you will need to provide their exact email address.
                                If the user is already registered they will be notified about your invitation, if they have not
                                registered yet, they will be invited to register. Please type in the new user&#39;s email address:
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
                                view pending invites at any time in the &quot;Invited Users&quot; tab.
                            </p>
                            <ReCAPTCHA
                                ref={this.recaptchaRef}
                                // size='invisible'
                                // badge='inline'
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

OrgInviteModal.propTypes={
    currentOrg: PropTypes.object.isRequired,
    open: PropTypes.bool,
    onCancel: PropTypes.func,
    byPassCaptcha: PropTypes.bool,
}

OrgInviteModal.defaultProps = {
    byPassCaptcha: false
}

const OrgInviteModalPage = Form.create({})(OrgInviteModal)

export default OrgInviteModalPage

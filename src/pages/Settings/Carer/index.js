import { Component, createRef } from 'react'
import { actions, connect } from 'mirrorx'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Divider, Form, Input, message, Modal, Row, Table, Tooltip } from 'antd'
import { globalConstants } from '@/_constants'
import ReCAPTCHA from 'react-google-recaptcha'
import TCModal from '@/components/TCModal/InviteTCModal'
import InviteTable from '@/components/InviteTable'
import { storeDeviceData } from '@/utility/Storage'
import deviceConfirmModal from '@/components/TCModal/DeviceConfirmModal'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    hubUsers: state.hub.hubUsers,
    me: state.user.me,
    hubInvitation: state.user.hubInvitation,
    hubRadars: state.hub.hubRadars?.map(record=>({...record.radar,...record.space}))
})

class Carer extends Component{
    constructor(props) {
        super(props)
        this.state = {
            modal: false,
            tcModal: false,
            isSubmitting: false,
        }
        this.recaptchaRef = createRef()
        this.formRef = createRef()
    }

    handleTCModal = (state) => {
        this.setState({tcModal: state})
    }

    handleTCModalSubmit = async() => {
        this.handleTCModal(false)
        return this.props.hubRadars?.length>0 ? deviceConfirmModal(false,()=>this.recaptchaRef.current.execute()) :
            this.recaptchaRef.current.execute()
    }

    handleClose = () => {
        this.setState({ modal: false })
    }

    handleSubmit = () => {
        this.formRef.current.validateFields().then(()=>{this.handleTCModal(true)})
    }

    captchaSuccess = (captcha) => {
        const payload = {
            captcha,
            hub_id: this.props.selectedHub.hub_id,
            email: this.formRef.current.getFieldValue('email'),
        }
        this.setState({isSubmitting: true})

        actions.user.inviteCarer(payload).then(() => {
            this.formRef.current.resetFields()
            this.recaptchaRef.current.reset()
            message.success('Invite Success')
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

    disassociate = (user) => {
        const payload = {
            user_id: user.user_id,
            hub_id: this.props.selectedHub.hub_id
        }
        actions.user.disassociateHub(payload).then(()=>{
            if (user.user_id === this.props.me.user_id) {
                storeDeviceData('hubId', '')
                actions.hub.getHubs()
                actions.routing.push('/deviceSelection')
            }
        })
    }

    removeCarerConfirm = (user) => {
        Modal.confirm({
            title:user.user_id===this.props.me.user_id
                ? 'Are you sure you wish to remove yourself as a carer?'
                : `Are you sure you wish to remove the carer ${user.first_name} ${user.last_name}?`,
            content: this.props.hubRadars?.length>0 ? <div>
                By removing this carer from your {globalConstants.HUB_SOFIHUB} you will also be removing them from the following {globalConstants.RADAR_HOBA}&#39;s:
                <ul>
                    {this.props.hubRadars.map(radar=><li key={radar.id}>{radar.display_name}</li>)}
                </ul>
                Are you sure you want to remove this carer from your {globalConstants.HUB_SOFIHUB} and also {this.props.hubRadars.length} {globalConstants.RADAR_HOBA}?
            </div>: null,
            onOk: ()=>this.disassociate(user),
            okText: 'Yes',
            cancelText: 'No'
        })
    }

    render(){
        const dataSource = this.props.hubUsers
        const columns = [
            {
                title: 'First Name',
                dataIndex: 'first_name',
                key: 'first_name',
                sorter: (a, b) => a.first_name.localeCompare(b.first_name),
            },
            {
                title: 'Last Name',
                dataIndex: 'last_name',
                key: 'last_name',
                sorter: (a, b) => a.last_name.localeCompare(b.last_name),
            },
            {
                title: 'Email',
                dataIndex: 'email',
                key: 'email',
                sorter: (a, b) => a.email.localeCompare(b.email),
            },
            {
                title: 'Mobile',
                dataIndex: 'mobile',
                key: 'mobile',
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, user) => (
                    dataSource.length>1 &&
                    <a onClick={()=>this.removeCarerConfirm(user)}><Tooltip title="Remove this carer"><DeleteOutlined /></Tooltip></a>
                ),
            },
        ]
        return (
            <Row type="flex" justify="center">
                <Col xs={22} xl={16}>
                    <Card className="beacon-card" title="Carer Table">
                        <Table scroll={{x: true}} dataSource={dataSource} columns={columns} rowKey="user_id"/>
                        <Row>
                            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleOpen}>Invite Carer</Button>
                        </Row>
                    </Card>
                    <Divider />
                    <Card className="beacon-card" title="Pending Carer Table">
                        <InviteTable
                            type="Hub"
                            invites={this.props.hubInvitation}
                            searchInput={false} hubId={this.props.selectedHub.hub_id}/>
                    </Card>
                </Col>
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
                        <Form ref={this.formRef} scrollToFirstError>
                            <p>In order to invite a new carer you will need to provide their exact email address. If the
                                user is already registered they will be notified about your invitation, if they have not
                                registered yet, they will be invited to register. Please type in the new carer&#39;s
                                email address:
                            </p>
                            <Form.Item
                                name="email"
                                rules={[{required: true, message: globalConstants.ENTER_EMAIL},
                                    { type: 'email', message: 'The input is not valid Email!' }]}>
                                <Input
                                    autoComplete="off"
                                    data-lpignore="true"
                                    size="large" maxLength={globalConstants.INPUT_MAX_LENGTH}
                                    ref={input => { this.email = input }} type="email"
                                    placeholder="Email address"/>
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
            </Row>
        )
    }
}

export default connect(mapStateToProps, null) (Carer)

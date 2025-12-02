import { Component, createRef, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Divider, Form, Input, message, Modal, Row, Table, Tooltip } from 'antd'
import { globalConstants } from '@/_constants'
import ReCAPTCHA from 'react-google-recaptcha'
import TCModal from '@/components/TCModal/InviteTCModal'
import { storeDeviceData } from '@/utility/Storage'
import InviteTable from '../../../../components/InviteTable'
import deviceConfirmModal from '../../../../components/TCModal/DeviceConfirmModal'

const mapStateToProps = state => ({
    selectedRadar: state.radar.selectedRadar,
    radarUsers: state.radar.radarUsers,
    radarHubUsers: state.radar.radarHubUsers,
    me: state.user.me,
    radarInvitation: state.user.radarInvitation,
    radarHubs: state.radar.radarHubs
})

class RadarCarer extends Component{
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
        return this.props.radarHubs?.length>0 ? deviceConfirmModal(true,()=>this.recaptchaRef.current.execute()) :
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
            product_id: this.props.selectedRadar.id,
            email: this.formRef.current.getFieldValue('email'),
        }
        this.setState({isSubmitting: true})

        actions.user.inviteRadarCarer(payload).then(() => {
            this.formRef.current.resetFields()
            this.recaptchaRef.current.reset()
            message.success('Invite Success')
            actions.user.getInvitationByRadar(this.props.selectedRadar.id)
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

    removeCarerConfirm = (user) => {
        Modal.confirm({
            title:user.user_id===this.props.me.user_id
                ? 'Are you sure you wish to remove yourself as a carer?'
                : `Are you sure you wish to remove the carer ${user.first_name} ${user.last_name}?`,
            content: this.props.radarHubs?.length>0 ? <div>
                By removing this carer from your {globalConstants.RADAR_HOBA} you will also be removing them from the {globalConstants.HUB_SOFIHUB} called {this.props.radarHubs[0].display_name}.
                Are you sure you want to remove this carer from your {globalConstants.RADAR_HOBA} and your {globalConstants.HUB_SOFIHUB}?
            </div> : null,
            onOk: ()=>this.disassociate(user),
            okText: 'Yes',
            cancelText: 'No'
        })
    }


    disassociate = (user) => {
        const payload = {
            user_id: user.user_id,
            product_id: this.props.selectedRadar.id
        }
        actions.radar.disassociateRadar(payload).then(()=>{
            if (user.user_id === this.props.me.user_id) {
                storeDeviceData('selectedRadar', '')
                actions.radar.fetchAllRadars()
                actions.routing.push('/deviceSelection')
            }
        })
    }

    render(){
        const dataSource = this.props.radarUsers
        const columns = [
            {
                title: 'First Name',
                dataIndex: ['flat_user','first_name'],
                key: 'first_name',
                sorter: (a, b) => a.flat_user.first_name.localeCompare(b.flat_user.first_name),
            },
            {
                title: 'Last Name',
                dataIndex: ['flat_user','last_name'],
                key: 'last_name',
                sorter: (a, b) => a.flat_user.last_name.localeCompare(b.flat_user.last_name),
            },
            {
                title: 'Email',
                dataIndex:['flat_user', 'email'],
                key: 'email',
                sorter: (a, b) => a.flat_user.email.localeCompare(b.flat_user.email),
            },
            {
                title: 'Mobile',
                dataIndex: ['flat_user','mobile'],
                key: 'mobile',
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, user) => (
                    dataSource.length>1 &&
                    <a onClick={()=>this.removeCarerConfirm(user.flat_user)}><Tooltip title="Remove this carer"><DeleteOutlined /></Tooltip></a>
                ),
            },
        ]
        return (
            <Fragment>
                <Card className="beacon-card" title="Carer Table">
                    <Table scroll={{x: true}} dataSource={dataSource} columns={columns} rowKey={record => record.flat_user.user_id}/>
                    <Row>
                        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleOpen}>Invite Carer</Button>
                    </Row>
                </Card>
                <Divider />
                <Card className="beacon-card" title="Pending Carer Table">
                    <InviteTable
                        type="Radar"
                        invites={this.props.radarInvitation}
                        searchInput={false} radarId={this.props.selectedRadar?.id}/>
                </Card>
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
            </Fragment>
        )
    }
}

export default connect(mapStateToProps, null) (RadarCarer)

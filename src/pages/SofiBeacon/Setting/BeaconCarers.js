import { Component, createRef, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, message, Modal, Popconfirm, Row, Table, Tooltip, Typography } from 'antd'
import Media from 'react-media'
import { storeDeviceData } from '@/utility/Storage'
import TCModal from '@/components/TCModal/InviteTCModal'
import { globalConstants } from '@/_constants'
import ReCAPTCHA from 'react-google-recaptcha'
import InviteTable from '@/components/InviteTable'
import { isWatch } from '@/utility/Common'

const mapStateToProps = state => ({
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    beaconUsers: state.sofiBeacon.selectedBeaconUsers,
    beaconInvitation: state.user.beaconInvitation,
    me: state.user.me,
})

const {Paragraph, Text} = Typography

class BeaconCarers extends Component {

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

    componentDidCatch(error, errorInfo) {
        console.error(error)
        console.error(errorInfo)
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

    handleSubmit = () => {
        this.formRef.current.validateFields().then(()=>{this.handleTCModal(true)})
    }

    captchaSuccess = (captcha) => {
        const payload = {
            captcha,
            beacon_id: this.props.selectedBeacon.id,
            email: this.formRef.current.getFieldValue('email'),
        }
        this.setState({isSubmitting: true})

        actions.user.inviteBeaconCarer(payload).then(() => {
            this.formRef.current.resetFields()
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

    /** disassociate user */
    disassociate = async (user) => {

        const beacon = this.props.selectedBeacon
        await actions.sofiBeacon.disassociateBeaconUser({ userId: user.user_id , beaconId: beacon.id, beaconPubId: beacon.pub_id }).then(()=>{
            actions.sofiBeacon.fetchBeaconUsers(beacon.pub_id)
            if (user.user_id === this.props.me.user_id) {
                storeDeviceData('selectedBeacon', null)
                actions.sofiBeacon.fetchBeaconByUser()
                actions.routing.push('/deviceSelection')
            }
        })
    }

    render() {
        const { beaconUsers } = this.props
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
                    <Popconfirm
                        title={user.user_id===this.props.me.user_id
                            ? 'Are you sure you wish to remove yourself as a account manager?'
                            : `Are you sure you wish to remove the account manager ${user.first_name} ${user.last_name}?`}
                        onConfirm={()=>this.disassociate(user)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <a className="test-button-disconnect">
                            <Media query='(max-width:599px)'>
                                { matches => matches ? (
                                    <DeleteOutlined />
                                ) : (
                                    <Tooltip title="Remove this account manager"><DeleteOutlined /></Tooltip>
                                ) }
                            </Media>
                        </a>
                    </Popconfirm>
                ),
            },
        ]

        return (
            <Fragment>
                <Card className="beacon-card" title="Account Manager Table">
                    <Paragraph>
                        <Text strong>Note:</Text> A account manager is someone who can access the portal. By default a account manager is not listed as an emergency contact.
                        You can add new people as emergency contacts <a onClick={()=>this.props?.onTabChanged('general', 'ec')}>here</a>.
                    </Paragraph>
                    <Table
                        scroll={{x: true}}
                        loading={beaconUsers === null}
                        columns={columns}
                        dataSource={beaconUsers}
                        rowKey="user_id"
                    />
                    <Row>
                        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleOpen}>Invite Account Manager</Button>
                    </Row>
                </Card>
                <Card className="beacon-card" title="Pending Account Manager Table">
                    <InviteTable
                        invites={this.props.beaconInvitation}
                        searchInput={false}
                        beaconId={this.props.selectedBeacon && this.props.selectedBeacon.pub_id}
                        type={isWatch(this.props.selectedBeacon) ? globalConstants.BEACON_WATCH : 'Beacon'}
                    />
                </Card>

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
                        <Form onSubmit={this.handleSubmit} ref={this.formRef}>
                            <p>In order to invite a new account manager you will need to provide their exact email address. If the
                                user is already registered they will be notified about your invitation, if they have not
                                registered yet, they will be invited to register. Please type in the new account manager&#39;s
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

export default connect(mapStateToProps)(BeaconCarers)

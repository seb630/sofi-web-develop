import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Collapse, Divider, Input, Popconfirm, Row, Table, Tooltip, } from 'antd'
import { hasAccess, sortDateTime, sortString } from '@/utility/Common'
import { globalConstants } from '@/_constants'
import moment from 'moment'
import { isMobile } from 'react-device-detect'
import InviteTable from '../../../../../components/InviteTable'
import OrgInviteModalPage from '../../../../Organisation/OrgInviteModal'
import DirectAddModal from '../../../Users/User/Org/DirectAddModal'
import RoleModal from './RoleModal'
import AccessDenied from '../../../../../components/AccessDeny'

const mapStateToProps = state => ({
    orgUsers: state.organisation.orgUsers,
    allUsers: state.user.allUsers,
    orgInvitation: state.organisation.orgInvitation,
    myPrivileges: state.user.myPrivileges,
    admin: state.user.me ?.authorities.some(role=>role.includes('ADMIN')),
})

class OrgUsers extends Component{
    constructor(props) {
        super(props)
        this.state = {
            modal: false,
            inviteModal: false,
            roleModal: false,
            users: props.orgUsers,
            selectedUser: null
        }
    }

    componentDidMount() {
        this.fetchData()
    }

    fetchData = () =>{
        const {currentOrg, myPrivileges, admin, allUsers} = this.props
        if (hasAccess('ORG_VIEW_ORG_USER', currentOrg,myPrivileges, admin)){
            actions.organisation.fetchOrgUsers(currentOrg.organization_id)
            actions.organisation.fetchInvitationByOrg(currentOrg.organization_id)
            !allUsers  && actions.user.getAllUsers()
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.currentOrg!==this.props.currentOrg && this.fetchData()
        prevProps.orgUsers !== this.props.orgUsers && this.setState({users: this.props.orgUsers})
    }

    handleClose = () => {
        this.setState({modal: false})
    }

    handleOpen = () => {
        this.setState({modal: true})
    }

    handleInviteClose = () => {
        this.setState({inviteModal: false})
    }

    handleInviteOpen = () => {
        this.setState({inviteModal: true})
    }

    handleRoleOpen = (selectedUser) => {
        actions.organisation.fetchOrgUserRoles(selectedUser.organization_user_id)
        this.setState({roleModal: true, selectedUser})
    }

    handleRoleClose = () => {
        this.setState({roleModal: false, selectedUser: null,})
    }

    sortLogin = (a, b, field) => {
        if (a[field] === null) return -1
        if (b[field] === null) return 1
        return sortDateTime(a[field], b[field])
    }

    disassociate = (user, e) => {
        e.stopPropagation()
        const payload = {
            user_id: user.user_id,
            organization_id: this.props.currentOrg.organization_id
        }
        actions.organisation.disassociateOrgUser(payload)
    }

    renderHeader = () =>{
        return (<Fragment><Row type="flex" gutter={15} align="middle" className="margin-bottom">
            <Col>
                <Input.Search
                    placeholder="Search here ..."
                    onSearch={value => this.handleSearch(value)}
                    enterButton
                    autoFocus = {!isMobile}
                />
            </Col>
        </Row>
        </Fragment>)
    }

    handleSearch = (value) => {
        const { orgUsers } = this.props
        if (value === ''){
            this.setState ({users: orgUsers})
        }else{
            this.setState({users: orgUsers.filter(
                record=> record.username && record.username.toLowerCase().includes(value.toLowerCase()) ||
                    record.new_email && record.new_email.toLowerCase().includes(value.toLowerCase()) ||
                    record.first_name && record.first_name.toLowerCase().includes(value.toLowerCase()) ||
                    record.last_name && record.last_name.toLowerCase().includes(value.toLowerCase()) ||
                    record.mobile && record.mobile.toLowerCase().includes(value.toLowerCase())) })
        }
    }

    render(){
        const { users, inviteModal, modal, roleModal, selectedUser } = this.state
        const { orgUsers, orgInvitation, currentOrg, allUsers, admin } = this.props
        const columns = [
            {
                title: 'Username',
                dataIndex: 'username',
                key: 'username',
                sorter: (a, b) => sortString(a,b,'username'),
            },
            {
                title: 'First Name',
                dataIndex: 'first_name',
                key: 'first_name',
                sorter: (a, b) => sortString(a,b,'first_name'),
            },
            {
                title: 'Last Name',
                dataIndex: 'last_name',
                key: 'last_name',
                sorter: (a, b) => sortString(a,b,'last_name'),

            },
            {
                title: 'Mobile',
                dataIndex: 'mobile',
                key: 'mobile',
            },
            {
                title: 'Last Login',
                dataIndex: 'last_successful_login_time',
                key: 'last',
                sorter: (a, b) => this.sortLogin(a, b, 'last_successful_login_time'),
                render: (text) => text && moment(text)
                    .format(globalConstants.LONGDATETIME_FORMAT)
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, user) => (
                    <Fragment>
                        <a onClick={()=>this.handleRoleOpen(user)}>Policies</a>
                        <Divider type="vertical"/>
                        <AccessDenied currentOrg={currentOrg} privilege="ORG_DELETE_ORG_USER" hasModal={false}>
                            <Popconfirm
                                title="Are you sure disassociate this user?"
                                onConfirm={(e)=>this.disassociate(user, e)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <a><Tooltip title="Disassociate this user">
                                    <DeleteOutlined />
                                </Tooltip></a>
                            </Popconfirm>
                        </AccessDenied>
                    </Fragment>
                ),
            },
        ]
        return (
            <AccessDenied currentOrg={currentOrg} privilege="ORG_VIEW_ORG_USER">
                <div className="contentPage">
                    <Table scroll={{x: true}} className="table" loading={ orgUsers == null}
                        dataSource={users || orgUsers}
                        columns={columns}
                        rowKey="user_id"
                        title={this.renderHeader}
                    />
                    <Row gutter={16} type="flex">
                        <AccessDenied currentOrg={currentOrg} privilege="ORG_CREATE_INVITE_ORG_USER" hasModal={false}>
                            <Col><Button type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleInviteOpen}>Invite User</Button></Col>
                        </AccessDenied>
                        {admin && <Col><Button type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleOpen}>Directly Add User</Button></Col>}
                    </Row>
                    <Divider />
                    <Collapse>
                        <Collapse.Panel header="Pending user table" key={0}>
                            <AccessDenied currentOrg={currentOrg} privilege="ORG_VIEW_INVITE_ORG_USER">
                                <Card>
                                    <InviteTable
                                        type="Org"
                                        invites={orgInvitation}
                                        searchInput={true}
                                        orgId={currentOrg.organization_id}
                                        currentOrg={currentOrg}
                                    />
                                </Card>
                            </AccessDenied>
                        </Collapse.Panel>
                    </Collapse>
                    <DirectAddModal
                        open={modal}
                        onCancel = {this.handleClose}
                        currentOrg={currentOrg}
                        allUsers={allUsers}
                        orgUsers={orgUsers}
                    />
                    <OrgInviteModalPage
                        open={inviteModal}
                        onCancel = {this.handleInviteClose}
                        currentOrg={currentOrg}
                        byPassCaptcha={true}
                    />
                    {roleModal && <RoleModal
                        open={roleModal}
                        onCancel = {this.handleRoleClose}
                        orgUser={selectedUser}
                    />}
                </div>
            </AccessDenied>
        )
    }
}


export default connect(mapStateToProps, null) (OrgUsers)

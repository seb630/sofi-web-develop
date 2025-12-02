import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Col, Divider, Input, Popconfirm, Row, Table } from 'antd'
import { sortDateTime, sortString } from '@/utility/Common'
import Register from './register'
import { globalConstants } from '@/_constants'
import moment from 'moment'
import { isMobile } from 'react-device-detect'

const mapStateToProps = state => ({
    allUsers: state.user.allUsers
})

class Users extends Component{
    constructor(props) {
        super(props)
        this.state = {
            modal: false,
            users: props.allUsers,
            showingCount: props.allUsers?.length,
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.allUsers !== this.props.allUsers && this.setState({
            users: this.props.allUsers, showingCount: this.props.allUsers.length,})
    }

    handleClose = () => {
        this.setState({ modal: false })
    }

    handleOpen = () => {
        this.setState({modal: true})
    }

    saveFormRef = (formRef) => {
        this.formRef = formRef
    }

    rollback = (user) => {
        actions.user.rollbackNewEmail(user.user_id).then(()=> {
            actions.user.getAllUsers()
        })
    }

    sortLogin = (a, b, field) => {
        if (a[field] === null) return -1
        if (b[field] === null) return 1
        return sortDateTime(a[field], b[field])
    }

    handleSearch = (value) => {
        const { allUsers } = this.props
        if (value === ''){
            this.setState ({users: allUsers, showingCount: allUsers.length})
        }else{
            const filtered = allUsers.filter(
                record=> record.username && record.username.toLowerCase().includes(value.toLowerCase()) ||
                    record.new_email && record.new_email.toLowerCase().includes(value.toLowerCase()) ||
                    record.first_name && record.first_name.toLowerCase().includes(value.toLowerCase()) ||
                    record.last_name && record.last_name.toLowerCase().includes(value.toLowerCase()) ||
                    record.mobile && record.mobile.toLowerCase().includes(value.toLowerCase()))
            this.setState({users: filtered, showingCount: filtered.length })
        }
    }

    renderHeader = () =>{
        return (
            <Fragment><Row justify="space-between"  gutter={15} align="middle" className="margin-bottom">
                <Col xs={24} lg={12}>
                    <Input.Search
                        style={{ width: 200, marginRight: 24 }}
                        placeholder="Search here ..."
                        onSearch={value => this.handleSearch(value)}
                        enterButton
                        autoFocus = {!isMobile}
                    />
                    <Button type="primary"  icon={<PlusOutlined />} onClick={this.handleOpen}>Create User</Button>
                </Col>
                <Col xs={24} lg={12} className="text-right"><b>Showing {this.state.showingCount} users out of total {this.props.allUsers?.length}</b></Col>
            </Row>

            </Fragment>
        )
    }



    render(){
        const { users } = this.state
        const { allUsers } = this.props
        const columns = [
            {
                title: 'Username',
                dataIndex: 'username',
                key: 'username',
                sorter: (a, b) => sortString(a,b,'username'),
                render: (text, record) => <a onClick= {() => {
                    actions.routing.push(`/globalAdmin/user/${record.user_id}`)
                }
                }>{text}</a>
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
                title: 'Role',
                dataIndex: 'authorities',
                key: 'authorities',
                render: (text, record) => record.authorities?.includes('ROLE_ADMIN') ? 'Admin' : 'User',
                filters: [
                    {
                        text: 'Admin Only',
                        value: 'ROLE_ADMIN',
                    }
                ],
                onFilter: (value, record) => record.authorities?.includes(value),
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
                title: 'Created At',
                dataIndex: 'created_at',
                key: 'last',
                sorter: (a, b) => this.sortLogin(a, b, 'created_at'),
                render: (text) => text && moment(text)
                    .format(globalConstants.LONGDATETIME_FORMAT)
            },
            {
                title: 'New Email',
                dataIndex: 'new_email',
                key: 'new_email',
                sorter: (a, b) => sortString(a,b,'new_email'),
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, user) => (
                    <Fragment>
                        {user.new_email && <Fragment>
                            <Divider type="vertical"/>
                            <Popconfirm
                                title="Are you sure rollback this user's email address?"
                                onConfirm={() => this.rollback(user)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <a>RollBack</a>
                            </Popconfirm>
                        </Fragment>
                        }
                    </Fragment>
                ),
            },
        ]
        return (
            <Fragment>
                <Table scroll={{x: true}} className="table" loading={ allUsers == null}
                    dataSource={users || allUsers}
                    columns={columns}
                    rowKey="user_id"
                    title={this.renderHeader}
                />
                <Register
                    open = {this.state.modal}
                    onCancel={this.handleClose}
                    wrappedComponentRef={this.saveFormRef}
                />
            </Fragment>)
    }
}


export default connect(mapStateToProps, null) (Users)

import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Col, Modal, Popconfirm, Row, Select, Table, Tooltip } from 'antd'
import HubUserModal from './Modal'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    hubUsers: state.hub.hubUsers,
    allUsers: state.user.allUsers
})

class HubUser extends Component{
    constructor(props) {
        super(props)
        this.state = {
            modal: false,
            user: '',
        }
    }

    handleUserChange = (value) => {
        this.setState({user: value})
    }

    handleClose = () => {
        this.setState({ modal: false })
    }

    handleSave = () => {
        const payload = {
            user_id: this.state.user,
            hub_mac_address: this.props.selectedHub.mac_address
        }
        const hubId = this.props.selectedHub.hub_id
        actions.user.associateHub({hubId, payload})
        this.setState({ modal: false })
    }

    handleOpen = () => {
        this.setState({
            user: '',
            modal: true
        })
    }

    buildUserOptions = () => {
        const candidates = this.props.allUsers ? this.props.allUsers.filter(
            user=> !this.props.hubUsers.find(x=>x.user_id===user.user_id)) : []
        return candidates.map(user => (
            <Select.Option key={user.user_id} value={user.user_id}>{`${user.first_name} ${user.last_name} (${user.email})`}</Select.Option>
        ))
    }

    disassociate = (user) => {
        const payload = {
            user_id: user.user_id,
            hub_id: this.props.selectedHub.hub_id
        }
        actions.user.disassociateHub(payload)
    }

    render(){
        const dataSource = this.props.hubUsers
        const columns = [
            {
                title: 'ID',
                dataIndex: 'user_id',
                key: 'user_id',
                defaultSortOrder: 'ascend',
                sorter: (a, b) => a.user_id - b.user_id,
            },
            {
                title: 'Username',
                dataIndex: 'username',
                key: 'username',
                sorter: (a, b) => a.username.localeCompare(b.username),
            },
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
                title: 'Mobile',
                dataIndex: 'mobile',
                key: 'mobile',
            },
            {
                title: 'Notifications',
                key: 'notification',
                render: (text, user) => (
                    <HubUserModal
                        hubUser = {user}
                        userId={user.user_id}
                        hubId={this.props.selectedHub.hub_id}
                    />
                ),
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, user) => (
                    <Popconfirm
                        title="Are you sure disassociate this user?"
                        onConfirm={()=>this.disassociate(user)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <a><Tooltip title="Disassociate this user"><DeleteOutlined /></Tooltip></a>
                    </Popconfirm>
                ),
            },
        ]
        const userOptions = this.buildUserOptions()
        return (
            <div>
                <Row>
                    <Col offset={2} xs={20} xxl={16}>
                        <Table scroll={{x: true}} dataSource={dataSource} columns={columns} rowKey="user_id"/>
                    </Col>
                </Row>
                <Row>
                    <Col offset={2} span={6}>
                        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleOpen}>Add</Button>
                    </Col>
                </Row>
                <Modal
                    okText="Save"
                    open={this.state.modal} onCancel={this.handleClose}
                    onOk={this.handleSave}
                    centered={false} title="Add User"  style={{height: '300px'}}
                >
                    <div style={{display:'grid'}}>
                        <label>Full Name</label>
                        <Select
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                            size="large"
                            value={this.state.user}
                            onChange={this.handleUserChange}
                        >
                            {userOptions}
                        </Select>
                    </div>
                </Modal>
            </div>
        )
    }
}


export default connect(mapStateToProps, null) (HubUser)

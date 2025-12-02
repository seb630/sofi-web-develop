import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Col, Input, message, Modal, Popconfirm, Row, Select, Table, Tooltip, Typography } from 'antd'
import { sortDateTime, sortString } from '@/utility/Common'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import HubUserModal from '../../../../Admin/HubUser/Modal'
import PropTypes from 'prop-types'
import { isMobile } from 'react-device-detect'

const mapStateToProps = state => ({
    allUsers: state.user.allUsers,
    hubs: state.user.userHubs,
    allHubs: state.hub.hubs
})

class UserHubs extends Component{
    constructor(props) {
        super(props)
        this.state = {
            modal: false,
            hubs: props.hubs,
            search: '',
            hub: [],
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.hubs !== this.props.hubs && this.setState({ hubs: this.props.hubs })
    }

    componentDidMount() {
        actions.user.getUserHubs(this.props.currentUser.user_id)
        this.props.allHubs && this.props.allHubs.length === 0 && actions.hub.getHubs()
    }

    handleClose = () => {
        this.setState({ modal: false, hub: null })
    }

    handleOpen = () => {
        this.setState({modal: true})
    }

    handleSearch = (value) => {
        const { hubs } = this.props
        if (value===''){
            this.setState ({hubs})
        }else{
            this.setState({hubs: hubs.filter(
                record=> record.display_name.toLowerCase().includes(value.toLowerCase()) ||
                        record.hub_id.toLowerCase().includes(value.toLowerCase()) ||
                        record.mac_address.toLowerCase().includes(value.toLowerCase())
            )})
        }
    }

    disassociate = (hub, e) => {
        e.stopPropagation()
        const payload = {
            user_id: this.props.currentUser.user_id,
            hub_id: hub.hub_id
        }
        actions.user.disassociateHub(payload)
    }

    renderHeader = () =>
        <Input.Search
            placeholder="Search here ..."
            onSearch={value => this.handleSearch(value)}
            style={{ width: 200 }}
            enterButton
            autoFocus = {!isMobile}
        />

    handleSave = async() => {
        const promises = []
        this.state.hub.map(hub=>{
            const payload = {
                user_id: this.props.currentUser.user_id,
                hub_mac_address: hub
            }
            promises.push(actions.user.associateHub({payload}))
        })

        Promise.all(promises).then(()=>{
            message.success('The hubs have been added, Please refresh the page')
            this.setState({ modal: false, hub: []})
        })

    }

    handleHubChange = (value) => {
        value.length<=10 ? this.setState({hub: value}) : message.error('Select up to 10 hubs at a time')
    }

    buildHubOptions = () => {
        const candidates = this.props.allHubs && this.props.allHubs.filter(
            hub=> !this.props.hubs.find(x=>x.hub_id===hub.hub_id)
        )
        return candidates && candidates.map(hub => (
            <Select.Option key={hub.hub_id} value={hub.mac_address}>{hub.display_name}</Select.Option>
        ))
    }

    render(){
        const hubOptions = this.buildHubOptions()
        const dataSource = this.state.hubs || this.props.hubs
        const columns = [
            {
                title: 'Name',
                dataIndex: 'display_name',
                key: 'display_name',
                sorter: (a, b) => sortString(a,b,'display_name'),
                render: (text, record) =>
                    <a
                        onClick={ () => {
                            actions.hub.selectHub(record).then(()=>{
                                actions.common.save({adminPortal: false})
                                actions.routing.push('/dashboard')
                            })
                        }}>
                        {text}
                    </a>
            },
            {
                title: 'ID',
                dataIndex: 'hub_id',
                key: 'hub_id',
                sorter: (a, b) => sortString(a,b,'hub_id'),
                render: (text) => <Typography.Text style={{width:120}} ellipsis={{tooltip: text}}>{text}</Typography.Text>
            },
            {
                title: 'MAC Address',
                dataIndex: 'mac_address',
                key: 'mac_address',
                sorter: (a, b) => sortString(a,b,'mac_address'),

            },
            {
                title: 'Connectivity',
                dataIndex: 'connectivity_state',
                key: 'connectivity_state',
            },
            {
                title: 'Last Message',
                dataIndex: 'last_heartbeat_at',
                key: 'last',
                sorter: (a, b) => sortDateTime(a.last_heartbeat_at, b.last_heartbeat_at),
                render: (text) => text && moment(text)
                    .format(globalConstants.LONGDATETIME_FORMAT)
            },
            {
                title: 'Notifications',
                key: 'notification',
                render: (text, hub) => (
                    <HubUserModal
                        hubUser = {hub}
                        userId={this.props.currentUser.user_id}
                        hubId={hub.hub_id}
                    />
                )
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, hub) => (
                    <Popconfirm
                        title="Are you sure disassociate this hub?"
                        onConfirm={(e)=>this.disassociate(hub, e)}
                        okText="Yes"
                        cancelText="No"
                        onClick={e => {e.stopPropagation()}}
                    >
                        <a><Tooltip title="Disassociate this hub">
                            <DeleteOutlined />
                        </Tooltip></a>

                    </Popconfirm>
                ),
            },
        ]
        return (
            <div className="contentPage">
                <Row>
                    <Col span={24}>
                        <Table
                            scroll={{x: true}} className="table"
                            dataSource={dataSource}
                            columns={columns}
                            rowKey="hub_id"
                            title={this.renderHeader}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col span={6}>
                        <Button
                            style={{ marginTop: '16px'}} type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleOpen}>
                            Add Hub
                        </Button>
                    </Col>
                </Row>
                <Modal
                    destroyOnClose
                    okText="Save"
                    open={this.state.modal} onCancel={this.handleClose}
                    onOk={this.handleSave}
                    centered={false} title="Add Hub"  style={{height: '300px'}}
                >
                    <div style={{display:'grid'}}>
                        <label>Hub Name</label>
                        <Select
                            showSearch
                            mode="multiple"
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            size="large"
                            onChange={this.handleHubChange}
                            placeholder="Please select up to 10 hubs..."
                            value={this.state.hub}
                        >
                            {hubOptions}
                        </Select>
                    </div>
                </Modal>
            </div>
        )
    }
}

UserHubs.propTypes={
    currentUser: PropTypes.object.isRequired,
}


export default connect(mapStateToProps, null) (UserHubs)

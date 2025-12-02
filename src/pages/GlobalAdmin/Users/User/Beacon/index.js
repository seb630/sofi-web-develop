import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Input, message, Modal, Popconfirm, Select, Table, Tooltip } from 'antd'
import { sortString } from '@/utility/Common'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import { isMobile } from 'react-device-detect'

const mapStateToProps = state => ({
    userBeacons: state.user.userBeacons,
    headStates: state.sofiBeacon.headStates,
    allBeacons: state.sofiBeacon.allBeacons
})

class UserBeacons extends Component {
    constructor(props) {
        super(props)
        this.state = {
            search: '',
            beacons: props.userBeacons,
        }
    }

    componentDidMount() {
        const { currentUser , headStates} = this.props
        actions.user.fetchUserBeacons({ userId: currentUser.user_id,headStates })
    }

    componentDidUpdate(prevProps) {
        prevProps.userBeacons !== this.props.userBeacons && this.setState({
            beacons: this.props.userBeacons })
    }

    /** disassociate beacon */
    disassociate = (beacon, e) => {
        e.stopPropagation()
        const payload = {
            user_id: this.props.currentUser.user_id,
            beacon_id: beacon.id
        }
        const { currentUser , headStates} = this.props
        actions.user.disassociateBeacon(payload).then(() => {
            actions.user.fetchUserBeacons({ userId: currentUser.user_id,headStates })
        }).catch( err => {
            err.global_errors?.length>0 ? err.global_errors.map(item => {
                message.error(`${item.message}`)
            }) : message.error(globalConstants.SERVER_ERROR_MESSAGE)
        })
    }

    /** handle search */
    handleStringSearch = (value) => {
        const { userBeacons } = this.props
        if (value === '' ){
            this.setState ({ search:'', beacons: userBeacons})
        }else{
            this.setState({ search: value,beacons: userBeacons.filter(
                record => record.display_name.toLowerCase().includes(value.toLowerCase()) ||
                        record.imei.includes(value.toLowerCase()) ||
                        record.id.toString().includes(value.toLowerCase())||
                        record.phone.includes(value.toLowerCase())
            )})
        }
    }

    /** render header */
    renderHeader = () => {
        return (
            <Input.Search
                style={{width: 200}}
                placeholder="Search here ..."
                onSearch={value => this.handleStringSearch(value)}
                enterButton
                autoFocus = {!isMobile}
            />
        )
    }


    render() {
        const { userBeacons  } = this.props
        const columns = [
            {
                title: 'Name',
                dataIndex: 'display_name',
                key: 'display_name',
                sorter: (a, b) => sortString(a,b,'display_name'),
                render: (text, record) =>
                    <a onClick= {() => {
                        actions.sofiBeacon.selectBeacon(record).then(()=>{
                            actions.common.save({adminPortal: false})
                            actions.routing.push('/beacon/dashboard')
                        })
                    }
                    }>
                        {text}
                    </a>
            },
            {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
                sorter: (a, b) => a.id-b.id,
            },
            {
                title: 'UUID',
                dataIndex: 'pub_id',
                sorter: (a, b) => sortString(a,b,'pub_id'),
            },
            {
                title: 'IMEI',
                dataIndex: 'imei',
                key: 'imei',
                sorter: (a, b) => sortString(a,b,'imei'),
            },
            {
                title: 'Phone Number',
                dataIndex: 'phone',
                key: 'phone',
                sorter: (a, b) => sortString(a,b,'phone'),
            },
            {
                title: 'Battery %',
                dataIndex: 'battery_level',
                render: (text) => <span> {text || 'No Data Yet'} </span>
            },
            {
                title: 'Battery Updated',
                dataIndex: 'battery_updated_at',
                render: (value) => value ? moment(value).format(globalConstants.DATETIME_FORMAT) : 'No Data Yet'
            },
            {
                title: 'Charging ?',
                dataIndex: 'charging',
                render: (value) => value ? 'Yes' : 'No'
            },
            {
                title: 'Charging Updated',
                dataIndex: 'charging_last_updated',
                render: (value) => value ? moment(value).format(globalConstants.DATETIME_FORMAT) : 'No Data Yet'
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, beacon) => (
                    <Popconfirm
                        title="Are you sure disassociate this beacon?"
                        onConfirm={(e)=>this.disassociate(beacon, e)}
                        okText="Yes"
                        cancelText="No"
                        onClick={e => {e.stopPropagation()}}
                    >
                        <a><Tooltip title="Disassociate this beacon">
                            <DeleteOutlined />
                        </Tooltip></a>

                    </Popconfirm>
                ),
            }
        ]
        return (<div className="contentPage">
            <Table
                scroll={{x: true}}
                className="table"
                loading={userBeacons == null}
                dataSource={this.state.beacons || userBeacons}
                columns={columns}
                rowKey='id'
                title={this.renderHeader}
            />

            <AddBeaconModal {...this.props} />
        </div>)
    }
}

class AddBeaconModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            open: props.open,
            beacon: []
        }
    }

    handleClose = () => {
        this.setState({ open: false,beacon: [] })
    }

    handleOpen = () => {
        this.setState({ open: true })
    }

    handleChange = (value) => {
        value.length<=10 ? this.setState({beacon: value}) : message.error('Select up to 10 beacons at a time')
    }

    handleSave = async() => {
        const { currentUser , headStates} = this.props

        const promises = []
        this.state.beacon.map(beacon=>{
            const payload = {
                user_id: this.props.currentUser.user_id,
                beacon_id: beacon
            }
            promises.push(actions.user.associateBeacon(payload))
        })

        Promise.all(promises).then(()=>{
            message.success('The beacons have been added, Please refresh the page')
            actions.user.fetchUserBeacons({ userId: currentUser.user_id,headStates })
            this.setState({ open: false, beacon: []})
        })
    }

    buildOptions = () => {
        const { allBeacons , userBeacons } = this.props
        const candidates = allBeacons && userBeacons && allBeacons.filter(
            beacon => !userBeacons.find( x => x.id === beacon.id)
        )
        return candidates && candidates.map(beacon => (
            <Select.Option key={beacon.id} value={beacon.id}>{beacon.display_name}</Select.Option>
        ))
    }

    render() {
        const options = this.buildOptions()
        return (
            <Fragment>
                <Button style={{ marginTop: '16px'}} type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleOpen}>Add Beacon</Button>
                <Modal
                    okText="Save"
                    open={this.state.open} onCancel={this.handleClose}
                    onOk={this.handleSave}
                    centered={false} title="Add Beacon"  style={{height: '300px'}}
                >
                    <div style={{display:'grid'}}>
                        <label>Beacon Name</label>
                        <Select
                            showSearch
                            mode="multiple"
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            size="large"
                            value={this.state.beacon}
                            onChange={this.handleChange}
                            placeholder="Please select up to 10 beacons..."
                        >
                            { options }
                        </Select>
                    </div>
                </Modal>
            </Fragment>
        )
    }
}

export default connect(mapStateToProps)(UserBeacons)

import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Badge, Button, Col, Input, Row, Table } from 'antd'
import { sortDateTime, sortString } from '@/utility/Common'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import CreateBeaconModal from './CreateBeacon'
import { isMobile } from 'react-device-detect'
import Upload from './MassCreation/upload'

const mapStateToProps = state => ({
    allBeacons: state.sofiBeacon.allBeacons,
    email: state.user.me.email,
    beaconModels: state.sofiBeacon.beaconModels,
    APNs: state.APN.adminAPN,
    subscriptionStates: state.billing.subscriptionStatus,
    subscriptionConditions: state.billing.subscriptionConditions,
})

class AdminBeacons extends Component {
    constructor(props) {
        super(props)

        this.state = {
            search: '',
            beacons: props.allBeacons,
            bulkModal: false,
            searchText: '',
            showingCount: props.allBeacons?.length,
            filteredInfo: null,
        }
    }

    /** component did update*/
    componentDidUpdate(prevProps) {
        prevProps.allBeacons !== this.props.allBeacons && this.setState({
            beacons: this.props.allBeacons, showingCount: this.props.allBeacons?.length})
    }

    /** handle search */
    handleStringSearch = (value) => {
        const { allBeacons } = this.props
        this.clearFilters()
        if (value === '' ){
            this.setState ({ search:'', beacons: allBeacons, showingCount: allBeacons.length})
        }else{
            const filtered = allBeacons.filter(
                record => record.display_name?.toLowerCase()?.includes(value.toLowerCase()) ||
                    record.imei?.includes(value.toLowerCase()) ||
                    record.id?.toString().includes(value.toLowerCase())||
                    record.phone?.includes(value.toLowerCase()) ||
                    record.pub_id?.toString().includes(value.toLowerCase())
            )
            this.setState({ search: value,beacons:filtered, showingCount: filtered.length })
        }
    }

    clearFilters = () => {
        this.setState({ filteredInfo: null })
    }

    /** render header */
    renderHeader = () => {
        return (<Fragment><Row type="flex" gutter={15} align="middle" className="margin-bottom" justify="space-between">
            <Col xs={24} lg={16}>
                <Input.Search
                    style={{ width: 200, marginRight:24 }}
                    placeholder="Search here ..."
                    onSearch={value => this.handleStringSearch(value)}
                    enterButton
                    autoFocus = {!isMobile}
                />
                <CreateBeaconModal />
                <Button
                    style={{ marginLeft:24 }}
                    icon={<PlusOutlined />}
                    type="primary"
                    onClick={this.handleBulkCreate}
                >Bulk Create</Button>
            </Col>
            <Col xs={24} lg={8} className="text-right"><b>Showing {this.state.showingCount} {globalConstants.PENDANT_GENERIC}s out of total {this.props.allBeacons?.length}</b></Col>
        </Row>
        </Fragment>)
    }

    getColumnSearchProps = (filteredInfo) => ({
        filteredValue: filteredInfo.last_message_server_received_at || null,
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        this.searchInput = node
                    }}
                    placeholder="Within last X minutes"
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Button
                    type="primary"
                    onClick={() => this.handleSearch(selectedKeys, confirm)}
                    icon={<SearchOutlined />}
                    size="small"
                    style={{ width: 90, marginRight: 8 }}
                >
                    Search
                </Button>
                <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                    Reset
                </Button>
            </div>
        ),
        filterIcon: filtered => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>{
            return record && record.last_message_server_received_at
                && moment(record.last_message_server_received_at).add(value, 'minute').isAfter(moment())
        },
        onFilterDropdownOpenChange: open => {
            if (open) {
                setTimeout(() => this.searchInput.select())
            }
        }
    })

    handleTableChange = (pagination, filters, sorter, extra) =>{
        this.setState({ filteredInfo: filters, showingCount: extra.currentDataSource.length})
    }

    handleSearch = (selectedKeys, confirm) => {
        confirm()
        this.setState({ searchText: selectedKeys[0] })
    }

    handleReset = clearFilters => {
        clearFilters()
        this.setState({ searchText: '' })
    }

    handleBulkCreate = () => {
        const {beaconModels, APNs, subscriptionStates} = this.props
        this.setState({bulkModal: true})
        !beaconModels && actions.sofiBeacon.getBeaconModels()
        !APNs && actions.APN.fetchAllApn()
        !subscriptionStates && actions.billing.fetchSubscriptionStatus()
    }

    render() {
        let { beacons, filteredInfo } = this.state
        filteredInfo = filteredInfo || {}
        const { allBeacons } = this.props
        const columns = [
            {
                title: 'Name',
                dataIndex: 'display_name',
                key: 'display_name',
                sorter: (a, b) => sortString(a,b,'display_name'),
                render: (text, record) =>
                    <a onClick= {() => {
                        actions.sofiBeacon.resetState()
                        actions.sofiBeacon.selectBeacon(record).then(()=>{
                            actions.common.save({adminPortal: false})
                            actions.routing.push('/beacon/admin')
                        })
                    }
                    }>
                        {text}
                    </a>
            },
            {
                title: 'ID',
                dataIndex: 'id',
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
                title: 'Model',
                dataIndex: 'model',
                key: 'model',
                sorter: (a, b) => sortString(a,b,'model'),
                render: text=> text?.toUpperCase()
            },
            {
                title: 'Archived',
                dataIndex: 'archived',
                key: 'archived',
                filters: [
                    {
                        text: 'Yes',
                        value: true,
                    },
                    {
                        text: 'No',
                        value: false,
                    },
                ],
                onFilter: (value, record) => `${record.archived}` === `${value}` ,
                filteredValue: filteredInfo.archived || null,
                render(val) {
                    return <Badge status={val ? 'success':'error'} text={val ? 'Yes': 'No'} />
                },
            },
            {
                title: 'Battery %',
                dataIndex: 'battery_level',
                render: (text) => <span> {text || 'No Data Yet'} </span>
            },
            {
                title: 'Charging ?',
                dataIndex: 'charging',
                render: (value) => value ? 'Yes' : 'No'
            },
            {
                title: 'Battery Updated',
                dataIndex: 'battery_updated_at',
                render: (value) =>  value ? moment(value).format(globalConstants.DATETIME_FORMAT) : 'No Data Yet'
            },
            {
                title: 'Server Last Received',
                dataIndex: 'last_message_server_received_at',
                render: (value) => value ? moment(value).format(globalConstants.DATETIME_FORMAT) : 'No Data Yet',
                sorter: (a, b) => sortDateTime(a.last_message_server_received_at,b.last_message_server_received_at),
                ...this.getColumnSearchProps(filteredInfo),
            }
        ]
        return (
            <Fragment>
                <Table
                    scroll={{x: true}}
                    className="table"
                    loading={allBeacons == null}
                    columns={columns}
                    dataSource={beacons || allBeacons}
                    rowKey="id"
                    title={this.renderHeader}
                    onChange={this.handleTableChange}
                />

                <Upload
                    open = {this.state.bulkModal}
                    onCancel={()=>this.setState({bulkModal: false})}
                    {...this.props}
                />
            </Fragment>
        )
    }
}

export default connect(mapStateToProps)(AdminBeacons)

import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { Badge, Button, Col, Input, Row, Table } from 'antd'
import { sortDateTime, sortString } from '@/utility/Common'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import { isMobile } from 'react-device-detect'
import CreateRadarModal from './CreateRadar'
import { SearchOutlined } from '@ant-design/icons'

const mapStateToProps = state => ({
    radars: state.radar.radars,
    subscriptionStatus: state.billing.subscriptionStatus,
    orgs: state.organisation.orgs
})

class AdminRadars extends Component {
    constructor(props) {
        super(props)

        this.state = {
            search: '',
            radars: props.radars,
            showingCount: props.radars?.length,
            filteredInfo: null,
            searchText: '',
        }
    }

    /** component did update*/
    componentDidUpdate(prevProps) {
        prevProps.radars !== this.props.radars && this.setState({
            radars: this.props.radars, showingCount: this.props.radars?.length, })
    }

    /** handle search */
    handleStringSearch = (value) => {
        this.clearFilters()
        const { radars } = this.props
        if (value === '' ){
            this.setState ({ search:'', radars: radars,  showingCount: radars.length})
        }else{
            const filtered = radars.filter(
                record => record.display_name?.toLowerCase().includes(value.toLowerCase()) ||
                    record.ext_id?.toLowerCase().includes(value.toLowerCase()) ||
                    record.device_name?.toLowerCase().includes(value.toLowerCase())||
                    record.pub_id?.toLowerCase().includes(value.toLowerCase())
            )
            this.setState({ search: value,radars:filtered, showingCount: filtered.length })
        }
    }

    clearFilters = () => {
        this.setState({ filteredInfo: null })
    }

    /** render header */
    renderHeader = () => {
        return (<Fragment><Row justify="space-between" gutter={15} align="middle" className="margin-bottom">
            <Col xs={24} lg={12}>
                <Input.Search
                    style={{ width: 200, marginRight: 24 }}
                    placeholder="Search here ..."
                    onSearch={value => this.handleStringSearch(value)}
                    enterButton
                    autoFocus = {!isMobile}
                />
                <CreateRadarModal {...this.props} />
            </Col>
            <Col xs={24} lg={12} className="text-right"><b>Showing {this.state.showingCount} {globalConstants.RADAR_GENERIC}s out of total {this.props.radars?.length}</b></Col>
        </Row>
        </Fragment>)
    }

    handleTableChange = (pagination, filters, sorter, extra) =>{
        this.setState({ filteredInfo: filters, showingCount: extra.currentDataSource.length})
    }

    getColumnSearchProps = (filteredInfo) => ({
        filteredValue: filteredInfo.last_seen_at || null,
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
            return record && record.last_seen_at
                && moment(record.last_seen_at).add(value, 'minute').isAfter(moment())
        },
        onFilterDropdownOpenChange: open => {
            if (open) {
                setTimeout(() => this.searchInput.select())
            }
        }
    })

    handleSearch = (selectedKeys, confirm) => {
        confirm()
        this.setState({ searchText: selectedKeys[0] })
    }

    handleReset = clearFilters => {
        clearFilters()
        this.setState({ searchText: '' })
    }

    render() {
        let { radars,filteredInfo } = this.state
        filteredInfo = filteredInfo || {}
        const columns = [
            {
                title: 'Name',
                dataIndex: 'display_name',
                key: 'display_name',
                sorter: (a, b) => sortString(a,b,'display_name'),
                render: (text, record) =>
                    <a onClick= {() => {
                        actions.radar.resetState()
                        actions.radar.selectRadar(record).then(()=>{
                            actions.common.save({adminPortal: false})
                            actions.routing.push('/radar/admin')
                        })
                    }
                    }>
                        {text}
                    </a>
            },
            {
                title: 'External ID',
                dataIndex: 'ext_id',
            },
            {
                title: 'Location',
                dataIndex: 'location',
            },
            {
                title: 'Status',
                dataIndex: 'status',
                filteredValue: filteredInfo.status || null,
                filters: [
                    {
                        text: 'ONLINE',
                        value: 'ONLINE',
                    },
                    {
                        text: 'OFFLINE',
                        value: 'OFFLINE',
                    },
                ],
                onFilter: (value, record) => record.status?.includes(value),
                sorter: (a, b) => sortString(a,b,'status'),
                render(val) {
                    return <Badge status={val==='ONLINE'?'success':'error'} text={val} />
                },
            },
            {
                title: 'Version',
                dataIndex: 'fw_version',
                key: 'version',
                sorter: (a, b) => sortString(a,b,'fw_version')
            },
            {
                title: 'Last Seen At',
                dataIndex: 'last_seen_at',
                render: (value) =>  value ? moment(value).format(globalConstants.DATETIME_FORMAT) : 'No Data Yet',
                sorter: (a, b) => sortDateTime(a.last_seen_at,b.last_seen_at),
                ...this.getColumnSearchProps(filteredInfo),
            },

        ]
        return (
            <Fragment>
                <Table
                    className="table"
                    loading={radars == null}
                    columns={columns}
                    dataSource={radars}
                    rowKey="id"
                    title={this.renderHeader}
                    onChange={this.handleTableChange}
                />
            </Fragment>
        )
    }
}

export default connect(mapStateToProps)(AdminRadars)

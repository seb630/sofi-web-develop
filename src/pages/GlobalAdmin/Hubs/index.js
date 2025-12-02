import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { Badge, Col, Input, Row, Table, Typography } from 'antd'
import { sortDateTime, sortString } from '@/utility/Common'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import { isMobile } from 'react-device-detect'

const mapStateToProps = state => ({
    hubs: state.hub.hubs
})

class AdminHubs extends Component{
    constructor(props) {
        super(props)
        this.state = {
            search: '',
            hubs: props.hubs,
            showingCount: props.hubs.length,
            filteredInfo: null,
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.hubs !== this.props.hubs && this.setState({ hubs: this.props.hubs, showingCount: this.props.hubs?.length, })
    }

    handleSearch = (value) => {
        const { hubs } = this.props
        this.clearFilters()
        if (value===''){
            this.setState ({hubs: hubs, showingCount: hubs.length})
        }else{
            const filtered = hubs.filter(
                record=> record.display_name.toLowerCase().includes(value.toLowerCase()) ||
                    record.hub_id.toLowerCase().includes(value.toLowerCase()) ||
                    record.mac_address.toLowerCase().includes(value.toLowerCase())
            )
            this.setState({hubs: filtered, showingCount: filtered.length})
        }
    }

    clearFilters = () => {
        this.setState({ filteredInfo: null })
    }

    renderHeader = () =>
        <Row justify="space-between">
            <Col span={12}>
                <Input.Search
                    placeholder="Search here ..."
                    onSearch={value => this.handleSearch(value)}
                    style={{ width: 200 }}
                    enterButton
                    autoFocus = {!isMobile}
                />
            </Col>
            <Col span={12} className="text-right"><b>Showing {this.state.showingCount} {globalConstants.HUB_GENERIC}s out of total {this.props.hubs?.length}</b></Col>
        </Row>

    handleTableChange = (pagination, filters, sorter, extra) =>{
        this.setState({ filteredInfo: filters, showingCount: extra.currentDataSource.length})
    }

    render(){
        let { hubs, filteredInfo  } = this.state
        filteredInfo = filteredInfo || {}
        const columns = [
            {
                title: 'Name',
                dataIndex: 'display_name',
                key: 'display_name',
                sorter: (a, b) => sortString(a,b,'display_name'),
                render: (text, record) =>
                    <a onClick= {() => {
                        actions.hub.resetState()
                        actions.hub.selectHub(record).then(()=>{
                            actions.common.save({adminPortal: false})
                            actions.routing.push('/admin')
                        })}}>
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
                title: 'Software Version',
                dataIndex: 'hub_app_version',
                key: 'hub_app_version',
                sorter: (a, b) => sortString(a,b,'hub_app_version'),

            },
            {
                title: 'Connectivity',
                dataIndex: 'connectivity_state',
                key: 'connectivity_state',
                filteredValue: filteredInfo.connectivity_state || null,
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
                onFilter: (value, record) => record.connectivity_state.includes(value),
                render(val) {
                    return <Badge status={val==='ONLINE'?'success':'error'} text={val} />
                },
            },
            {
                title: 'Anomaly',
                dataIndex: 'has_active_anomaly',
                key: 'has_active_anomaly',
                filteredValue: filteredInfo.has_active_anomaly || null,
                filters: [
                    {
                        text: 'Has Anomaly',
                        value: 'Anomaly',
                    },
                    {
                        text: 'No Anomaly',
                        value: 'noAnomaly',
                    },
                ],
                onFilter: (value, record) => {
                    return value==='Anomaly' ? record.has_active_anomaly: !record.has_active_anomaly
                },
                render(val) {
                    return <Badge status={val?'error':'success'} text={val ? 'Has Anomaly' : 'No Anomaly' } />
                },
            },
            {
                title: 'Last Message',
                dataIndex: 'last_heartbeat_at',
                key: 'last',
                defaultSortOrder: 'descend',
                sorter: (a, b) => sortDateTime(a.last_heartbeat_at, b.last_heartbeat_at),
                render: (text) => text && moment(text).format(globalConstants.LONGDATETIME_FORMAT)
            },
        ]
        return (
            <Table
                scroll={{x: true}}
                loading={this.props.hubs == null}
                dataSource={hubs || this.props.hubs}
                columns={columns}
                rowKey="hub_id"
                title={this.renderHeader}
                id="hubTable"
                onChange={this.handleTableChange}
            />
        )
    }
}


export default connect(mapStateToProps, null) (AdminHubs)

import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { Progress } from '@ant-design/charts'
import { Card, InputNumber, Row, Table } from 'antd'
import { sortDateTime, sortString } from '@/utility/Common'
import { globalConstants } from '@/_constants'
import moment from 'moment'
import { titleCase } from 'change-case'

const mapStateToProps = state => ({
    hubs: state.hub.hubs || []
})

class HubDashboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            recentDays: 14
        }
    }

    getLatestOnline = () => {
        const latestHubsOnline = this.props.hubs.filter(hubs=>hubs.connectivity_state==='ONLINE')
        return latestHubsOnline.length
    }


    render() {
        const online = this.getLatestOnline()
        const onlinePercent = (online/this.props.hubs.length*100).toFixed(0)
        const offlineHubs = this.props.hubs.filter(hub=> hub.connectivity_state==='OFFLINE' &&
            moment(hub.last_heartbeat_at).add(this.state.recentDays, 'day').isAfter(moment())
        )

        const offlineColumn = [
            {
                title: 'Name',
                dataIndex: 'display_name',
                key: 'display_name',
                sorter: (a, b) => sortString(a,b,'display_name'),
                render: (text, record) =>
                    <a onClick= {() => {
                        actions.hub.selectHub(record)
                        actions.common.save({adminPortal: false})
                        actions.routing.push('/admin')
                    }
                    }>
                        {text}
                    </a>
            },
            {
                title: 'ID',
                dataIndex: 'hub_id',
                key: 'hub_id',
                sorter: (a, b) => sortString(a,b,'hub_id'),
            },
            {
                title: 'MAC Address',
                dataIndex: 'mac_address',
                key: 'mac_address',
                sorter: (a, b) => sortString(a,b,'mac_address'),
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

        const onlineProgressConfig = {
            height: 50,
            autoFit: true,
            percent: onlinePercent/100,
            color: ['#44AF86', '#E8EDF3'],
        }

        return (
            <Fragment>
                <Card
                    title={`${titleCase(globalConstants.HUB_GENERIC)}s online`}
                    className="margin-bottom"
                >
                    <h2>{`${onlinePercent}%`}</h2>
                    <Progress {...onlineProgressConfig}/>
                    <Row>
                        <span>{`Online: ${online}`}</span>
                        <span style={{ marginLeft: 16 }}>{`Offline: ${this.props.hubs.length-online}`}</span>
                        <span style={{ marginLeft: 16 }}>{`Total: ${this.props.hubs.length}`}</span>
                    </Row>
                </Card>
                <Card
                    title={`Recently offline ${titleCase(globalConstants.HUB_GENERIC)}s`}
                >
                    <h2>The following {globalConstants.HUB_GENERIC}s have gone offline in <InputNumber
                        size="small"
                        value={this.state.recentDays}
                        onChange={v=>this.setState({recentDays: v})}
                        min={1}
                        max={365}
                        formatter={value => `${value}Days`}
                    /></h2>
                    <Table scroll={{x: true}}
                        style={{marginTop:12}}
                        className="table"
                        dataSource={offlineHubs}
                        columns={offlineColumn}
                        rowKey="hub_id"
                    />
                </Card>
            </Fragment>
        )
    }
}

export default connect(mapStateToProps,{})(HubDashboard)

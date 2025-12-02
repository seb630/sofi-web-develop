import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { Pie, Progress } from '@ant-design/charts'
import moment from 'moment'
import { sortDateTime, sortString } from '@/utility/Common'
import { globalConstants } from '@/_constants'
import { Card, InputNumber, Row, Table } from 'antd'

const mapStateToProps = state => ({
    beacons: state.sofiBeacon.allBeacons || [],
    beaconModels: state.sofiBeacon.beaconModels
})

class BeaconDashboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            recentDays: 14
        }
    }

    getLatestOnline = () => {
        const latestBeaconsOnline = this.props.beacons.filter(beacon=>beacon.beacon_status==='ONLINE')
        return latestBeaconsOnline.length
    }

    generatePieData = () => {
        const { beacons, beaconModels } = this.props
        const beaconModelObj = beaconModels?.reduce((a, v) => ({ ...a, [v.name]: v.label}), {})
        let beaconObj = {}
        beaconModelObj && beacons?.map(beacon=> {
            beaconObj[beaconModelObj[beacon.model]] = beaconObj[beaconModelObj[beacon.model]]
                ? beaconObj[beaconModelObj[beacon.model]]+1
                : 1
        })
        let chartData = []
        Object.keys(beaconObj).map(key=>{
            if (key!=='null' ) {
                let record = {
                    x: key,
                    y: beaconObj[key]
                }
                chartData.push(record)
            }else {
                let record = {
                    x: 'UNKNOWN',
                    y: beaconObj[key]
                }
                chartData.push(record)
            }
        })
        return chartData
    }

    render() {
        const chartData = this.generatePieData()
        const online = this.getLatestOnline()
        const onlinePercent = (online/this.props.beacons.length*100).toFixed(0)
        const offlineBeacons = this.props.beacons.filter(beacon=> beacon.beacon_status==='OFFLINE' &&
            moment(beacon.last_message_server_received_at).add(this.state.recentDays, 'day').isAfter(moment())
        )

        const offlineColumn = [
            {
                title: 'Name',
                dataIndex: 'display_name',
                key: 'display_name',
                sorter: (a, b) => sortString(a,b,'display_name'),
                render: (text, record) =>
                    <a onClick= {() => {
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
                key: 'id',
                sorter: (a, b) => a.id-b.id,
            },
            {
                title: 'IMEI',
                dataIndex: 'imei',
                key: 'imei',
                sorter: (a, b) => sortString(a,b,'imei'),

            },
            {
                title: 'Last Message',
                dataIndex: 'last_message_server_received_at',
                key: 'last_message_server_received_at',
                defaultSortOrder: 'descend',
                sorter: (a, b) => sortDateTime(a.last_message_server_received_at, b.last_message_server_received_at),
                render: (text) => text && moment(text).format(globalConstants.LONGDATETIME_FORMAT)
            },
        ]

        const onlineProgressConfig = {
            height: 50,
            autoFit: true,
            percent: onlinePercent/100,
            color: ['#44AF86', '#E8EDF3'],
        }

        const pieConfig = {
            appendPadding: 10,
            data: chartData,
            angleField: 'y',
            colorField: 'x',
            radius: 0.9,
            innerRadius: 0.6,
            label: {
                type: 'outer',
                content: '{name} {percentage}',
            },
            statistic: {
                title:{
                    style: {
                        whiteSpace: 'pre-wrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    },
                    content: `${globalConstants.PENDANT_GENERIC}s`,
                },
                content: {
                    style: {
                        whiteSpace: 'pre-wrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    },
                    content: this.props.beacons.length,
                },
            },
            interactions: [{ type: 'element-active' }],
        }
        return (
            <Fragment>
                <Card
                    title="Beacons online"
                    className="margin-bottom"
                >
                    <h2>{`${onlinePercent}%`}</h2>
                    <Progress {...onlineProgressConfig}/>
                    <Row>
                        <span>{`Online: ${online}`}</span>
                        <span style={{ marginLeft: 16 }}>{`Offline: ${this.props.beacons.length-online}`}</span>
                        <span style={{ marginLeft: 16 }}>{`Total: ${this.props.beacons.length}`}</span>
                    </Row>
                </Card>

                <Card title="Model Versions" className="margin-bottom"><Pie {...pieConfig}/></Card>

                <Card
                    title="Recently offline beacons"
                    className="margin-bottom"
                >
                    <h2>The following {globalConstants.PENDANT_GENERIC}s have gone offline in <InputNumber
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
                        dataSource={offlineBeacons}
                        columns={offlineColumn}
                        rowKey="id"
                    />
                </Card>
            </Fragment>
        )
    }
}

export default connect(mapStateToProps,{})(BeaconDashboard)

import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { Pie, Progress } from '@ant-design/charts'
import moment from 'moment'
import { sortDateTime, sortString } from '@/utility/Common'
import { globalConstants } from '@/_constants'
import { Card, InputNumber, Row, Switch, Table } from 'antd'
import { titleCase } from 'change-case'

const mapStateToProps = state => ({
    radars: state.radar.radars,
})

class RadarDashboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            recentDays: 14,
            onlineFilter: true
        }
    }

    getLatestOnline = () => {
        const latestRadarsOnline = this.props.radars.filter(radar=>radar.status==='ONLINE')
        return latestRadarsOnline.length
    }

    generatePieData = () => {
        const { radars } = this.props
        let radarObj = {}
        radars && radars.map(radar=> {
            if (this.state.onlineFilter) {
                if (radar.status==='ONLINE') {
                    radarObj[radar.fw_version] = radarObj[radar.fw_version]
                        ? radarObj[radar.fw_version]+1
                        : 1
                }
            }else{
                radarObj[radar.fw_version] = radarObj[radar.fw_version]
                    ? radarObj[radar.fw_version]+1
                    : 1
            }
        })
        let chartData = []
        Object.keys(radarObj).map(key=>{
            if (key!=='null' ) {
                let record = {
                    x: key,
                    y: radarObj[key]
                }
                chartData.push(record)
            }else {
                let record = {
                    x: 'UNKNOWN',
                    y: radarObj[key]
                }
                chartData.push(record)
            }
        })
        return chartData
    }

    render() {
        const chartData = this.generatePieData()
        const online = this.getLatestOnline()
        const onlinePercent = (online/this.props.radars.length*100).toFixed(0)
        const offlineRadars = this.props.radars.filter(radar=> radar.status==='OFFLINE' &&
            moment(radar.last_seen_at).add(this.state.recentDays, 'day').isAfter(moment())
        )

        const offlineColumn = [
            {
                title: 'Name',
                dataIndex: 'display_name',
                key: 'display_name',
                sorter: (a, b) => sortString(a,b,'display_name'),
                render: (text, record) =>
                    <a onClick= {() => {
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
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
                sorter: (a, b) => a.id-b.id,
            },
            {
                title: 'MAC Address',
                dataIndex: 'mac_address',
                key: 'mac_address',
                sorter: (a, b) => sortString(a,b,'mac_address'),
            },
            {
                title: 'Last Message',
                dataIndex: 'last_seen_at',
                key: 'last_seen_at',
                defaultSortOrder: 'descend',
                sorter: (a, b) => sortDateTime(a.last_seen_at, b.last_seen_at),
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
                    content: `${globalConstants.RADAR_GENERIC}s`,
                },
                content: {
                    style: {
                        whiteSpace: 'pre-wrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    },
                    customHtml: ()=> <span>{this.props.radars?.filter(
                        radar=>this.state.onlineFilter ? radar.status==='ONLINE' : true).length}
                    </span>
                },
            },
            interactions: [{ type: 'element-active' }],
        }
        return (
            <Fragment>
                <Card
                    title={`${titleCase(globalConstants.RADAR_GENERIC)}s online`}
                    className="margin-bottom"
                >
                    <h2>{`${onlinePercent}%`}</h2>
                    <Progress {...onlineProgressConfig}/>
                    <Row>
                        <span>{`Online: ${online}`}</span>
                        <span style={{ marginLeft: 16 }}>{`Offline: ${this.props.radars.length-online}`}</span>
                        <span style={{ marginLeft: 16 }}>{`Total: ${this.props.radars.length}`}</span>
                    </Row>
                </Card>

                <Card
                    title="Versions"
                    className="margin-bottom"
                    extra={<Switch
                        className="ant-switch--online"
                        checkedChildren="ONLINE"
                        unCheckedChildren="ALL"
                        checked={this.state.onlineFilter}
                        onChange={checked=>this.setState({onlineFilter: checked})}
                    />}
                >
                    <Pie {...pieConfig}/>
                </Card>

                <Card
                    title={`Recent offline ${globalConstants.RADAR_GENERIC}s`}
                    className="margin-bottom"
                >
                    <h2>The following {globalConstants.RADAR_GENERIC}s have gone offline in <InputNumber
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
                        dataSource={offlineRadars}
                        columns={offlineColumn}
                        rowKey="id"
                    />
                </Card>
            </Fragment>
        )
    }
}

export default connect(mapStateToProps,{})(RadarDashboard)

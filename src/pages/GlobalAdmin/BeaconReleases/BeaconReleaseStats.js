import { Component, Fragment } from 'react'
import { actions } from 'mirrorx'
import { Pie, Progress } from '@ant-design/charts'
import { Badge, Card, Switch, Table } from 'antd'
import { sortString } from '@/utility/Common'
import { globalConstants } from '@/_constants'
import { titleCase } from 'change-case'

class BeaconReleaseStats extends Component {
    constructor(props) {
        super(props)
        this.state = {
            pieOnlineFilter: false,
            latestBeacons: this.getLatestBeacons(),
            olderBeacons: props.beacons.filter(beacon=>!this.getLatestBeacons().includes(beacon)),
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.beacons !== this.props.beacons && this.setState({
            latestBeacons: this.getLatestBeacons(),
            olderBeacons: this.props.beacons.filter(beacon=>!this.getLatestBeacons().includes(beacon))
        })
        prevProps.releases !== this.props.releases && this.setState({
            latestBeacons: this.getLatestBeacons(),
            olderBeacons: this.props.beacons.filter(beacon=>!this.getLatestBeacons().includes(beacon))
        })
    }

    getLatestBeacons = () => {
        const { releases, beacons } = this.props
        const latest = releases?.length>0 ? releases[releases.length-1].version : null
        return latest ? beacons.filter(beacon=>beacon.version === latest) : beacons
    }

    getLatestOnline = () => {
        const latestBeacons = this.getLatestBeacons()
        const latestBeaconsOnline = latestBeacons.filter(beacon=>beacon.beacon_status==='ONLINE')
        return latestBeacons.length===0 ? 0 : (latestBeaconsOnline.length/latestBeacons.length*100).toFixed(0)
    }

    generateData = () => {
        const { releases, beacons } = this.props
        let beaconObj = {}
        beacons && beacons.map(beacon=> {
            if (this.state.pieOnlineFilter) {
                if (beacon.beacon_status==='ONLINE') {
                    beaconObj[beacon.version] = beaconObj[beacon.version]
                        ? beaconObj[beacon.version] +1
                        : 1
                }
            }else{
                beaconObj[beacon.version] = beaconObj[beacon.version]
                    ? beaconObj[beacon.version] +1
                    : 1
            }
        })
        let chartData = []
        let othersCount = 0
        const lastThreeRelease = releases?.length>3 ? releases.slice(-3) : releases
        Object.keys(beaconObj).map(key=>{
            if (key!==null && releases && lastThreeRelease.find(release=>release.version===key)) {
                let record = {
                    x: key,
                    y: beaconObj[key]
                }
                chartData.push(record)
            } else if (key!=='null' && releases) {
                othersCount += beaconObj[key]
            }else if (key==='null'){
                let record = {
                    x: 'Unknown',
                    y: beaconObj[key]
                }
                chartData.push(record)
            }
        })
        chartData.push({
            x: 'Older',
            y: othersCount
        })
        return chartData
    }


    render() {
        let {latestBeacons, olderBeacons} = this.state
        const {model} = this.props
        const chartData = this.generateData()
        const latestOnline = this.getLatestOnline()
        const latestColumn = [
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
                sorter: (a, b) => a>b,
            },
            {
                title: 'Status',
                dataIndex: 'beacon_status',
                key: 'beacon_status',
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
                onFilter: (value, record) => record?.beacon_status?.includes(value),
                render(val) {
                    return <Badge status={val==='ONLINE'?'success':'error'} text={val} />
                },
            },
            {
                title: 'Software Version',
                dataIndex: 'version',
                key: 'version',
                sorter: (a, b) => sortString(a,b,'version'),
            },
        ]

        const olderColumn = [
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
                sorter: (a, b) => a>b,
            },
            {
                title: 'Status',
                dataIndex: 'beacon_status',
                key: 'beacon_status',
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
                onFilter: (value, record) => record?.beacon_status?.includes(value),
                render(val) {
                    return <Badge status={val==='ONLINE'?'success':'error'} text={val} />
                },
            },
            {
                title: 'Software Version',
                dataIndex: 'version',
                defaultSortOrder: 'descend',
                sorter: (a, b) => sortString(a,b,'version'),
            },
        ]

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
                title:false,
                content: {
                    style: {
                        whiteSpace: 'pre-wrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    },
                    customHtml: ()=> <span>{this.props.beacons?.filter(
                        beacon=>this.state.pieOnlineFilter ? beacon.beacon_status==='ONLINE' : true).length} {globalConstants.PENDANT_GENERIC}s</span>
                },
            },
            interactions: [{ type: 'element-active' }],
        }

        const latestProgressConfig = {
            height: 50,
            autoFit: true,
            percent: latestOnline/100,
            color: ['#44AF86', '#E8EDF3'],
        }

        return (
            <Fragment>
                <Card
                    loading={model===''}
                    className="margin-bottom"
                    title="Release Versions"
                    extra={<Switch
                        className="ant-switch--online"
                        checkedChildren="ONLINE"
                        unCheckedChildren="ALL"
                        checked={this.state.pieOnlineFilter}
                        onChange={checked=>this.setState({pieOnlineFilter: checked})}
                    />}
                >
                    <Pie {...pieConfig}/>
                </Card>
                <Card
                    loading={model===''}
                    title={`${titleCase(globalConstants.PENDANT_GENERIC)} on latest release online/offline`}
                    className="margin-bottom"
                >
                    <h2>{`${latestOnline}%`}</h2>
                    <Progress {...latestProgressConfig}/>
                </Card>

                <Card
                    loading={model===''}
                    title={`${titleCase(globalConstants.PENDANT_GENERIC)} on the latest version of the software`}
                    className="margin-bottom"
                >
                    <h2>{`The following ${model} ${globalConstants.PENDANT_GENERIC}s are up to date:`}</h2>
                    <Table scroll={{x: true}}
                        className="table"
                        dataSource={latestBeacons}
                        columns={latestColumn}
                        rowKey="id"
                    />
                </Card>
                <Card
                    loading={model===''}
                    title={`${titleCase(globalConstants.PENDANT_GENERIC)} on the older versions of the software`}
                >
                    <h2>{`The following ${model} ${globalConstants.PENDANT_GENERIC}s are not on the latest version:`}</h2>
                    <Table scroll={{x: true}}
                        className="table"
                        dataSource={olderBeacons}
                        columns={olderColumn}
                        rowKey="id"
                    />
                </Card>
            </Fragment>
        )
    }
}

export default BeaconReleaseStats

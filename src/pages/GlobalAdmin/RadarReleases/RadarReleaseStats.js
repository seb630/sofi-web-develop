import { Component, Fragment } from 'react'
import {actions, connect} from 'mirrorx'
import { Pie, Progress } from '@ant-design/charts'
import { Badge, Card, Switch, Table } from 'antd'
import { sortString } from '@/utility/Common'
import { globalConstants } from '@/_constants'
import { titleCase } from 'change-case'

const mapStateToProps = state => ({
    releases: state.release.radarReleases,
    radars: state.radar.radars || [],
})

class RadarReleaseStats extends Component {
    constructor(props) {
        super(props)
        this.state = {
            pieOnlineFilter: false,
            latestRadars: this.getLatestRadars(),
            olderRadars: props.radars.filter(radar=>!this.getLatestRadars().includes(radar)),
        }
    }

    componentDidUpdate(prevProps) {
        (prevProps.releases !== this.props.releases || prevProps.radars !== this.props.radars) && this.setState({
            latestRadars: this.getLatestRadars(),
            olderRadars: this.props.radars.filter(radar=>!this.getLatestRadars().includes(radar))
        })
    }

    getLatestRadars = () => {
        const { releases, radars } = this.props
        const latest = releases?.length>0 ? releases[releases.length-1].version : null
        return latest ? radars.filter(radar=>radar.fw_version === latest) : radars
    }

    getLatestOnline = () => {
        const latestRadars = this.getLatestRadars()
        const latestRadarsOnline = latestRadars.filter(radar=>radar.status==='ONLINE')
        return latestRadars.length===0 ? 0 : (latestRadarsOnline.length/latestRadars.length*100).toFixed(0)
    }

    generateData = () => {
        const { releases, radars } = this.props
        let radarObj = {}
        radars?.map(radar=> {
            if (this.state.pieOnlineFilter) {
                if (radar.status==='ONLINE') {
                    radarObj[radar.fw_version] = radarObj[radar.fw_version]
                        ? radarObj[radar.fw_version] +1
                        : 1
                }
            }else{
                radarObj[radar.fw_version] = radarObj[radar.fw_version]
                    ? radarObj[radar.fw_version] +1
                    : 1
            }
        })
        let chartData = []
        let othersCount = 0
        const lastThreeRelease = releases?.length>3 ? releases.slice(-3) : releases
        Object.keys(radarObj).map(key=>{
            if (key!==null && releases && lastThreeRelease.find(release=>release.version===key)) {
                let record = {
                    x: key,
                    y: radarObj[key]
                }
                chartData.push(record)
            } else if (key!=='null' && releases) {
                othersCount += radarObj[key]
            }else if (key==='null'){
                let record = {
                    x: 'Unknown',
                    y: radarObj[key]
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
        let {latestRadars, olderRadars} = this.state
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
                sorter: (a, b) => a>b,
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
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
                onFilter: (value, record) => record?.status?.includes(value),
                render(val) {
                    return <Badge status={val==='ONLINE'?'success':'error'} text={val} />
                },
            },
            {
                title: 'Software Version',
                dataIndex: 'fw_version',
                key: 'fw_version',
                sorter: (a, b) => sortString(a,b,'fw_version'),
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
                sorter: (a, b) => a>b,
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
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
                onFilter: (value, record) => record?.status?.includes(value),
                render(val) {
                    return <Badge status={val==='ONLINE'?'success':'error'} text={val} />
                },
            },
            {
                title: 'Software Version',
                dataIndex: 'fw_version',
                defaultSortOrder: 'descend',
                sorter: (a, b) => sortString(a,b,'fw_version'),
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
                    customHtml: ()=> <span>{this.props.radars?.filter(
                        radar=>this.state.pieOnlineFilter ? radar.status==='ONLINE' : true).length} {globalConstants.RADAR_GENERIC}s</span>
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
                    title={`${titleCase(globalConstants.RADAR_GENERIC)} on latest release online/offline`}
                    className="margin-bottom"
                >
                    <h2>{`${latestOnline}%`}</h2>
                    <Progress {...latestProgressConfig}/>
                </Card>

                <Card
                    title={`${titleCase(globalConstants.RADAR_GENERIC)} on the latest version of the software`}
                    className="margin-bottom"
                >
                    <h2>{`The following ${globalConstants.RADAR_GENERIC}s are up to date:`}</h2>
                    <Table scroll={{x: true}}
                        className="table"
                        dataSource={latestRadars}
                        columns={latestColumn}
                        rowKey="id"
                    />
                </Card>
                <Card
                    title={`${titleCase(globalConstants.RADAR_GENERIC)} on the older versions of the software`}
                >
                    <h2>{`The following ${globalConstants.RADAR_GENERIC}s are not on the latest version:`}</h2>
                    <Table scroll={{x: true}}
                        className="table"
                        dataSource={olderRadars}
                        columns={olderColumn}
                        rowKey="id"
                    />
                </Card>
            </Fragment>
        )
    }
}

export default connect(mapStateToProps,{})(RadarReleaseStats)

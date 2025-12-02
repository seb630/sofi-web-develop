import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { Pie, Progress } from '@ant-design/charts'
import { Badge, Card, Switch, Table } from 'antd'
import { sortString } from '@/utility/Common'
import { globalConstants } from '@/_constants'
import { titleCase } from 'change-case'

const mapStateToProps = state => ({
    releases: state.release.releases,
    hubs: state.hub.hubs
})

class ReleaseDashboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            pieOnlineFilter: false,
            latestHubs: this.getLatestHubs(),
            olderHubs: props.hubs.filter(hub=>!this.getLatestHubs().includes(hub))
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.hubs !== this.props.hubs && this.setState({
            latestHubs: this.getLatestHubs(),
            olderHubs: this.props.hubs.filter(hub=>!this.getLatestHubs().includes(hub))
        })
        prevProps.releases !== this.props.releases && this.setState({
            latestHubs: this.getLatestHubs(),
            olderHubs: this.props.hubs.filter(hub=>!this.getLatestHubs().includes(hub))
        })
    }

    getLatestHubs = () => {
        const { releases, hubs } = this.props
        let latest = releases && releases.sort((a, b) => (a.release_id - b.release_id))[releases.length-1].version
        return hubs.filter(hub=>hub.hub_app_version === latest)
    }

    getLatestOnline = () => {
        const latestHubs = this.getLatestHubs()
        const latestHubsOnline = latestHubs.filter(hub=>hub.connectivity_state==='ONLINE')
        return latestHubs.length===0 ? 0 : (latestHubsOnline.length/latestHubs.length*100).toFixed(0)
    }

    generateData = () => {
        const { releases, hubs } = this.props
        let hubObj = {}
        hubs && hubs.map(hub=> {
            if (this.state.pieOnlineFilter) {
                if (hub.connectivity_state==='ONLINE') {
                    hubObj[hub.hub_app_version] = hubObj[hub.hub_app_version]
                        ? hubObj[hub.hub_app_version] +1
                        : 1
                }
            }else{
                hubObj[hub.hub_app_version] = hubObj[hub.hub_app_version]
                    ? hubObj[hub.hub_app_version] +1
                    : 1
            }
        })
        let chartData = []
        let othersCount = 0
        const lastThreeRelease = releases?.length>3 ? releases.slice(-3) : releases
        Object.keys(hubObj).map(key=>{
            if (key!==null && releases && lastThreeRelease.find(release=>release.version===key)) {
                let record = {
                    x: key,
                    y: hubObj[key]
                }
                chartData.push(record)
            } else if (key!=='null' && releases) {
                othersCount += hubObj[key]
            }else if (key==='null'){
                let record = {
                    x: 'Unknown',
                    y: hubObj[key]
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
        const { releases } = this.props
        const latest = releases && releases.sort((a, b) => (a.release_id - b.release_id))[releases.length-1].version
        let {latestHubs, olderHubs} = this.state
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
                title: 'Connectivity',
                dataIndex: 'connectivity_state',
                key: 'connectivity_state',
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
                title: 'Software Version',
                dataIndex: 'hub_app_version',
                key: 'hub_app_version',
                sorter: (a, b) => sortString(a,b,'hub_app_version'),
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
                title: 'Connectivity',
                dataIndex: 'connectivity_state',
                key: 'connectivity_state',
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
                title: 'Software Version',
                dataIndex: 'hub_app_version',
                key: 'hub_app_version',
                defaultSortOrder: 'descend',
                sorter: (a, b) => sortString(a,b,'hub_app_version'),
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
                    customHtml: ()=><span>{this.props.hubs && this.props.hubs.filter(
                        hub=>this.state.pieOnlineFilter ? hub.connectivity_state==='ONLINE' : true).length}{globalConstants.HUB_GENERIC}s</span>
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
                    title={`${titleCase(globalConstants.HUB_GENERIC)}s on latest release online/offline`}
                    className="margin-bottom"
                >
                    <h2>{`${latestOnline}%`}</h2>
                    <Progress {...latestProgressConfig}/>
                </Card>
                <Card
                    title={`${titleCase(globalConstants.HUB_GENERIC)}s on the latest version of the software - latest version is: ${latest}`}
                    className="margin-bottom"
                >
                    <h2>The following {globalConstants.HUB_GENERIC}s are up to date:</h2>
                    <Table scroll={{x: true}}
                        className="table"
                        dataSource={latestHubs}
                        columns={latestColumn}
                        rowKey="hub_id"
                    />
                </Card>
                <Card
                    title={`${titleCase(globalConstants.HUB_GENERIC)}s on the older versions of the software`}
                    className="margin-bottom"
                >
                    <h2>The following {globalConstants.HUB_GENERIC}s are not on the latest version of the software:</h2>
                    <Table scroll={{x: true}}
                        className="table"
                        dataSource={olderHubs}
                        columns={olderColumn}
                        rowKey="hub_id"
                    />
                </Card>
            </Fragment>
        )
    }
}

export default connect(mapStateToProps,{})(ReleaseDashboard)

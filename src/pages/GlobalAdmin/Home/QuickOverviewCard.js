import { Button, Card, Col, Row, Space, Typography } from 'antd'
import { actions, connect } from 'mirrorx'
import { titleCase } from 'change-case'
import { globalConstants } from '@/_constants'
import { useEffect, useState } from 'react'
import moment from 'moment-timezone'
import { ReloadOutlined } from '@ant-design/icons'
import { Pie } from '@ant-design/charts'
import colours from '@/scss/colours.scss'

const mapStateToProps = state => ({
    providers: state.SIM.providers,
    hubs: state.hub.hubs,
    radars: state.radar.radars,
    beacons: state.sofiBeacon.allBeacons
})

const PieChartCol = (props) => {
    const {online, offline, title} = props

    const pieConfig = {
        height: 200,
        width: 200,
        appendPadding: 10,
        data: [
            {type: 'Online', value: online},
            {type: 'Offline', value: (online+offline)===0 ? 1: offline}
        ],
        legend: false,
        angleField: 'value',
        colorField: 'type',
        label: null,
        tooltip: !!(online+offline),
        color: ({ type }) => {
            if(type === 'Online'){
                return colours.blue
            }
            return colours.lightText
        },
        radius: 0.9,
    }

    return <Col xs={12} lg={6}>
        <Pie {...pieConfig} />
        <Space direction="vertical" size="small" style={{ display: 'flex' }}>
            <Typography.Title level={5}>
                {title}
            </Typography.Title>
            <Row gutter={12} wrap={false}>
                <Col span={12}>Online:</Col>
                <Col span={8}>{online}</Col>
            </Row>
            <Row gutter={12} wrap={false}>
                <Col span={12}>Offline:</Col>
                <Col span={8}>{offline}</Col>
            </Row>
            <Row gutter={12} wrap={false}>
                <Col span={12}>Online %:</Col>
                <Col span={8}>{(online+offline)===0 ? '0%' : (online/(online+offline)).toLocaleString('en',{style: 'percent'})}</Col>
            </Row>
        </Space>
    </Col>
}

const QuickOverviewCard = (props) => {
    moment.tz.setDefault(moment.tz.guess())
    const {hubs, radars, beacons} = props
    const [updateTime, setUpdateTime] =useState(moment())
    const [loading, setLoading] = useState(false)
    useEffect(()=>refresh(),[])

    const renderTitle = () => {
        return <Space size={[8, 16]} wrap><span>Quick Overview</span><span className="desc">As of {updateTime.format('DD/MM/YYYY HH:mm:ss (z)')}</span></Space>
    }

    const renderExtra = () => {
        return <Space>
            {loading && <span>Disabled for 20s...</span>}
            <Button icon={<ReloadOutlined/>} type="primary" onClick={handleRefreshButton} loading={loading}>Refresh</Button>
        </Space>
    }

    const handleRefreshButton = () => {
        setLoading(true)
        setUpdateTime(moment())
        refresh().finally(()=>setTimeout(()=>setLoading(false),10000))
    }

    const refresh = () => {
        let promises = []
        promises.push(actions.sofiBeacon.fetchAllBeacons())
        promises.push(actions.hub.getHubs())
        promises.push(actions.radar.fetchAllRadars())
        return Promise.all(promises)
    }

    return <Card title={renderTitle()} extra={renderExtra()}>
        <Row gutter={[12,12]}>
            {hubs && <PieChartCol
                title={`${titleCase(globalConstants.HUB_GENERIC)}s`}
                online={hubs?.filter(hub=>hub.connectivity_state==='ONLINE')?.length}
                offline={hubs?.filter(hub=>hub.connectivity_state==='OFFLINE')?.length}
            />}

            {beacons && <PieChartCol
                title={`${titleCase(globalConstants.PENDANT_GENERIC)}s (20min lookback)`}
                online={beacons?.filter(beacon=>beacon?.last_message_server_received_at && moment().isBefore(moment(beacon.last_message_server_received_at).add(20,'minutes')))?.length}
                offline={beacons?.filter(beacon=>!(beacon?.last_message_server_received_at && moment().isBefore(moment(beacon.last_message_server_received_at).add(20,'minutes'))))?.length}
            />}

            {beacons && <PieChartCol
                title={`${titleCase(globalConstants.PENDANT_GENERIC)}s (60min lookback)`}
                online={beacons?.filter(beacon=>beacon?.last_message_server_received_at && moment().isBefore(moment(beacon.last_message_server_received_at).add(60,'minutes')))?.length}
                offline={beacons?.filter(beacon=>!(beacon?.last_message_server_received_at && moment().isBefore(moment(beacon.last_message_server_received_at).add(60,'minutes'))))?.length}
            />}

            {radars && <PieChartCol
                title={`${titleCase(globalConstants.RADAR_GENERIC)}s`}
                online={radars?.filter(radar=>radar.status==='ONLINE')?.length}
                offline={radars?.filter(radar=>radar.status!=='ONLINE')?.length}
            />}
        </Row>
    </Card>
}

export default connect(mapStateToProps, {})(QuickOverviewCard)

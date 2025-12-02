import { Component } from 'react'
import moment from 'moment'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Col, Collapse, Row, Table, Tooltip } from 'antd'
import { globalConstants } from '@/_constants'
import { getSpaceIcons, sortDateTime, sortString } from '@/utility/Common'
import SensorBattery from '../../../components/SensorBattery'

export default class Sensors extends Component{
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    renderTooltipedStatus = (item) => {
        const doorSensor = item.device_kind==='CONTACT'
        return <div>
            {this.props.hub.connectivity_state==='OFFLINE' ?
                <Tooltip title={`${globalConstants.HUB_SOFIHUB} is offline, switch ${globalConstants.HUB_GENERIC} on for accurate sensor data`}>
                    <span className='deviceStatus deviceStatus-offline'>OFFLINE</span>
                </Tooltip> : doorSensor ? <span className={`deviceStatus deviceStatus-${item.action_state?.toLowerCase()}`}>{item.action_state}</span>
                    :<span className={`deviceStatus deviceStatus-${item.status?.toLowerCase()}`}>{item.status}</span>
            }
        </div>
    }

    render(){
        const dataSource = this.props.sensors

        const columns = [
            {
                title:<div>Name
                    <Tooltip title={globalConstants.NAMETOOLTIP}>
                        <InfoCircleOutlined className="sensorInfoIcon" />
                    </Tooltip></div>,
                dataIndex: 'device_name',
                key: 'device_name',
                render: (text, item) => <Row gutter={8}>
                    <Col xs={24} md={6} lg={8} xxl={4}>{getSpaceIcons(text, item, this.props.hub.connectivity_state==='OFFLINE')}</Col>
                    <Col xs={24} md={18} lg={16} xxl={20}>{text}</Col>
                </Row>,
                defaultSortOrder: 'ascend',
                sorter: (a, b) => sortString(a,b,'device_name'),
            },
            {
                title: <div>
                    Status
                    <Tooltip title={<div>
                        <b>Status Column:</b><br/>
                        Click or hover on a sensor status to see its last heartbeat time.
                        <br/>
                        <b>What do the different statuses mean?</b><br/>

                        <span className="greenTooltip">Online </span>
                        <span>= Sensor working correctly.</span><br/>
                        <span className="orangeTooltip">Warning </span>
                        <span>= Sofihub has not received anything from the sensor for over an hour.</span><br/>
                        <span className="redTooltip">Offline </span>
                        <span>= Sofihub has not received anything from the sensor for over two hours.</span><br/>
                        It is expected that sensors will send at least a heartbeat to Sofihub once per hour.
                        Sofihub regards the sensor as offline if two heartbeats are missed consecutively.<br/>

                        An offline sensor needs action immediately, otherwise the {globalConstants.HUB_SOFIHUB} may not work correctly.
                        Typically an offline sensor indicates its batteries are flat, replace the batteries as soon as possible.
                    </div>}>
                        <InfoCircleOutlined className="sensorInfoIcon" />
                    </Tooltip>
                </div>,
                dataIndex: 'status',
                key: 'status',
                render: (text, item)=> this.renderTooltipedStatus(item),
                align: 'center',
            },
            {
                title:<div>Triggered
                    <Tooltip title={globalConstants.TRIGGEREDTOOLTIP}>
                        <InfoCircleOutlined className="sensorInfoIcon" />
                    </Tooltip> </div>,
                dataIndex: 'last_motion_at',
                key: 'last_motion_at',
                render: (text, item)=> this.props.hub.connectivity_state==='OFFLINE' ? <span>N/A</span> :
                    item.status === 'ONLINE' ?
                        <span>{item.last_motion_at ? moment(item.last_motion_at).fromNow() : 'Not Yet Reported'}</span>: null,
                sorter: (a, b) => sortDateTime(a.last_motion_at,b.last_motion_at,),
                align: 'center',
            },
            {
                title:<div>Battery
                    <Tooltip title={globalConstants.BATTERYTOOLTIP}>
                        <InfoCircleOutlined className="sensorInfoIcon" />
                    </Tooltip></div>,
                dataIndex: 'battery_level',
                key: 'battery_level',
                render: (text, item)=> this.props.hub.connectivity_state==='OFFLINE' ? <span>N/A</span>
                    :item.status === 'ONLINE' ? <SensorBattery admin={this.props.admin} battery={item.battery_level} /> : null,
                align: 'center',
                sorter: (a, b) => a.battery_level-b.battery_level
            }
        ]

        return(
            <Collapse expandIconPosition={'end'} defaultActiveKey={'1'} className='sensorCard'>
                <Collapse.Panel key='1' header='Sensors'>
                    <Table scroll={{x: true}}
                        size="small"
                        bordered
                        pagination={false}
                        loading={this.props.sensors===null}
                        dataSource={dataSource}
                        columns={columns}
                        rowKey='device_id'
                    />
                </Collapse.Panel>
            </Collapse>
        )
    }
}



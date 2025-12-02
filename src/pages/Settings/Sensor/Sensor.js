import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Divider, message, Modal, Popconfirm, Row, Table, Tooltip } from 'antd'
import EditableCell, { EditableContext, EditableFormRow } from '../../../utility/EditableTable'
import SensorPairingModal from './SensorPairing'
import { isMobile } from 'react-device-detect'
import _ from 'lodash'
import { getSpaceIcons } from '@/utility/Common'
import moment from 'moment'
import TroubleShootModal from './TroubleShootModal'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    hubDevices: state.hub.hubDevices,
    hubSpaces: state.hub.hubSpaces,
    sensors: state.hub.sensors
})


class Sensor extends Component{
    constructor(props) {
        super(props)
        this.state = {
            editingKey: '',
            addSensorModal: false,
            replace: false,
            troubleshootingModal: false,
            device: null,
        }

    }

    save(form, device_id) {
        form.validateFields((error, row) => {
            if (error) {
                return
            }
            const hubId = this.props.selectedHub.hub_id
            const device = {
                hub_id: hubId,
                device_kind: 'MOTION',
                device_id,
                ...row
            }
            actions.hub.updateHubDevice({hubId, device})
            this.setState({ editingKey: '' })
        })
    }

    handleAdd = () => {
        this.handleModalState(true)
        this.setState({replace: false, device: null})
    }

    handleModalState = (state) => {
        this.setState({addSensorModal: state})
    }

    handleTroubleShootModalState = (state) => {
        this.setState({troubleshootingModal: state})
    }

    isEditing = (record) => {
        return record.device_id === this.state.editingKey
    }

    replace = (record) => {
        this.handleModalState(true)
        this.setState({replace: true, device: record})
    }

    troubleshooting = (record) => {
        this.handleTroubleShootModalState(true)
        actions.hub.getDeviceIntervalConfig(record.device_id)
        this.setState({device: record})
    }

    remove = (record) => {
        Modal.confirm({
            width: 700,
            title: 'Are you sure you wish to remove this sensor?',
            content: <div>
                <p>You&#39;re about to remove the {record.device_name} sensor. This action will:</p>
                <ul>
                    <li>Mean any new data sent from the sensor will be ignored if it is still operational.</li>
                    <li>The room the sensor is allocated to will not be deleted, all historical occupancy data will
                        remain.</li>
                </ul>
            </div>,
            okText: 'Remove Sensor',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
                actions.hub.removeSensor(record).catch((e)=>message.error(e.message))
            },
        })
    }

    edit(key) {
        this.setState({ editingKey: key })
    }

    cancel = () => {
        this.setState({ editingKey: '' })
    }

    renderTooltipedStatus = (item) => {
        const doorSensor = item.device_kind==='CONTACT'
        return <div>
            {this.props.selectedHub.connectivity_state==='OFFLINE' ?
                <Tooltip title={`${globalConstants.HUB_SOFIHUB} is offline, switch it on for accurate sensor data`}>
                    <span className='deviceStatus deviceStatus-offline'>OFFLINE</span>
                </Tooltip> : doorSensor ? <span className={`deviceStatus deviceStatus-${item.action_state?.toLowerCase()}`}>{item.action_state}</span>
                    :<span className={`deviceStatus deviceStatus-${item.status?.toLowerCase()}`}>{item.status}</span>
            }
        </div>
    }

    render(){
        const {sensors, hubDevices} = this.props
        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell,
            },
        }
        const initialColumns = this.props.selectedHub && [
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (text, item)=> {
                    return <Tooltip title={<div>
                        <div>
                        Triggered: {item.last_motion_at ? moment(item.last_motion_at).fromNow() : 'Not Yet Reported'}
                        </div>
                        <div>
                        Heartbeat: {item.last_active_at ? moment(item.last_active_at).fromNow() : 'Not Yet Reported'}
                        </div>
                    </div>}>
                        {this.renderTooltipedStatus(item)}
                    </Tooltip>},
                align: 'center',
            },
            {
                title: 'Name of Sensor',
                dataIndex: 'device_name',
                key: 'device_name',
                align: 'center',
                sorter: (a, b) => a.device_name.localeCompare(b.device_name),
                defaultSortOrder: 'ascend',
                editable: true,
                render: (text, item) => <Row gutter={8}>
                    <Col xs={24} md={6} lg={8} xxl={4}>{getSpaceIcons(text, item, this.props.selectedHub.connectivity_state==='OFFLINE')}</Col>
                    <Col xs={24} md={18} lg={16} xxl={20}>{text}</Col>
                </Row>,
            },
            {
                title: 'Located in the Space',
                dataIndex: 'space_id',
                key: 'space_id',
                sorter: (a, b) => a.space_id - b.space_id,
                render: (text, record) => (
                    this.props.hubSpaces && this.props.hubSpaces.find(space=>space.space_id===record.space_id) &&
                    this.props.hubSpaces.find(space=>space.space_id===record.space_id).name
                ),
                editable: true,
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, record) => {
                    const editable = this.isEditing(record)
                    return (
                        <div>
                            {editable ? (
                                <span>
                                    <EditableContext.Consumer>
                                        {form => (
                                            <a
                                                onClick={() => this.save(form, record.device_id)}
                                                style={{ marginRight: 8 }}
                                            >
                                                Save
                                            </a>
                                        )}
                                    </EditableContext.Consumer>
                                    <Popconfirm
                                        title="Sure to cancel?"
                                        onConfirm={this.cancel}
                                    >
                                        <a>Cancel</a>
                                    </Popconfirm>
                                </span>
                            ) : (
                                <div>
                                    <a onClick={() => this.edit(record.device_id)}>Edit</a>
                                    <Divider type="vertical"/>
                                    <a onClick={() => this.replace(record)}>Replace</a>
                                    <Divider type="vertical"/>
                                    <a onClick={() => this.remove(record)}>Remove</a>
                                    <br/>
                                    <a onClick={() => this.troubleshooting(record)}>Config & Troubleshooting</a>
                                </div>
                            )}
                        </div>
                    )
                },
            }
        ]

        const columns = initialColumns?.map((col) => {
            if (!col.editable) {
                return col
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: this.isEditing(record),
                }),
            }
        })
        const dataSource = _.map(sensors, function(obj) {
            return _.assign(obj, _.find(hubDevices, {
                device_id: obj.device_id
            }))
        })

        const sensorTitle = <div className="tableTitle">
            This is where you can see all your current sensors, and the spaces (or rooms)
            they are located within the home. You can add new sensors and allocate them to rooms,
            replace them, or delete them. A sensor must be allocated to a space. To add, edit, or
            remove spaces please change to the spaces tab.
        </div>
        const renderTable =  <Table
            scroll={{x: true}}
            title={()=> sensorTitle}
            dataSource={dataSource}
            columns={columns}
            rowKey="device_id"
            components={components}
            footer={()=>
                <Row>
                    <Button type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleAdd}>Add Sensor</Button>
                </Row>}
        />
        return (
            <Fragment>
                {isMobile ?
                    <Fragment>
                        <Row type="flex" justify="center">
                            <Col xs={22} xl={16}>
                                <h4>Sensor</h4>
                            </Col>
                        </Row>
                        <Row type="flex" justify="center">
                            <Col xs={22} xl={16}>
                                {renderTable}
                            </Col>
                        </Row>
                    </Fragment>
                    : <Row justify="center">
                        <Col xs={22} xl={16}>
                            <Card className="beacon-card" title="Sensor">
                                {renderTable}
                            </Card>
                        </Col>
                    </Row>
                }
                <SensorPairingModal
                    open={this.state.addSensorModal}
                    onClose={()=>this.handleModalState(false)}
                    replace={this.state.replace}
                    currentDevice={this.state.device}
                />
                <TroubleShootModal
                    open={this.state.troubleshootingModal}
                    onClose={()=>this.handleTroubleShootModalState(false)}
                    device={this.state.device}
                    selectedHub={this.props.selectedHub}
                />
            </Fragment>
        )
    }
}


export default connect(mapStateToProps, null) (Sensor)

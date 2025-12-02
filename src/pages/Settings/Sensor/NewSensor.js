import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { Card, Col, Divider, Modal, Row, Table } from 'antd'
import { sortDateTime } from '@/utility/Common'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import AllocateSpaceModal from './AllocateSpaceModal'
import { isMobile } from 'react-device-detect'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    hubSpaces: state.hub.hubSpaces,
    hubNewDevices: state.hub.hubNewDevices
})


class NewSensor extends Component{
    constructor(props) {
        super(props)
        this.state = {
            deviceId: null,
            allocateModal: false,
        }

        this.columns = [
            {
                title: 'New Device ID',
                dataIndex: 'device_id',
                key: 'device_id',
                sorter: (a, b) => a.device_id - b.device_id,
            },
            {
                title: 'Provider ID',
                dataIndex: 'provider_id',
                key: 'provider_id',
                defaultSortOrder: 'ascend',
                sorter: (a, b) => a.provider_id - b.provider_id,
            },
            {
                title: 'Paired At',
                dataIndex: 'created_at',
                key: 'created_at',
                defaultSortOrder: 'descend',
                sorter: (a, b) => sortDateTime(a.created_at, b.created_at),
                render: (text) => text && moment(text).format(globalConstants.LONGDATETIME_FORMAT)
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, record) => {
                    return (
                        <div>
                            <a onClick={() => this.allocate(record.device_id)}>Allocate</a>
                            <Divider type="vertical"/>
                            <a onClick={() => this.remove(record)}>Remove</a>
                        </div>
                    )
                },
            }
        ]
    }

    handleModalState = (state) => {
        this.setState({allocateModal: state})
    }

    remove = (record) => {
        Modal.confirm({
            width: 700,
            title: 'Are you sure you wish to remove this sensor?',
            content: <div>
                <p>You&#39;re about to remove a sensor. This action will:</p>
                <ul>
                    <li>Mean any new data sent from the sensor will be ignored if it is still operational.</li>
                </ul>
            </div>,
            okText: 'Remove Sensor',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
                actions.hub.removeNewSensor(record)
            },
        })
    }

    allocate(deviceId) {
        this.setState({ deviceId: deviceId, allocateModal: true })
    }

    render(){
        const columns = this.columns
        const dataSource = this.props.hubNewDevices
        const sensorTitle = <div className="tableTitle">
            This is where you can see all your new sensors, which have been paired but have not been named or added to a space.
        </div>

        const renderTable = <Table scroll={{x: true}}
            title={()=> sensorTitle}
            dataSource={dataSource}
            columns={columns}
            rowKey="device_id"
            pagination={false}
        />

        return (
            <Fragment>
                {isMobile ?
                    <Fragment>
                        <Row type="flex" justify="center">
                            <Col xs={22} xl={16}>
                                <h4>New Sensor</h4>
                            </Col>
                        </Row>
                        <Row type="flex" justify="center">
                            <Col xs={22} xl={16}>
                                {renderTable}
                            </Col>
                        </Row>
                    </Fragment>
                    : <Row type="flex" justify="center">
                        <Col xs={22} xl={16}>
                            <Card className="beacon-card" title="New Sensor">
                                {renderTable}
                            </Card>
                        </Col>
                    </Row>
                }
                <AllocateSpaceModal
                    hubId={this.props.selectedHub.hub_id}
                    open={this.state.allocateModal}
                    onCancel={()=>this.handleModalState(false)}
                    hubSpaces={this.props.hubSpaces}
                    deviceId={this.state.deviceId}
                />
            </Fragment>
        )
    }
}


export default connect(mapStateToProps, null) (NewSensor)

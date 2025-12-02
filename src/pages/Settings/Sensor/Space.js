import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Divider, Modal, Popconfirm, Row, Table } from 'antd'
import EditableCell, { EditableContext, EditableFormRow } from '../../../utility/EditableTable'
import changeCase from 'change-case'
import NewSpaceModal from './SensorPairing/NewSpaceModal'
import { isMobile } from 'react-device-detect'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    hubSpaces: state.hub.hubSpaces,
    hubDevices: state.hub.hubDevices,
})

class Space extends Component{
    constructor(props) {
        super(props)
        this.state = {
            editingKey: '',
            newSpaceModal: false
        }
    }

    remove = (record) => {
        const sensors = this.props.hubDevices
        Modal.confirm({
            width: 700,
            title: 'Are you sure you wish to delete this space?',
            content: <div>
                <p>If you delete the space: {record.name}, you will no longer be able to associate sensors with it.
                All historical occupancy data (that is when motion was detected in the space) will remain, you will be
                able to access it via the Timeline view, if you select dates before today.</p>
                <p>Are you sure you wish to delete the space: {record.name}?</p>
            </div>,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
                actions.hub.removeSpace(record).catch(()=> Modal.error({
                    width: 700,
                    title: 'You cannot delete this space!',
                    content: <div>
                        <p>
                            The space {record.name} cannot be deleted because there is still at least one sensor
                            attached to it. You must first assign those sensors to new or other existing spaces, or
                            delete the sensor. The following sensors are still assigned to this space:
                        </p>
                        <ul>
                            {sensors.filter(device=> device.space_id === record.space_id).map(device=>
                                <li key={device.device_id}>
                                    {device.device_name}
                                </li>
                            )}
                        </ul>
                    </div>,
                })
                )
            },
        })
    }

    save(form, space_id) {
        form.validateFields((error, row) => {
            if (error) {
                return
            }
            const hubId = this.props.selectedHub.hub_id
            const space = {
                hub_id: hubId,
                space_id,
                ...row
            }
            actions.hub.updateHubSpace({hubId, space})
            this.setState({ editingKey: '' })
        })
    }

    handleNewSpaceModalOpen = (state) => {
        this.setState({newSpaceModal: state})
    }

    handleAdd = () => {
        this.handleNewSpaceModalOpen(true)
    }

    isEditing = (record) => {
        return record.space_id === this.state.editingKey
    }

    edit = (key) => {
        this.setState({ editingKey: key })
    }

    cancel = () => {
        this.setState({ editingKey: '' })
    }

    render(){
        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell,
            },
        }

        const initialColumns = [
            {
                title: 'Name of Space',
                dataIndex: 'name',
                key: 'name',
                sorter: (a, b) => a.name.localeCompare(b.name),
                defaultSortOrder: 'ascend',
                editable: true,
            },
            {
                title: 'Type of Space',
                dataIndex: 'kind',
                key: 'kind',
                sorter: (a, b) => a.kind.localeCompare(b.kind),
                render: (text) => changeCase.titleCase(text),
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
                                                onClick={() => this.save(form, record.space_id)}
                                                style={{ marginRight: 8 }}
                                            >
                                                Save
                                            </a>
                                        )}
                                    </EditableContext.Consumer>
                                    <Popconfirm
                                        title="Sure to cancel?"
                                        onConfirm={() => this.cancel()}
                                    >
                                        <a>Cancel</a>
                                    </Popconfirm>
                                </span>
                            ) : (<div>
                                <a onClick={() => this.edit(record.space_id)} >Edit</a>
                                <Divider type="vertical"/>
                                <a onClick={() => this.remove(record)}>Delete</a>
                            </div>
                            )}
                        </div>
                    )
                },
            }
        ]

        const columns = initialColumns.map((col) => {
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

        const dataSource = this.props.hubSpaces

        const spaceTitle = <div className="tableTitle">
            This is where you can see all of the spaces in your home. A gentle reminder that a space does not
                necessarily have to have a sensor associated with it. Here you can add a new space, edit, or delete a
                space. A space has a name example: &quot;Master Bedroom&quot;, and a type example: &quot;Bedroom&quot;.
            To add or update a sensor or {globalConstants.RADAR_HOBA}&#39;s space: please change to the sensor or {globalConstants.RADAR_HOBA} tab and edit the
            appropriate device.
        </div>

        const renderTable = <Table scroll={{x: true}}
            className="table"
            dataSource={dataSource}
            columns={columns}
            rowKey="space_id"
            pagination={false}
            components={components}
            title={() => spaceTitle}
            footer={() =>
                <Row>
                    <Button type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleAdd}>Add Space</Button>
                </Row>}
        />
        return (
            <Fragment>
                {isMobile ?
                    <Fragment>
                        <Row type="flex" justify="center">
                            <Col xs={22} xl={16}>
                                <h4>Space</h4>
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
                            <Card className="beacon-card" title="Space">
                                {renderTable}
                            </Card>
                        </Col>
                    </Row>
                }
                <NewSpaceModal
                    onCancel={()=>this.handleNewSpaceModalOpen(false)}
                    open={this.state.newSpaceModal}
                    hubId = {this.props.selectedHub.hub_id}
                />
            </Fragment>
        )
    }
}


export default connect(mapStateToProps, null) (Space)

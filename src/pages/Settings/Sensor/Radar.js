import { Badge, Card, Col, Divider, message, Modal, Popconfirm, Row, Table } from 'antd'
import EditableCell, { EditableContext, EditableFormRow } from '@/utility/EditableTable'
import { useState } from 'react'
import { actions } from 'mirrorx'
import LinkRadarModal from '@/pages/Settings/Sensor/LinkRadarModal'
import { globalConstants } from '@/_constants'

const HubRadars = (props) => {

    const [editingKey, setEditingKey] = useState()
    // const [addModal, setAddModal] = useState(false)

    const isEditing = (radar) => radar.id === editingKey

    const remove = (radar) => {
        Modal.confirm({
            title: `Are you sure you wish to remove this ${globalConstants.RADAR_HOBA}?`,
            okText: 'Remove',
            onOk: ()=>handleUnlinkRadar(radar)
        })
    }

    const handleUnlinkRadar = async (radar) => {
        try {
            const { selectedHub } = props
            await actions.radar.unLinkRadarHub({
                id: radar.id,
                hub_id: selectedHub.hub_id
            }).then(()=>{
                actions.hub.getHubRadars(selectedHub.hub_id)
            })
        } catch (err) {
            err.global_errors && err.global_errors.map((msg) => {
                message.error(msg)
            })
        }
    }

    const save = (form, radar) => {
        form.validateFields((error, row) => {
            if (error) {
                return
            }
            const payload = {
                ...radar,
                ...row,
                old_space_id: radar.space_id
            }
            let promises = []
            promises.push(actions.radar.saveRadarInfo(payload))
            promises.push(actions.radar.editRadarSpace(payload))
            Promise.all(promises).then(()=>{
                actions.hub.getHubRadars(props.selectedHub.hub_id)
            })
            setEditingKey('')
        })
    }

    const radarTitle = <div className="tableTitle">
        This is where you can see all your current {globalConstants.RADAR_HOBA}s associated with this {globalConstants.HUB_SOFIHUB} and the spaces
        they are associated with. You can add new {globalConstants.RADAR_HOBA}s and allocate them to a space, you can edit an existing {globalConstants.RADAR_HOBA},
        or remove a {globalConstants.RADAR_HOBA}. A {globalConstants.RADAR_HOBA} must be associated with a space.
    </div>

    const components = {
        body: {
            row: EditableFormRow,
            cell: EditableCell,
        },
    }
    const initialColumns = [
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: text=> <Badge status={text==='ONLINE'?'success':'error'} text={text} />,
        },
        {
            title: `${globalConstants.RADAR_HOBA} Display Name`,
            dataIndex: 'display_name',
            key: 'display_name',
            sorter: (a, b) => a.display_name.localeCompare(b.display_name),
            defaultSortOrder: 'ascend',
            editable: true,
        },
        {
            title: 'Located in the Space',
            dataIndex: 'space_id',
            key: 'space_id',
            render: (text, record) => (record.name),
            editable: true,
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => {
                const editable = isEditing(record)
                return (
                    <div>
                        {editable ? (
                            <span>
                                <EditableContext.Consumer>
                                    {form => (
                                        <a
                                            onClick={() => save(form, record)}
                                            style={{ marginRight: 8 }}
                                        >
                                                Save
                                        </a>
                                    )}
                                </EditableContext.Consumer>
                                <Popconfirm
                                    title="Sure to cancel?"
                                    onConfirm={()=>setEditingKey(null)}
                                >
                                    <a>Cancel</a>
                                </Popconfirm>
                            </span>
                        ) : (
                            <div>
                                <a onClick={() => setEditingKey(record.id)}>Edit</a>
                                <Divider type="vertical"/>
                                <a onClick={() => remove(record)}>Remove</a>
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
                editing: isEditing(record),
            }),
        }
    })
    const dataSource = props.hubRadars?.map(record=>({...record.radar,...record.space}))

    return (
        <Row justify="center">
            <Col xs={22} xl={16}>
                <Card title={`${globalConstants.RADAR_HOBA}s`}  className="beacon-card" >
                    <Table
                        title={()=> radarTitle}
                        dataSource={dataSource}
                        columns={columns}
                        rowKey="id"
                        components={components}
                        footer={()=>
                            <LinkRadarModal {...props} />}
                    />
                </Card>
            </Col>
        </Row>
    )
}

export default HubRadars

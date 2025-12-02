import { Component, Fragment } from 'react'
import { actions } from 'mirrorx'
import { CheckCircleOutlined, ClockCircleOutlined, DownCircleOutlined, PlusOutlined, UpCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { Button, Col, message, Modal, Row, Space, Switch, Table, Tooltip, Typography, Input, Select } from 'antd'
import EditableCell, { EditableFormRow } from '../../../../utility/EditableTable'
import UserService from '../../../../services/User'
import { SuccessModal } from '@/pages/SofiBeacon/Setting/EmergencyContact/SuccessModal'
import { globalConstants } from '@/_constants'
import { EmergencyModal, CheckModal } from './EmergencyModal'
import { isWatch } from '@/utility/Common'

class EmergencyContactTable extends Component
{
    constructor(props) {
        super(props)
        this.state = {
            editing: false,
            defaultCountry: null,
            successModalOpen: false,
            checkModalOpen: false,
            emergencyModalOpen: false,
            dataSource: this.props.selectedBeaconEmergencyContacts ?? [],
            selectedBeacon: this.props.selectedBeacon
        }
        // console.log("EmergencyContactTable: ", props)
    }

    getCountry = () => {
        UserService.getCountry().then(result=> {
            if (result.data && result.data.charAt(0)==='1') {
                this.setState({defaultCountry: result.data.slice(2,4)})
            }
        })
    }

    
    getRawColumns = (dataSource) => {
        const contactsCount = dataSource.length
        return [
            {
                title: 'Priority',
                dataIndex: 'index',
                render: (text, record) => {
                    const up = (record.index > 1 && record.index < contactsCount) || (record.index === contactsCount && !this.emergencyServicesExist())
                    const down = (record.index < contactsCount && !this.emergencyServicesExist()) || (record.index < contactsCount - 1 && this.emergencyServicesExist())
                    return (
                        <Space size="small">
                            <b>{text}</b>
                            {contactsCount > 1 && (
                                <Fragment>
                                    {up && (
                                        <Button
                                            size="small"
                                            icon={<UpCircleOutlined/>}
                                            onClick={()=>this.handleUp(record.index)}
                                        />
                                    )}
                                    {down && (
                                        <Button
                                            size="small"
                                            icon={<DownCircleOutlined/>}
                                            onClick={()=>this.handleDown(record.index)}
                                        />
                                    )}
                                </Fragment>
                            )}
                        </Space>
                    )
                }
            },
            {
                title: 'Contact Name',
                dataIndex: 'name',
                editable: true,
            },
            {
                title: 'Phone Number',
                dataIndex: 'number',
                editable: true,
            },
            {
                title:'On SOS or fall down',
                editable: true,
                children: [{
                    title: 'Call Phone',
                    dataIndex: 'accept_phone',
                    valuePropName: 'checked',
                    editable: true,
                    render: (_, record) => (
                        (this.emergencyServicesExist() && record.index == contactsCount)
                            ? <></>
                            : <Switch checkedChildren="On" unCheckedChildren="Off" checked={record.accept_phone} disabled/>
                    )

                },
                {
                    title: 'Send SMS',
                    dataIndex: 'accept_sms',
                    valuePropName: 'checked',
                    editable: true,
                    render: (_, record) => (
                        (this.emergencyServicesExist() && record.index == contactsCount)
                            ? <></>
                            : <Switch checkedChildren="On" unCheckedChildren="Off" checked={record.accept_sms} disabled/>
                    )
                }]
            },
            {
                title: 'Status',
                dataIndex: 'status',
                render: (text) => {
                    return text==='ACK'
                        ? (
                            <Tooltip title={`Emergency contact has been saved on the ${isWatch(this.state.selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB}`}>
                                <CheckCircleOutlined className="greenTooltip" />
                            </Tooltip>
                        )
                        : text==='SENT'
                            ? (
                                <Tooltip title={`Emergency contact is being saved to the ${isWatch(this.state.selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB}`}>
                                    <ClockCircleOutlined className="blueTooltip" />
                                </Tooltip>
                            )
                            : (
                                text ? (
                                    <Tooltip title="Emergency contact failed to save to Beacon, make sure the number is in the correct
                                        format and try again">
                                        <WarningOutlined className="redTooltip" />
                                    </Tooltip>
                                ) : null
                            )
                }
            },
            {
                title: 'Action',
                key: 'action',
                render: (_, record) => (
                    <a onClick={() => this.handleRemoveRecord(record)}>Remove</a>
                )
            }
        ]
    }

    emergencyServicesExist = () => {
        const { dataSource } = this.state
        if (!dataSource) {
            return false
        }
        return (dataSource.findIndex(item => item.name === 'Emergency Services') > -1)
    }

    componentDidMount() {
        this.getCountry()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selectedBeaconEmergencyContacts !== this.props.selectedBeaconEmergencyContacts) {
            this.setState({
                dataSource: this.props.selectedBeaconEmergencyContacts ?? []
            })
        }
    }
       
    handleSaveToDB = () => {
        const dataSource = this.state.dataSource
    
        let payload = {
            beacon_id: this.props.selectedBeacon.id,
            contacts: dataSource
        }
        actions.sofiBeacon.saveBeaconEmergencyContacts(payload)
            .then((result) => {
                this.setState({
                    editing: false,
                    successModalOpen: true,
                    result: result
                })
            }).catch(err => {
                message.error(err.error)
            })
    }

    handleEditMode = () =>{
        this.setState({
            editing: true,
            result: null
        })
    }

    handleCancel = () => {
        this.setState({
            editing: false, 
            result: null,
            dataSource: [...this.props.selectedBeaconEmergencyContacts]
        })
    }

    handleDelete = key => {
        this.handleEditMode()
        this.setState({
            dataSource: [...this.state.dataSource.filter(item => item.index !== key)]
        })
    }

    handleRemoveRecord = (record) => {
        Modal.confirm({
            width: 500,
            title: `Are you sure you wish to remove ${record.name} as an emergency contact?`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () =>{
                this.handleDelete(record.index)
            },
        })
    }

    handleOpenEmergency = () => {
        if (!this.emergencyServicesExist()) {
            if (globalConstants.EMERGENCY_CALL_NUMBERS.length == 0) {
                this.setState({
                    emergencyModalOpen: false
                })
                this.handleAdd()
            } else {
                this.setState({
                    emergencyModalOpen: true
                })
            }
        } else {
            this.handleAdd()
        }
    }

    handleAdd = () => {
        const { dataSource } = this.state
        let maxLimitOfContacts = this.props.selectedBeacon.model==='ev07w' ? 3 :10
        let newIndex = dataSource ? dataSource.length + 1 : 1
        let emergencyContact = null
        if (this.emergencyServicesExist()){
            newIndex --
            emergencyContact = dataSource[newIndex - 1]
            maxLimitOfContacts = this.props.selectedBeacon.model==='ev07w' ? 2 : 9
        }

        // add new contact
        let newDataSource = dataSource.slice(0, newIndex - 1)
        if (newIndex > maxLimitOfContacts){
            message.error(`Maximum ${maxLimitOfContacts} emergency contacts`)
        } else {
            const newData = {
                index: newIndex,
                name: `New Contact ${newIndex}`,
                accept_phone: true,
                accept_sms: true,
                status: 'ACK'
            }
            newDataSource.push(newData)
            if (emergencyContact) {
                newDataSource.push(emergencyContact)
            }
            this.setState({
                editing: true,
                dataSource: newDataSource
            })
        }
    }

    handleAddEmergency = () => {
        if(this.emergencyServicesExist()) {
            return
        }
        const { dataSource } = this.state
        const index = dataSource ? dataSource.length + 1 : 1
        let maxLimitOfContacts = this.props.selectedBeacon.model==='ev07w' ? 3 :10
        if (index > maxLimitOfContacts){
            message.error(`Maximum ${maxLimitOfContacts} emergency contacts`)
            return
        } else {
            const emergencyServiceData = {
                index: index,
                name: 'Emergency Services',
                accept_phone: true,
                accept_sms: true
            }
            this.setState({
                editing: true,
                dataSource: [...dataSource, emergencyServiceData]
            })
        }
    }

    handleSave = row => {
        const newDataSource = this.state.dataSource
        const index = newDataSource.findIndex(item => item.index === row.index)
        const preRow = newDataSource[index]
        newDataSource.splice(index, 1, {
            ...preRow,
            ...row,
        })
        this.setState({
            dataSource: [...newDataSource]
        })
    }

    swapItems = (arr, i, j) => {
        const indexI = arr[i].index, indexJ = arr[j].index;
        [arr[i], arr[j]] = [arr[j], arr[i]]
        arr[i].index = indexI
        arr[j].index = indexJ
        return arr
    }

    handleUp = (_index) => {
        const { dataSource } = this.state
        const index = dataSource.findIndex((item) => item.index === _index)
        if (index > 0) {
            this.setState({
                editing: true,
                dataSource: [...this.swapItems(dataSource, index, index - 1)]
            })
        }
    }

    handleDown = (_index) => {
        const { dataSource } = this.state
        const index = dataSource.findIndex((item) => item.index === _index)
        if (index > 0) {
            this.setState({
                editing: true,
                dataSource: [...this.swapItems(dataSource, index, index + 1)]
            })
        }
    }

    render() {
        const { 
            editing, result, defaultCountry, successModalOpen,
            checkModalOpen, emergencyModalOpen, dataSource
        } = this.state
        const rawColumns = this.getRawColumns(dataSource)
        const columns = rawColumns.map((column) => {
            if (!column.editable) {
                return column
            }
            if (column.children?.length>0) {
                return {
                    ...column,
                    children: column.children.map(childColumn => {
                        if (!childColumn.editable) {
                            return childColumn
                        }
                        return {
                            ...childColumn,
                            onCell: record => ({
                                record,
                                dataIndex: childColumn.dataIndex,
                                title: childColumn.title,
                                valuePropName: childColumn.valuePropName,
                                editing: editing,
                                handleSave: this.handleSave,
                                defaultCountry: defaultCountry
                            }),
                        }
                    })
                }
            }
            return {
                ...column,
                onCell: record => ({
                    record,
                    dataIndex: column.dataIndex,
                    title: column.title,
                    valuePropName: column.valuePropName,
                    editing: editing,
                    handleSave: this.handleSave,
                    defaultCountry: defaultCountry
                })
            }
        })
        
        const editableTableComponent = {
            body: {
                row: EditableFormRow,
                cell: EditableCell,
            }
        }

        return (
            <>
                <SuccessModal
                    open={successModalOpen}
                    result={result}
                    onCancel={()=>this.setState({successModalOpen: false})}
                />
                <EmergencyModal
                    open = {emergencyModalOpen}
                    onAdd = {() => this.handleAdd()} 
                    onCancel={() => this.setState({emergencyModalOpen: false})} 
                    onChecked = {() => this.setState({checkModalOpen: true})}
                />
                <CheckModal
                    open = {checkModalOpen}
                    onCancel={()=>this.setState({checkModalOpen: false})} 
                    onEmergency = {this.handleAddEmergency}
                />
                <Table
                    scroll={{ x: true }}
                    dataSource={dataSource}
                    columns={columns}
                    rowKey="index"
                    pagination={false}
                    components={editableTableComponent}
                    className="margin-bottom"
                />

                <Row
                    type="flex"
                    justify="space-between"
                    gutter={[12,12]}
                    style={{ padding: '10px 20px 10px 20px' }}
                >
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={this.handleOpenEmergency}
                    >
                        Add Another Number
                    </Button>
                    {editing
                        ? (
                            <Row>
                                <Button type="default" onClick={this.handleCancel} className="margin-right">Cancel</Button>
                                <Button type="primary" onClick={this.handleSaveToDB}>Save</Button>
                            </Row>
                        )
                        : <Button type="primary" onClick={this.handleEditMode}>Edit</Button>
                    }
                </Row>
            </>
        )
    }
}

export default EmergencyContactTable

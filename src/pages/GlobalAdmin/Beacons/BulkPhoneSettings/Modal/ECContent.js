import { Button, Card, Col, message, Row, Select, Space, Switch, Table, Typography } from 'antd'
import { globalConstants } from '@/_constants'
import { Fragment, useEffect, useState } from 'react'
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons'
import EditableCell, { EditableFormRow } from '@/utility/EditableTable'
import UserService from '@/services/User'
import colours from '@/scss/colours.scss'

const ECContent = (props) => {
    const {setData, setDirty} = props

    const [changeMode, setChangeMode] = useState()
    const [addData, setAddData] = useState([])
    const [removeData, setRemoveData] = useState([])
    const [editing, setEditing] = useState(false)
    const [defaultCountry, setDefaultCountry] = useState()

    const setPayload = () => {
        const payload = {
            mode: changeMode,
            added_ecs: addData,
            deleted_ecs: removeData
        }
        setData(payload)
        setDirty(false)
        setEditing(false)
    }

    const getCountry = () => {
        UserService.getCountry().then(result=> {
            if (result.data && result.data.charAt(0)==='1'){
                setDefaultCountry(result.data.slice(2,4))
            }
        })
    }

    useEffect(()=>getCountry(),[])

    const edit = () =>{
        setEditing(true)
        setDirty(true)
    }

    const components = {
        body: {
            row: EditableFormRow,
            cell: EditableCell,
        }
    }

    const initialAddColumn = [
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
                render: (text, item) => <Switch checkedChildren="On" unCheckedChildren="Off" checked={item.accept_phone} disabled/>

            },
            {
                title: 'Send SMS',
                dataIndex: 'accept_sms',
                valuePropName: 'checked',
                editable: true,
                render: (text, item) => <Switch checkedChildren="On" unCheckedChildren="Off" checked={item.accept_sms} disabled/>
            }]
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (<a onClick={() => handleAddDelete(record.index)}>Remove</a>),
        }
    ]

    const initialRemoveColumn = [
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
            title: 'Action',
            key: 'action',
            render: (text, record) => (<a onClick={() => handleRemoveDelete(record.index)}>Remove</a>),
        }
    ]

    const handleAddDelete = key => {
        setAddData(addData.filter(item => item.index !== key))
        setEditing(true)
        setDirty(true)
    }

    const handleRemoveDelete = key => {
        setRemoveData(removeData.filter(item => item.index !== key))
        setEditing(true)
        setDirty(true)
    }

    const columns = (initialColumn) => initialColumn.map((col) => {
        if (!col.editable) {
            return col
        }
        if (col.children?.length>0){
            return {
                ...col,
                children: col.children.map(childcol=>{
                    if (!childcol.editable) {
                        return childcol
                    }
                    return {
                        ...childcol,
                        onCell: record => ({
                            record,
                            dataIndex: childcol.dataIndex,
                            title: childcol.title,
                            valuePropName: childcol.valuePropName,
                            editing,
                            handleSave: initialColumn.length===3? handleSaveRemove: handleSaveAdd,
                            defaultCountry: defaultCountry
                        }),
                    }
                })
            }
        }
        return {
            ...col,
            onCell: record => ({
                record,
                dataIndex: col.dataIndex,
                title: col.title,
                valuePropName: col.valuePropName,
                editing,
                handleSave: initialColumn.length===3? handleSaveRemove: handleSaveAdd,
                defaultCountry: defaultCountry
            }),
        }
    })

    const handleSaveAdd = row => {
        const newData = [...addData]
        const index = newData.findIndex(item => row.index === item.index)
        const item = newData[index]
        newData.splice(index, 1, {
            ...item,
            ...row,
        })
        setAddData(newData)
    }

    const handleSaveRemove = row => {
        const newData = [...removeData]
        const index = newData.findIndex(item => row.index === item.index)
        const item = newData[index]
        newData.splice(index, 1, {
            ...item,
            ...row,
        })
        setRemoveData(newData)
    }

    const handleAdd = () => {
        const index = addData ? addData.length+1 : 1
        const maxContacts = 10
        const newData = {
            index: index,
            name: `New Contact ${index}`,
            accept_phone: true,
            accept_sms: true
        }
        if (index>maxContacts){
            message.error(`Maximum ${maxContacts} emergency contacts`)
        }else {
            setEditing(true)
            setDirty(true)
            setAddData(addData ? [...addData, newData] : [newData])
        }
    }

    const handleRemove = () => {
        const index = removeData ? removeData.length+1 : 1
        const newData = {
            index: index,
            name: `New Contact ${index}`,
        }
        setEditing(true)
        setDirty(true)
        setRemoveData(addData ? [...removeData, newData] : [newData])
    }

    return <Space direction="vertical" style={{width: '100%'}}>
        <Typography.Paragraph strong>
            What emergency contact changes do you want to make?
            <Select
                style={{width: '200px', marginLeft: '12px'}}
                value={changeMode}
                onSelect={value => setChangeMode(value)}
                options={[
                    {value: 'M', label: 'Merge Contacts'},
                    {value: 'R', label: 'Replace All Contacts'}
                ]}>

            </Select>
        </Typography.Paragraph>

        {changeMode && <Fragment>


            {changeMode === 'M' &&<Fragment>
                <Card size="small" title={<span><ExclamationCircleOutlined style={{color: colours.blue, marginRight: '6px'}}/>Before you do a merge</span>}>
                    <Typography.Paragraph>
                    Just a heads up that when a merge takes place we first remove the emergency contacts that match the criteria supplied in the “remove” section, and then afterwards we apply the contacts from the “add” section.
                    </Typography.Paragraph>
                </Card>

                <Typography.Paragraph strong>
                What contacts would you like to REMOVE from the selected {globalConstants.PENDANT_GENERIC}s? <br/>
                </Typography.Paragraph>
                <Table
                    dataSource={removeData}
                    columns={columns(initialRemoveColumn)}
                    rowKey="index"
                    pagination={false}
                    components={components}
                    className="margin-bottom"
                    footer={()=>
                        <Row type="flex" justify="space-between" gutter={[12,12]}>
                            <Col>
                                <Button type="primary" icon={<PlusOutlined />} onClick={handleRemove}>Add Another Number</Button>
                            </Col>
                            <Col>
                                {editing ?
                                    <Button type="primary" onClick={setPayload}>Save</Button>:
                                    <Button type="primary" onClick={edit}>Edit</Button>}
                            </Col>
                        </Row>}
                />

            </Fragment>
            }

            <Typography.Paragraph strong>
            What contacts would you like to ADD to the selected {globalConstants.PENDANT_GENERIC}s? <br/>
            </Typography.Paragraph>
            <Table
                dataSource={addData}
                columns={columns(initialAddColumn)}
                rowKey="index"
                pagination={false}
                components={components}
                className="margin-bottom"
                footer={()=>
                    <Row type="flex" justify="space-between" gutter={[12,12]}>
                        <Col>
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Another Number</Button>
                        </Col>
                        <Col>
                            {editing ?
                                <Button type="primary" onClick={setPayload}>Save</Button>:
                                <Button type="primary" onClick={edit}>Edit</Button>}
                        </Col>
                    </Row>}
            />
        </Fragment>}
    </Space>
}

export default ECContent

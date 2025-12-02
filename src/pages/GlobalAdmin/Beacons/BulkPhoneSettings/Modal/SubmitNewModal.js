import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Input, Select, Modal, Row, Space, Steps, Typography, Table, Form, Col, message } from 'antd'
import { actions } from 'mirrorx'
import Media from 'react-media'
import { isMobile } from 'react-device-detect'
import BeaconService  from '@/services/Beacon'
import { globalConstants } from '@/_constants'
import DeviceStatus from '@/components/DeviceStatus'
import BeaconFilters from '@/pages/GlobalAdmin/Beacons/BulkPhoneSettings/Modal/BeaconFilters'
import { titleCase } from 'change-case'
import PSContent from '@/pages/GlobalAdmin/Beacons/BulkPhoneSettings/Modal/PSContent'
import ECContent from '@/pages/GlobalAdmin/Beacons/BulkPhoneSettings/Modal/ECContent'
import WMContent from '@/pages/GlobalAdmin/Beacons/BulkPhoneSettings/Modal/WMContent'

const NewBulkPhoneSettingModal = (props) => {
    const {open, onCancel, allBeacons, orgs} = props
    const [description, setDescription] = useState()
    const [current, setCurrent] = useState(0)
    const [loading, setLoading] = useState(false)
    const [beacons, setBeacons] = useState([])
    const [oldKeys, setOldKeys] = useState([])
    const [settingType, setSettingType] = useState()
    const [ecPayload, setEcPayload] = useState({mode: 'M', deleted_ecs: [], added_ecs:[], allow_duplicates: true})
    const [ecDirty, setEcDirty] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [actionForm] = Form.useForm()


    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(Array.from(new Set([...oldKeys, ...newSelectedRowKeys])))
    }

    const handleClose = () => {
        setCurrent(0)
        handleReset()
        setDescription(null)
        onCancel()
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    }

    const columns = [{
        title: 'Device name',
        dataIndex: 'display_name',
    },
    {
        title: 'Device IMEI',
        dataIndex: 'imei',
    },
    {
        title: 'Status',
        index: 'beacon_status',
        render: (text, record) => <DeviceStatus status={record?.beacon_status ? record.beacon_status:'OFFLINE'} />
    }
    ]

    const handleReset = () => {
        setSelectedRowKeys([])
        setOldKeys([])
    }

    const tableTitle = () => <Row gutter={[20,20]} justify="space-between"><Col>{allBeacons?.length} {globalConstants.PENDANT_GENERIC}s total (displaying only {beacons?.length} based on filters)</Col>
        <Col>{selectedRowKeys?.length} {globalConstants.PENDANT_GENERIC}s selected</Col>
        <Col><a onClick={handleReset}>Reset</a></Col>
    </Row>

    const tableFooter = () => <BeaconFilters filter={fetchBeacons} orgs={orgs}/>

    const fetchBeacons = (payload={}) => {
        setLoading(true)
        setOldKeys(selectedRowKeys)
        BeaconService.postBeacons(payload).then(result=>{
            setBeacons(result)
        }).finally(()=>setLoading(false))
    }

    // eslint-disable-next-line
    useEffect(()=>fetchBeacons(),[])

    const handlePSSubmit = (values) => {
        const payload = {
            beacon_ids: selectedRowKeys,
            description,
            payload: values
        }
        actions.sofiBeacon.applyBatchUpdate(payload).then(()=>{
            actions.sofiBeacon.fetchBatchUpdateList()
            message.success('Batch update request sent')
            handleReset()
            actionForm.resetFields()
            setCurrent(0)
            setDescription(null)
            onCancel()
        }).catch((e)=>message.error(e.message))
    }

    const handleECSubmit = () => {
        const payload = {
            beacon_ids: selectedRowKeys,
            description,
            ...ecPayload
        }
        actions.sofiBeacon.applyBatchEC(payload).then(()=>{
            actions.sofiBeacon.fetchBatchUpdateList()
            message.success('Batch update request sent')
            handleReset()
            setCurrent(0)
            setDescription(null)
            onCancel()
        }).catch((e)=>message.error(e.message))
    }

    const handleWMSubmit = (values) => {
        const payload = {
            beacon_ids: selectedRowKeys,
            description,
            upload_interval: `PT${values.upload_interval}M`
        }
        actions.sofiBeacon.applyBatchWM(payload).then(()=>{
            actions.sofiBeacon.fetchBatchUpdateList()
            message.success('Batch update request sent')
            handleReset()
            actionForm.resetFields()
            setCurrent(0)
            setDescription(null)
            onCancel()
        }).catch((e)=>message.error(e.message))
    }

    const descriptionContent = <Typography>
        <Typography.Paragraph strong>
            1. Please choose what type of the changes you want to make: <br/>
            <Select
                style={{width: '100%'}}
                value={settingType}
                onSelect={value => setSettingType(value)}
                options={[
                    {value: 'PS', label: 'Phone Settings'},
                    {value: 'EC', label: 'Emergency Contacts'},
                    {value: 'WM', label: 'Work Mode'},
                ]}
            />
        </Typography.Paragraph>
        <Typography.Paragraph strong>
            2. Please describe the change: <Input value={description} onChange={e=>setDescription(e.target.value)} />
        </Typography.Paragraph>
    </Typography>

    const selectContent = <Space direction="vertical" style={{width: '100%'}}>
        <Typography.Text strong>
            Select the devices to change:
        </Typography.Text>
        <Table
            bordered
            size="small"
            columns={columns}
            loading={loading}
            dataSource={beacons}
            rowSelection={rowSelection}
            rowKey="id"
            title={tableTitle}
            footer={tableFooter}
            pagination={{position: ['topRight']}}
        />
    </Space>

    const actionContent = settingType==='PS' ? <PSContent
        selectedRowKeys={selectedRowKeys}
        actionForm={actionForm}
        handleSubmit={handlePSSubmit}
    /> : settingType==='EC' ? <ECContent setData={setEcPayload} setDirty={setEcDirty}/> : <WMContent
        actionForm={actionForm}
        handleSubmit={handleWMSubmit}
    />

    const steps = [{
        title: 'Setting Description',
        content: descriptionContent,
    },{
        title: `Select ${titleCase(globalConstants.PENDANT_GENERIC)}s`,
        content: selectContent
    },{
        title: 'Choose Actions',
        content: actionContent,
    }]

    const modalTitle =  <Media query="(max-width: 767px)">
        {matches =><Steps
            current={current}
            direction={matches ? 'vertical':'horizontal'}
            size="small"
            labelPlacement={isMobile ? 'horizontal' : 'vertical'}
            items={steps}
        />
        }
    </Media>

    const prev = () => {
        setCurrent(current-1)
    }

    const next = () => {
        setCurrent(current+1)
    }



    return <Modal
        width={800}
        open={open}
        onCancel={handleClose}
        title={modalTitle}
        confirmLoading={loading}
        footer={null}
        destroyOnClose
    >
        <div className="steps-content">{steps[current].content}</div>
        <div className="steps-action">
            {
                current < steps.length - 1 && <Button
                    type="primary"
                    loading={loading}
                    onClick={next}
                    disabled={current===1 && selectedRowKeys.length===0}
                    className="floatRight">Next</Button>
            }
            {
                current === steps.length - 1
                        && <Button type="primary" onClick={ ()=>
                        {
                            settingType==='PS' ? actionForm.validateFields().then(values => handlePSSubmit(values)) :
                                settingType==='EC' ? handleECSubmit(): actionForm.validateFields().then(values => handleWMSubmit(values))
                        }}
                        className="floatRight" disabled={ecDirty}>Apply and Run</Button>
            }
            {
                current > 0 && <Button style={{ marginLeft: 8 }} onClick={prev}>Previous</Button>
            }
        </div>
    </Modal>
}

NewBulkPhoneSettingModal.propTypes={
    open: PropTypes.bool,
    onCancel: PropTypes.func,
}

export default NewBulkPhoneSettingModal

import { useEffect, useState } from 'react'
import { actions, connect } from 'mirrorx'
import { DeleteOutlined } from '@ant-design/icons'
import { Col, Collapse, Divider, Input, message, Modal, Row, Table, Card } from 'antd'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import { sortDateTime, sortString } from '@/utility/Common'
import TerminateSIMAction from '@/pages/GlobalAdmin/SIM/Terminations/TerminateSIMAction'
import { isMobile } from 'react-device-detect'

const mapStateToProps = state => ({
    simActivations: state.SIM.SIMActivations,
    scheduledDeactivations: state.SIM.scheduledDeactivations,
})

const SIMTerminationTable = (props)=> {
    const {scheduledDeactivations} = props
    const currentData = scheduledDeactivations?.filter(record=>moment().isBefore(moment(record.scheduled_date)))
    const pastData = scheduledDeactivations?.filter(record=>moment().isAfter(moment(record.scheduled_date)))

    const [currentDataSource, setCurrentDataSource] = useState(currentData)
    const [pastDataSource, setPastDataSource] = useState(pastData)
    useEffect(()=>
    {
        setCurrentDataSource(scheduledDeactivations?.filter(record=>moment().isBefore(moment(record.scheduled_date))))
        setPastDataSource(scheduledDeactivations?.filter(record=>moment().isAfter(moment(record.scheduled_date))))
    },[scheduledDeactivations])

    const handleDelete = (record) => {
        Modal.confirm({
            onOk: ()=>actions.SIM.deleteSSDeactivations(record.id).then(()=>{
                message.success('Delete Success')
            }).catch(()=>{
                message.error('Delete failed, Please contact admin.')
            }),
            okText: 'OK',
            title: 'Are you sure you wish to cancel this deactivation?',
        })
    }


    const renderHeader = () => <Row type="flex" gutter={15} align="middle" className="margin-bottom">
        <Col>
            <Input.Search
                placeholder="Search here ..."
                onSearch={handleSearch}
                enterButton
                autoFocus = {!isMobile}
            />
        </Col>
    </Row>

    const handleSearch = (value) => {
        if (value === '' ){
            setCurrentDataSource(currentData)
            setPastDataSource(pastData)
        }else{
            setCurrentDataSource(currentData.filter(
                record => record.iccid_full?.toLowerCase().includes(value.toLowerCase()) ||
                    record.product_mac_or_imei?.toLowerCase().includes(value.toLowerCase()) ||
                    record.last_update_by?.toLowerCase().includes(value.toLowerCase())
            ))

            setPastDataSource(pastData.filter(
                record => record.iccid_full?.toLowerCase().includes(value.toLowerCase()) ||
                    record.product_mac_or_imei?.toLowerCase().includes(value.toLowerCase()) ||
                    record.last_update_by?.toLowerCase().includes(value.toLowerCase())
            ))
        }
    }

    const columns = [
        {
            title: 'ICCID',
            dataIndex: 'iccid_full',
            key: 'iccid_full',
            sorter: (a, b) => sortString(a, b, 'iccid_full'),
        },
        {
            title: 'MAC or IMEI',
            dataIndex: 'product_mac_or_imei',
            key: 'product_mac_or_imei',
        },
        {
            title: 'Job Status',
            dataIndex: 'job_status',
            render: (text) => text==='ACTIVE' ? 'Termination Scheduled' :
                text==='CANCELED' ? 'Termination Canceled (Termination will not take place)' :
                    text==='PENDING' ? 'Termination Requested, Pending' :
                        text==='SUCCESS' ? 'Termination Success' : ''
        },
        {
            title: 'Description',
            dataIndex: 'notes',
        },
        {
            title: 'Scheduled Date',
            dataIndex: 'scheduled_date',
            render: (value) => value ? moment(value).format(globalConstants.DATETIME_FORMAT) : 'No Data Yet',
            sorter: (a, b) => sortDateTime(a.scheduled_date, b.scheduled_date),
        },
        {
            title: 'Last Updated By',
            dataIndex: 'last_update_by',
        },
        {
            title: 'Last Updated At',
            dataIndex: 'last_update_at',
            render: (value) => value ? moment(value).format(globalConstants.DATETIME_FORMAT) : 'No Data Yet'
        },
        {
            title: 'Action',
            key: 'action',
            render: (text,record) => <div>
                <TerminateSIMAction.UpdateSIMModal {...props} model={record}/>
                <Divider type={'vertical'}/>
                <DeleteOutlined onClick={()=>handleDelete(record)} />
            </div>
        }
    ]

    const pastColumns = [
        {
            title: 'ICCID',
            dataIndex: 'iccid_full',
            key: 'iccid_full',
            sorter: (a, b) => sortString(a, b, 'iccid_full'),
        },
        {
            title: 'MAC or IMEI',
            dataIndex: 'product_mac_or_imei',
            key: 'product_mac_or_imei',
        },
        {
            title: 'Job Status',
            dataIndex: 'job_status',
            render: (text) => text==='ACTIVE' ? 'Termination Scheduled' :
                text==='CANCELED' ? 'Termination Canceled (Termination will not take place)' :
                    text==='PENDING' ? 'Termination Requested, Pending' :
                        text==='SUCCESS' ? 'Termination Success' : text
        },
        {
            title: 'Description',
            dataIndex: 'notes',
        },
        {
            title: 'Scheduled Date',
            dataIndex: 'scheduled_date',
            render: (value) => value ? moment(value).format(globalConstants.DATETIME_FORMAT) : 'No Data Yet'
        },
        {
            title: 'Last Updated By',
            dataIndex: 'last_update_by',
        },
        {
            title: 'Last Updated At',
            dataIndex: 'last_update_at',
            render: (value) => value ? moment(value).format(globalConstants.DATETIME_FORMAT) : 'No Data Yet'
        }
    ]

    return (<Card title={renderHeader()}>
        <Table
            scroll={{x: true}}
            className="margin-bottom"
            columns={columns}
            dataSource={currentDataSource}
            rowKey="id"
        />
        <Row>
            <TerminateSIMAction.CreateSIMModal {...props} />
        </Row>
        <Divider />
        <Collapse defaultActiveKey={['past']}>
            <Collapse.Panel key="past" header="Past Terminations">
                <Table
                    scroll={{x: true}}
                    className="margin-bottom"
                    columns={pastColumns}
                    dataSource={pastDataSource}
                    rowKey="id"
                />
            </Collapse.Panel>
        </Collapse>

    </Card>)
}

export default connect(mapStateToProps,{})(SIMTerminationTable)

import { Fragment, useState } from 'react'
import { connect } from 'mirrorx'
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { Badge, Button, Col, Divider, Row, Table, Tooltip, Typography } from 'antd'
import { sortDateTime } from '@/utility/Common'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import SubmitNewModal from './Modal/SubmitNewModal'
import ViewResultModal from './Modal/ViewResultModal'
import BeaconService from '@/services/Beacon'

const mapStateToProps = state => ({
    batchUpdateList: state.sofiBeacon.batchUpdateList,
    allBeacons: state.sofiBeacon.allBeacons,
    orgs: state.organisation.orgs
})

const BulkPhoneSettingList =(props)=>{
    const {batchUpdateList} = props
    const [uploadModal, setUploadModal] = useState(false)
    const [viewModal, setViewModal] = useState(false)
    const [selectedRecord, setSelectedRecord] = useState()

    const renderHeader = () => {
        return (<Fragment><Row justify="space-between" gutter={15} align="middle" className="margin-bottom">
            <Col>
                <strong>Bulk Advanced Changes to Existing Pendants</strong>
            </Col>
            <Col className="text-right"><Button type="primary" icon={<PlusOutlined />} onClick={()=>setUploadModal(true)}>Submit New</Button></Col>
        </Row>
        <Divider/>
        <Typography.Text>
            Here you can change {globalConstants.PENDANT_GENERIC} settings. You can look at historical bulk changes, and re-run them if required.
        </Typography.Text>
        </Fragment>)
    }

    const viewRecord = async (record) => {
        setViewModal(true)
        const details = await BeaconService.getBatchUpdateById(record.id)
        setSelectedRecord(details)
    }

    const cancelViewResultModal = () => {
        setViewModal(false)
        setSelectedRecord(null)
    }

    const columns = [
        {
            title: 'Description',
            dataIndex: 'description',
            render: text =>  text==='B' ? 'Beacons' : text
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: text =>  <span>{text}<Tooltip title={text==='B_PSW' ? 'Phone Settings' : text==='B_EC' ? 'Emergency Contacts': 'Work Mode'}>
                <QuestionCircleOutlined className="sensorInfoIcon" />
            </Tooltip></span>
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            defaultSortOrder: 'descend',
            sorter: (a, b) => sortDateTime(a.created_at, b.created_at),
            render: (text) => text && moment(text).format(globalConstants.LONGDATETIME_FORMAT)
        },
        {
            title: 'Created By',
            dataIndex: 'created_by_username',
        },
        {
            title: 'Result',
            dataIndex: 'status',
            render(val) {
                return <Badge status={val==='E'?'error':'success'} text={
                    val==='E'?'Error':val==='F'? 'Failed': val==='P'? 'Pending': val === 'AC' ? 'Success' : val
                } />
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (text,record) => <Button onClick={()=>viewRecord(record)}>View</Button>
        }
    ]
    return (
        <Fragment>
            <Table
                className="table"
                loading={ batchUpdateList == null}
                dataSource={batchUpdateList}
                columns={columns}
                rowKey="id"
                title={renderHeader}
            />
            <ViewResultModal
                open={viewModal}
                onCancel={cancelViewResultModal}
                batchUpdateRecord={selectedRecord}
            />
            <SubmitNewModal
                open={uploadModal}
                onCancel={()=>setUploadModal(false)}
                {...props}
            />
        </Fragment>
    )

}


export default connect(mapStateToProps, null) (BulkPhoneSettingList)

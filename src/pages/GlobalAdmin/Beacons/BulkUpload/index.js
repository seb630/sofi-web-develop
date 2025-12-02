import { Fragment, useState } from 'react'
import { connect } from 'mirrorx'
import { PlusOutlined } from '@ant-design/icons'
import { Badge, Button, Col, Row, Table, Typography } from 'antd'
import { sortDateTime } from '@/utility/Common'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import SubmitNewModal from './Modal/SubmitNewModal'
import ViewResultModal from './Modal/ViewResultModal'
import BeaconService from '@/services/Beacon'

const mapStateToProps = state => ({
    bulkUploadList: state.sofiBeacon.bulkUploadList
})

const BulkUploadList =(props)=>{
    const {bulkUploadList} = props
    const [uploadModal, setUploadModal] = useState(false)
    const [viewResultModal, setViewResultModal] = useState(false)
    const [selectedRecord, setSelectedRecord] = useState()

    const renderHeader = () => {
        return (<Fragment><Row justify="space-between" gutter={15} align="middle" className="margin-bottom">
            <Col>
                <strong>Bulk Onboarding - For New Pendants Only</strong>
            </Col>
            <Col className="text-right"><Button type="primary" icon={<PlusOutlined />} onClick={()=>setUploadModal(true)}>Submit New</Button></Col>
        </Row>
        <Typography.Text type="secondary">
            This feature should only be used with newly created pendants, it should not be used with existing pendants! <br/>
        </Typography.Text>
        <Typography.Text type="secondary">
            This feature WILL overwrite all settings (even correctly set ones) on an existing pendant!
        </Typography.Text>
        </Fragment>)
    }

    const viewRecord = async (record) => {
        setViewResultModal(true)
        const details = await BeaconService.getBulkUploadDetail(record.id)
        setSelectedRecord(details)
    }

    const cancelViewResultModal = () => {
        setViewResultModal(false)
        setSelectedRecord(null)
    }

    const afterSubmit = (newRecord) => {
        setUploadModal(false)
        setViewResultModal(true)
        setSelectedRecord(newRecord)
    }

    const columns = [
        {
            title: 'Type',
            dataIndex: 'type',
            render: text =>  text==='B' ? 'Beacons' : text
        },
        {
            title: 'ID',
            dataIndex: 'id',
            sorter: (a, b) => a.id-b.id,
        },
        {
            title: 'Date Submitted',
            dataIndex: 'uploaded_at',
            defaultSortOrder: 'descend',
            sorter: (a, b) => sortDateTime(a.uploaded_at, b.uploaded_at),
            render: (text) => text && moment(text).format(globalConstants.LONGDATETIME_FORMAT)
        },
        {
            title: 'Result',
            dataIndex: 'status',
            render(val) {
                return <Badge status={val==='E'?'error':'success'} text={
                    val==='E'?'Error':val==='V'? 'Validated': val==='P'? 'Pending': val === 'S' ? 'Success' : val
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
                loading={ bulkUploadList == null}
                dataSource={bulkUploadList}
                columns={columns}
                rowKey="id"
                title={renderHeader}
            />
            <ViewResultModal
                open={viewResultModal}
                onCancel={cancelViewResultModal}
                bulkUpload={selectedRecord}
            />
            <SubmitNewModal
                open={uploadModal}
                onCancel={()=>setUploadModal(false)}
                afterSubmit={afterSubmit}
            />
        </Fragment>
    )

}


export default connect(mapStateToProps, null) (BulkUploadList)

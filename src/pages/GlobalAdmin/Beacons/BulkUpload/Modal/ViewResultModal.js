import PropTypes from 'prop-types'
import { Badge, Button, Col, List, message, Modal, Row, Table, Typography } from 'antd'
import { formatTimeWithTimezone } from '@/utility/Common'
import { actions } from 'mirrorx'
import { CheckOutlined, DatabaseOutlined, TableOutlined, TabletOutlined } from '@ant-design/icons'
import styled from '@/scss/colours.scss'
import { Fragment } from 'react'


const ViewResultModal = (props) => {
    const {open, onCancel, bulkUpload} = props

    const renderFooter = () => {
        if (bulkUpload.status === 'V') {
            return [<Button key='cancel' onClick={onCancel}>Cancel (Don&#39;t Apply)</Button>,  <Button key='apply' type="primary" onClick={handleApply}>Apply</Button>]
        }else return [<Button onClick={onCancel} type="primary" key="cancel">Close</Button>]
    }

    const renderErrors = (uploadRecord) => {
        if (uploadRecord?.status === 'E'){
            return <Fragment>
                <Typography.Paragraph strong>Results:</Typography.Paragraph>
                <List
                    bordered
                    dataSource={uploadRecord?.logs}
                    renderItem={item => (
                        <List.Item>
                            <Typography.Text mark>[{item.ref}]</Typography.Text> {item.status_msg}
                        </List.Item>
                    )}
                />
            </Fragment>
        }
    }

    const renderApply = (uploadRecord) => {
        if (uploadRecord?.status ==='V'){
            return <div className='text-center'>
                <div>
                    <TableOutlined  style={{fontSize: '80px', color: styled.green}} />
                </div>
                <Typography.Title level={4} style={{fontSize: '32px', color: styled.green}}>Upload is Valid!</Typography.Title>
                <Typography.Paragraph>
                    Your upload has been validated, but has not yet been applied.
                </Typography.Paragraph>
                <Typography.Paragraph strong>
                    Would you like to apply it now?
                </Typography.Paragraph>
            </div>
        }
    }


    const renderPending = (uploadRecord) => {
        const columns = [
            {
                title: 'Ref',
                dataIndex: 'ref',
            },
            {
                title: 'Data Type',
                dataIndex: 'data_type',
            },
            {
                title: 'Ref ID',
                dataIndex: 'ref_id',
            },
            {
                title: 'IMEI',
                dataIndex: 'ref_extra1',
            },
            {
                title: 'Display Name',
                dataIndex: 'ref_extra2',
            },
            {
                title: 'Status',
                dataIndex: 'status',
                render(val) {
                    return <Badge status={val==='E'?'error':'success'} text={
                        val==='E'?'Error':val==='F'? 'Failed': val==='P'? 'Pending': val === 'AC' ? 'Success' : val
                    } />
                },
            },
        ]

        if (uploadRecord?.status ==='P'){
            return <Fragment>
                <Typography.Paragraph strong>Results:</Typography.Paragraph>

                <Table
                    pagination={{pageSize: 5}}
                    bordered
                    size="small"
                    columns={columns}
                    dataSource={uploadRecord?.logs}
                    rowKey="id"
                />

                {/*<Row justify="space-around" className="margin-bottom">*/}
                {/*    <Col className="text-center" span={12}>*/}
                {/*        <DatabaseOutlined style={{fontSize:'80px', marginBottom:'12px'}}/>*/}
                {/*        <Row><LoadingOutlined style={{marginRight: '6px', color: styled.blue}}/>Database changes:&nbsp;<span style={{color:styled.blue}}>Pending</span></Row>*/}
                {/*    </Col>*/}
                {/*    <Col className="text-center" span={12}>*/}
                {/*        <TabletOutlined style={{fontSize:'80px', marginBottom:'12px'}}/>*/}
                {/*        <Row><LoadingOutlined style={{marginRight: '6px', color: styled.blue}}/>Pendant changes:&nbsp;<span style={{color:styled.blue}}>Pending</span></Row>*/}
                {/*    </Col>*/}
                {/*</Row>*/}
                <Typography.Paragraph type="secondary">
                    Changes will continue in background when closed.
                </Typography.Paragraph>
            </Fragment>
        }
    }

    const renderSuccess = (uploadRecord) => {
        if (uploadRecord?.status ==='S'){
            return <Fragment>
                <Typography.Paragraph strong>Results:</Typography.Paragraph>
                <Row justify="space-around" className="margin-bottom">
                    <Col className="text-center" span={12}>
                        <DatabaseOutlined style={{fontSize:'80px', marginBottom:'12px', color: styled.green}}/>
                        <Row><CheckOutlined style={{marginRight: '6px', color: styled.green}}/>Database changes:&nbsp;<span style={{color:styled.green}}>Done</span></Row>
                    </Col>
                    <Col className="text-center" span={12}>
                        <TabletOutlined style={{fontSize:'80px', marginBottom:'12px', color: styled.green}}/>
                        <Row><CheckOutlined style={{marginRight: '6px', color: styled.green}}/>Pendant changes:&nbsp;<span style={{color:styled.green}}>Done</span></Row>
                    </Col>
                </Row>
                <Typography.Paragraph type="secondary">
                    Changes will continue in background when closed.
                </Typography.Paragraph>
            </Fragment>
        }
    }

    const handleApply = () => {
        actions.sofiBeacon.applyBulkUpload(bulkUpload.id).then(()=>{
            message.success('Applied success!')
            actions.sofiBeacon.fetchBulkUploadBeaconList()
            onCancel()
        })
    }

    return bulkUpload? <Modal
        width={800}
        open={open}
        onCancel={onCancel}
        title={`Bulk Upload ID: ${bulkUpload?.id}`}
        footer={renderFooter()}
    >
        <Row>
            Type: {bulkUpload?.type==='B' ? 'Beacons' : bulkUpload?.type}
        </Row>
        <Row>
            Data Submitted: {formatTimeWithTimezone(bulkUpload.upload_at)}
        </Row>
        <Row className="margin-bottom">
            Result:&nbsp;<Typography.Text
                type={bulkUpload?.status==='E'? 'danger' : bulkUpload?.status==='V' || bulkUpload?.status==='S'? 'success':'default'}
                style={{color: bulkUpload?.status==='P' ? styled.blue:'initial'}}
            >
                {bulkUpload?.status==='E'? 'Error' : bulkUpload?.status==='V' ? 'Validation passed, but changes not yet applied':bulkUpload?.status === 'P'? 'PENDING' : bulkUpload?.status==='S'? 'SUCCESS': bulkUpload?.status}
            </Typography.Text>
        </Row>
        {renderApply(bulkUpload)}
        {renderErrors(bulkUpload)}
        {renderPending(bulkUpload)}
        {renderSuccess(bulkUpload)}
    </Modal> : null
}

ViewResultModal.propTypes={
    open: PropTypes.bool,
    onCancel: PropTypes.func,
}

export default ViewResultModal

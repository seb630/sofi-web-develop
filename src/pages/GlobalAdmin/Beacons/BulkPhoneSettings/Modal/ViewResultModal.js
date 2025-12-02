import PropTypes from 'prop-types'
import { Button, Col, Table, Modal, Row, Typography, Space, Badge, message, Switch } from 'antd'
import { sortDateTime } from '@/utility/Common'
import { actions } from 'mirrorx'
import BeaconService from '@/services/Beacon'
import { Fragment } from 'react'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import useSWR from 'swr'

const {Paragraph, Text} = Typography

const ViewResultModal = (props) => {
    const {open, onCancel, batchUpdateRecord} = props
    const fetcher = (id) => BeaconService.getBatchUpdateById(id)
    const { data: batchUpdateDetail } = useSWR(batchUpdateRecord?.id, fetcher)

    const dataSource = batchUpdateDetail?.logs.map(log=>({...log, ...batchUpdateDetail?.device_details.find(device=>device.id===log.ref_id)}))

    const renderTitle = <Typography >
        <Paragraph ellipsis><Text strong>{batchUpdateDetail?.type==='B_EC' ? 'Bulk Emergency Contacts Changes' : batchUpdateDetail?.type==='B_PSW' ? 'Bulk Phone Changes' : 'Bulk Work Mode Changes'}</Text> - Changes with description: {batchUpdateDetail?.description}</Paragraph>
        <Paragraph type="secondary" style={{fontSize: 'smaller'}}>Please note this task may not be marked as completed, as there may be some pendants which are offline meaning they have not yet accepted the changes requested.</Paragraph>
    </Typography>

    const handleRerun = () => {
        const payload =
            {...batchUpdateDetail?.data,
                description: `Rerun - ${batchUpdateDetail?.data?.description}` }
        let promises = []
        batchUpdateDetail?.type==='B_WM' ? promises.push(actions.sofiBeacon.applyBatchWM(payload)) : promises.push(actions.sofiBeacon.applyBatchUpdate(payload))

        Promise.all(promises).then(()=>{
            actions.sofiBeacon.fetchBatchUpdateList()
            message.success('Batch update rerun request sent')
            onCancel()
        }).catch((e)=>message.error(e.message))
    }

    const renderPSContent = () => {
        return <Fragment>
            <Typography.Paragraph strong>Settings to be applied:</Typography.Paragraph>
            <Row justify="space-between" className="margin-bottom" wrap={false} align="bottom">
                <Col>
                    <Paragraph>
                        <ul>
                            <li>
                                Restrict inbound calls to emergency contacts only: {batchUpdateDetail?.data?.payload?.only_auth_number_call ? 'On' : 'Off'}
                            </li>
                            <li>
                                Restrict inbound SMS to emergency contacts only: {batchUpdateDetail?.data?.payload?.only_auth_number_sms ? 'On' : 'Off'}
                            </li>
                            <li>
                                Allow {globalConstants.BEACON_SOFIHUB} to hang up button press:  {batchUpdateDetail?.data?.payload?.button_hang_up ? 'On' : 'Off'}
                            </li>
                            <li>
                                Auto answer inbound calls: {batchUpdateDetail?.data?.payload?.auto_answer ? 'On' : 'Off'}
                            </li>
                            <li>
                                If auto answer is on, auto answer after {batchUpdateDetail?.data?.payload?.rings_before_answer} rings
                            </li>
                        </ul>
                    </Paragraph>
                </Col>
                <Col className="text-center">
                    <Button type="primary" onClick={handleRerun}>Rerun all changes</Button>
                </Col>
            </Row>
        </Fragment>
    }

    const renderWMContent = () => {
        return <Fragment>
            <Typography.Paragraph strong>Settings to be applied:</Typography.Paragraph>
            <Row justify="space-between" className="margin-bottom" wrap={false} align="bottom">
                <Col>
                    <Paragraph>
                        <ul>
                            <li>
                                Upload Interval change to: {batchUpdateDetail?.data?.upload_interval && moment.duration(batchUpdateDetail.data.upload_interval).humanize()}
                            </li>
                        </ul>
                    </Paragraph>
                </Col>
                <Col className="text-center">
                    <Button type="primary" onClick={handleRerun}>Rerun all changes</Button>
                </Col>
            </Row>
        </Fragment>
    }

    const ecColumns = [
        {
            title: 'Contact Name',
            dataIndex: 'name',
        },
        {
            title: 'Phone Number',
            dataIndex: 'number',
        },
        {
            title:'On SOS or fall down',
            children: [{
                title: 'Call Phone',
                dataIndex: 'accept_phone',
                valuePropName: 'checked',
                render: (text, item) => <Switch checkedChildren="On" unCheckedChildren="Off" checked={item.accept_phone} disabled/>

            },
            {
                title: 'Send SMS',
                dataIndex: 'accept_sms',
                valuePropName: 'checked',
                render: (text, item) => <Switch checkedChildren="On" unCheckedChildren="Off" checked={item.accept_sms} disabled/>
            }]
        },
    ]

    const renderECContent = () => {
        return <Space direction="vertical" style={{width: '100%'}}>
            <Typography.Paragraph strong>Emergency Contacts changes to be applied:</Typography.Paragraph>
            <Typography.Paragraph>Mode: <Typography.Text strong>{batchUpdateDetail?.data?.mode==='M' ? 'Merge mode' : 'Replace mode'}</Typography.Text></Typography.Paragraph>
            <Table
                size="small"
                dataSource={batchUpdateDetail?.data?.deleted_ecs}
                columns={ecColumns}
                rowKey="index"
                pagination={false}
                title={()=> <b>Removed Emergency Contacts:</b>}
            />
            <Table
                size="small"
                dataSource={batchUpdateDetail?.data?.added_ecs}
                columns={ecColumns}
                rowKey="index"
                pagination={false}
                title={()=> <b>Added Emergency Contacts:</b>}
            />
        </Space>
    }

    const columns = [
        {
            title: 'Display Name',
            dataIndex: 'display_name',
        },
        {
            title: 'Device IMEI',
            dataIndex: 'imei',
        },
        {
            title: 'Applied At',
            dataIndex: 'sent_at',
            defaultSortOrder: 'descend',
            sorter: (a, b) => sortDateTime(a.sent_at, b.sent_at),
            render: (text) => text && moment(text).format(globalConstants.DATETIME_FORMAT)
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

    return batchUpdateRecord? <Modal
        width={850}
        open={open}
        onCancel={onCancel}
        title={renderTitle}
        footer={null}
        destroyOnClose
    >
        <Space direction="vertical" style={{width: '100%'}} >
            <Table
                pagination={{pageSize: 5}}
                bordered
                size="small"
                columns={columns}
                dataSource={dataSource}
                rowKey="id"
            />
            {batchUpdateDetail?.type==='B_PSW'? renderPSContent(): batchUpdateDetail?.type==='B_EC' ? renderECContent() : renderWMContent() }
        </Space>
    </Modal> : null
}

ViewResultModal.propTypes={
    open: PropTypes.bool,
    onCancel: PropTypes.func,
    batchUpdateRecord: PropTypes.object
}

export default ViewResultModal

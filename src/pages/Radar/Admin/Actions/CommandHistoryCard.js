import { Button, Card, Col, Modal, Row, Space, Table, Typography } from 'antd'
import { sortDateTime, sortString } from '@/utility/Common'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import { useState } from 'react'
import JSONPretty from 'react-json-pretty'

const description = (label, content) => {
    return <Row gutter={[12,12]}>
        <Col xs={8} lg={6} style={{textAlign:'end'}}>
            <Typography.Text strong>{label}:</Typography.Text>
        </Col>
        <Col xs={16} lg={18}>
            <Typography.Text>{content}</Typography.Text>
        </Col>
    </Row>
}

const CommandHistoryCard  = (props) => {

    const {radarCommands} = props
    const [detailModal, setDetailModal] = useState(false)
    const [detailRecord, setDetailRecord] = useState()

    const handleDetail = (record) => {
        setDetailModal(true)
        setDetailRecord(record)
    }
    const handleCancel = () => {
        setDetailModal(false)
        setDetailRecord(null)
    }

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            sorter: (a, b) => a.id-b.id,
            defaultSortOrder: 'descend'
        },
        {
            title: 'Message Type',
            dataIndex: 'msg_type',
            sorter: (a, b) => sortString(a,b,'msg_type'),
        },
        {
            title: 'Message Status',
            dataIndex: 'msg_status',
            sorter: (a, b) => sortString(a,b,'msg_status'),
        },
        {
            title: 'Created By',
            dataIndex: 'created_by',
            sorter: (a, b) => sortString(a,b,'created_by'),
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            sorter: (a, b) => sortDateTime(a.created_at,b.created_at),
            render: (value) =>  value ? moment(value).format(globalConstants.DATETIME_FORMAT) : 'No Data Yet'
        },
        {
            title: 'Action',
            key: 'action',
            render: (record) => (
                <a onClick={()=>handleDetail(record)}>View Detail</a>
            ),
        }]

    return(
        <Card title={'Async Command History'}>
            <Typography.Paragraph>
                Please note sending a test fall or activation will not show in this table.
            </Typography.Paragraph>
            <Table
                dataSource={radarCommands}
                columns={columns}
                key="id"
            />
            <Modal
                width={800}
                title="Async Command Detail"
                open={detailModal}
                onCancel={handleCancel}
                footer={[<Button key="done" type="primary" onClick={handleCancel}>Done</Button>]}
            >
                {detailRecord && <Space direction="vertical" style={{ display: 'flex' }}>
                    {description('ID',detailRecord?.id)}
                    {description(`${globalConstants.RADAR_HOBA} ID`,detailRecord?.id)}
                    {description('Device Name',detailRecord?.device_name)}
                    {description('Message UUID',detailRecord?.msg_uuid)}
                    {description('Message Status',detailRecord?.msg_status)}
                    {description('Message Payload',<JSONPretty id="json-pretty" data={detailRecord?.msg_payload}/>)}
                    {description('Created At', moment(detailRecord?.created_at).format(globalConstants.DATETIME_FORMAT))}
                    {description('Created By',detailRecord?.created_by)}
                    {description('Attempt Max',detailRecord?.attempt_max)}
                    {description('Attempt Seq',detailRecord?.attempt_seq)}
                    {description('Last Attempt At',moment(detailRecord?.last_attempt_at).format(globalConstants.DATETIME_FORMAT))}
                    {description(`${globalConstants.RADAR_HOBA} Ack At`, detailRecord?.radar_ack_at ? moment(detailRecord?.radar_ack_at).format(globalConstants.DATETIME_FORMAT): '')}
                    {description(`${globalConstants.RADAR_HOBA} Ack Payload`,detailRecord?.radar_ack_payload ? <JSONPretty id="json-pretty" data={detailRecord?.radar_ack_payload}/> : '')}
                </Space>}
            </Modal>
        </Card>
    )
}

export default CommandHistoryCard

import { Fragment, useEffect, useState } from 'react'
import { actions, connect } from 'mirrorx'
import { globalConstants } from '@/_constants'
import { sortDateTime } from '@/utility/Common'
import moment from 'moment'
import { Col, Divider, Input, message, Popconfirm, Row, Table, Tooltip } from 'antd'
import { isMobile } from 'react-device-detect'
import { DeleteOutlined } from '@ant-design/icons'
import UpdateSubscriptionHistoryDescription from '@/pages/Subscription/UpdateSubscriptionHistoryDescription'

const mapStateToProps = state => ({
    subscription: state.billing.subscription,
    subscriptionHistory: state.billing.subscriptionHistory,
})

const SubscriptionHistory = (props) => {
    const {subscription, subscriptionHistory} = props
    const [histories, setHistories] = useState(subscriptionHistory?.content)
    const [updateModal, setUpdateModal] = useState(false)
    const [selectedRecord, setSelectedRecord] = useState()

    useEffect(()=>actions.billing.fetchSubscriptionHistory(subscription.id),[subscription])
    useEffect(()=>setHistories(subscriptionHistory?.content),[subscriptionHistory])

    const handleDelete = (record) => {
        actions.billing.removeSubscriptionHistory(record.id).then(()=>{
            message.success('Deleted')
            actions.billing.fetchSubscriptionHistory(subscription.id)
        })
    }

    const handleUpdate = (desc) => {
        const payload = {
            ...selectedRecord,
            event_description: desc
        }
        actions.billing.updateSubscriptionHistoryDescription(payload).then(()=>{
            message.success('Updated')
            actions.billing.fetchSubscriptionHistory(subscription.id)
            setUpdateModal(false)
        })
    }

    const handleSearch = (value) => {
        if (value === '' ){
            setHistories(subscriptionHistory?.content)
        }else{
            setHistories(subscriptionHistory?.content?.filter(
                record => record.subscription_status?.toLowerCase().includes(value.toLowerCase()) ||
                    record.author?.toLowerCase().includes(value.toLowerCase()) ||
                    record.event_type?.toLowerCase().includes(value.toLowerCase())
            ))
        }
    }

    const renderHeader = () => {
        return (<Fragment>
            <Row align="middle" className="margin-bottom">
                <Col>
                    <Input.Search
                        placeholder="Search here ..."
                        onSearch={value => handleSearch(value)}
                        enterButton
                        autoFocus = {!isMobile}
                    />
                </Col>
            </Row>
        </Fragment>
        )
    }

    const handleOpenModal = (record) => {
        setSelectedRecord(record)
        setUpdateModal(true)
    }

    const columns = [
        {
            title: 'Subscription Status',
            dataIndex: 'subscription_status',
        },
        {
            title: 'Author',
            dataIndex: 'author',
        },

        {
            title: 'Event Type',
            dataIndex: 'event_type',
        },

        {
            title: 'Event Description',
            dataIndex: 'event_description',
        },

        {
            title: 'Event Time',
            dataIndex: 'event_time',
            defaultSortOrder: 'descend',
            sorter: (a, b) => sortDateTime(a.event_time, b.event_time),
            render: (text) => text && moment(text).format(globalConstants.DATETIME_FORMAT)
        },

        {
            title: 'Actions',
            render: (record)=><Fragment>
                <a onClick={()=>handleOpenModal(record)}>Update Description</a>
                <Divider type={'vertical'}/>
                <Popconfirm
                    title="Are you sure delete this history?"
                    onConfirm={()=>handleDelete(record)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Tooltip title="Delete this history"><DeleteOutlined /></Tooltip>
                </Popconfirm>
            </Fragment>
        }

    ]

    return (
        <Row className="systemDetails" justify="center">
            <Col xs={22} xxl={18}>
                <Table
                    scroll={{x: true}}
                    loading={!histories}
                    columns={columns}
                    dataSource={histories}
                    rowKey="id"
                    title={renderHeader}
                />
            </Col>
            <UpdateSubscriptionHistoryDescription
                open={updateModal}
                onOk = {handleUpdate}
                onCancel={()=>setUpdateModal(false)}
                historyRecord={selectedRecord}
            />
        </Row>
    )
}

export default connect(mapStateToProps, null)(SubscriptionHistory)

import {Button, Card, message, Space} from 'antd'
import {useEffect, useState} from 'react'
import {actions} from 'mirrorx'
import propTypes from 'prop-types'
import NotificationTable from '@/components/NotificationTable/index'

const MultipleDeviceNotificationTable = (props) => {
    const { me, notifications, adminPage, handleCancel} = props
    const [dataSource, setDataSource] = useState([])

    useEffect(()=>{notifications && setDataSource(notifications)}, [notifications])

    const onChange = (checked, deviceId, record, channel) => {
        const result = dataSource.map(notificationRecord=>{
            return notificationRecord?.product.id === deviceId ? {
                ...notificationRecord,
                product_user_notifications: notificationRecord.product_user_notifications.map(item=>{
                    if (item.event_type === record.event_type && item.channel===channel){
                        item.enabled = checked
                        return item
                    } else return item
                })
            } : notificationRecord
        })
        setDataSource(result)
    }

    const handleSave = () => {
        let result = []
        result = dataSource.map(notificationRecord=>[...result, ...notificationRecord.product_user_notifications]).flat()
        actions.radar.updateRadarNotifications(result).then(()=>{
            message.success('Saved')
            handleCancel && handleCancel()
        })
    }

    const onCancel = () => {
        setDataSource(notifications)
        handleCancel && handleCancel()
    }

    return <>
        <Space direction="vertical" style={{width: '100%'}}>
            {dataSource?.map(notification=>{
                return <Card
                    size="small"
                    title={notification?.product?.display_name}
                    key={notification?.product?.id}
                    bordered={false}
                >
                    <NotificationTable
                        productId={notification?.product?.id}
                        user={notification?.flat_user}
                        me={me}
                        notifications={notification?.product_user_notifications}
                        footer={false}
                        adminPage={adminPage}
                        onChange={onChange}
                    />
                </Card>
            })}
            <Space className="floatRight">
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="save" type="primary" onClick={handleSave}>
                    Update
                </Button></Space>
        </Space>


    </>
}

MultipleDeviceNotificationTable.propTypes={
    user: propTypes.object,
    me: propTypes.object,
    notifications: propTypes.array,
    adminPage: propTypes.bool,
    handleCancel: propTypes.func,
}
export default MultipleDeviceNotificationTable

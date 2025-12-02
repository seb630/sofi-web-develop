import {Button, message, Space, Switch, Table} from 'antd'
import {useEffect, useState} from 'react'
import {globalConstants} from '@/_constants'
import {actions} from 'mirrorx'
import propTypes from 'prop-types'

const NotificationTable = (props) => {
    const {productId, user, me, noAccess, notifications, adminPage, handleCancel, footer, onChange} = props
    const [dataSource, setDataSource] = useState([])

    useEffect(()=>{notifications && setDataSource(generateDataSource(notifications))}, [notifications])

    const generateDataSource = (dataSource) => {
        const result = []
        result.push({
            event: ' - There is a fall event',
            event_type: 'RADAR_FALL',
            PUSH_NOTIFICATION: dataSource.find(record=>record.event_type==='RADAR_FALL' && record.channel==='PUSH_NOTIFICATION') ? dataSource.find(record=>record.event_type==='RADAR_FALL' && record.channel==='PUSH_NOTIFICATION').enabled : true,
            EMAIL: dataSource.find(record=>record.event_type==='RADAR_FALL' && record.channel==='EMAIL') ? dataSource.find(record=>record.event_type==='RADAR_FALL' && record.channel==='EMAIL').enabled : true,
            SMS_VIA_API: dataSource.find(record=>record.event_type==='RADAR_FALL' && record.channel==='SMS_VIA_API') ? dataSource.find(record=>record.event_type==='RADAR_FALL' && record.channel==='SMS_VIA_API').enabled : true,
        })

        result.push({
            event: ` - The ${globalConstants.RADAR_GENERIC} goes offline`,
            event_type: 'RADAR_OFFLINE',
            PUSH_NOTIFICATION: dataSource.find(record=>record.event_type==='RADAR_OFFLINE' && record.channel==='PUSH_NOTIFICATION') ? dataSource.find(record=>record.event_type==='RADAR_OFFLINE' && record.channel==='PUSH_NOTIFICATION').enabled : true,
            EMAIL: dataSource.find(record=>record.event_type==='RADAR_OFFLINE' && record.channel==='EMAIL') ? dataSource.find(record=>record.event_type==='RADAR_OFFLINE' && record.channel==='EMAIL').enabled : true,
            SMS_VIA_API: dataSource.find(record=>record.event_type==='RADAR_OFFLINE' && record.channel==='SMS_VIA_API') ? dataSource.find(record=>record.event_type==='RADAR_OFFLINE' && record.channel==='SMS_VIA_API').enabled : true,
        })
        return result
    }

    const onSwitchChange = (checked, record, channel) => {
        if (onChange) {
            onChange(checked, productId, record, channel)
        }else {
            const result = dataSource.map(item=>{
                if (item.event === record.event){
                    item[channel] = checked
                    return item
                } else return item
            })
            setDataSource(result)
        }
    }

    const handleSave = () => {
        const result = []
        dataSource.map(event=>{
            Object.keys(event).filter(key=>key!=='event'&& key!=='event_type').map(key=>{
                (key!=='SMS_VIA_API' || adminPage) && result.push({
                    product_id: productId,
                    user_id: user? user.user_id : me.user_id,
                    event_type:event.event_type,
                    channel: key,
                    enabled: event[key]
                })
            })
        })
        actions.radar.updateRadarNotifications(result).then(()=>{
            message.success('Saved')
            handleCancel && handleCancel()
        })
    }

    const columns = [{
        title: `Notify ${user? me?.user_id === user.user_id ? 'me': `${user.first_name} ${user.last_name}` : 'me' } when:`,
        dataIndex: 'event',
    },{
        title: 'Push Notifications',
        dataIndex: 'PUSH_NOTIFICATION',
        render: (text,record) => <Switch checked={record.PUSH_NOTIFICATION} onChange={(checked)=>onSwitchChange(checked,record, 'PUSH_NOTIFICATION')} disabled={noAccess}></Switch>
    },{
        title: 'Email',
        dataIndex: 'EMAIL',
        render: (text,record) => record?.event_type!=='RADAR_OFFLINE' && <Switch checked={record.EMAIL} onChange={(checked)=>onSwitchChange(checked,record, 'EMAIL')} disabled={noAccess}></Switch>
    }]

    adminPage && columns.push({
        title: 'SMS',
        dataIndex: 'SMS_VIA_API',
        render: (text,record) => record?.event_type!=='RADAR_OFFLINE' && <Switch checked={record.SMS_VIA_API} onChange={(checked)=>onSwitchChange(checked,record, 'SMS_VIA_API')} disabled={noAccess}></Switch>
    })

    const onCancel = () => {
        setDataSource(generateDataSource(notifications))
        handleCancel && handleCancel()
    }

    return <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        rowKey="event"
        footer={()=>footer ? <Space className="floatRight">
            <Button key="cancel" onClick={onCancel}>
                Cancel
            </Button>
            <Button key="save" type="primary" onClick={handleSave} disabled={noAccess}>
                Save
            </Button></Space>:undefined}
    />
}

NotificationTable.defaultProps={
    footer: true,
    adminPage: false,
    noAccess: false
}

NotificationTable.propTypes={
    productId: propTypes.number,
    user: propTypes.object,
    me: propTypes.object,
    noAccess: propTypes.bool,
    notifications: propTypes.array,
    adminPage: propTypes.bool,
    handleCancel: propTypes.func,
    onChange: propTypes.func,
    footer: propTypes.bool,
}
export default NotificationTable

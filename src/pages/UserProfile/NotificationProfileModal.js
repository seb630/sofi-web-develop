import {Modal, Typography} from 'antd'
import {globalConstants} from '@/_constants'
import {useEffect, useState} from 'react'
import {actions} from 'mirrorx'
import MultipleDeviceNotificationTable from '@/components/NotificationTable/MultipleDeviceNotificationTable'

const NotificationProfile = (props) => {
    const {open,onClose, userDetails} = props
    const [dataSource, setDataSource] = useState()

    useEffect(()=>{
        if (open){
            const payload = {
                userId: userDetails.user_id
            }
            actions.radar.fetchRadarNotifications(payload).then((result)=>{
                setDataSource(result)
            })
        }
    // eslint-disable-next-line
    }, [open])

    return <Modal
        title="Notification Preferences"
        open={open}
        onCancel={onClose}
        width='850px'
        footer={false}
    >
        <Typography.Paragraph>
            Please note {globalConstants.BEACON_SOFIHUB} and {globalConstants.HUB_SOFIHUB} notification preferences are not available here.
        </Typography.Paragraph>
        <Typography.Paragraph  className="margin-bottom">
            To see those notification settings click on the device you want to change and visit the settings tab.
        </Typography.Paragraph>
        <MultipleDeviceNotificationTable
            user={userDetails}
            me={userDetails}
            notifications={dataSource}
            handleCancel={onClose}
        />
    </Modal>
}

export default NotificationProfile

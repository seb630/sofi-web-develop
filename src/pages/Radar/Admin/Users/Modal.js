import {Fragment, useState} from 'react'
import {message, Modal} from 'antd'
import {actions} from 'mirrorx'
import NotificationTable from '@/components/NotificationTable'

const EditNotification = (props) =>{
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState()
    const { radarUser, userId, radarId, me } = props
    const editTitle = radarUser.product.display_name ? radarUser.product.display_name : radarUser.flat_user.first_name + ' ' + radarUser.flat_user.last_name

    const handleOpen = () => {
        actions.radar.fetchRadarNotifications({
            productId: radarId,
            userId: userId
        }).then(result=>{
            setOpen(true)
            setNotifications(result.length>0 ? result[0]?.product_user_notifications : [])
        }).catch(()=>message.error('Something error happened'))
    }

    return (<Fragment>
        <a className="js-updateAPNBtn" onClick={handleOpen}>Update</a>
        {notifications && <Modal
            width={'800px'}
            footer={null}
            open={open}
            onCancel={()=>setOpen(false)}
            centered={false}
            title={`Edit Notification: ${editTitle}`}
        >
            <NotificationTable
                productId={radarId}
                user={radarUser.flat_user}
                me={me}
                notifications={notifications}
                adminPage
                handleCancel={()=>setOpen(false)}
            />
        </Modal>}
    </Fragment>)
}

export default EditNotification

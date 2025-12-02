import { Fragment, useState } from 'react'
import { Modal} from 'antd'
import Notifications from './notifications'

const EditNotification = (props) =>{
    const [open, setOpen] = useState(false)
    const { hubUser, userId, hubId } = props

    const editTitle = hubUser.display_name ? hubUser.display_name : hubUser.first_name + ' ' + hubUser.last_name
    return (<Fragment>
        <a className="js-updateAPNBtn" onClick={()=>setOpen(true)}>Update</a>
        <Modal
            width={'80%'}
            footer={null}
            open={open}
            onCancel={()=>setOpen(false)}
            centered={false}
            title={`Edit Notification: ${editTitle}`}
        >
            <Notifications hubUser={hubUser} hubId={hubId} userId={userId}/>
        </Modal>
    </Fragment>)
}

export default EditNotification

import { Modal } from 'antd'
import { globalConstants } from '@/_constants'

const deviceConfirmModal = (radarInvite, handleSubmit, handleCancel) => {
    return Modal.confirm({
        content: <div>
            <div>The carer you invited to this {radarInvite? globalConstants.RADAR_HOBA : globalConstants.HUB_SOFIHUB} will be added to the {
                radarInvite? globalConstants.HUB_SOFIHUB : `${globalConstants.RADAR_HOBA}s`} connected to.</div>
            <div>Are you sure you want to invite the carer to all the devices?</div>
        </div>,
        okText: 'Invite',
        onOk: handleSubmit,
        onCancel: handleCancel
    })
}

export default deviceConfirmModal

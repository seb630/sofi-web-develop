import withProfileModal from './ProfileModal'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'

const CreateProfileAction = (props) => (
    <Button id="createAPNbtn" type="primary" {...props} icon={<PlusOutlined />} size="large">Add a new profile</Button>
)

const UpdateProfileAction = (props) => (
    <a className="js-updateAPNBtn" {...props}><Tooltip title="Edit this profile">
        <EditOutlined />
    </Tooltip></a>
)

const CreateProfileModal = withProfileModal(CreateProfileAction,{ name: 'createProfileModal'})

const UpdateProfileModal = withProfileModal(UpdateProfileAction,{ name: 'editProfileModal'})

export default {
    CreateProfileModal,
    UpdateProfileModal,
}

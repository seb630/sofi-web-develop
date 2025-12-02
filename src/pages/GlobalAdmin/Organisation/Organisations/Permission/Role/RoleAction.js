import withRoleModal from './RoleModal'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'

const CreateRoleAction = (props) => (
    <Button id="createAPNbtn" type="primary" {...props} icon={<PlusOutlined />} size="large">Add a new role</Button>
)

const UpdateRoleAction = (props) => (
    <a className="js-updateAPNBtn" {...props}><Tooltip title="Edit this role">
        <EditOutlined />
    </Tooltip></a>
)

const CreateRoleModal = withRoleModal(CreateRoleAction,{ name: 'createRoleModal'})

const UpdateRoleModal = withRoleModal(UpdateRoleAction,{ name: 'editRoleModal'})

export default {
    CreateRoleModal,
    UpdateRoleModal,
}

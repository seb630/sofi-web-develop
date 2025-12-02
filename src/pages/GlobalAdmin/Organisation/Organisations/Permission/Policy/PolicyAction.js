import withPolicyModal from './PolicyModal'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'

const CreatePolicyAction = (props) => (
    <Button id="createAPNbtn" type="primary" {...props} icon={<PlusOutlined />} size="large">Add a new policy</Button>
)

const UpdatePolicyAction = (props) => (
    <a className="js-updateAPNBtn" {...props}><Tooltip title="Edit this policy">
        <EditOutlined />
    </Tooltip></a>
)

const CreatePolicyModal = withPolicyModal(CreatePolicyAction,{ name: 'createPolicyModal'})

const UpdatePolicyModal = withPolicyModal(UpdatePolicyAction,{ name: 'editPolicyModal'})

export default {
    CreatePolicyModal,
    UpdatePolicyModal,
}

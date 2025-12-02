import withAPNModal from './ApnModal'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'

const CreateAPNAction = (props) => (
    <Button id="createAPNbtn" type="primary" size="large" {...props} icon={<PlusOutlined />} >Add APN</Button>
)

const UpdateAPNAction = (props) => (
    <a className="js-updateAPNBtn" {...props}>Update</a>
)

const CreateAPNModal = withAPNModal(CreateAPNAction,{ name: 'createAPNModal'})

const UpdateAPNModal = withAPNModal(UpdateAPNAction,{ name: 'editAPNModal'})

export default {
    CreateAPNModal,
    UpdateAPNModal
}

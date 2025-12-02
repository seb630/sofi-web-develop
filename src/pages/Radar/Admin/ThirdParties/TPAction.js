import withTPModal from './TPModal'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'

const CreateTPAction = (props) => (
    <Button id="createAPNbtn" type="primary" {...props} icon={<PlusOutlined />} >Add Integration</Button>
)

const UpdateTPAction = (props) => (
    <a className="js-updateAPNBtn" {...props}>Edit</a>
)

const CreateTPModal = withTPModal(CreateTPAction)

const UpdateTPModal = withTPModal(UpdateTPAction)

export default {
    CreateTPModal,
    UpdateTPModal
}

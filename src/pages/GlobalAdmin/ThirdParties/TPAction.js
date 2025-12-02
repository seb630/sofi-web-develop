import withTPModal from './TPModal'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'

const CreateTPAction = (props) => (
    <Button id="createAPNbtn" type="primary" {...props} icon={<PlusOutlined />} size="large">Add Third Party Endpoint</Button>
)

const UpdateTPAction = (props) => (
    <a className="js-updateAPNBtn" {...props}>Update</a>
)

const CreateTPOption = (props) => (
    <div
        style={{ padding: '8px', cursor: 'pointer' }}
        onMouseDown={e => e.preventDefault()}
        {...props}>
        <PlusOutlined /> Don&#39;t see? Add new IP
    </div>
)

const CreateTPModal = withTPModal(CreateTPAction,{ name: 'createTPModal'})

const UpdateTPModal = withTPModal(UpdateTPAction,{ name: 'editTPModal'})

const CreateTPinAccount = withTPModal(CreateTPOption,{ name: 'createTPModal'})

export default {
    CreateTPModal,
    UpdateTPModal,
    CreateTPinAccount,
}

import withSIMModal from './SIMModal'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'

const CreateSIMAction = (props) => (
    <Button id="createAPNbtn" type="primary" {...props} icon={<PlusOutlined />} size="large">Add SIM Record</Button>
)

const UpdateSIMAction = (props) => (
    <a className="js-updateAPNBtn" {...props}>Update</a>
)

const AllocateAction = (props)=> (
    <a className="js-updateAPNBtn" {...props}>allocate this device a SIM</a>
)

const CreateSIMModal = withSIMModal(CreateSIMAction,{ name: 'createSIMModal'})

const UpdateSIMModal = withSIMModal(UpdateSIMAction,{ name: 'editSIMModal'})

const AllocateSIMModal = withSIMModal(AllocateAction,{ name: 'allocateSIMModal'})

export default {
    CreateSIMModal,
    UpdateSIMModal,
    AllocateSIMModal
}

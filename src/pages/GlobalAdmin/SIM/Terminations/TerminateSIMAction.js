import withSIMModal from './TerminateSIMModal'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'

const CreateSIMAction = (props) => (
    <Button id="createAPNbtn" type="primary" {...props} icon={<PlusOutlined />} size="large">Add SIM Termination</Button>
)

const UpdateSIMAction = (props) => (
    <a className="js-updateAPNBtn" {...props}>Edit</a>
)


const CreateSIMModal = withSIMModal(CreateSIMAction,{ name: 'createSIMModal'})

const UpdateSIMModal = withSIMModal(UpdateSIMAction,{ name: 'editSIMModal'})


export default {
    CreateSIMModal,
    UpdateSIMModal,
}

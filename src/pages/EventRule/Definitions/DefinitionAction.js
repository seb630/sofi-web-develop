import withRuleModal from './DefinitionModal'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'

const CreateRuleAction = (props) => (
    <Button id="createAPNbtn" size='large' type="primary" {...props} icon={<PlusOutlined />} >Add New Rule</Button>
)

const UpdateRuleAction = (props) => (
    <a className="js-updateAPNBtn" {...props}>Edit</a>
)

const SeeRuleAction = (props) => (
    <a className="js-updateAPNBtn" {...props}>See Rule</a>
)

const CreateRuleModal = withRuleModal(CreateRuleAction,{ name: 'createRuleModal'})

const UpdateRuleModal = withRuleModal(UpdateRuleAction,{ name: 'editRuleModal'})

const SeeRuleModal = withRuleModal(SeeRuleAction,{ name: 'seeRuleModal'})

export default {
    CreateRuleModal,
    UpdateRuleModal,
    SeeRuleModal
}

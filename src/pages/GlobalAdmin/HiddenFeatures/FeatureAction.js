import withFeatureModal from './FeatureModal'
import { PlusOutlined } from '@ant-design/icons'
import {Button} from 'antd'

const CreateFeatureAction = (props) => (
    <Button id="createAPNbtn" type="primary" {...props} icon={<PlusOutlined />} size="large">Add Portal Feature</Button>
)

const UpdateFeatureAction = (props) => (
    <a className="js-updateAPNBtn" {...props}>Update</a>
)

const CreateFeatureModal = withFeatureModal(CreateFeatureAction,{ name: 'createFeatureModal'})

const UpdateFeatureModal = withFeatureModal(UpdateFeatureAction,{ name: 'editFeatureModal'})

export default {
    CreateFeatureModal,
    UpdateFeatureModal,
}

import { Component } from 'react'
import { Form } from '@ant-design/compatible'
import { Modal, Input, Select } from 'antd'
import PropTypes from 'prop-types'
import {globalConstants} from '@/_constants'
import changeCase from 'change-case'
import {actions} from 'mirrorx'

class NewSpaceModal extends Component {

    handleSave = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                const hubId = this.props.hubId
                const space = {
                    hub_id: hubId,
                    kind: values.type,
                    name: values.name,
                }
                actions.hub.addHubSpace({hubId, space}).then(()=>{
                    this.props.onCancel()
                })
            }
        })
    }

    render() {
        const {open, onCancel, form} = this.props

        const { getFieldDecorator } = form

        const nameTip = 'What should the name of the room be? Example: Spare Bedroom, Guest Bathroom...'
        const typeTip = <div><p>
            What should the room type be? Please note, only the master bedroom should be of type &quot;Bedroom&quot;
        </p>
        <i>Don&#39;t see the room type you need? Use &quot;Other Room&quot;</i>
        </div>
        return (
            <Modal
                title="Add New Room"
                open={open}
                onCancel={onCancel}
                onOk={this.handleSave}
                okText='Save'
                cancelText='Cancel'
            >
                <Form layout="vertical">
                    <Form.Item help={nameTip}>
                        {getFieldDecorator('name', {
                            rules: [{ required: true, message: 'Please input the name of the room!' }],
                        })(
                            <Input placeholder="Room Name"/>
                        )}
                    </Form.Item>
                    <Form.Item
                        help={typeTip}
                    >
                        {getFieldDecorator('type', {
                            rules: [
                                { required: true, message: 'Please select room type!' },
                            ],
                        })(
                            <Select placeholder="Please select room type">
                                {globalConstants.SPACES.map(space=>
                                    <Select.Option key={space} value={space}>{changeCase.title(space)}</Select.Option>
                                )}
                            </Select>
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}

NewSpaceModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    hubId: PropTypes.string
}

export default Form.create()(NewSpaceModal)

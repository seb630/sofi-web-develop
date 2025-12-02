import { Component } from 'react'
import { Form } from '@ant-design/compatible'
import { Input, Modal, Select } from 'antd'
import PropTypes from 'prop-types'
import { actions } from 'mirrorx'

class AllocateSpaceModal extends Component {

    handleSave = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                const payload = {
                    hub_id: this.props.hubId,
                    device_id: this.props.deviceId,
                    space_id: values.space,
                    device_name: values.name,
                }
                actions.hub.linkSensorToSpace(payload).then(()=>{
                    this.props.onCancel()
                })
            }
        })
    }

    render() {
        const {open, onCancel, form} = this.props

        const { getFieldDecorator } = form

        const nameTip = <p>What should the name of the sensor be? Example: Guest Bathroom Motion, Hallway Motion,
            Front Door Motion...</p>
        const typeTip = <p>What room should the sensor be allocated to?</p>
        return (
            <Modal
                title="Allocate Space"
                open={open}
                onCancel={onCancel}
                onOk={this.handleSave}
                okText='Save'
                cancelText='Cancel'
            >
                <Form layout="vertical">
                    <Form.Item help={nameTip}>
                        {getFieldDecorator('name', {
                            rules: [{ required: true, message: 'Please input the name of the sensor!' }],
                        })(
                            <Input placeholder="New sensor name"/>
                        )}
                    </Form.Item>
                    <Form.Item
                        help={typeTip}
                    >
                        {getFieldDecorator('space', {
                            rules: [
                                { required: true, message: 'Please select room for the sensor!' },
                            ],
                        })(
                            <Select placeholder="Please select room for the sensor"  style={{width: '180px'}}>
                                {this.props.hubSpaces.map(space=>
                                    <Select.Option key={space.space_id} value={space.space_id}>{space.name}
                                    </Select.Option>)}
                            </Select>
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}

AllocateSpaceModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    deviceId: PropTypes.number,
    hubId: PropTypes.string.isRequired,
    hubSpaces: PropTypes.array
}

export default Form.create()(AllocateSpaceModal)

import { Component } from 'react'
import { Form } from '@ant-design/compatible'
import { Input, message, Modal } from 'antd'
import PropTypes from 'prop-types'
import { globalConstants } from '@/_constants'

class DeleteModal extends Component {

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err) => {
            if (!err) {
                this.props.onDelete().then(()=> {
                    message.success('Group deleted')
                    this.props.onClose()
                }).catch((error)=>{
                    Modal.error({
                        title: 'Error deleting group',
                        content: (
                            <div>
                                <p>{error.message}</p>
                            </div>
                        )
                    })
                })
            }
        })
    }

    render() {
        const {open, onClose, selectedGroup, selectedGroupDevices, deviceGroups, form} = this.props
        const hubCount = selectedGroupDevices?.reduce((acc, item)=> item.device_type==='HUB' ? acc+1 : acc, 0)
        const beaconCount = selectedGroupDevices?.reduce((acc, item)=>item.device_type==='BEACON' ? acc+1 : acc, 0)
        const childCount = deviceGroups?.reduce((acc, item)=> item.parent_id===selectedGroup?.organization_device_group_id ? acc+1 : acc, 0)

        return (
            <Modal
                okText="Delete"
                open={open} onCancel={onClose}
                onOk={this.handleSubmit}
                okButtonProps={{type:'danger'}}
                cancelButtonProps={{type:'primary'}}
                centered={false}
                title="Are you sure you want to delete this group?"
                style={{height: '500px'}}
                destroyOnClose
            >
                <Form layout="vertical">
                    <p>Please note the devices in this group will not be removed from your organisation.</p>

                    <p>If you delete this group you will disassociate {hubCount} {globalConstants.HUB_GENERIC}s and {beaconCount} {globalConstants.PENDANT_GENERIC}s from this group.
                        You will also remove {childCount} sub groups which belong to this group, their devices, an any sub groups that
                        belong to them.</p>
                    <p>Are you sure you want to delete this group, and all sub groups? And disassociate all devices from these groups?</p>

                    <p>To confirm type &quot;{selectedGroup?.name}&quot; into the text box.</p>

                    <Form.Item
                        label="Group name"
                    >
                        {form.getFieldDecorator('name', {
                            rules: [{
                                type:'enum', enum: [selectedGroup?.name],  message: 'name does not match, you ' +
                                        'must type in the exact name in order to delete this group',
                            }, {
                                required: true, message: 'Please input the name!',
                            }],
                        })(
                            <Input />
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}

DeleteModal.propTypes={
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    selectedGroup: PropTypes.object,
    selectedGroupDevices: PropTypes.array,
    deviceGroups: PropTypes.array,
}

export default Form.create({})(DeleteModal)

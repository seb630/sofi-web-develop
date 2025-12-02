import { Component } from 'react'
import { actions } from 'mirrorx'
import { Form } from '@ant-design/compatible'
import { Input, message, Modal } from 'antd'
import PropTypes from 'prop-types'

const FormItem = Form.Item

class DeviceGroupModal extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    handleSubmit = (e) => {
        e.preventDefault()
        const {currentOrg, form, selectedGroup, edit, type } = this.props
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let orgId = currentOrg.organization_id
                let payload = {
                    ...selectedGroup,
                    organization_id: currentOrg.organization_id,
                    name: values.name,
                }
                let promise = []
                if (type==='device'){
                    if (edit){
                        payload.parent_id = selectedGroup.parent_id
                        promise.push(actions.organisation.updateDeviceGroup({ orgId, payload }))
                    }else{
                        payload.parent_id = selectedGroup?.organization_device_group_id || null
                        payload.organization_device_group_id = null
                        promise.push( actions.organisation.createDeviceGroup({ orgId, payload }))
                    }
                } else {
                    if (edit) {
                        payload.parent_id = selectedGroup.parent_id
                        promise.push(actions.organisation.updateUserGroup({orgId, payload}))
                    } else {
                        payload.parent_id = selectedGroup?.organization_user_group_id || null
                        payload.organization_user_group_id = null
                        promise.push(actions.organisation.createUserGroup({orgId, payload}))
                    }
                }
                Promise.all(promise).then(() => {
                    message.success(`Group ${edit? ' edited' : 'added'} success!`)
                    this.props.form.resetFields()
                    this.props.onClose()
                }, (error) => {
                    message.error(error.message)
                })
            }
        })
    }


    render() {
        const { open, onClose, form, type, selectedGroup, edit } = this.props
        const { getFieldDecorator } = form
        return (
            <Modal
                title={type==='device' ? `${edit? 'Edit':'Add'} device group`: `${edit? 'Edit':'Add'} user group` }
                open={open}
                onOk={this.handleSubmit}
                okText="Submit"
                onCancel={onClose}
            >
                <Form layout="vertical">
                    <FormItem
                        label="Group Name"
                    >
                        {getFieldDecorator('name', {
                            rules: [{
                                required: true, message: 'Please input the group name!',
                            }],
                            initialValue: edit ? selectedGroup?.name : ''
                        })(
                            <Input />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}

DeviceGroupModal.propTypes ={
    open: PropTypes.bool,
    onClose: PropTypes.func,
    currentOrg: PropTypes.object,
    type: PropTypes.oneOf(['user','device']),
    selectedGroup: PropTypes.object,
    organization_device_group_id: PropTypes.number,
    edit: PropTypes.bool,
}

export default Form.create() (DeviceGroupModal)

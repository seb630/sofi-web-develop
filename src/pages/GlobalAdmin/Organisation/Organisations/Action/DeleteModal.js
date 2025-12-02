import { Component } from 'react'
import { Form } from '@ant-design/compatible'
import { Input, Modal } from 'antd'
import PropTypes from 'prop-types'

class DeleteOrgModal extends Component {

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err) => {
            if (!err) {
                this.props.onDelete()
            }
        })
    }

    render() {
        const {open, onClose, selectedOrg, form} = this.props

        return (
            <Modal
                okText="Delete"
                open={open} onCancel={onClose}
                onOk={this.handleSubmit}
                okButtonProps={{type:'danger'}}
                cancelButtonProps={{type:'primary'}}
                centered={false}
                title="Are you sure you want to delete this organisation?"
                style={{height: '500px'}}
                destroyOnClose
            >
                <Form layout="vertical">
                    <p>Deleting this organisation: &quot;{selectedOrg.name}&quot; does not delete the devices in the organisation, nor the
                        accounts of the users who are part of the organisation. The relationships that devices have with this organisation
                        and with its users will be deleted. Are you sure you want to delete this organisation?</p>

                    <p>To confirm type into the text box the name of this organisation which is: &quot;{selectedOrg.name}&quot;</p>

                    <Form.Item
                        label="Organisation name"
                    >
                        {form.getFieldDecorator('name', {
                            rules: [{
                                type:'enum', enum: [selectedOrg?.name],  message: 'name does not match, you ' +
                                        'must type in the exact name in order to delete this organisation',
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

DeleteOrgModal.propTypes={
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    selectedOrg: PropTypes.object,
}

export default Form.create({})(DeleteOrgModal)

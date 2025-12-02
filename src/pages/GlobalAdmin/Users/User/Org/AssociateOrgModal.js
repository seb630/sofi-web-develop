import { Component } from 'react'
import { Form } from '@ant-design/compatible'
import { Button, message, Modal, Select } from 'antd'
import { actions } from 'mirrorx'
import { globalConstants } from '../../../../../_constants'
import PropTypes from 'prop-types'

const FormItem = Form.Item

class AssociateOrgUser extends Component {

    handleSubmit = (e, invite) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let payload = {}
                if (invite){
                    payload.email = this.props.currentUser.email
                    payload.organization_id = values.org
                    actions.organisation.inviteOrgUser(payload).then(() => {
                        message.success('Organisation invitation sent')
                        this.props.form.resetFields()
                        this.props.onCancel()
                    }, (error) => {
                        message.error(globalConstants.WENT_WRONG + '(' + error.response.data.message+')')
                    })
                }else{
                    payload.user_id = this.props.currentUser.user_id
                    payload.organization_id = values.org
                    actions.organisation.associateOrgUser(payload).then(() => {
                        message.success('Organisation associated')
                        this.props.form.resetFields()
                        this.props.onCancel()
                    }, (error) => {
                        message.error(globalConstants.WENT_WRONG + '(' + error.response.data.message+')')
                    })
                }

            }
        })
    }

    buildOrgOptions = () => {
        const candidates = this.props.allOrgs && this.props.allOrgs.filter(
            org=> !this.props.userOrgs?.find(x=>x.organization_id===org.organization_id)
        )
        return candidates && candidates.map(org => (
            <Select.Option key={org.organization_id} value={org.organization_id}>{org.name}</Select.Option>
        ))
    }

    render() {
        const { open, onCancel, form } = this.props
        const { getFieldDecorator } = form
        const orgOptions = this.buildOrgOptions()
        return (
            <Modal
                open={open} onCancel={onCancel}
                centered={false} title="Associate Organisation"  style={{height: '500px'}}
                footer={[
                    <Button key="back" onClick={onCancel}>
                        Cancel
                    </Button>,
                    <Button key="add" onClick={(e)=>this.handleSubmit(e, false)}>
                        Add to organisation
                    </Button>,
                    <Button key="invite" type="primary" onClick={(e)=>this.handleSubmit(e, true)}>
                        Invite to organisation
                    </Button>,
                ]}
            >
                <Form layout="vertical">
                    <FormItem
                        label="Organisation"
                    >
                        {getFieldDecorator('org', {
                            rules: [{
                                required: true, message: 'Please select an organisation.',
                            }],
                        })(
                            <Select
                                showSearch
                                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                size="large"
                                placeholder="Please select an organisation..."
                            >
                                {orgOptions}
                            </Select>
                        )}
                    </FormItem>

                </Form>
            </Modal>
        )
    }
}

AssociateOrgUser.propTypes={
    currentUser: PropTypes.object.isRequired,
    userOrgs: PropTypes.array,
    allOrgs: PropTypes.array,
    open: PropTypes.bool,
    onCancel: PropTypes.func,

}

export default Form.create()(AssociateOrgUser)

import { Component, Fragment } from 'react'
import { Form } from '@ant-design/compatible'
import { message, Modal, Progress, Select } from 'antd'
import { actions } from 'mirrorx'
import { globalConstants } from '@/_constants'
import PropTypes from 'prop-types'
import InviteModal from '../../../../../components/InviteOrgModal/InviteOrgModal'

const FormItem = Form.Item

class DirectAddModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            tcModal: false,
            isSubmitting: false,
        }
    }


    handleTCModal = (state) => {
        this.setState({tcModal: state})
    }

    handleTCModalSubmit = () => {
        this.handleTCModal(false)
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let payload = {}
                payload.user_id = values.userId
                payload.organization_id = this.props.currentOrg.organization_id
                actions.organisation.associateOrgUser(payload).then(() => {
                    Modal.success({
                        icon: null,
                        content: <div>
                            <div align="center" className='margin-bottom'>
                                <p className='title'>Added!</p>
                                <Progress type="circle" percent={100}  strokeColor='#44AF86'/>
                            </div>
                            <p>
                                <b>Important:</b> for security reasons, by default any added users do not have access to any aspect of the organisation and its devies.
                            </p>
                            <p>
                                In order for this user to have access to this organisation and or its devices, please assign policies to this user giving them access. If this user is
                                the initial user to be added to this organisation, please allocate the default administrative policy to them.
                            </p>
                            <p>
                               If this is a normal user rather than an admin user, please notify organisational admins to allocate the correct user groups and policies to them.
                            </p>
                        </div>,
                        okText: 'Okay',
                    })
                    this.props.form.resetFields()
                    this.props.onCancel()
                }, (error) => {
                    message.error(globalConstants.WENT_WRONG + '(' + error.response.data.message+')')
                })
            }
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err) => {
            if (!err) {
                this.handleTCModal(true)
            }
        })
    }

    buildUserOptions = () => {
        const candidates = this.props.allUsers ? this.props.allUsers.filter(
            user=> !this.props.orgUsers?.find(x=>x.user_id===user.user_id)) : []
        return candidates.map(user => (
            <Select.Option key={user.user_id} value={user.user_id}>{`${user.first_name} ${user.last_name} (${user.email})`}</Select.Option>
        ))
    }

    render() {
        const { open, onCancel, form, currentOrg } = this.props
        const { getFieldDecorator } = form
        const userOptions = this.buildUserOptions()
        return (
            <Fragment>
                <InviteModal
                    handleModalstate={this.handleTCModal}
                    handleSubmit={this.handleTCModalSubmit}
                    modal={this.state.tcModal}
                    orgName={currentOrg.name}
                />
                <Modal
                    okText="Add"
                    open={open} onCancel={onCancel}
                    onOk={this.handleSubmit}
                    centered={false} title={`Add a new user to ${currentOrg.name}`}
                    okButtonProps={{loading: this.state.isSubmitting}}
                >
                    <Form layout="vertical">
                        <FormItem
                            label="User"
                        >
                            {getFieldDecorator('userId', {
                                rules: [{
                                    required: true, message: 'Please select a user.',
                                }],
                            })(
                                <Select
                                    showSearch
                                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                    size="large"
                                    placeholder="Please select a user..."
                                >
                                    {userOptions}
                                </Select>
                            )}
                        </FormItem>

                    </Form>
                </Modal>
            </Fragment>
        )
    }
}

DirectAddModal.propTypes={
    allUsers: PropTypes.array,
    orgUsers: PropTypes.array,
    currentOrg: PropTypes.object.isRequired,
    open: PropTypes.bool,
    onCancel: PropTypes.func,
}

export default Form.create()(DirectAddModal)

import { Component, Fragment } from 'react'
import { Form } from '@ant-design/compatible'
import { message, Modal, Select } from 'antd'
import { actions } from 'mirrorx'
import { globalConstants } from '@/_constants'
import PropTypes from 'prop-types'

const FormItem = Form.Item

class DirectAddModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isSubmitting: false,
        }
    }

    handleSubmit = (e) => {
        const {type, currentDevice} = this.props
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let payload = {}
                payload.mac_or_imei = type==='HUB' ? currentDevice.mac_address : currentDevice.imei
                payload.organization_id = values.orgId
                payload.type = type
                actions.organisation.associateOrgDevice(payload).then(() => {
                    message.success('Organisation associated')
                    this.props.form.resetFields()
                    this.props.onCancel()
                    type==='HUB' ? actions.hub.getHubOrgs(currentDevice.hub_id) : actions.sofiBeacon.getBeaconOrgs(currentDevice.pub_id)
                }, (error) => {
                    message.error(globalConstants.WENT_WRONG + '(' + error.response.data.message+')')
                })
            }
        })
    }

    buildOrgOptions = () => {
        const candidates = this.props.allOrgs ? this.props.allOrgs.filter(
            org=> !this.props.deviceOrgs.find(x=>x.organization_id===org.organization_id)) : []
        return candidates.map(org => (
            <Select.Option key={org.organization_id} value={org.organization_id}>{org.name}</Select.Option>
        ))
    }

    render() {
        const { open, onCancel, form } = this.props
        const { getFieldDecorator } = form
        const orgOptions = this.buildOrgOptions()
        return (
            <Fragment>
                <Modal
                    okText="Add"
                    open={open} onCancel={onCancel}
                    onOk={this.handleSubmit}
                    centered={false} title="Link to a new organisation"
                    okButtonProps={{loading: this.state.isSubmitting}}
                >
                    <Form layout="vertical">
                        <FormItem
                            label="Organisation"
                        >
                            {getFieldDecorator('orgId', {
                                rules: [{
                                    required: true, message: 'Please select an organisation.',
                                }],
                            })(
                                <Select
                                    autoFocus
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
            </Fragment>
        )
    }
}

DirectAddModal.propTypes={
    allOrgs: PropTypes.array,
    deviceOrgs: PropTypes.array,
    currentDevice: PropTypes.object.isRequired,
    type: PropTypes.oneOf(['HUB','BEACON']).isRequired,
    open: PropTypes.bool,
    onCancel: PropTypes.func,
}

export default Form.create()(DirectAddModal)

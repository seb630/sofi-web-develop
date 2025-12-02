import { Component } from 'react'
import { Form } from '@ant-design/compatible'
import { Checkbox, Input, message, Modal } from 'antd'
import { actions } from 'mirrorx'
import { globalConstants } from '@/_constants'

class BulkDeactivateModal extends Component {

    constructor(props) {
        super(props)
        this.state={
            loading: false,
        }
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.setState({loading:true})
                let payload = values
                payload.disable_product = true
                payload.iccids = this.props.record
                actions.SIM.massDeactivation(payload).then(() => {
                    message.success('Deactivate requested, Please wait up to 30 minutes')
                    this.props.onCancel()
                }).catch(() => {
                    message.error('Deactivation failed, Please contact admin.')
                }).finally(()=>this.setState({loading: false}))
            }
        })
    }

    checkCheckBox = (rule, value, callback) => {
        if (!value) {
            callback('Please confirm you understand the consequences!')
        } else {
            callback()
        }
    }

    render() {
        const { open, onCancel, form } = this.props
        const { getFieldDecorator, getFieldValue } = form

        return (
            <Modal
                width={600}
                okText="Bulk Deactivate"
                open={open} onCancel={onCancel}
                onOk={this.handleSubmit}
                okButtonProps={{ type:'danger', disabled: !getFieldValue('consequence_agreement'), loading: this.state.loading}}
                cancelButtonProps={{type:'primary'}}
                centered={false} title="Are you sure deactivate these SIM cards?"
                destroyOnClose
            >
                <Form layout="vertical">
                    <p>
                        If you de-activate this SIM card it cannot be re-activated again. A de-activated SIM card will
                        stop all data communications between the device and the cloud, and the {globalConstants.HUB_SOFIHUB} or
                        {globalConstants.BEACON_SOFIHUB} will no longer be able to perform all functions (including critical functions like SOS
                        and anomalies). If the device will be used in the future the SIM will need to be replaced (a
                        return to base may be required). Are you sure you wish to de-activate this SIM card?
                    </p>
                    <Form.Item label="Deactivate reason">
                        {
                            getFieldDecorator('reason', {
                            })(
                                <Input maxLength={globalConstants.INPUT_MAX_LENGTH} width={200}/>
                            )
                        }
                    </Form.Item>
                    <Form.Item label="Support company name">
                        {
                            getFieldDecorator('support_name', {
                            })(
                                <Input maxLength={globalConstants.INPUT_MAX_LENGTH} width={200}/>
                            )
                        }
                    </Form.Item>
                    <Form.Item label="Support phone number">
                        {
                            getFieldDecorator('phone', {})(
                                <Input maxLength={globalConstants.INPUT_MAX_LENGTH} width={200}/>
                            )
                        }
                    </Form.Item>
                    <p>To de-activate check the box below to confirm you understand the consequences.</p>
                    <Form.Item>
                        {getFieldDecorator('consequence_agreement', {
                            valuePropName: 'checked',
                            rules: [
                                { validator: this.checkCheckBox }
                            ]
                        })(
                            <Checkbox>I understand</Checkbox>
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}

export default Form.create()(BulkDeactivateModal)

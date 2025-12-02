import { Component } from 'react'
import { Form } from '@ant-design/compatible'
import { Input, message, Modal } from 'antd'
import { actions } from 'mirrorx'
import { globalConstants } from '@/_constants'

class DeactivateModal extends Component {

    constructor(props){
        super(props)
        this.state = {
            loading: false
        }
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err) => {
            if (!err) {
                this.setState({loading: true})
                actions.SIM.deactivateSIM(this.props.record.id).then((result) => {
                    result && !result.errors && message.success('Deactivate requested, Please wait up to 30 minutes')
                    this.props.onCancel()
                }).catch(() => {
                    message.error('Deactivation failed, Please contact admin.')
                }).finally(()=>this.setState({loading: false}))
            }
        })
    }

    render() {
        const { open, onCancel, form, record, carriers } = this.props
        const { getFieldDecorator } = form
        const reactivatable = carriers?.find(carrier=>record?.sim_carrier===carrier.name)?.reactivatable

        return (
            <Modal
                width={600}
                okText="Deactivate"
                open={open} onCancel={onCancel}
                onOk={this.handleSubmit}
                okButtonProps={{ type:'danger', loading: this.state.loading }}
                cancelButtonProps={{type:'primary'}}
                centered={false} title="Are you sure deactivate this SIM card?"
                destroyOnClose
            >
                <Form layout="vertical">
                    {reactivatable? <p>
                        A de-activated SIM card will stop all data communications between the device and the cloud, and
                        the {globalConstants.HUB_SOFIHUB} or {globalConstants.BEACON_SOFIHUB} will no longer be able to perform all functions (including
                        critical functions like SOS and anomalies). This SIM card may support re-activation in the
                        future, however this does not apply to all SIM cards. If the device will be used in the future
                        the SIM may be able to be re-activated, otherwise the SIM card will need to be replaced (a return
                        to base may be required). Are you sure you wish to de-activate this SIM card?
                    </p>:<p>
                        If you de-activate this SIM card it cannot be re-activated again. A de-activated SIM card will
                        stop all data communications between the device and the cloud, and the {globalConstants.HUB_SOFIHUB} or {globalConstants.BEACON_SOFIHUB} will no longer be able to perform all functions (including critical functions like SOS
                        and anomalies). If the device will be used in the future the SIM will need to be replaced (a
                        return to base may be required). Are you sure you wish to de-activate this SIM card?
                    </p>}
                    <p>To de-activate type <b>{record?.product_mac_or_imei}</b> into the text box below to confirm.
                    </p>
                    <Form.Item
                        label="MAC or IMEI"
                    >
                        {getFieldDecorator('mac_or_imei', {
                            rules: [{
                                type:'enum', enum: [record?.product_mac_or_imei],  message: 'MAC or IMEI code does not match, you ' +
                                    'must type in the exact MAC or IMEI code in order to deactivate this SIM card',
                            }, {
                                required: true, message: 'Please input the MAC or IMEI!',
                            }],
                            validateTrigger: 'onBlur'
                        })(
                            <Input />
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}

export default Form.create()(DeactivateModal)

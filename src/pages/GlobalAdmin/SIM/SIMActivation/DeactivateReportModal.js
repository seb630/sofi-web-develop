import { Component, Fragment } from 'react'
import { Form } from '@ant-design/compatible'
import { InputNumber, message, Modal, Select, Switch } from 'antd'
import { actions } from 'mirrorx'
import { globalConstants } from '@/_constants'
import { titleCase } from 'change-case'

class DeactivateReportModal extends Component {

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let innerPayload = {
                    offline: values.offline,
                    offline_for_days: values.offline_for_days,
                    subscription_stale: values.subscription_stale,
                    subscription_stale_for_days: values.subscription_stale_for_days
                }
                const payload = values.product_type === 'HUB' ? {
                    hub_criteria: innerPayload
                } : {
                    beacon_criteria: innerPayload
                }
                actions.SIM.fetchSIMDeactivationSuggestion(payload).then((result)=>{
                    result.length>0 ? message.success('Report generated') : message.info('No result found')
                    this.props.onCancel()
                })
            }
        })
    }

    render() {
        const { open, onCancel, form } = this.props
        const { getFieldDecorator, getFieldValue } = form
        const formItemLayout = {
            labelCol: { xs: 24, sm: 10 },
            wrapperCol: { xs: 24, sm: 14 },
        }

        return (
            <Modal
                width={600}
                okText="Generate"
                open={open} onCancel={onCancel}
                onOk={this.handleSubmit}
                okButtonProps={{ type:'danger' }}
                cancelButtonProps={{type:'primary'}}
                centered={false} title="Generate deactivation report"
                destroyOnClose
            >
                <Form layout="vertical">
                    <Form.Item label="Product Type" {...formItemLayout}>
                        {
                            getFieldDecorator('product_type', {
                                rules: [{ required: true, message: 'Please select product type!' }],
                                initialValue: 'HUB'
                            })(
                                <Select>
                                    <Select.Option key='hub' value='HUB'>{titleCase(globalConstants.HUB_GENERIC)}</Select.Option>
                                    <Select.Option key='beacon' value='BEACON'>{titleCase(globalConstants.PENDANT_GENERIC)}</Select.Option>
                                </Select>
                            )
                        }
                    </Form.Item>
                    <Form.Item label="Offline Check" {...formItemLayout}>
                        {
                            getFieldDecorator('offline', {
                                valuePropName: 'checked',
                                initialValue: false
                            })(
                                <Switch
                                    size="default"
                                    checkedChildren="Yes"
                                    unCheckedChildren="No"
                                />
                            )
                        }
                    </Form.Item>
                    {getFieldValue('offline') && <Fragment>
                        <Form.Item
                            label='Offline days' {...formItemLayout}
                        >
                            {getFieldDecorator('offline_for_days',{
                                initialValue: 0
                            })(
                                <InputNumber/>
                            )}
                        </Form.Item>
                    </Fragment>}

                    <Form.Item label="Subscription Stale" {...formItemLayout}>
                        {
                            getFieldDecorator('subscription_stale', {
                                valuePropName: 'checked',
                                initialValue: false
                            })(
                                <Switch
                                    size="default"
                                    checkedChildren="Yes"
                                    unCheckedChildren="No"
                                />
                            )
                        }
                    </Form.Item>
                    {getFieldValue('subscription_stale') && <Fragment>
                        <Form.Item label='Subscription Stale days' {...formItemLayout}>
                            {getFieldDecorator('subscription_stale_for_days',{initialValue: 0})(
                                <InputNumber />
                            )}
                        </Form.Item>
                    </Fragment>}
                </Form>
            </Modal>
        )
    }
}

export default Form.create()(DeactivateReportModal)

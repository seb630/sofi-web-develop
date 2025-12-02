import { Component } from 'react'
import { Form } from '@ant-design/compatible'
import { Input, message, Modal } from 'antd'
import { actions } from 'mirrorx'
import { globalConstants } from '@/_constants'
import PhoneInput from 'react-phone-number-input'

const FormItem = Form.Item

class RegistrationForm extends Component {

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                actions.organisation.createOrg(values).then(() => {
                    message.success('Organisation Created')
                    this.props.form.resetFields()
                    this.props.onCancel()
                }, (error) => {
                    message.error(globalConstants.WENT_WRONG + '(' + error.response.data.message+')')
                })
            }
        })
    }

    render() {
        const { open, onCancel, form } = this.props
        const { getFieldDecorator } = form

        return (
            <Modal
                okText="Create"
                open={open} onCancel={onCancel}
                onOk={this.handleSubmit}
                centered={false} title="Create Organisation"  style={{height: '500px'}}
            >
                <Form layout="vertical">
                    <FormItem
                        label="Organisation Name"
                    >
                        {getFieldDecorator('name', {
                            rules: [{
                                required: true, message: 'Please input organisation name!',
                            }],
                        })(
                            <Input />
                        )}
                    </FormItem>

                    <FormItem
                        label="Description"
                    >
                        {getFieldDecorator('description', {
                            rules: [{ required: true, message: 'Please input the description!', whitespace: true }],
                        })(
                            <Input />
                        )}
                    </FormItem>

                    <FormItem
                        label="Organisation General Number"
                    >
                        {getFieldDecorator('general_phone_number', {
                        })(
                            <PhoneInput
                                flagsPath='https://flagicons.lipis.dev/flags/4x3/' country="AU"  inputClassName="ant-input"/>
                        )}
                    </FormItem>

                    <FormItem
                        label="Organisation Contact Link"
                    >
                        {getFieldDecorator('contact_link', {
                        })(
                            <Input />
                        )}
                    </FormItem>

                    <FormItem
                        label="Organisation Support Number"
                    >
                        {getFieldDecorator('support_phone_number', {
                        })(
                            <PhoneInput
                                flagsPath='https://flagicons.lipis.dev/flags/4x3/' country="AU"  inputClassName="ant-input"/>
                        )}
                    </FormItem>

                    <FormItem
                        label="Organisation Support Link"
                    >
                        {getFieldDecorator('support_link', {
                        })(
                            <Input />
                        )}
                    </FormItem>

                    <FormItem
                        label="Website"
                    >
                        {getFieldDecorator('website', {})(
                            <Input />
                        )}
                    </FormItem>

                </Form>
            </Modal>
        )
    }
}

export default Form.create()(RegistrationForm)

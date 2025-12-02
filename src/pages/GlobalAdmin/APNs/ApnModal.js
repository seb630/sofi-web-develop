import { Component, Fragment } from 'react'
import { actions } from 'mirrorx'
import { Form } from '@ant-design/compatible'
import { Input, message, Modal, Radio, Select, Spin } from 'antd'
import { globalConstants } from '@/_constants'

const RadioGroup = Radio.Group

/** APN Modal HoC
 * @param {React.Component} ActionComponent
 * @param {Object} params
 * @return {React.Component}
*/
function withAPNModal (ActionComponent,params) {
    class APNForm extends Component {
        constructor(props) {
            super(props)
            this.state = {
                isEditable: !!props.model,
                open: false,
                submitting : false
            }

            this._isMount = false
        }

        componentDidMount = () => {
            this._isMount = true
        }

        componentWillUnmount = () => {
            this._isMount = false
        }

        /** handle close Modal */
        handleClose = () => {
            const { form } = this.props
            form.resetFields()
            this._isMount && this.setState({ open: false })
        }

        /** handle open Modal */
        handleOpen = () => {
            this.setState({ open: true })
        }

        /** handle saving */
        handleSave = () => {
            const { form , model, admin, currentOrg} = this.props
            const { isEditable } = this.state
            form.validateFieldsAndScroll(async (err, values) => {
                if (!err) {
                    try {
                        this.setSubmit(true)
                        const action = []
                        if (!admin) {
                            const orgId = values.organization_id
                            action.push(isEditable ?
                                actions.organisation.updateOrgAPN({ orgId, payload: {...model, ...values}, apnId: model.pub_id }):
                                actions.organisation.createOrgAPN({payload: values, orgId }))
                        }else{
                            action.push(isEditable ?
                                actions.APN.updateApn({ id: model.pub_id,params: values }):
                                actions.APN.createApn(values))
                        }
                        Promise.all(action).then(()=> {
                            admin && actions.APN.fetchAllApn()
                            currentOrg && actions.organisation.fetchOrgAPNs(currentOrg.organization_id)
                            message.success(isEditable ? 'APN Updated' : 'APN Created')
                            this.handleClose()
                        })
                    } catch (err) {
                        err.global_errors?.length>0 ? err.global_errors.map(item => {
                            message.error(`${item.message}`)
                        }) : message.error(globalConstants.SERVER_ERROR_MESSAGE)
                    } finally {
                        this.setSubmit(false)
                    }
                }
            })
        }

        setSubmit = (value) => {
            this._isMount && this.setState({ submitting: value })
        }

        buildOrgOptions = () => {
            const {currentOrg, orgs} = this.props
            return orgs ? orgs.map(org => (
                <Select.Option key={org.organization_id} value={org.organization_id}>{org.name}</Select.Option>
            )) :  <Select.Option key={currentOrg?.organization_id} value={currentOrg?.organization_id}>{currentOrg?.name}</Select.Option>
        }


        render() {
            const { form , model, currentOrg, admin } = this.props
            const { getFieldDecorator } = form
            const { submitting , open , isEditable } = this.state
            const orgOptions = this.buildOrgOptions()
            const formItemLayout = {
                labelCol: { xs: 24, sm: 10 },
                wrapperCol: { xs: 24, sm: 14 },
            }

            return (<Fragment>
                <ActionComponent onClick={this.handleOpen} />
                <Modal
                    okText="Save"
                    open={open} onCancel={this.handleClose}
                    onOk={this.handleSave}
                    centered={false} title={isEditable ? `Edit APN: ${model.apn_name}` : 'Create new APN'}
                >
                    <Spin spinning={submitting}>
                        <Form layout="horizontal">
                            <Form.Item label="Owner Organisation" {...formItemLayout}>
                                {
                                    getFieldDecorator('organization_id', {
                                        initialValue: model ? model.organization_id : currentOrg ? currentOrg.organization_id : undefined,
                                        rules: [{ required: !admin, message: 'Please select the own organisation!' }],
                                    })(
                                        <Select
                                            disabled={!!currentOrg}
                                            allowClear
                                            placeholder="Optional"
                                        >
                                            {orgOptions}
                                        </Select>
                                    )
                                }
                            </Form.Item>
                            <Form.Item label="Name" {...formItemLayout}>
                                {
                                    getFieldDecorator('apn_name', {
                                        rules: [{ required: true, message: 'Please enter APN name!' }],
                                        initialValue: model && model.apn_name
                                    })(
                                        <Input  maxLength={globalConstants.INPUT_MAX_LENGTH}/>
                                    )
                                }
                            </Form.Item>
                            <Form.Item label="Value" {...formItemLayout}>
                                {
                                    getFieldDecorator('apn_value', {
                                        rules: [{ required: true, message: 'Please enter APN value!' }],
                                        initialValue: model && model.apn_value
                                    })(
                                        <Input maxLength={globalConstants.INPUT_MAX_LENGTH}/>
                                    )
                                }
                            </Form.Item>
                            <Form.Item label="Archived" {...formItemLayout}>
                                {
                                    getFieldDecorator('apn_archived', {
                                        initialValue: model ? model.apn_archived : false
                                    })(
                                        <RadioGroup name="apn_archived">
                                            <Radio value={true}>Yes</Radio>
                                            <Radio value={false}>No</Radio>
                                        </RadioGroup>
                                    )
                                }
                            </Form.Item>
                        </Form>
                    </Spin>
                </Modal>
            </Fragment>)
        }
    }

    return Form.create({ name: params.name })(APNForm)
}

export default withAPNModal

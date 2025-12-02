import { Component, Fragment } from 'react'
import { actions } from 'mirrorx'
import { Form } from '@ant-design/compatible'
import { Divider, Input, message, Modal, Select, Spin } from 'antd'
import { globalConstants } from '../../../_constants'
import PropTypes from 'prop-types'
import { titleCase } from 'change-case'

/** APN Modal HoC
 * @param {React.Component} ActionComponent
 * @param {Object} params
 * @return {React.Component}
*/
function withFeatureModal (ActionComponent,params) {
    class FeatureForm extends Component {
        constructor(props) {
            super(props)
            this.state = {
                isEditable: !!props.model,
                open: false,
                submitting : false,
                configOptions: null,
            }
        }

        componentDidUpdate(prevProps) {
            prevProps !== this.props && this.buildConfigOptions()
            // prevProps.model !== this.props.model && this.fetchListData(this.props.model.type)
        }


        /** handle close Modal */
        handleClose = () => {
            const { form } = this.props
            form.resetFields()
            this.setState({ open: false })
        }

        /** handle open Modal */
        handleOpen = () => {
            this.setState({ open: true })
        }

        /** handle saving */
        handleSave = () => {
            const { form , model } = this.props
            const { isEditable } = this.state
            form.validateFieldsAndScroll(async (err, values) => {
                if (!err) {
                    const action = []
                    const payload =  {...model, ...values}
                    payload.product_id = values.product_type === 'BEACON' ? values.product_beacon_id : values.product_hub_id
                    isEditable ? action.push(actions.common.updatePortalFunction(payload)):
                        action.push(actions.common.createPortalFunction(payload))

                    Promise.all(action).then(()=>{
                        message.success(isEditable ? 'Feature Rule Updated' : 'Feature Rule Created')
                        this.setSubmit(false)
                        this.handleClose()
                    }).catch (err=> {
                        this.setSubmit(false)
                        err.global_errors?.length>0 ? err.global_errors.map(item => {
                            message.error(`${item}`)
                        }) : message.error(globalConstants.SERVER_ERROR_MESSAGE)
                    })
                }
            })
        }

        setSubmit = (value) => {
            this.setState({ submitting: value })
        }

        fetchListData = (option) =>{
            if (option==='ORGANIZATION'){
                actions.organisation.fetchAllOrgs()
            }else if (option==='PRODUCT'){
                actions.hub.getSofiDevices()
            }
        }

        buildConfigOptions = () => {
            const { hubs, beacons, orgs, selectedFeature } = this.props
            const hubOptions = hubs?.map(device => (
                <Select.Option key={device.hub_id} value={device.hub_id}>{device.display_name}</Select.Option>
            ))
            const beaconOptions = beacons?.map(device => (
                <Select.Option key={device.pub_id} value={device.pub_id}>{device.display_name}</Select.Option>
            ))
            const orgOptions = orgs?.map(org => (
                <Select.Option key={org.organization_id} value={org.organization_id}>{org.name}</Select.Option>
            ))
            const actionOptions = globalConstants.PORTAL_FUNCTIONS[selectedFeature]?.map(key=>
                <Select.Option key={key} value={key}>{key}</Select.Option>)
            const configOptions = {orgOptions, hubOptions, beaconOptions, actionOptions}
            this.setState({configOptions})
            return configOptions
        }

        render() {
            const { form , model, selectedFeature } = this.props
            const { getFieldDecorator, getFieldValue } = form
            const { submitting , open , isEditable, configOptions } = this.state

            const formItemLayout = {
                labelCol: { xs: 24, sm: 10 },
                wrapperCol: { xs: 24, sm: 14 },
            }

            const scopes = [{name: 'Global', value: 'GLOBAL'},{name: 'Organisation', value: 'ORGANIZATION'},
                {name: 'Product', value: 'PRODUCT'}]

            const scopeOptions = scopes.map(type=>(
                <Select.Option key={type.name} value={type.value}>{type.name}</Select.Option>
            ))

            return (<Fragment>
                <ActionComponent onClick={this.handleOpen} />
                <Modal
                    okText="Save"
                    open={open} onCancel={this.handleClose}
                    onOk={this.handleSave}
                    centered={false}
                    title={isEditable ? `Edit Feature Rule: ${model.rule_id}` : 'Create new Feature Destination'}
                >
                    <Spin spinning={submitting}>
                        <Form layout="horizontal">
                            <Form.Item label="Feature Name" {...formItemLayout}>
                                {
                                    getFieldDecorator('function', {
                                        rules: [{ required: true, message: 'Please input feature name!' }],
                                        initialValue: selectedFeature
                                    })(<Input disabled/>)
                                }
                            </Form.Item>

                            <Form.Item label="Rule Action" {...formItemLayout}>
                                {
                                    getFieldDecorator('rule_action', {
                                        initialValue: model && model.rule_action
                                    })(
                                        <Select>
                                            {configOptions?.actionOptions}
                                        </Select>
                                    )
                                }
                            </Form.Item>

                            <Form.Item label="Rule Scope" {...formItemLayout}>
                                {
                                    getFieldDecorator('rule_scope', {
                                        rules: [{ required: true, message: 'Please select rule scope!' }],
                                        initialValue: model && model.rule_scope
                                    })(
                                        <Select onChange={(v)=>this.fetchListData(v)}>
                                            {scopeOptions}
                                        </Select>
                                    )
                                }
                            </Form.Item>

                            <Divider>Rule scope config:</Divider>
                            {getFieldValue('rule_scope') === 'ORGANIZATION' &&
                            <Form.Item label="Organisation" {...formItemLayout}>
                                {
                                    getFieldDecorator('organization_id', {
                                        initialValue: model ? model.organization_id : null,
                                    })(
                                        <Select
                                            showSearch
                                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                        >
                                            {configOptions?.orgOptions}
                                        </Select>
                                    )
                                }
                            </Form.Item>
                            }
                            {getFieldValue('rule_scope') === 'PRODUCT' && <Form.Item label="Product Type" {...formItemLayout}>
                                {
                                    getFieldDecorator('product_type', {
                                        initialValue: model && model.product_type
                                    })(
                                        <Select>
                                            <Select.Option key="BEACON" value="BEACON">{titleCase(globalConstants.PENDANT_GENERIC)}</Select.Option>
                                            <Select.Option key="HUB" value="HUB">{titleCase(globalConstants.HUB_GENERIC)}</Select.Option>
                                        </Select>
                                    )
                                }
                            </Form.Item>
                            }
                            {getFieldValue('rule_scope') === 'PRODUCT' && getFieldValue('product_type') === 'HUB' &&
                            <Form.Item label="Hub" {...formItemLayout}>
                                {
                                    getFieldDecorator('product_hub_id', {
                                        initialValue: model ? model.product_id : null,
                                    })(
                                        <Select
                                            showSearch
                                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                        >
                                            {configOptions?.hubOptions}
                                        </Select>
                                    )
                                }
                            </Form.Item>
                            }
                            {getFieldValue('rule_scope') === 'PRODUCT' && getFieldValue('product_type') === 'BEACON' &&
                            <Form.Item label="Beacon" {...formItemLayout}>
                                {
                                    getFieldDecorator('product_beacon_id', {
                                        initialValue: model ? model.product_id : null,
                                    })(
                                        <Select
                                            showSearch
                                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                        >
                                            {configOptions?.beaconOptions}
                                        </Select>
                                    )
                                }
                            </Form.Item>
                            }

                        </Form>
                    </Spin>
                </Modal>
            </Fragment>)
        }
    }

    FeatureForm.propTypes={
        model: PropTypes.object,
        orgs: PropTypes.array,
        hubs: PropTypes.array,
        beacons: PropTypes.array,
        selectedFeature: PropTypes.string
    }
    return Form.create({ name: params.name })(FeatureForm)

}

export default withFeatureModal

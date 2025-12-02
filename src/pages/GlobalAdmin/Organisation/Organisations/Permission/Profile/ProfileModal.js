import { Component, Fragment } from 'react'
import { actions } from 'mirrorx'
import { Form } from '@ant-design/compatible'
import { Col, Divider, Input, List, message, Modal, Row, Select, Spin } from 'antd'
import { globalConstants } from '@/_constants'
import PropTypes from 'prop-types'

/** APN Modal HoC
 * @param {React.Component} ActionComponent
 * @param {Object} params
 * @return {React.Component}
*/
function withProfileModal (ActionComponent,params) {
    class ProfileForm extends Component {
        constructor(props) {
            super(props)
            this.state = {
                isEditable: !!props.model,
                open: false,
                submitting : false,
                configOptions: {}
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
            this.fetchListData(this.props.model?.type)
            this.setState({ open: true })
        }

        /** handle saving */
        handleSave = () => {
            const { form , model, currentOrg } = this.props
            const { isEditable } = this.state
            form.validateFieldsAndScroll(async (err, values) => {
                if (!err) {
                    const config = {
                        secure_by_user_id: values.userConfig,
                        secure_by_user_group_id: values.userGroupConfig,
                        secure_by_device_id: values.deviceConfig,
                        secure_by_device_group_id: values.deviceGroupConfig
                    }
                    const payload = {
                        ...model,
                        config,
                        access_all: false,
                        enabled: true,
                        description: values.description,
                        name: values.name,
                        organization_id: currentOrg.organization_id,
                        type: values.type,
                    }
                    this.setSubmit(true)
                    const action = []
                    action.push(isEditable ? actions.permission.updateProfile(payload) : actions.permission.createProfile(payload))

                    Promise.all(action).then(()=>{
                        message.success(isEditable ? 'Profile Updated' : 'Profile Created')
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
            const {currentOrg, model} = this.props
            const orgId = currentOrg.organization_id
            model && actions.permission.fetchProfileDependants(model.security_data_profile_id)
            if (option==='ORGANIZATION_USER'){
                actions.organisation.fetchOrgUsers(orgId)
                actions.organisation.fetchOrgUserGroups(orgId)
            }else if (option==='ORGANIZATION_USER_GROUP'){
                actions.organisation.fetchOrgUserGroups(orgId)
            }else if (option==='ORGANIZATION_DEVICE'){
                actions.organisation.fetchOrgDeviceGroups(orgId)
                actions.organisation.fetchOrgHubs(orgId)
                actions.organisation.fetchOrgBeacons(orgId)
                actions.organisation.fetchOrgRadars(orgId)
            }else if (option==='ORGANIZATION_DEVICE_GROUP'){
                actions.organisation.fetchOrgDeviceGroups(orgId)
            }
        }

        buildConfigOptions = () => {
            const {users, userGroups, devices, deviceGroups, orgDevices} = this.props
            const mergedDevices = devices.map(device=>({
                ...device,
                ...orgDevices.find(orgDevice=>orgDevice.device_mac_or_imei===device.mac_address || orgDevice.device_mac_or_imei===device.imei)
            }))
            const userOptions = users?.map(user => (
                <Select.Option key={user.user_id} value={user.user_id}>{`${user.first_name} ${user.last_name}`}</Select.Option>
            ))
            const userGroupOptions = userGroups?.map(userGroup => (
                <Select.Option key={userGroup.organization_user_group_id} value={userGroup.organization_user_group_id}>{userGroup.name}</Select.Option>
            ))
            const deviceOptions = mergedDevices?.map(device => (
                <Select.Option key={device.organization_device_id} value={device.organization_device_id}>{device.display_name}</Select.Option>
            ))
            const deviceGroupOptions = deviceGroups?.map(deviceGroup => (
                <Select.Option key={deviceGroup.organization_device_group_id} value={deviceGroup.organization_device_group_id}>{deviceGroup.name}</Select.Option>
            ))
            const configOptions = {userOptions, userGroupOptions, deviceOptions, deviceGroupOptions}
            this.setState({configOptions})
            return configOptions
        }

        render() {
            const { form , model, profileDependants } = this.props
            const { getFieldDecorator, getFieldValue } = form
            const { submitting , open , isEditable, configOptions } = this.state
            const types = [{name: 'Organisation User', value: 'ORGANIZATION_USER'},{name: 'Organisation User Group', value: 'ORGANIZATION_USER_GROUP'},
                {name: 'Organisation Device', value: 'ORGANIZATION_DEVICE'},{name: 'Organisation Device Group', value: 'ORGANIZATION_DEVICE_GROUP'},]
            const formItemLayout = {
                labelCol: { xs: 24, sm: 10 },
                wrapperCol: { xs: 24, sm: 14 },
            }
            const typeOptions = types.map(type=>(
                <Select.Option key={type.name} value={type.value}>{type.name}</Select.Option>
            ))
            return (<Fragment>
                <ActionComponent onClick={this.handleOpen} />
                <Modal
                    destroyOnClose
                    okText="Save"
                    open={open} onCancel={this.handleClose}
                    onOk={this.handleSave}
                    centered={false}
                    title={isEditable ? `Edit security data profile: ${model.name}` : 'Create new security data profile'}
                >
                    <Spin spinning={submitting}>
                        <Form layout="horizontal">
                            <Form.Item label="Name" {...formItemLayout}>
                                {
                                    getFieldDecorator('name', {
                                        rules: [{ required: true, message: 'Please input profile name!' }],
                                        initialValue: model && model.name
                                    })(<Input />)
                                }
                            </Form.Item>
                            <Form.Item label="Profile Type" {...formItemLayout}>
                                {
                                    getFieldDecorator('type', {
                                        rules: [{ required: true, message: 'Please select security data profile type!' }],
                                        initialValue: model && model.type
                                    })(
                                        <Select onChange={(v)=>this.fetchListData(v)}>
                                            {typeOptions}
                                        </Select>
                                    )
                                }
                            </Form.Item>
                            <Divider>Data profile config:</Divider>
                            {getFieldValue('type') === 'ORGANIZATION_USER' &&
                            <Form.Item label="Users" {...formItemLayout}>
                                {
                                    getFieldDecorator('userConfig', {
                                        initialValue: model ? model.config.secure_by_user_id : [],
                                    })(
                                        <Select
                                            mode="multiple"
                                            allowClear
                                        >
                                            {configOptions.userOptions}
                                        </Select>
                                    )
                                }
                            </Form.Item>
                            }
                            {(getFieldValue('type') === 'ORGANIZATION_USER' || getFieldValue('type') === 'ORGANIZATION_USER_GROUP') &&
                            <Form.Item label="User Groups" {...formItemLayout}>
                                {
                                    getFieldDecorator('userGroupConfig', {
                                        initialValue: model ? model.config.secure_by_user_group_id : [],
                                    })(
                                        <Select
                                            mode="multiple"
                                            allowClear
                                        >
                                            {configOptions.userGroupOptions}
                                        </Select>
                                    )
                                }
                            </Form.Item>
                            }
                            {getFieldValue('type') === 'ORGANIZATION_DEVICE' &&
                            <Form.Item label="Devices" {...formItemLayout}>
                                {
                                    getFieldDecorator('deviceConfig', {
                                        initialValue: model ? model.config.secure_by_device_id : [],
                                    })(
                                        <Select
                                            mode="multiple"
                                            allowClear
                                        >
                                            {configOptions.deviceOptions}
                                        </Select>
                                    )
                                }
                            </Form.Item>
                            }
                            {(getFieldValue('type') === 'ORGANIZATION_DEVICE' || getFieldValue('type') === 'ORGANIZATION_DEVICE_GROUP') &&
                            <Form.Item label="Device Groups" {...formItemLayout}>
                                {
                                    getFieldDecorator('deviceGroupConfig', {
                                        initialValue: model ? model.config.secure_by_device_group_id : [],
                                    })(
                                        <Select
                                            mode="multiple"
                                            allowClear
                                        >
                                            {configOptions.deviceGroupOptions}
                                        </Select>
                                    )
                                }
                            </Form.Item>
                            }
                            {isEditable && profileDependants?.length>0 && <Fragment>
                                <Divider />
                                <h4>This change impacts the following policies:</h4>
                                <Row gutter={12}>
                                    <Col span={12}><List
                                        size="small"
                                        dataSource={profileDependants}
                                        renderItem={item => <List.Item>{item.name}</List.Item>}/></Col>
                                </Row>
                            </Fragment>}
                        </Form>
                    </Spin>
                </Modal>
            </Fragment>)
        }
    }

    ProfileForm.propTypes={
        model: PropTypes.object,
        currentOrg: PropTypes.object,
        users: PropTypes.array,
        userGroups: PropTypes.array,
        devices: PropTypes.array,
        deviceGroups: PropTypes.array,
    }
    return Form.create({ name: params.name })(ProfileForm)

}

export default withProfileModal

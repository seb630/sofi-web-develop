import { Component, Fragment } from 'react'
import { actions } from 'mirrorx'
import { Form } from '@ant-design/compatible'
import { Button, Col, Divider, Input, List, message, Modal, Row, Select, Spin, Steps, Typography, } from 'antd'
import PropTypes from 'prop-types'

/** APN Modal HoC
 * @param {React.Component} ActionComponent
 * @param {Object} params
 * @return {React.Component}
*/
function withPolicyModal (ActionComponent,params) {
    class PolicyForm extends Component {
        constructor(props) {
            super(props)
            this.state = {
                isEditable: !!props.model,
                open: false,
                submitting : false,
                current: 0,
                oldName: props.model?.name,
                newPolicy: null,
                selectedRoles: null,
                selectedProfiles: null,
            }
        }

        closeAll = () =>{
            const { form } = this.props
            form.resetFields()
            this.setState({
                open: false,
                current: 0,
                newPolicy: null,
                selectedRoles: null,
                selectedProfiles: null,
            })
        }
        /** handle close Modal */
        handleClose = () => {
            const {current, newPolicy} = this.state
            if (current>0){
                Modal.confirm({
                    title: 'Are you sure you want to stop?',
                    content: `The policy ${newPolicy.name} has already been created, but if you stop now any unsaved 
                    permissions won't be added. Are you sure you want to stop?`,
                    okText: 'Yes',
                    cancelText: 'No',
                    onOk: this.closeAll
                })
            }else{
                this.closeAll()
            }
        }

        /** handle open Modal */
        handleOpen = () => {
            this.setState({ open: true })
            if (this.props.model){
                actions.permission.fetchRoleProfiles(this.props.model.security_role_id)
                actions.permission.fetchInheritingRoles(this.props.model.security_role_id)
            }
        }

        next = () =>{
            const {form, model, currentOrg} = this.props
            const {getFieldValue} = form
            const {current, isEditable} = this.state
            if (current===0){
                form.validateFields(['name','description'],(err,values)=> {
                    if (!err){
                        const payload = {
                            ...model,
                            name: values.name,
                            description: values.description,
                            type: 'DATA',
                            organization_id: currentOrg.organization_id
                        }
                        isEditable ?
                            actions.permission.updateRole(payload).then(result=>{
                                actions.permission.fetchOrgRoles(payload.organization_id)
                                actions.permission.fetchRoleDependants(model.security_role_id)
                                const newState = current + 1
                                this.setState({ current: newState, newPolicy: result })
                            }, (error) => {
                                error?.response?.data?.message.includes('duplicate') ?
                                    Modal.error({
                                        title:'You already have a policy that uses this name',
                                        okText: 'Okay',
                                        content: 'You can create a policy with a different name or cancel and edit the existing policy'
                                    })
                                    :message.error(error?.response?.data?.message)
                            }) :
                            actions.permission.createRole(payload).then(result=>{
                                actions.permission.fetchOrgRoles(payload.organization_id)
                                const newState = current + 1
                                this.setState({ current: newState, newPolicy: result })
                            }, (error) => {
                                error?.response?.data?.message.includes('duplicate') ?
                                    Modal.error({
                                        title:'You already have a policy that uses this name',
                                        okText: 'Okay',
                                        content: 'You can create a policy with a different name or cancel and edit the existing policy'
                                    })
                                    :message.error(error?.response?.data?.message)
                            })
                    }
                })
            }
            else if (current === 1) {
                const newState = current + 1
                this.setState({  current: newState, selectedRoles: getFieldValue('roles')})
            } else if (current === 2){
                const newState = current + 1
                this.setState({  current: newState, selectedProfiles: getFieldValue('profiles')})
            }
        }

        prev = () =>{
            this.setState({current: this.state.current - 1})
        }

        save = () => {
            const {newPolicy, isEditable, selectedRoles, selectedProfiles} = this.state
            let promises = []
            if (isEditable) {
                let promises = []
                const {inheritingRoles, roleProfiles} = this.props
                const originRoleKeys = inheritingRoles.map(role=>role.security_role_id)
                const add_role_list = selectedRoles.filter(key=>!originRoleKeys.includes(key))
                const remove_role_list = originRoleKeys.filter(key=>!selectedRoles.includes(key))
                add_role_list.length > 0 && promises.push(actions.permission.addDutyRolesToPolicy({
                    security_role_id: newPolicy.security_role_id,
                    security_role_ids: add_role_list
                }))
                remove_role_list.length > 0 && promises.push(actions.permission.removeDutyRolesFromPolicy({
                    security_role_id: newPolicy.security_role_id,
                    security_role_ids: remove_role_list
                }))

                const originProfileKeys = roleProfiles.map(role=>role.security_data_profile_id)
                const add_profile_list = selectedProfiles.filter(key=>!originProfileKeys.includes(key))
                const remove_profile_list = originProfileKeys.filter(key=>!selectedProfiles.includes(key))

                add_profile_list.length > 0 && promises.push(actions.permission.addProfilesToPolicy({
                    security_role_id: newPolicy.security_role_id,
                    security_data_profile_ids: add_profile_list
                }))
                remove_profile_list.length > 0 && promises.push(actions.permission.removeProfilesFromPolicy({
                    security_role_id: newPolicy.security_role_id,
                    security_data_profile_ids: remove_profile_list
                }))

                Promise.all(promises).then(()=>{
                    message.success('Policy Updated')
                    this.closeAll()
                }, (error) => {
                    message.error(error?.response?.data?.message)
                })

            }else {
                const profilePayload = {
                    security_role_id: newPolicy.security_role_id,
                    security_data_profile_ids: selectedProfiles
                }
                const rolePayload = {
                    security_role_id: newPolicy.security_role_id,
                    security_role_ids: selectedRoles
                }
                promises.push(actions.permission.addProfilesToPolicy(profilePayload))
                promises.push(actions.permission.addDutyRolesToPolicy(rolePayload))
                Promise.all(promises).then(()=>{
                    message.success('New Policy Added')
                    this.closeAll()
                }, (error) => {
                    message.error(error?.response?.data?.message)
                })
            }
        }

        setSubmit = (value) => {
            this.setState({ submitting: value })
        }

        render() {
            const { form , model, profiles, roles, inheritingRoles, roleProfiles, roleDependants } = this.props
            const { getFieldDecorator } = form
            const { submitting , open , isEditable, current, newPolicy, selectedRoles, selectedProfiles, oldName } = this.state
            const formItemLayout = {
                labelCol: { xs: 24, sm: 6 },
                wrapperCol: { xs: 24, sm: 18 },
            }

            const profileOptions = profiles && profiles.map(profile=>(
                <Select.Option key={profile.security_data_profile_id} value={profile.security_data_profile_id}>{profile.name}</Select.Option>
            ))

            const roleOptions = roles && roles.map(role=>(
                <Select.Option key={role.security_role_id} value={role.security_role_id}>{role.name}</Select.Option>
            ))

            const policyContent =
                <div>
                    <h4>{isEditable ? `Edit existing policy: ${model.name}` : 'Create a new policy'}</h4>
                    <Form layout="horizontal">
                        <Form.Item label="Name" {...formItemLayout}>
                            {
                                getFieldDecorator('name', {
                                    rules: [{ required: true, message: 'Please input policy name!' }],
                                    initialValue: model && model.name
                                })(<Input />)
                            }
                        </Form.Item>
                        <Form.Item label="Description" {...formItemLayout}>
                            {
                                getFieldDecorator('description', {
                                    rules: [{ required: true, message: 'Please input policy description!' }],
                                    initialValue: model && model.description
                                })(<Input.TextArea />)
                            }
                        </Form.Item>
                    </Form>
                </div>

            const roleContent =
                <div>
                    <h4>{isEditable ? `Edit Duty Roles assigned to: "${newPolicy?.name}" ${newPolicy?.name !== oldName ? `(Formerly: "${oldName}")`:''}` :
                        `Add some Duty Roles to "${newPolicy?.name}"`}</h4>
                    <p>Duty Roles give users the permission to perform an action (but does not define the resource the action can be performed on - this is defined by
                        &quot;Security Data Profiles&quot; which is the next step).</p>
                    <Form layout="horizontal">
                        <Form.Item label="Duty Roles" {...formItemLayout}>
                            {
                                getFieldDecorator('roles', {
                                    initialValue: selectedRoles ? selectedRoles : model && inheritingRoles ? inheritingRoles.map(role=>role.security_role_id) : [],
                                })(
                                    <Select
                                        mode="multiple"
                                        allowClear
                                    >
                                        {roleOptions}
                                    </Select>
                                )
                            }
                        </Form.Item>
                    </Form>
                </div>

            const profileContent =
                <div>
                    <h4>{isEditable ? `Edit Security Data Profiles assigned to: "${newPolicy?.name}" ${newPolicy?.name !== oldName ? `(Formerly: "${oldName}")`:''}` :
                        `Add some Security Data Profiles to "${newPolicy?.name}"`}</h4>
                    <p>Security Data Profiles define what resources &quot;Duty Roles&quot; can be performed on (&quot;Duty Roles&quot; were defined in the previous step and define
                        what actions the user can perform on resources defined in &quot;Security Data Profiles&quot;).</p>
                    <Form layout="horizontal">
                        <Form.Item label="Profiles" {...formItemLayout}>
                            {
                                getFieldDecorator('profiles', {
                                    initialValue: selectedProfiles ? selectedProfiles : model && roleProfiles ? roleProfiles.map(profile=>profile.security_data_profile_id) : [],
                                })(
                                    <Select
                                        mode="multiple"
                                        allowClear
                                    >
                                        {profileOptions}
                                    </Select>
                                )
                            }
                        </Form.Item>
                    </Form>
                </div>

            const summaryContent =
                <div>
                    <h4>{isEditable ? `Summary of changes to: "${newPolicy?.name}" ${newPolicy?.name !== oldName ? `(Formerly: "${oldName}")`:''}` :
                        `Summary of new policy: "${newPolicy?.name}"`}</h4>
                    <p>The policy {isEditable ? 'will be' : 'is'} called &quot;{newPolicy?.name}&quot; and is described as: <br/>
                        <Typography.Text strong>{newPolicy?.description}</Typography.Text></p>
                    <Divider />
                    <h4>The following Duty Roles are assigned to this policy:</h4>
                    <Row gutter={12}>
                        <Col span={12}><List
                            header={isEditable ? 'Updated List:' : null}
                            size="small"
                            dataSource={selectedRoles}
                            renderItem={item => <List.Item>{roles.find(role=>role.security_role_id===item)?.name}</List.Item>}
                        >
                        </List></Col>
                        {isEditable && <Col span={12}><List
                            header="Previously was"
                            size="small"
                            dataSource={inheritingRoles}
                            renderItem={item => <List.Item>{item.name}</List.Item>}
                        >
                        </List></Col>}
                    </Row>
                    <Divider />
                    <h4>Which grants anyone allocated to this policy the ability to perform actions on resources defined in the following Security Data Profiles:</h4>
                    <Row gutter={12}>
                        <Col span={12}><List
                            header={isEditable ? 'Updated List:' : null}
                            size="small"
                            dataSource={selectedProfiles}
                            renderItem={item => <List.Item>{profiles.find(role=>role.security_data_profile_id===item)?.name}</List.Item>}/></Col>
                        {isEditable && <Col span={12}><List
                            header="Previously was"
                            size="small"
                            dataSource={roleProfiles}
                            renderItem={item => <List.Item>{item.name}</List.Item>}/></Col>}
                    </Row>
                    {isEditable && <Fragment>
                        <Divider />
                        <h4>This change impacts the following users and user groups:</h4>
                        <Row gutter={12}>
                            <Col span={12}><List
                                header="Impacted users"
                                size="small"
                                dataSource={roleDependants?.dependant_org_users}
                                pagination={roleDependants?.dependant_org_users?.length>5 ?{pageSize: 5}: null}
                                renderItem={item => <List.Item>{item.first_name} {item.last_name}</List.Item>}/></Col>
                            <Col span={12}><List
                                header="Impacted user groups"
                                size="small"
                                dataSource={roleDependants?.dependant_org_user_groups}
                                pagination={roleDependants?.dependant_org_user_groups?.length>5 ?{pageSize: 5}: null}
                                renderItem={item => <List.Item>{item.name}</List.Item>}/></Col>
                        </Row>
                    </Fragment>}
                </div>

            const steps = [{
                title: 'Policy',
                content: policyContent,
            }, {
                title: 'Duty Roles',
                content: roleContent,
            }, {
                title: 'Security Profiles',
                content: profileContent,
            }, {
                title: 'Summary',
                content: summaryContent,
            }]

            const modalTitle =  <Steps current={current} size="small">
                {steps.map(item => <Steps.Step key={item.title} title={item.title} />)}
            </Steps>

            return (<Fragment>
                <ActionComponent onClick={this.handleOpen} />
                <Modal
                    footer={null}
                    open={open} onCancel={this.handleClose}
                    centered={false}
                    width={750}
                    destroyOnClose
                    title={modalTitle}
                >
                    <Spin spinning={submitting}>
                        <div className="steps-content">{steps[current].content}</div>
                        <div className="steps-action">
                            {
                                current < steps.length - 1 && <Button
                                    type="primary"
                                    onClick={this.next}
                                    className="floatRight">{(current === steps.length - 1 || current === 0) ? 'Save' : 'Next'}</Button>
                            }
                            {
                                current ===0 && <Button style={{ marginLeft: 8 }} onClick={this.handleClose}>Cancel</Button>
                            }
                            {
                                current > 1 && current < 4 && <Button style={{ marginLeft: 8 }} onClick={this.prev}>Previous</Button>
                            }
                            {
                                current === steps.length-1 && <Button
                                    type="primary"
                                    onClick={this.save}
                                    className="floatRight">{isEditable ? 'Save' : 'Create'}</Button>
                            }
                        </div>

                    </Spin>
                </Modal>
            </Fragment>)
        }
    }

    PolicyForm.propTypes={
        model: PropTypes.object,
        currentOrg: PropTypes.object,
        profiles: PropTypes.array,
        roles: PropTypes.array,
    }
    return Form.create({ name: params.name })(PolicyForm)

}

export default withPolicyModal

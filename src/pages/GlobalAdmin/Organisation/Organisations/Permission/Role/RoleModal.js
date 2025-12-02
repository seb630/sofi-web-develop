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
function withDutyRoleModal (ActionComponent,params) {
    class DutyRoleForm extends Component {
        constructor(props) {
            super(props)
            this.state = {
                isEditable: !!props.model,
                open: false,
                submitting : false,
                current: 0,
                oldName: props.model?.name,
                newDutyRole: null,
                selectedRoles: null,
                selectedPrivileges: null,
            }
        }

        /** handle close Modal */
        handleClose = () => {
            const {current, newDutyRole} = this.state
            if (current>0){
                Modal.confirm({
                    title: 'Are you sure you want to stop?',
                    content: `The duty role ${newDutyRole.name} has already been created, but if you stop now any unsaved 
                permissions won't be added. Are you sure you want to stop?`,
                    okText: 'Yes',
                    cancelText: 'No',
                    onOk: () => {
                        const { form } = this.props
                        form.resetFields()
                        this.setState({
                            open: false,
                            current: 0,
                            newDutyRole: null,
                            selectedRoles: null,
                            selectedPrivileges: null,
                        })
                    }
                })
            }else{
                const { form } = this.props
                form.resetFields()
                this.setState({
                    open: false,
                    current: 0,
                    newDutyRole: null,
                    selectedRoles: null,
                    selectedPrivileges: null,
                })
            }
        }

        /** handle open Modal */
        handleOpen = () => {
            this.setState({ open: true })
            if (this.props.model){
                actions.permission.fetchRolePrivileges(this.props.model.security_role_id)
                actions.permission.fetchInheritingRoles(this.props.model.security_role_id)
            }
        }

        next = () =>{
            const {form, model, currentOrg} = this.props
            const {getFieldValue} = form
            const {current, isEditable} = this.state
            if (current===0){
                form.validateFields(['name','description'],(err,values)=> {
                    if (!err) {
                        const payload = {
                            ...model,
                            name: values.name,
                            description: values.description,
                            type: 'DUTY',
                            organization_id: currentOrg.organization_id
                        }
                        isEditable ?
                            actions.permission.updateRole(payload).then(result=>{
                                actions.permission.fetchOrgRoles(payload.organization_id)
                                actions.permission.fetchRoleDependants(model.security_role_id)
                                const newState = current + 1
                                this.setState({ current: newState, newDutyRole: result })
                            }, (error) => {
                                error?.response?.data?.message.includes('duplicate') ?
                                    Modal.error({
                                        title:'You already have a duty role that uses this name',
                                        okText: 'Okay',
                                        content: 'You can create a duty role with a different name or cancel and edit the existing duty role'
                                    })
                                    :message.error(error?.response?.data?.message)
                            }) :
                            actions.permission.createRole(payload).then(result=>{
                                actions.permission.fetchOrgRoles(payload.organization_id)
                                const newState = current + 1
                                this.setState({ current: newState, newDutyRole: result })
                            }, (error) => {
                                error?.response?.data?.message.includes('duplicate') ?
                                    Modal.error({
                                        title:'You already have a duty role that uses this name',
                                        okText: 'Okay',
                                        content: 'You can create a duty role with a different name or cancel and edit the existing duty role'
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
                this.setState({  current: newState, selectedPrivileges: getFieldValue('privileges')})
            }
        }

        save = () => {
            const {newDutyRole, isEditable, selectedRoles, selectedPrivileges} = this.state
            let promises = []
            if (isEditable) {
                let promises = []
                const {inheritingRoles, rolePrivileges} = this.props
                const originRoleKeys = inheritingRoles.map(role=>role.security_role_id)
                const add_role_list = selectedRoles.filter(key=>!originRoleKeys.includes(key))
                const remove_role_list = originRoleKeys.filter(key=>!selectedRoles.includes(key))
                add_role_list.length > 0 && promises.push(actions.permission.addDutyRolesToPolicy({
                    security_role_id: newDutyRole.security_role_id,
                    security_role_ids: add_role_list
                }))
                remove_role_list.length > 0 && promises.push(actions.permission.removeDutyRolesFromPolicy({
                    security_role_id: newDutyRole.security_role_id,
                    security_role_ids: remove_role_list
                }))

                const originPrivilegeKeys = rolePrivileges.map(role=>role.security_privilege_id)
                const add_privilege_list = selectedPrivileges.filter(key=>!originPrivilegeKeys.includes(key))
                const remove_privilege_list = originPrivilegeKeys.filter(key=>!selectedPrivileges.includes(key))
                add_privilege_list.length > 0 && promises.push(actions.permission.addPrivilegesToRole({
                    security_role_id: newDutyRole.security_role_id,
                    privilege_ids: add_privilege_list
                }))
                remove_privilege_list.length > 0 && promises.push(actions.permission.removePrivilegesFromRole({
                    security_role_id: newDutyRole.security_role_id,
                    privilege_ids: remove_privilege_list
                }))

                Promise.all(promises).then(()=>{
                    message.success('Duty Role Updated')
                    this.handleClose()
                }, (error) => {
                    message.error(error?.message)
                })

            }else {
                const rolePayload = {
                    security_role_id: newDutyRole.security_role_id,
                    security_role_ids: selectedRoles
                }
                const privilegePayload = {
                    security_role_id: newDutyRole.security_role_id,
                    privilege_ids: selectedPrivileges
                }
                promises.push(actions.permission.addDutyRolesToPolicy(rolePayload))
                promises.push(actions.permission.addPrivilegesToRole(privilegePayload))
                Promise.all(promises).then(()=>{
                    message.success('New Duty Role Added')
                    this.handleClose()
                }, (error) => {
                    message.error(error.message)
                })
            }
        }

        prev = () =>{
            this.setState({current: this.state.current - 1})
        }

        setSubmit = (value) => {
            this.setState({ submitting: value })
        }

        render() {
            const { form , model, privileges, roles, inheritingRoles, rolePrivileges, roleDependants } = this.props
            const { getFieldDecorator } = form
            const { submitting , open , isEditable, current, newDutyRole, selectedRoles, selectedPrivileges, oldName } = this.state
            const formItemLayout = {
                labelCol: { xs: 24, sm: 6 },
                wrapperCol: { xs: 24, sm: 18 },
            }

            const privilegeOptions = privileges?.map(privilege=>(
                <Select.Option key={privilege.security_privilege_id} value={privilege.security_privilege_id}>{privilege.name}</Select.Option>
            ))

            const roleOptions = roles?.filter(role=>role.security_role_id!==newDutyRole?.security_role_id)?.map(role=>(
                <Select.Option key={role.security_role_id} value={role.security_role_id}>{role.name}</Select.Option>
            ))

            const dutyRoleContent =
                <div>
                    <h4>{isEditable ? `Edit existing duty role: ${model.name}` : 'Create a new duty role'}</h4>
                    <Form layout="horizontal">
                        <Form.Item label="Name" {...formItemLayout}>
                            {
                                getFieldDecorator('name', {
                                    rules: [{ required: true, message: 'Please input role name!' }],
                                    initialValue: model && model.name
                                })(<Input />)
                            }
                        </Form.Item>
                        <Form.Item label="Description" {...formItemLayout}>
                            {
                                getFieldDecorator('description', {
                                    rules: [{ required: true, message: 'Please input role description!' }],
                                    initialValue: model && model.description
                                })(<Input.TextArea />)
                            }
                        </Form.Item>
                    </Form>
                </div>

            const roleContent =
                <div>
                    <h4>{isEditable ? `Edit Duty Roles assigned to: "${newDutyRole?.name}" ${newDutyRole?.name !== oldName ? `(Formerly: "${oldName}")`:''}` :
                        `Add some Duty Roles to "${newDutyRole?.name}"`}</h4>
                    <p>Duty Roles give users the permission to perform an action.</p>
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

            const privilegeContent =
                <div>
                    <h4>{isEditable ? `Edit Privileges assigned to: "${newDutyRole?.name}" ${newDutyRole?.name !== oldName ? `(Formerly: "${oldName}")`:''}` :
                        `Add Privileges to "${newDutyRole?.name}"`}</h4>
                    <Form layout="horizontal">
                        <Form.Item label="Privileges" {...formItemLayout}>
                            {
                                getFieldDecorator('privileges', {
                                    initialValue: selectedPrivileges ? selectedPrivileges : model && rolePrivileges ? rolePrivileges.map(privilege=>privilege.security_privilege_id) : [],
                                })(
                                    <Select
                                        mode="multiple"
                                        allowClear
                                    >
                                        {privilegeOptions}
                                    </Select>
                                )
                            }
                        </Form.Item>
                    </Form>
                </div>

            const summaryContent =
                <div>
                    <h4>{isEditable ? `Summary of changes to: "${newDutyRole?.name}" ${newDutyRole?.name !== oldName ? `(Formerly: "${oldName}")`:''}` :
                        `Summary of new duty role: "${newDutyRole?.name}"`}</h4>
                    <p>The duty role {isEditable ? 'will be' : 'is'} called &quot;{newDutyRole?.name}&quot; and is described as: <br/>
                        <Typography.Text strong>{newDutyRole?.description}</Typography.Text></p>
                    <Divider />
                    <h4>The following Duty Roles are inheriting to this role:</h4>
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
                    <h4>Added privileges:</h4>
                    <Row gutter={12}>
                        <Col span={12}><List
                            header={isEditable ? 'Updated List:' : null}
                            size="small"
                            dataSource={selectedPrivileges}
                            renderItem={item => <List.Item>{privileges.find(privilege=>privilege.security_privilege_id===item)?.name}</List.Item>}/></Col>
                        {isEditable && <Col span={12}><List
                            header="Previously was"
                            size="small"
                            dataSource={rolePrivileges}
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
                title: 'Duty Role',
                content: dutyRoleContent,
            }, {
                title: 'Inheriting Roles',
                content: roleContent,
            }, {
                title: 'Privileges',
                content: privilegeContent,
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

    DutyRoleForm.propTypes={
        model: PropTypes.object,
        currentOrg: PropTypes.object,
        privileges: PropTypes.array,
        roles: PropTypes.array,
    }
    return Form.create({ name: params.name })(DutyRoleForm)
}

export default withDutyRoleModal

import { Component, Fragment, useState, useEffect } from 'react'
import { actions } from 'mirrorx'
import { Form } from '@ant-design/compatible'
import { DatePicker, Input, message, Modal, Select, Spin, Switch, Button, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { globalConstants } from '@/_constants'
import Mask from 'react-text-mask'
import moment from 'moment'
import PropTypes from 'prop-types'
import Link from 'antd/lib/typography/Link'

/** APN Modal HoC
 * @param {React.Component} ActionComponent
 * @param {Object} params
 * @return {React.Component}
*/
function withTPModal (ActionComponent,params) {
    class TPForm extends Component {
        constructor(props) {
            super(props)
            this.state = {
                isEditable: !!props.model,
                open: false,
                submitting: false,
                isSelected: props.model?.kind === 'SOFIHUB'?true:false,
                headers: props.model?.config?.['sofihub.http.extra_headers'] ?? []
            }
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
            const { form , model, currentOrg, admin, headers } = this.props
            const { isEditable } = this.state
            form.validateFieldsAndScroll(async (err, values) => {
                if (!err) {
                    if(this.state.isSelected){
                        values.endpoint1 = values.ip1
                    } else {
                        values.endpoint1 = values.ip1 + ':'+ values.port1
                    }
                    values.endpoint2 = values.ip2 ? values.ip2 + ':'+ values.port2 : ''
                    values.endpoint3 = values.ip3 ? values.ip3 + ':'+ values.port3 : ''
                    
                    if(values.kind === 'SOFIHUB'){
                        values.config = values.config || {}
                        values.config['sofihub.http.extra_headers'] = this.state.headers
                    }
                    this.setSubmit(true)
                    const action = []
                    if (currentOrg || values.organization_id) {
                        const orgId = values.organization_id
                        action.push(isEditable ?
                            actions.organisation.updateOrgTP({ orgId, payload: values, destinationId: model.destination_id }):
                            actions.organisation.createOrgTP({payload: values, orgId }))
                    }else{
                        action.push(isEditable ?
                            actions.thirdParty.updateDestination({ id: model.destination_id, payload: values }):
                            actions.thirdParty.createDestination(values))
                    }

                    Promise.all(action).then(()=>{
                        admin && actions.thirdParty.fetchAllDestination()
                        console.log('submit')
                        message.success(isEditable ? 'Destination Updated' : 'Destination Created')
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

        buildOrgOptions = () => {
            const {currentOrg, orgs} = this.props
            return orgs ? orgs.map(org => (
                <Select.Option key={org.organization_id} value={org.organization_id}>{org.name}</Select.Option>
            )) :  <Select.Option key={currentOrg?.organization_id} value={currentOrg?.organization_id}>{currentOrg?.name}</Select.Option>
        }

        handleAddHeader = () => {
            this.setState(prevState => ({
                headers: [...prevState.headers, '']
            }))
        }

        handleRemove = (index) => {
            this.setState(prevState => ({
                headers: prevState.headers.filter((_, i) => i !== index)
            }))
        }        

        handleInsert = (event, index) => {
            const { value } = event.target
            this.setState(prevState => {
                const updatedHeaders = [...prevState.headers]
                updatedHeaders[index] = value
                return { headers: updatedHeaders }
            })
        }

        render() {
            const { form , model, kinds, currentOrg, admin } = this.props
            const { getFieldDecorator } = form
            const { submitting , open , isEditable, isSelected, headers } = this.state
            const formItemLayout = {
                labelCol: { xs: 24, sm: 10 },
                wrapperCol: { xs: 24, sm: 14 },
            }

            const kindOptions = kinds && kinds.map(kind=>(
                <Select.Option key={kind.name} value={kind.value}>{kind.label}</Select.Option>
            ))
            const orgOptions = this.buildOrgOptions()

            return (
                <Fragment>
                    <ActionComponent onClick={this.handleOpen} />
                    <Modal
                        okText="Save"
                        open={open} onCancel={this.handleClose}
                        onOk={this.handleSave}
                        centered={false}
                        title={isEditable ? `Edit TP Destination: ${model.destination_id}` : 'Create new TP Destination'}
                    >
                        <Spin spinning={submitting}>
                            <Form layout="horizontal">
                                <Form.Item label="Owner Organisation" {...formItemLayout}>
                                    {
                                        getFieldDecorator('organization_id', {
                                            initialValue: model ? model.organization_id : currentOrg ? currentOrg.organization_id : null,
                                            rules: [{ required: !admin, message: 'Please select the own organisation!' }],
                                        })(
                                            <Select
                                                disabled={!!currentOrg}
                                                allowClear
                                            >
                                                {orgOptions}
                                            </Select>
                                        )
                                    }
                                </Form.Item>
                                <Form.Item label="Kind" {...formItemLayout}>
                                    {
                                        getFieldDecorator('kind', {
                                            rules: [{ required: true, message: 'Please select destination kind!' }],
                                            initialValue: model && model.kind
                                        })(
                                            <Select onChange={(e)=>{
                                                if(e === 'SOFIHUB'){
                                                    this.setState({ isSelected: true })
                                                }else{
                                                    this.setState({ isSelected: false })
                                                }
                                            }}>
                                                {kindOptions}
                                            </Select>
                                        )
                                    }
                                </Form.Item>
                                <Form.Item label="Name" {...formItemLayout}>
                                    {
                                        getFieldDecorator('name', {
                                            rules: [{ required: true, message: 'Please input destination name!' }],
                                            initialValue: model && model.name
                                        })(<Input />)
                                    }
                                </Form.Item>
                                <Form.Item label={isSelected ? 'HTTP Endpoint' : 'Primary IP address'} {...formItemLayout}>
                                    {getFieldDecorator('ip1', {
                                        rules: [{ required: true, message: globalConstants.ENTER_HTTP_ENDPOINT }],
                                        initialValue: !isSelected ? (model && model.endpoint1 && model.endpoint1.split(':')[0]) : model && model.endpoint1
                                    })(
                                        <Input />
                                    )}
                                </Form.Item>
                                
                                {!isSelected && <>
                                    <Form.Item label="Primary Port number" {...formItemLayout}>
                                        {
                                            getFieldDecorator('port1', {
                                                rules: [{ required: isSelected ? false : true, message: globalConstants.ENTER_PORT }],
                                                initialValue: model && model.endpoint1?.split(':')[1]
                                            })(
                                                <Mask
                                                    guide={false}
                                                    name="port1"
                                                    placeholder="12345"
                                                    className="ant-input"
                                                    mask={value => Array(value.length).fill(/[\d]/)}
                                                    render={(ref, props) => (
                                                        <input ref={ref} {...props} />
                                                    )}
                                                />
                                            )
                                        }
                                    </Form.Item>
                                    <Form.Item label="Secondary IP address" {...formItemLayout}>
                                        {
                                            getFieldDecorator('ip2', {
                                                initialValue: model && model.endpoint2?.split(':')[0]
                                            })(
                                                <Input />
                                            )
                                        }
                                    </Form.Item>
                                    <Form.Item label="Secondary Port number" {...formItemLayout}>
                                        {
                                            getFieldDecorator('port2', {
                                                initialValue: model && model.endpoint2?.split(':')[1]
                                            })(
                                                <Mask
                                                    guide={false}
                                                    name="port2"
                                                    placeholder="12345"
                                                    className="ant-input"
                                                    mask={value => Array(value.length).fill(/[\d]/)}
                                                    render={(ref, props) => (
                                                        <input ref={ref} {...props} />
                                                    )}
                                                />
                                            )
                                        }
                                    </Form.Item>
                                    <Form.Item label="Third IP address" {...formItemLayout}>
                                        {
                                            getFieldDecorator('ip3', {
                                                initialValue: model && model.endpoint3?.split(':')[0]
                                            })(
                                                <Input />
                                            )
                                        }
                                    </Form.Item>
                                    <Form.Item label="Third Port number" {...formItemLayout}>
                                        {
                                            getFieldDecorator('port3', {
                                                initialValue: model && model.endpoint3?.split(':')[1]
                                            })(
                                                <Mask
                                                    guide={false}
                                                    name="port3"
                                                    placeholder="12345"
                                                    className="ant-input"
                                                    mask={value => Array(value.length).fill(/[\d]/)}
                                                    render={(ref, props) => (
                                                        <input ref={ref} {...props} />
                                                    )}
                                                />
                                            )
                                        }
                                    </Form.Item>
                                </>
                                }
                                <Form.Item label="Timeout (ms)" {...formItemLayout}>
                                    {
                                        getFieldDecorator('timeout', {
                                            initialValue: model && model.timeout
                                        })(
                                            <Input  maxLength={globalConstants.INPUT_MAX_LENGTH}/>
                                        )
                                    }
                                </Form.Item>
                                {
                                    !isSelected &&
                                    <Form.Item label="Append Deep Link URI?" {...formItemLayout}>
                                        {
                                            getFieldDecorator('deep_link_enabled', {
                                                initialValue: model && model.deep_link_enabled,
                                                valuePropName: 'checked'
                                            })(
                                                <Switch />
                                            )
                                        }
                                    </Form.Item>
                                }
                                <Form.Item label="Description" {...formItemLayout}>
                                    {
                                        getFieldDecorator('description', {
                                            initialValue: model && model.description
                                        })(<Input.TextArea />)
                                    }
                                </Form.Item>
                                {isSelected && 
                                    <Form.Item label="Extra HTTP Headers" {...formItemLayout}>
                                        <Button id="addHeader" type="primary"  icon={<PlusOutlined />} size="middle" onClick={this.handleAddHeader}>Add Header</Button>
                                    </Form.Item>
                                }

                                {
                                    isSelected && headers.length > 0 && (
                                        <>
                                            {headers.map((item, index) => (
                                                <Form.Item label={`${index + 1}`} {...formItemLayout} key={index}>
                                                    <div className='header-div'>
                                                        <Input style={{ width: '200px' }} value={item} onChange={(event) => this.handleInsert(event, index)} />
                                                        <Link onClick={() => this.handleRemove(index)}>Remove</Link>
                                                    </div>
                                                </Form.Item>
                                            ))}
                                            <div className='header-placeholder'>
                                                <Typography style={{fontSize:'11px', color:'#59cbe8'}}>Example: </Typography>
                                                <Typography style={{fontSize:'11px'}}>Authorization: Beare &lt;token&gt;</Typography>
                                            </div>
                                        </>
                                    )
                                }
                                
                                {model&& <div>
                                    <Form.Item label="Created At" {...formItemLayout}>
                                        {
                                            getFieldDecorator('created_at', {
                                                initialValue: model && moment(model.created_at)
                                            })(
                                                <DatePicker showTime disabled format="DD-MM-YYYY HH:mm:ss" />
                                            )
                                        }
                                    </Form.Item>
                                    <Form.Item label="Last Modified By" {...formItemLayout}>
                                        {
                                            getFieldDecorator('last_modified_by', {
                                                initialValue: model && model.last_modified_by
                                            })(
                                                <Input disabled/>
                                            )
                                        }
                                    </Form.Item>
                                    <Form.Item label="Last Modified At" {...formItemLayout}>
                                        {
                                            getFieldDecorator('last_modified_at', {
                                                initialValue: model && moment(model.last_modified_at)
                                            })(
                                                <DatePicker showTime disabled format="DD-MM-YYYY HH:mm:ss" />
                                            )
                                        }
                                    </Form.Item>
                                </div>}
                            </Form>
                        </Spin>
                    </Modal>
                </Fragment>
            )
        }
    }

    TPForm.propTypes={
        kinds: PropTypes.array,
        model: PropTypes.object,
        currentOrg: PropTypes.object,
        orgs: PropTypes.array,
        admin: PropTypes.bool,
    }
    return Form.create({ name: params.name })(TPForm)

}

export default withTPModal

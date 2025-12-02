import { Component, createRef, Fragment } from 'react'
import { actions } from 'mirrorx'
import { CopyOutlined } from '@ant-design/icons'
import { DatePicker, Divider, Form, Input, message, Modal, Select, Spin } from 'antd'
import { globalConstants } from '@/_constants'
import moment from 'moment'
import TPActions from '../../../GlobalAdmin/ThirdParties/TPAction'
import { CopyToClipboard } from 'react-copy-to-clipboard'

/** APN Modal HoC
 * @param {React.Component} ActionComponent
 * @return {React.Component}
*/
function withTPModal (ActionComponent) {
    class TPForm extends Component {
        constructor(props) {
            super(props)
            this.state = {
                isEditable: !!props.model,
                open: false,
                submitting : false,
                destinationId: props.model ?props.model.destination_id: null,
            }
            this.formRef = createRef()
        }


        /** handle close Modal */
        handleClose = () => {
            this.formRef.current?.resetFields()
            this.setState({ open: false })
        }

        /** handle open Modal */
        handleOpen = () => {
            this.setState({ open: true })
        }

        handleSelect = (value, option) => {
            const { destinations } = this.props
            this.setState({destinationId: option.key})
            const destination = destinations.find(destination=>destination.destination_id == option.key)
            this.formRef.current?.setFieldsValue({
                kind: destination.kind,
                endpoint2: destination.endpoint2,
                endpoint3: destination.endpoint3
            })
        }

        /** handle saving */
        handleSave = async (values) => {
            const { model, selectedBeacon, destinations } = this.props
            const { isEditable } = this.state
            const beaconId = selectedBeacon.pub_id
            const destination = destinations.find(destination=>destination.destination_id == this.state.destinationId)
            const payload = {
                ...values,
                ...destination,
            }
            payload.alert_escalation_delay = values.alert_escalation_delay ?
                moment.duration(parseInt(values.alert_escalation_delay), 'minutes').toISOString() :
                undefined
            try {
                this.setSubmit(true)
                isEditable ?
                    await actions.sofiBeacon.updateTPAccount({ beaconId, id: model.id, payload }):
                    await actions.sofiBeacon.createTPAccount({beaconId, payload})
                await actions.sofiBeacon.getTPAccounts(beaconId)
                message.success(isEditable ? 'Integration Updated' : 'Integration Created')
                this.setSubmit(false)
                this.handleClose()
            } catch (err) {
                this.setSubmit(false)
                message.error(err.message)
            }
        }

        setSubmit = (value) => {
            this.setState({ submitting: value })
        }

        render() {
            const { model, destinations, selectedBeacon } = this.props
            const { submitting , open , isEditable } = this.state

            const formItemLayout = {
                labelCol: { xs: 24, sm: 11 },
                wrapperCol: { xs: 24, sm: 13 },
            }

            const ipOptions = destinations && destinations.map(destination=>{
                return <Select.OptGroup
                    label={`${destination.kind}${destination.name ? ' - '+destination.name:''}${destination.organization_name ? ' - '+ destination.organization_name:''}`}
                    key={destination.destination_id}>
                    <Select.Option key={destination.destination_id} value={destination.endpoint1}>{destination.endpoint1}</Select.Option>
                </Select.OptGroup>
            })

            const hostname = window.location.hostname
            const link = hostname+'/beacons/'+selectedBeacon?.pub_id

            return (
                <Fragment>
                    <ActionComponent onClick={this.handleOpen} />
                    <Modal
                        width={600}
                        okText="Save"
                        open={open} onCancel={this.handleClose}
                        onOk={() => {this.formRef.current?.validateFields().then((values) => {
                            this.formRef.current?.resetFields()
                            this.handleSave(values)
                        })
                            .catch((info) => {
                                message.error('Validate Failed:', info)
                            })
                        }}
                        centered={false}
                        title={isEditable ? `Edit integration: ${model.id}` : 'Add integration'}
                    >
                        <Spin spinning={submitting}>
                            <Form
                                ref={this.formRef}
                                layout="horizontal"
                                onFinish={this.handleSave}
                                initialValues={{
                                    beacon_id: selectedBeacon?.id,
                                    beacon_link: link,
                                    account_number: model?.account_number,
                                    endpoint1: model?.endpoint1,
                                    kind: model?.kind,
                                    endpoint2: model?.endpoint2,
                                    endpoint3: model?.endpoint3,
                                    alert_escalation_delay: model && moment.duration(model.alert_escalation_delay).asMinutes(),
                                    third_party_account_config: model?.third_party_account_config,
                                    created_at: model && moment(model.created_at),
                                    last_modified_by: model?.last_modified_by,
                                    last_modified_at: model && moment(model.last_modified_at)
                                }}
                                {...formItemLayout}
                            >
                                <Form.Item
                                    label="Beacon ID"
                                    name="beacon_id"
                                >
                                    <Input disabled/>
                                </Form.Item>

                                <Form.Item
                                    label="Beacon Link"
                                    name="beacon_link"
                                >
                                    <Input
                                        disabled
                                        addonAfter={<CopyToClipboard options={{format: 'text/plain'}}
                                            text={link}
                                            onCopy={()=>message.success('Copied')}
                                        >
                                            <CopyOutlined /></CopyToClipboard>}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Account Number"
                                    name="account_number"
                                    rules={[{ required: true, message: 'Please input account number!' }]}
                                >
                                    <Input  maxLength={globalConstants.INPUT_MAX_LENGTH}/>
                                </Form.Item>
                                <Form.Item
                                    label="Primary endpoint"
                                    name="endpoint1"
                                    rules={[{ required: true, message: 'Please select endpoint' }]}
                                >
                                    <Select
                                        showSearch
                                        allowClear
                                        onSelect={this.handleSelect}
                                        dropdownRender={menu => (
                                            <div>
                                                {menu}
                                                <Divider style={{ margin: '4px 0' }} />
                                                <TPActions.CreateTPinAccount
                                                    orgs={this.props.orgs}
                                                    kinds={this.props.kinds}
                                                    admin={this.props.admin}
                                                />
                                            </div>
                                        )}
                                    >
                                        {ipOptions}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    label="Kind"
                                    name="kind"
                                >
                                    <Input disabled/>
                                </Form.Item>
                                <div>
                                    <p>Secondary and other endpoints:</p>
                                    <p>Secondary and other endpoints are linked to the primary endpoint and there is no need
                                        to add them in manually.</p>
                                    <Form.Item
                                        label="Secondary endpoint"
                                        name="endpoint2"
                                    >
                                        {this.formRef.current?.getFieldValue('endpoint2') ? <Input disabled/> :
                                            <span>No secondary endpoint associated</span>}
                                    </Form.Item>

                                    <Form.Item
                                        label="Third endpoint"
                                        name="endpoint3"
                                    >
                                        {this.formRef.current?.getFieldValue('endpoint3') ? <Input disabled/> :
                                            <span>No third endpoint associated</span>}
                                    </Form.Item>
                                </div>

                                <Form.Item
                                    label="Alert Escalation Delay (min)"
                                    name="alert_escalation_delay"
                                >
                                    <Input maxLength={globalConstants.INPUT_MAX_LENGTH}/>
                                </Form.Item>

                                <Form.Item
                                    label="Config"
                                    name="third_party_account_config"
                                >
                                    <Input.TextArea autoSize/>
                                </Form.Item>

                                {model && <div>
                                    <Form.Item
                                        label="Created At"
                                        name="created_at"
                                    >
                                        <DatePicker showTime disabled format="DD-MM-YYYY HH:mm:ss" />
                                    </Form.Item>

                                    <Form.Item
                                        label="Last Modified By"
                                        name="last_modified_by"
                                    >
                                        <Input disabled/>
                                    </Form.Item>

                                    <Form.Item
                                        label="Last Modified At"
                                        name="last_modified_at"
                                    >
                                        <DatePicker showTime disabled format="DD-MM-YYYY HH:mm:ss" />
                                    </Form.Item>
                                </div>}
                            </Form>
                        </Spin>
                    </Modal>
                </Fragment>
            )
        }
    }

    return TPForm
}

export default withTPModal

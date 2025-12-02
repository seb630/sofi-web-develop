import { Component, createRef } from 'react'
import { actions } from 'mirrorx'
import { Form, message, Modal, Select } from 'antd'
import PropTypes from 'prop-types'
import changeCase from 'change-case'
import { globalConstants } from '@/_constants'

class AddLeafModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            deviceType: null,
        }
        this.formRef = createRef()
    }

    handleClose = () =>{
        this.setState({deviceType: null})
        this.props.onClose()
    }

    handleSubmit = (values) => {
        const {currentOrg, selectedGroup, type } = this.props
        let orgId = currentOrg.organization_id

        let promise = []
        if (type==='device'){
            values.device_id_ref.map(id=>{
                let payload = {
                    ...selectedGroup,
                    organization_id: currentOrg.organization_id,
                }
                payload.device_id_ref =  id
                payload.type = this.state.deviceType
                promise.push( actions.organisation.addDeviceGroupDevice({ orgId, payload }))
            })
        } else {
            values.device_id_ref.map(id=> {
                let payload = {
                    ...selectedGroup,
                    organization_id: currentOrg.organization_id,
                }
                payload.organization_user_id = id
                promise.push(actions.organisation.addUserGroupUser({ orgId, payload }))
            })
        }
        Promise.all(promise).then(() => {
            message.success(`Add ${type} success!`)
            this.formRef.current.resetFields()
            this.handleClose()
        }, (error) => {
            message.error(error.message)
        })
    }

    buildOptions = () => {
        let {selectedGroupDevices, type, candidates, selectedGroupUsers} = this.props
        if (type==='device'){
            const {deviceType} = this.state
            candidates = candidates?.filter(
                candidate => !selectedGroupDevices?.find(x => x.device_id_ref === candidate.hub_id && !candidate.pub_id || x.device_id_ref === candidate.pub_id)
            )
            candidates = candidates?.filter(candidate=>deviceType==='HUB' && candidate.hub_id && !candidate.pub_id || deviceType==='BEACON' && candidate.imei || deviceType==='RADAR' && candidate.ext_id)
            return candidates?.map(device => (
                device && <Select.Option
                    key={device.pub_id ? device.pub_id : device.hub_id}
                    value={device.pub_id ? device.pub_id : device.hub_id}
                    type={device.hub_id && device.mac_address? 'HUB' : device.ext_id ? 'RADAR': 'BEACON'}
                >{device.display_name}</Select.Option>
            ))
        } else {
            candidates = candidates?.filter(
                candidate => !selectedGroupUsers?.find(x => x?.organization_user_resp_dto?.user_id === candidate.user_id)
            )
            return candidates?.map(user => (
                user && <Select.Option
                    key={user.organization_user_id}
                    value={user.organization_user_id}
                >{user.first_name} {user.last_name}</Select.Option>
            ))
        }
    }

    render() {
        const { open, type } = this.props
        const candidateOptions = this.buildOptions()
        return (
            <Modal
                destroyOnClose
                title={type==='device' ? 'Add device':  'Add user' }
                open={open}
                onOk={() => {this.formRef.current?.validateFields().then((values) => {
                    this.formRef.current?.resetFields()
                    this.handleSubmit(values)
                })
                    .catch((info) => {
                        message.error('Validate Failed:', info)
                    })
                }}
                okText="Submit"
                onCancel={this.handleClose}
            >
                <Form
                    onFinish={this.handleSubmit}
                    ref={this.formRef}
                    layout="vertical"
                >
                    {type==='device'&& <Form.Item
                        name="device_type"
                        label="Device Type"
                        rules={[{
                            required: true, message: 'Please select type!',
                        }]}
                    >
                        <Select
                            size="large"
                            placeholder="Please select device type"
                            onChange={(v)=>this.setState({deviceType: v})}
                        >
                            <Select.Option value='HUB' key='HUB'>{globalConstants.HUB_GENERIC}</Select.Option>
                            <Select.Option value='BEACON' key='BEACON'>{globalConstants.PENDANT_GENERIC}</Select.Option>
                            <Select.Option value='RADAR' key='RADAR'>{globalConstants.RADAR_GENERIC}</Select.Option>
                        </Select>
                    </Form.Item>
                    }
                    {(type !== 'device' || this.state.deviceType) && <Form.Item
                        name="device_id_ref"
                        label={`${changeCase.titleCase(type)} name`}
                        rules={[{
                            required: true, message: `Please select a ${type}!`,
                        }, { type: 'array', max: 10, message: 'Select up to 10 devices at a time' }]}
                    >
                        <Select
                            mode="multiple"
                            showSearch
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            size="large"
                            placeholder={`Please select a ${type}`}
                        >
                            {candidateOptions}
                        </Select>
                    </Form.Item>
                    }
                </Form>
            </Modal>
        )
    }
}

AddLeafModal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    currentOrg: PropTypes.object,
    type: PropTypes.oneOf(['user', 'device']),
    selectedGroup: PropTypes.object,
    candidates: PropTypes.array,
    selectedGroupDevices: PropTypes.array,
    selectedGroupUsers: PropTypes.array,
}

export default AddLeafModal

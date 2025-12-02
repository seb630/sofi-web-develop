import { Component } from 'react'
import { actions } from 'mirrorx'
import { Form } from '@ant-design/compatible'
import { Col, Input, Modal, Radio, Row, Select } from 'antd'
import PropTypes from 'prop-types'
import { globalConstants } from '@/_constants'

class SettingModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    generateCarers = (carers)=> {
        return carers && carers.map(carer=>(
            <Select.Option key={carer.user_id} value={carer.user_id}>{carer.first_name+' '+carer.last_name}</Select.Option>
        ))
    }

    handleSave = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                if (values.radius<50){
                    Modal.warning({
                        title: 'Hey, quick tip',
                        content : 'Quick note GPS is accurate to within 10 metres, we recommend that a geofence ' +
                            'radius is 50 metres or larger'
                    })
                }else if (this.checkOnlyMe(values)){
                    Modal.warning(
                        {
                            title: 'Hold on there admin user!',
                            content : `You are an admin user, and you can see this ${globalConstants.PENDANT_GENERIC}, but you are not a carer for this ${globalConstants.PENDANT_GENERIC}. You cannot change the settings to "only me" unless you assign yourself as a carer for this ${globalConstants.PENDANT_GENERIC}.`,
                            okText: 'I understand'
                        }
                    )
                }
                else{
                    let payload = this.props.geofence
                    payload.name = values.name
                    payload.config.shape.circle.radius = values.radius
                    payload.config.on_enter = this.calculateActionValue('on_enter', values)
                    payload.config.on_exit = this.calculateActionValue('on_exit', values)
                    if (payload.id){
                        actions.sofiBeacon.updateBeaconGeofence(payload).then(()=>{
                            this.props.onClose()
                        })
                    }else{
                        actions.sofiBeacon.createBeaconGeofence(payload).then(()=>{
                            this.props.onClose()
                        })
                    }
                }

            }
        })
    }

    checkOnlyMe = (values) => {
        // Return true if the admin user is not carer but selected Only Me option
        if (!this.props.carers.some(carer=>carer.user_id ===this.props.me.user_id)){
            return (values.on_enter_sms==='me' || values.on_enter_email==='me' ||
               values.on_exit_sms==='me' || values.on_exit_email==='me')
        }else{
            return false
        }
    }

    calculateNotifyValue = (action, notify, values) => {
        let result = {}
        if (values[action+'_'+notify]==='none'){
            result[notify+'_all'] = false
            result[notify+'_list']= []
        } else if (values[action+'_'+notify]==='all'){
            result[notify+'_all'] = true
            result[notify+'_list']= []
        } else if (values[action+'_'+notify]==='me'){
            result[notify+'_all'] = false
            result[notify+'_list']= [this.props.me.user_id]
        }else if (values[action+'_'+notify]==='some'){
            result[notify+'_all'] = false
            result[notify+'_list']= values[action+'_'+notify+'_carers']
        }
        return result
    }


    calculateActionValue = (action, values) => {
        let sms = this.calculateNotifyValue(action, 'sms', values)
        let email = this.calculateNotifyValue(action, 'email', values)
        return {...sms,...email}
    }


    generateInitialValue = (action, notify) => {
        const {geofence, me} = this.props
        let result = ''
        if (geofence && me){
            if (geofence.config[action]) {
                if (geofence.config[action][notify + '_all']) {
                    result =  'all'
                } else if (!geofence.config[action][notify + '_list'] || geofence.config[action][notify + '_list'].length === 0) {
                    result =  'none'
                } else if (geofence.config[action][notify + '_list'].length === 1 && geofence.config[action][notify + '_list'][0] == me.user_id) {
                    result =  'me'
                } else {
                    result =  'some'
                }
            } else {
                result =  'none'
            }
        }
        return result
    }

    render() {
        const {form, open,onClose,geofence, carers } = this.props
        const { getFieldDecorator, getFieldValue } = form
        const carersOption = this.generateCarers(carers)
        const formItemLayoutAlter = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 12 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 12 },
            },
        }

        return (<div>
            <Modal
                title="Geofence Setting"
                open={open}
                onOk={this.handleSave}
                onCancel={onClose}
                width='800px'
            >
                <Form
                    onSubmit={this.handleSave}
                    labelCol= {{xs: { span: 24 },sm: { span: 8 }}}
                    wrapperCol={{xs: { span: 24 }, sm: { span: 16 }}}
                >
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                {...formItemLayoutAlter}
                                label="Geofence Name"
                            >
                                {getFieldDecorator('name', {
                                    rules: [{ required: true, message: 'Please input Geofence name!', whitespace: true }],
                                    initialValue: geofence && geofence.name
                                })(
                                    <Input />
                                )}
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                {...formItemLayoutAlter}
                                label="Radius"
                            >
                                {getFieldDecorator('radius', {
                                    rules: [{ required: true, message: 'Please input radius!'}],
                                    initialValue: geofence && geofence.config.shape.circle.radius
                                })(
                                    <Input style={{ width: '150px' }} addonAfter="meters"/>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <h3>
                            Here you can edit notification settings for the geofence, you can either set up notification for yourself or for everyone.
                        </h3>
                    </Row>
                    <Row>
                        <h4>If the {globalConstants.PENDANT_GENERIC} enters the geofence area:</h4>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24}>
                            <Form.Item
                                label="Send SMS to"
                            >
                                {getFieldDecorator('on_enter_sms', {
                                    rules: [{
                                        required: true, message: 'Please select an action!',
                                    }],
                                    initialValue: this.generateInitialValue('on_enter','sms')
                                })(
                                    <Radio.Group  buttonStyle="solid" >
                                        <Radio.Button value="all">All Carers</Radio.Button>
                                        <Radio.Button value="me">Only Me</Radio.Button>
                                        <Radio.Button value="some">Selected Carers</Radio.Button>
                                        <Radio.Button value="none">None</Radio.Button>
                                    </Radio.Group>
                                )}
                            </Form.Item>
                        </Col>
                        {getFieldValue('on_enter_sms') === 'some' &&
                        <Col xs={24}>
                            <Form.Item
                                label="Select Carer"
                            >
                                {getFieldDecorator('on_enter_sms_carers', {
                                    initialValue: geofence.config.on_enter && geofence.config.on_enter.sms_list
                                })(
                                    <Select mode="multiple" placeholder="Please select carer">{carersOption}</Select>
                                )}
                            </Form.Item>
                        </Col>
                        }
                        <Col xs={24}>
                            <Form.Item
                                label="Send Email to"
                            >
                                {getFieldDecorator('on_enter_email', {
                                    rules: [{
                                        required: true, message: 'Please select an action!',
                                    }],
                                    initialValue: this.generateInitialValue('on_enter','email')
                                })(
                                    <Radio.Group  buttonStyle="solid" >
                                        <Radio.Button value="all">All Carers</Radio.Button>
                                        <Radio.Button value="me">Only Me</Radio.Button>
                                        <Radio.Button value="some">Selected Carers</Radio.Button>
                                        <Radio.Button value="none">None</Radio.Button>
                                    </Radio.Group>
                                )}
                            </Form.Item>
                        </Col>
                        {getFieldValue('on_enter_email') === 'some' &&
                        <Col xs={24}>
                            <Form.Item
                                label="Select Carer"
                            >
                                {getFieldDecorator('on_enter_email_carers', {
                                    initialValue: geofence.config.on_enter && geofence.config.on_enter.email_list
                                })(
                                    <Select mode="multiple" placeholder="Please select carer">{carersOption}</Select>
                                )}
                            </Form.Item>
                        </Col>
                        }
                    </Row>
                    <Row>
                        <h4>If the {globalConstants.PENDANT_GENERIC} leaves the geofence area:</h4>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24}>
                            <Form.Item
                                label="Send SMS to"
                            >
                                {getFieldDecorator('on_exit_sms', {
                                    rules: [{
                                        required: true, message: 'Please select an action!',
                                    }],
                                    initialValue: this.generateInitialValue('on_exit','sms')
                                })(
                                    <Radio.Group  buttonStyle="solid" >
                                        <Radio.Button value="all">All Carers</Radio.Button>
                                        <Radio.Button value="me">Only Me</Radio.Button>
                                        <Radio.Button value="some">Selected Carers</Radio.Button>
                                        <Radio.Button value="none">None</Radio.Button>
                                    </Radio.Group>
                                )}
                            </Form.Item>
                        </Col>
                        {getFieldValue('on_exit_sms') === 'some' &&
                        <Col xs={24}>
                            <Form.Item
                                label="Select Carer"
                            >
                                {getFieldDecorator('on_exit_sms_carers', {
                                    initialValue: geofence.config.on_exit && geofence.config.on_exit.sms_list
                                })(
                                    <Select mode="multiple" placeholder="Please select carer">{carersOption}</Select>
                                )}
                            </Form.Item>
                        </Col>
                        }
                        <Col xs={24}>
                            <Form.Item
                                label="Send Email to"
                            >
                                {getFieldDecorator('on_exit_email', {
                                    rules: [{
                                        required: true, message: 'Please select an action!',
                                    }],
                                    initialValue: this.generateInitialValue('on_exit','email')
                                })(
                                    <Radio.Group  buttonStyle="solid" >
                                        <Radio.Button value="all">All Carers</Radio.Button>
                                        <Radio.Button value="me">Only Me</Radio.Button>
                                        <Radio.Button value="some">Selected Carers</Radio.Button>
                                        <Radio.Button value="none">None</Radio.Button>
                                    </Radio.Group>
                                )}
                            </Form.Item>
                        </Col>
                        {getFieldValue('on_exit_email') === 'some' &&
                        <Col xs={24}>
                            <Form.Item
                                label="Select Carer"
                            >
                                {getFieldDecorator('on_exit_email_carers', {
                                    initialValue: geofence.config.on_exit && geofence.config.on_exit.email_list
                                })(
                                    <Select mode="multiple" placeholder="Please select carer">{carersOption}</Select>
                                )}
                            </Form.Item>
                        </Col>
                        }
                    </Row>
                </Form>

            </Modal>
        </div>)
    }
}

const SettingModalPage = Form.create({})(SettingModal)

SettingModalPage.propTypes={
    geofence: PropTypes.object.isRequired,
    carers: PropTypes.array.isRequired,
    open: PropTypes.bool,
    onClose: PropTypes.func,
    me: PropTypes.object,
}

export default SettingModalPage

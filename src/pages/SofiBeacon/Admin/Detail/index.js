import { Component } from 'react'
import { actions } from 'mirrorx'
import { Form } from '@ant-design/compatible'
import { Alert, Button, Card, Checkbox, Col, Input, message, Row, Select, Skeleton, Spin } from 'antd'
import PhoneInput from 'react-phone-number-input'
import { globalConstants } from '@/_constants'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { CopyOutlined } from '@ant-design/icons'
import { titleCase } from 'change-case'
import { isWatch } from '@/utility/Common'

class Index extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isDirty: false,
            submitting: false,
            imeiWarning: false
        }
    }

    /** handle IMEI blur */
    handleIMEIBlur = () => {
        const { form } = this.props
        const values = form.getFieldsValue()
        this.setState({ imeiWarning: values.imei && values.imei.length < globalConstants.IMEI_MAX_LENGTH })

    }

    /** handle save */
    handleSave = () => {
        const { form, selectedBeacon } = this.props
        form.validateFields(async (err,values) => {
            try {
                if (!err) {
                    this.setState({ submitting: true })
                    await actions.sofiBeacon.saveBeaconInfor(_.extend({},selectedBeacon,values)).then(()=>{
                        actions.sofiBeacon.fetchBeaconByUser()
                        window.location.reload()
                    })
                    message.success('Saved successfully !!',3)
                    this.setDirty(false)
                }
            } catch (err) {
                err.global_errors.forEach(e => {
                    message.error(e.message,3)
                })
            } finally {
                this.setState({ submitting: false })
            }
        })
    }

    /** set Dirty
     * @param {boolean} isDirty
    */
    setDirty = (isDirty) => {
        this.setState({
            isDirty
        })
    }

    render() {
        const { imeiWarning, submitting , isDirty } = this.state
        const { form , selectedBeacon, beaconModels} = this.props
        const { getFieldDecorator, getFieldValue } = form

        const beaconModelOptions = beaconModels && beaconModels.map(model=>(
            <Select.Option key={model.name} value={model.name}>{model.name}</Select.Option>
        ))

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            }
        }

        const checkBoxItemLayout = {
            labelCol: {
                span: 8
            },
            wrapperCol: {
                span: 16
            }
        }

        const title = (isWatch(selectedBeacon) ? 'Watch' : 'Beacon') + ' Details'

        return (
            <Card className="beacon-card" title={title}>
                <Skeleton loading={selectedBeacon == null}>
                    <Spin spinning={submitting}>
                        <p>You can update the {titleCase(isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC)} phone number here</p>
                        <Form.Item label={`${titleCase(isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC)} ID`} {...formItemLayout}>
                            {
                                getFieldDecorator('beacon_id', {
                                    initialValue: selectedBeacon && selectedBeacon.id,

                                })(
                                    <Input
                                        disabled
                                        addonAfter={<CopyToClipboard options={{format: 'text/plain'}}
                                            text={selectedBeacon?.id}
                                            onCopy={()=>message.success('Copied')}
                                        >
                                            <CopyOutlined /></CopyToClipboard>}
                                    />
                                )
                            }
                        </Form.Item>

                        <Form.Item label={`${titleCase(isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC)} Pub ID`} {...formItemLayout}>
                            {
                                getFieldDecorator('pub_id', {
                                    initialValue: selectedBeacon && selectedBeacon.pub_id,

                                })(
                                    <Input disabled addonAfter={<CopyToClipboard options={{format: 'text/plain'}}
                                        text={selectedBeacon?.pub_id}
                                        onCopy={()=>message.success('Copied')}
                                    >
                                        <CopyOutlined /></CopyToClipboard>}
                                    />
                                )
                            }
                        </Form.Item>

                        <Form.Item label={'Firmware Version'} {...formItemLayout}>
                            {
                                getFieldDecorator('firmware_version', {
                                    initialValue: selectedBeacon && selectedBeacon.firmware_version,

                                })(
                                    <Input disabled addonAfter={<CopyToClipboard options={{format: 'text/plain'}}
                                        text={selectedBeacon?.firmware_version}
                                        onCopy={()=>message.success('Copied')}
                                    >
                                        <CopyOutlined /></CopyToClipboard>}
                                    />
                                )
                            }
                        </Form.Item>

                        <Form.Item label="Version" {...formItemLayout}>
                            {
                                getFieldDecorator('version', {
                                    initialValue: selectedBeacon && selectedBeacon.version,

                                })(
                                    <Input disabled addonAfter={<CopyToClipboard options={{format: 'text/plain'}}
                                        text={selectedBeacon?.version}
                                        onCopy={()=>message.success('Copied')}
                                    >
                                        <CopyOutlined /></CopyToClipboard>}
                                    />
                                )
                            }
                        </Form.Item>

                        <Form.Item label="IMEI" {...formItemLayout}>
                            {
                                getFieldDecorator('imei', {
                                    rules: [
                                        { required: true, message: 'Please enter IMEI number!' },
                                        { max: globalConstants.IMEI_MAX_LENGTH , message:'IMEI has maximum of 15 characters.' },
                                        { pattern: new RegExp(/^\d+$/) , message:'IMEI is only digits.'}
                                    ],
                                    initialValue: selectedBeacon && selectedBeacon.imei,

                                })(
                                    <Input
                                        maxLength={globalConstants.INPUT_MAX_LENGTH}
                                        onBlur={this.handleIMEIBlur}
                                        onChange={() => { this.setDirty(true)} }
                                        addonAfter={<CopyToClipboard options={{format: 'text/plain'}}
                                            text={getFieldValue('imei')}
                                            onCopy={()=>message.success('Copied')}
                                        >
                                            <CopyOutlined /></CopyToClipboard>}
                                    />
                                )
                            }
                            {
                                imeiWarning && <Alert showIcon={true}  style={{ marginTop: '15px'}} message={globalConstants.ADD_IMEI_WARNING} type="warning" />
                            }
                        </Form.Item>
                        <Row>
                            <Col flex="auto">
                                <Form.Item label="Phone" {...formItemLayout}>
                                    {
                                        getFieldDecorator('phone', {
                                            rules: [{ required: true, message: 'Please enter phone number!' }],
                                            initialValue: selectedBeacon && selectedBeacon.phone
                                        })(
                                            <PhoneInput
                                                flagsPath='https://flagicons.lipis.dev/flags/4x3/'
                                                inputClassName="ant-input"
                                                country={globalConstants.DEFAULT_COUNTRY}
                                                onChange={() => { this.setDirty(true)} } />
                                        )
                                    }
                                </Form.Item>
                            </Col>
                            <Col flex="40px">
                                <Button style={{padding: '2.4px 11px', borderRadius:'0 4px 4px 0'}}><CopyToClipboard options={{format: 'text/plain'}}
                                    text={getFieldValue('phone')}
                                    onCopy={()=>message.success('Copied')}
                                >
                                    <CopyOutlined /></CopyToClipboard></Button>
                            </Col>
                        </Row>
                        <Form.Item label="Model Number" {...formItemLayout}>
                            {
                                getFieldDecorator('model', {
                                    rules: [{ required: true, message: 'Please select the model!' }],
                                    initialValue: selectedBeacon && selectedBeacon.model
                                })(
                                    <Select onChange={() => { this.setDirty(true)} } style={{minWidth: 220}}>
                                        {beaconModelOptions}
                                    </Select>
                                )
                            }
                        </Form.Item>

                        <Form.Item label="Archived" {...checkBoxItemLayout}>
                            {
                                getFieldDecorator('archived', {
                                    valuePropName: 'checked',
                                    initialValue: selectedBeacon && selectedBeacon.archived
                                })(
                                    <Checkbox onChange={() => { this.setDirty(true)} } />
                                )
                            }
                        </Form.Item>
                        <div className="d-flex justify-content-end">
                            <Button id="btn-saveBeaconDetails" type="primary" disabled={!isDirty} onClick={this.handleSave}> Save </Button>
                        </div>
                    </Spin>
                </Skeleton>
            </Card>
        )
    }
}

Index.propTypes = {
    me: PropTypes.object,
    selectedBeacon: PropTypes.shape({
        id: PropTypes.number,
        imei: PropTypes.string,
        phone: PropTypes.string,
        archived: PropTypes.bool
    }),
    beaconModels: PropTypes.array
}

export default Form.create({})(Index)

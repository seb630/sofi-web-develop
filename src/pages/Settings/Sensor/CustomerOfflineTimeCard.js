import { PureComponent } from 'react'
import { actions, connect } from 'mirrorx'
import { Form } from '@ant-design/compatible'
import { Button, Card, InputNumber, message, Row } from 'antd'
import PropTypes from 'prop-types'
import moment from 'moment'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    deviceIntervalConfig: state.hub.deviceIntervalConfig
})

class CustomerOfflineTimeCard extends PureComponent {

    save = () => {
        const {form, selectedSensor} = this.props
        const isDoorSensor = selectedSensor.device_kind==='CONTACT'
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let payload = {
                    ...values,
                    warning_interval: moment.duration(parseInt(values.warning_interval), isDoorSensor ? 'days':'minutes').toISOString(),
                    unknown_interval: moment.duration(parseInt(values.unknown_interval), isDoorSensor ? 'days':'minutes').toISOString(),
                    offline_interval: moment.duration(parseInt(values.offline_interval), isDoorSensor ? 'days':'minutes').toISOString(),
                    device_id: selectedSensor.device_id
                }
                actions.hub.updateDeviceIntervalConfig(
                    {deviceId: selectedSensor.device_id, payload }).then(()=>{
                    message.success('saved')
                }).catch((error)=>{
                    message.error(error.message)
                })

            }
        })
    }
    render() {
        const {form, deviceIntervalConfig, selectedSensor} = this.props
        const isDoorSensor = selectedSensor.device_kind==='CONTACT'
        const {getFieldDecorator} = form
        const formItemLayout = {
            labelCol: { xs: 24, sm: 11 },
            wrapperCol: { xs: 24, sm: 13 },
        }
        return (
            <Card className="advanced_block" title="Customise offline time">
                <p>
                    Sensors transition from their online status to other statuses if the {globalConstants.HUB_SOFIHUB} does not hear
                    from the sensor after a specific amount of time. You can customise this time here:
                </p>
                <Form layout="horizontal">
                    {isDoorSensor ? <Form.Item label="Transition from online to warning" {...formItemLayout}>
                        {
                            getFieldDecorator('warning_interval', {
                                initialValue: deviceIntervalConfig?.warning_interval ?
                                    moment.duration(deviceIntervalConfig.warning_interval).asDays() : null
                            })(
                                <InputNumber
                                    min={1}
                                    formatter={value => value && `${value}days`}
                                    parser={value => value?.replace('days', '')}
                                />
                            )
                        }
                    </Form.Item> :
                        <Form.Item label="Transition from online to warning" {...formItemLayout}>
                            {
                                getFieldDecorator('warning_interval', {
                                    initialValue: deviceIntervalConfig?.warning_interval ?
                                        moment.duration(deviceIntervalConfig.warning_interval).asMinutes() : null
                                })(
                                    <InputNumber
                                        min={1}
                                        formatter={value => value && `${value}mins`}
                                        parser={value => value?.replace('mins', '')}
                                    />
                                )
                            }
                        </Form.Item>
                    }
                    {isDoorSensor ? <Form.Item label="Transition from warning to unknown" {...formItemLayout}>
                        {
                            getFieldDecorator('unknown_interval', {
                                initialValue: deviceIntervalConfig?.unknown_interval ?
                                    moment.duration(deviceIntervalConfig.unknown_interval).asDays() : null
                            })(
                                <InputNumber
                                    min={1}
                                    formatter={value => value && `${value}days`}
                                    parser={value => value?.replace('days', '')}
                                />
                            )
                        }
                    </Form.Item>: <Form.Item label="Transition from warning to unknown" {...formItemLayout}>
                        {
                            getFieldDecorator('unknown_interval', {
                                initialValue: deviceIntervalConfig?.unknown_interval ?
                                    moment.duration(deviceIntervalConfig.unknown_interval).asMinutes() : null
                            })(
                                <InputNumber
                                    min={1}
                                    formatter={value => value && `${value}mins`}
                                    parser={value => value?.replace('mins', '')}
                                />
                            )
                        }
                    </Form.Item>
                    }
                    {isDoorSensor ? <Form.Item label="Transition from unknown to offline" {...formItemLayout}>
                        {
                            getFieldDecorator('offline_interval', {
                                initialValue: deviceIntervalConfig?.offline_interval ?
                                    moment.duration(deviceIntervalConfig.offline_interval).asDays() : null
                            })(
                                <InputNumber
                                    min={1}
                                    formatter={value => value && `${value}days`}
                                    parser={value => value?.replace('days', '')}
                                />
                            )
                        }
                    </Form.Item>: <Form.Item label="Transition from unknown to offline" {...formItemLayout}>
                        {
                            getFieldDecorator('offline_interval', {
                                initialValue: deviceIntervalConfig?.offline_interval ?
                                    moment.duration(deviceIntervalConfig.offline_interval).asMinutes() : null
                            })(
                                <InputNumber
                                    min={1}
                                    formatter={value => value && `${value}mins`}
                                    parser={value => value?.replace('mins', '')}
                                />
                            )
                        }
                    </Form.Item>
                    }
                    <Row type="flex" justify="end">
                        <Button type="primary" onClick={this.save}>Save</Button>
                    </Row>
                </Form>
            </Card>
        )
    }
}

CustomerOfflineTimeCard.propTypes={
    selectedSensor: PropTypes.object,
    selectedHub: PropTypes.object,
}

export default connect(mapStateToProps, null) (Form.create({})(CustomerOfflineTimeCard))

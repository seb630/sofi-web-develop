import {Button, Card, Col, Form, InputNumber, message, Row, Select, Space} from 'antd'
import { actions } from 'mirrorx'
import './index.scss'
import { useEffect, useRef, useState } from 'react'
import { RouterPrompt } from '@/components/RouterPrompt'
import { globalConstants } from '@/_constants'
import {CheckCircleOutlined, ClockCircleOutlined} from '@ant-design/icons'

const RadarGeneralSettings = (props) => {
    const {selectedRadar, radarConfig, history} = props
    const {scrollToBottom, scrollToCalibrate}  = actions.radar.getS().routing?.location?.state || {}
    const [dirty, setDirty] = useState(false)
    const calibrateRef = useRef()
    const fallRef = useRef()

    const scrollToBottomAction = () => {
        scrollToBottom && fallRef.current.scrollIntoView({ behavior: 'smooth' })
    }

    const scrollToCalibrateAction= () => {
        scrollToCalibrate && calibrateRef.current.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(scrollToBottomAction, [scrollToBottom])
    useEffect(scrollToCalibrateAction, [scrollToCalibrate])

    const [form] = Form.useForm()

    useEffect(() => {
        form.setFieldsValue({
            ...radarConfig && JSON.parse(radarConfig.config),
        })
    },[radarConfig, form, selectedRadar])

    const handleCancel = () => {
        form.setFieldsValue({
            ...radarConfig && JSON.parse(radarConfig.config),
        })
        setDirty(false)
    }

    const handleSave = () =>{
        let payload = {
            id: selectedRadar.id,
            config: JSON.stringify({
                ...form.getFieldsValue(),
            })
        }
        actions.radar.updateRadarConfig(payload).then(()=> {
            setDirty(false)
            message.success(`We will restart your ${globalConstants.RADAR_HOBA} for these changes to take effect.`)
        },(error=>{
            message.error(error.message)
        }))
    }

    const layout = {
        labelCol: { span: 12 },
        wrapperCol: { span: 12 },
    }

    return (
        <Card title="General Radar Settings" >
            <RouterPrompt
                when={dirty}
                history={history}
                title="Unsaved Changes"
                content={`You have unsaved changes, would you like to save and reboot the ${globalConstants.RADAR_HOBA}, or would you like to discard and continue?`}
                cancelText="Cancel and Save"
                okText="Discard and Continue"
                onOK={() => true}
                onCancel={() => false}
            />

            <Form
                {...layout}
                labelWrap
                form={form}
                initialValues={{
                    ...radarConfig && JSON.parse(radarConfig.config)
                }}
                onFinish={handleSave}
                onValuesChange={()=>setDirty(true)}
            >
                <Row gutter={12} style={{marginBottom:18}} align="middle" className="radarSetting">
                    <Col className="ant-form-item-label" span={12}>
                        <label>
                            Changes synced?
                        </label>
                    </Col>
                    <Col span={12}>
                        {radarConfig?.is_synced ? <><CheckCircleOutlined className="icon icon-success" />Saved to {globalConstants.RADAR_HOBA}</> : <><ClockCircleOutlined className="icon" />Save is pending...</>}
                    </Col>
                </Row>

                <Form.Item
                    name="work_range"
                    label="Detection range"
                >
                    <InputNumber
                        style={{width:'100px'}}
                        min={1}
                        max={7}
                        step={0.1}
                        formatter={value => `${value}m`}
                        parser={value => value.replace('m', '')}
                        placeholder="Work range in meters"
                    />
                </Form.Item>

                <Form.Item
                    name="install_height"
                    label="Install height"
                >
                    <Select
                        style={{width:'100px'}}
                        options={[{
                            label: '1.4m',
                            value: 1.4
                        }, {
                            label: '2.2m',
                            value: 2.2
                        }]} />
                </Form.Item>

                <Form.Item
                    name="alarm_delay_time"
                    label="Alarm delay time in seconds"
                >
                    <InputNumber
                        style={{width:'100px'}}
                        min={30}
                        max={120}
                        step={5}
                        formatter={value => `${value}s`}
                        parser={value => value.replace('s', '')}
                    />
                </Form.Item>

                <Form.Item label="" labelCol={0} wrapperCol={24} style={{textAlign:'end', marginBottom: 0}}>
                    <Space direction="horizontal">
                        <Button onClick={handleCancel} disabled={!dirty}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" disabled={!dirty}>
                            Save
                        </Button>
                    </Space>
                </Form.Item>
            </Form>

        </Card>
    )
}

export default RadarGeneralSettings

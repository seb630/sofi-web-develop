import { Button, Card, Col, Form, Input, message, Row, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { actions } from 'mirrorx'
import { globalConstants } from '@/_constants'
import moment from 'moment'
import { isLife, isWatch } from '@/utility/Common'

const { Paragraph } = Typography

const BeaconPrefixCard = (props) => {
    const [prefix, setPrefix] = useState(props.settings?.sms_prefix_text || '')
    const [formRef] = Form.useForm()

    useEffect(() => {
        setPrefix(props.settings?.sms_prefix_text || '')
        formRef.setFieldsValue({ prefix: props.settings?.sms_prefix_text || '' })
    }, [props.settings, formRef])

    const handleUpdate = (values) => {
        const payload = { prefix: values.prefix }
        actions.sofiBeacon.UpdateBeaconPrefix({ payload, beaconId: props.selectedBeacon.pub_id }).then(() => {
            message.success('Saved! This might take some time to be accepted by your beacon.')
        }, () => message.error(globalConstants.WENT_WRONG))
    }

    const deviceType = isLife(props.selectedBeacon) ?
        globalConstants.LIFE_SOFIHUB :
        isWatch(props.selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB

    const title = (isWatch(props.selectedBeacon) ? globalConstants.BEACON_WATCH : 'Beacon') + ' SMS Alert Prefix'

    return (
        <Card title={title} className="advanced_block">
            <Paragraph>
                Here you can set up a short prefix for the {deviceType} to prepend to the start of a fall alert, or SOS
                button press SMS. This can help you quickly identify who&#39;s {deviceType} is messaging you if you are an
                emergency contact for more than one beacon.
            </Paragraph>

            <Form onFinish={handleUpdate} initialValues={{ prefix: prefix }} form={formRef}>
                <Row align="middle">
                    <Col flex="auto">
                        <Form.Item
                            className="margin-bottom"
                            label="What should the prefix be?"
                            name="prefix"
                            rules={[{ pattern: globalConstants.BEACON_SMS_PREFIX_REGEX, message: 'Maximum 18 characters without any special characters' }]}
                        >
                            <Input
                                onChange={v => setPrefix(v.target.value)}
                                placeholder={props?.selectedBeacon?.display_name}
                                style={{ width: 300 }}
                            />
                        </Form.Item>
                    </Col>
                    <Col flex="0 1 120px">
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                    </Col>
                </Row>
                <Paragraph>
                    Please note there is a maximum of 18 characters, letters or numbers. No special characters are
                    supported.
                </Paragraph>
                <Row gutter={16}>
                    <Col span={12}>
                        <Card title="Example of normal SMS:" size="small" className="beaconPrefixCard">
                            <div className="beaconPrefixCard-body">
                                <div>Help Me!</div>
                                <div>Now:</div>
                                <div>Loc Time: {moment().format('DD/MM/YYYY HH:mm:ss')}</div>
                                <div>Alarm Time: {moment().format('DD/MM/YYYY HH:mm:ss')}</div>
                            </div>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="Example of normal SMS:" size="small" className="beaconPrefixCard">
                            <div className="beaconPrefixCard-body">
                                <div>{prefix || '(Your prefix goes here!)'}</div>
                                <div>Help Me!</div>
                                <div>Now:</div>
                                <div>Loc Time: {moment().format('DD/MM/YYYY HH:mm:ss')}</div>
                                <div>Alarm Time: {moment().format('DD/MM/YYYY HH:mm:ss')}</div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Form>

        </Card>
    )
}

export default BeaconPrefixCard

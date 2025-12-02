import {Button, message, Row, Typography, Space, Col} from 'antd'
import {globalConstants} from '@/_constants'
import {actions} from 'mirrorx'
import {GlobalOutlined} from '@ant-design/icons'
import { isWatch } from '@/utility/Common'

const SendDefaultSettingsField = (props) => {
    const {selectedBeacon} = props

    const offline = selectedBeacon?.beacon_status === 'OFFLINE' || !selectedBeacon?.beacon_status

    const handleFeatureClick = async(feature) => {        
        if (feature==='url') {
            actions.sofiBeacon.postURLSettings(selectedBeacon.pub_id)
                .then(()=>message.success('Setting updated by TCP!'))
                .catch(err=>message.error(err))
            return
        }
        let payload = {
            beacon_id: selectedBeacon.pub_id,
            feature: feature
        }
        if (feature==='sos'){
            payload.ring = 'PT15S'
        }
        actions.sofiBeacon.postTCPSettings(payload)
            .then(()=>message.success('Setting updated by TCP!'))
            .catch(err=>message.error(err))
    }

    const handleDefaultSettingButton = () => {
        actions.sofiBeacon.sendDefaultSettings(selectedBeacon.pub_id)
            .then(()=>message.success('Default Settings sent'))
            .catch(err=>message.error(err))
    }

    const offlineProm = offline && <Col>
        <Typography.Text type="danger">Feature unavailable as {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC} is offline. You must get the {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC} online before you can use this feature</Typography.Text><br/>
    </Col>

    return (
        <Space direction="vertical" >
            <Typography.Text strong>4. Push the &quot;Standard Operating Settings&quot; to your {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC}:</Typography.Text>
            <Row justify="center">
                <Button type="primary" onClick={handleDefaultSettingButton} disabled={offline}>
                    Send Standard Operating Settings (TCP)
                </Button>
            </Row>
            {offlineProm}

            <Typography.Text strong>5. Optional Settings:</Typography.Text>
            <Row>
                <Col span={8}>
                    Update URL for maps sent in SMS messages
                </Col>
                <Col>
                    <Button icon={<GlobalOutlined />} disabled={offline} onClick={()=>handleFeatureClick('url')}>
                        Set (TCP)
                    </Button>
                </Col>
                {offlineProm}
            </Row>

            <Row>
                <Col span={8}>
                    Set SOS button to perform SOS function
                </Col>
                <Col>
                    <Button icon={<GlobalOutlined />} disabled={offline} onClick={()=>handleFeatureClick('sos-button')}>
                        Set (TCP)
                    </Button>
                </Col>
                {offlineProm}
            </Row>

            <Row>
                <Col span={8}>
                    Set Call 1 button to call contact number 1
                </Col>
                <Col>
                    <Button icon={<GlobalOutlined />} disabled={offline} onClick={()=>handleFeatureClick('call1-button')}>
                        Set (TCP)
                    </Button>
                </Col>
                {offlineProm}
            </Row>

            <Row>
                <Col span={8}>
                    SOS calls will attempt to ring 15 seconds before trying the next emergency contact.
                </Col>
                <Col>
                    <Button icon={<GlobalOutlined />} disabled={offline} onClick={()=>handleFeatureClick('sos')}>
                        Set (TCP)
                    </Button>
                </Col>
                {offlineProm}
            </Row>
        </Space>
    )
}

export default SendDefaultSettingsField

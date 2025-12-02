import {globalConstants} from '@/_constants'
import { Card, Col, Row } from 'antd'
import { AlertOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import {Link} from 'mirrorx'


const FallSettings = (props) => {
    const oldBeacon = props.selectedBeacon && props.selectedBeacon.model === globalConstants._3G_BEACON_MODEL
    const switchedOn = props.selectedBeaconHeadState?.device_settings && JSON.parse(props.selectedBeaconHeadState?.device_settings)?.fall_detection_on

    const renderSwitchedOn = () => (
        <Row align="middle">
            <Col><CheckCircleOutlined className="good fallIcon" /></Col>
            {oldBeacon ? <Col>Fall detection is on, don&#39;t forget to keep your settings up to date!</Col> :
                <Col>On, and set to level {props.selectedBeaconHeadState?.device_settings && JSON.parse(props.selectedBeaconHeadState?.device_settings)?.fall_down_level}.
                </Col>}
        </Row>
    )

    const renderSwitchedOff = () =>(
        <Row type="flex" align="middle">
            <Col><CloseCircleOutlined className="fallIcon" /> </Col>
            <Col>Fall detection is switched off.</Col>
        </Row>
    )

    return (
        <Card
            size="small"
            style={{marginBottom: 0, height: '100%'}}
            className="beacon-card"
            title={<span><AlertOutlined className="fallIcon" />Fall Detection</span>}
            extra={<Link to={'/beacon/settings/detection'} style={{marginLeft: 12}}>Change</Link>}
        >
            {switchedOn ? renderSwitchedOn() : renderSwitchedOff()}
        </Card>
    )
}

export default FallSettings

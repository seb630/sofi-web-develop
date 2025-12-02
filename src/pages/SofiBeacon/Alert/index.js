import FallSettings from '@/pages/SofiBeacon/Alert/FallSettings'
import { Col, Row } from 'antd'
import { connect } from 'mirrorx'
import EmergencyContacts from '@/pages/SofiBeacon/Alert/EmergencyContacts'
import BeaconAlertFilter from '@/pages/SofiBeacon/Alert/Filter'
import { BrowserView, MobileView } from 'react-device-detect'
import AlarmTimeline from '@/pages/SofiBeacon/Alert/AlarmTimeline'

const mapStateToProps = state => ({
    ...state.sofiBeacon
})

const Alerts = (props) => {
    return <div className="contentPage">
        <BrowserView>
            <Row gutter={[12,12]} >
                <Col span={8}>
                    <BeaconAlertFilter {...props} />
                </Col>
                <Col span={8}>
                    <FallSettings {...props}/>
                </Col>
                <Col span={8}>
                    <EmergencyContacts {...props}/>
                </Col>
            </Row>
            <Row>
                <AlarmTimeline {...props}/>
            </Row>
        </BrowserView>

        <MobileView>
            <Row gutter={[12,16]}>
                <Col span={24}>
                    <BeaconAlertFilter {...props} />
                </Col>
                <Row>
                    <AlarmTimeline {...props}/>
                </Row>
                <Col span={24}>
                    <EmergencyContacts {...props}/>
                </Col>
                <Col span={24}>
                    <FallSettings {...props}/>
                </Col>
            </Row>
        </MobileView>
    </div>
}

export default connect(mapStateToProps, null) (Alerts)

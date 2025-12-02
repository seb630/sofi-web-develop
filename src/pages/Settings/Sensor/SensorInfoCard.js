import { PureComponent } from 'react'
import { Card, Col, Row } from 'antd'
import PropTypes from 'prop-types'
import DeviceStatus from '../../../components/DeviceStatus'
import SensorBattery from '../../../components/SensorBattery'
import moment from 'moment'

class SensorInfoCard extends PureComponent {

    calculateStatus = (selectedSensor, selectedHub) => {
        return selectedHub.connectivity_state==='OFFLINE' ? 'OFFLINE'
            : selectedSensor.status
    }

    render() {
        const {selectedSensor, selectedHub} = this.props
        const status = this.calculateStatus(selectedSensor, selectedHub)
        return (
            <Card className="advanced_block" title="Last known sensor status">
                <Row>
                    <Col xs={24} md={12}>
                        Sensor is currently:<DeviceStatus status={status} />

                    </Col>
                    <Col xs={24} md={12}>
                        <p className="desc">This means {status === 'ONLINE' ? 'it sent us a signal within the last hour.'
                            : status === 'WARNING' ? 'we have not heard from the sensor within the last hour.'
                                : 'we have not heard from the sensor within the last two hours.'}</p>
                    </Col>
                </Row>

                <Row>
                    <Col xs={24} md={12}>
                        Its last known battery was: <SensorBattery admin={false} battery={selectedSensor.battery_level} />
                    </Col>
                    <Col xs={24} md={12}>
                        <p className="desc">This means that the last time we heard from the sensor it was reporting this battery level.</p>
                    </Col>
                </Row>

                <Row>
                    <Col xs={24} md={12}>
                        It was last triggered: <span>
                            {selectedSensor.last_motion_at ? moment(selectedSensor.last_motion_at).fromNow() : 'Not Yet Reported'}
                        </span>
                    </Col>
                    <Col xs={24} md={12}>
                        <p className="desc">This means the sensor {selectedSensor.last_motion_at ?
                            'saw motion '+moment(selectedSensor.last_motion_at).fromNow() : 'never saw the motion'}.</p>
                    </Col>
                </Row>

                <Row>
                    <Col xs={24} md={12}>
                        Its last heartbeat was: <span>
                            {selectedSensor.last_active_at ? moment(selectedSensor.last_active_at).fromNow() : 'Not Yet Reported'}
                        </span>
                    </Col>
                    <Col xs={24} md={12}>
                        <p className="desc">This means the sensor {selectedSensor.last_active_at ?
                            'sent a signal '+moment(selectedSensor.last_active_at).fromNow()+ ' indicating it was online'
                            : 'never sent a signal'}.</p>
                    </Col>
                </Row>

            </Card>
        )
    }
}

SensorInfoCard.propTypes={
    selectedSensor: PropTypes.object,
    selectedHub: PropTypes.object,
}

export default SensorInfoCard

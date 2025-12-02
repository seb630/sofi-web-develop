import { PureComponent } from 'react'
import { actions } from 'mirrorx'
import { Button, Card, Col, message, Row } from 'antd'
import PropTypes from 'prop-types'
import { globalConstants } from '@/_constants'

class StuckSensorCard extends PureComponent {

    resend = () => {
        const {selectedHub, selectedSensor} = this.props
        const hubId = selectedHub.hub_id
        actions.hub.offSensor({hubId, payload:selectedSensor})
            .then(()=>message.success('Stuck Sensor Fixed'))
            .catch((e)=>message.error(e.message))
    }

    renderTitle = () => <Row type="flex" justify="space-between" >
        <Col span={18}>Stuck sensor</Col>
        <Col span={6}><div className="toggle_switch">
            <Button
                type="primary"
                onClick={this.resend}
            >Fix Stuck Sensor</Button>
        </div></Col>
    </Row>

    render() {
        return (
            <Card className="advanced_block" title={this.renderTitle()}>
                <p>
                    Is the {globalConstants.HUB_SOFIHUB} reporting that it is seeing motion in a room no one is in? Sometimes a sensor can get stuck in the &quot;
                    motion detected&quot; position after its battery is flat or it goes offline. Use this to troubleshoot stuck sensors.
                </p>
                <p>
                    This feature can help to stop false anomalies from triggering on sensors which are offline, flat battery, or have been
                    sent in for replacement or repair.
                </p>
            </Card>
        )
    }
}

StuckSensorCard.propTypes={
    selectedSensor: PropTypes.object,
    selectedHub: PropTypes.object,
}

export default StuckSensorCard

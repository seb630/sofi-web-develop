import { PureComponent } from 'react'
import { actions } from 'mirrorx'
import { Button, Card, Col, message, Row } from 'antd'
import PropTypes from 'prop-types'
import { globalConstants } from '@/_constants'

class ResendConfigCard extends PureComponent {

    resend = () => {
        const {selectedHub, selectedSensor} = this.props
        const hubId = selectedHub.hub_id
        actions.hub.updateSensor({hubId, payload:selectedSensor})
            .then(()=>message.success('Configure Resent'))
            .catch((e)=>message.error(e.message))
    }

    renderTitle = () => <Row type="flex" justify="space-between" >
        <Col span={18}>Resend configuration to sensor</Col>
        <Col span={6}><div className="toggle_switch">
            <Button
                type="primary"
                onClick={this.resend}
            >Resend Config</Button>
        </div></Col>
    </Row>

    render() {
        return (
            <Card className="advanced_block" title={this.renderTitle()}>
                <div>Sometimes if a sensor has a battery change, it might need a config update. This option tells the {globalConstants.HUB_SOFIHUB} to update the
                sensor config to make sure it&#39;s working in the correct way.</div>
            </Card>
        )
    }
}

ResendConfigCard.propTypes={
    selectedSensor: PropTypes.object,
    selectedHub: PropTypes.object,
}

export default ResendConfigCard

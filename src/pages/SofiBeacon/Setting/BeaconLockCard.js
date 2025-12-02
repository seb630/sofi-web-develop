import { PureComponent } from 'react'
import { actions } from 'mirrorx'
import { Card, Col, Row, Switch } from 'antd'
import { globalConstants } from '@/_constants'
import { isLife, isWatch } from '@/utility/Common'

class BeaconLockCard extends PureComponent {

    constructor(props) {
        super(props)
        this.state = {
            checked: props.selectedBeacon ? props.selectedBeacon.locked : false,
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.selectedBeacon !== this.props.selectedBeacon && this.setState({checked: this.props.selectedBeacon.locked})
    }

    handleSwitchClick = () => {
        let beacon = this.props.selectedBeacon
        beacon.locked = !this.state.checked
        this.setState({checked: !this.state.checked})
        actions.sofiBeacon.saveBeaconInfor(beacon)
    }

    renderTitle = () => {
        const deviceType = isLife(this.props.selectedBeacon) ?
            globalConstants.LIFE_SOFIHUB :
            isWatch(this.props.selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB
        return (
            <Row type="flex" justify="space-between" >
                <Col span={18}>Lock your {deviceType}</Col>
                <Col span={6}><div className="toggle_switch">
                    <Switch
                        checked={this.state.checked}
                        onChange={this.handleSwitchClick}
                    />
                </div></Col>
            </Row>
        )
    }

    render() {
        const deviceType = isLife(this.props.selectedBeacon) ?
            globalConstants.LIFE_SOFIHUB :
            isWatch(this.props.selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB
        return (
            <Card className="advanced_block" title={this.renderTitle()}>
                <div><p>If you lock your {deviceType} it means that no one can claim it using the IMEI number located on the box.</p>
                    <p>Locking your {deviceType} does not stop you from inviting new carers, you can invite new carers at any time in the
                        &quot;Carers&quot; tab.</p><p>The SOFIHUB team recommends that you keep your {deviceType} locked.
                    </p></div>
            </Card>
        )
    }
}

export default BeaconLockCard

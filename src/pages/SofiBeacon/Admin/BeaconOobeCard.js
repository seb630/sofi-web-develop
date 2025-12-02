import { PureComponent } from 'react'
import {actions} from 'mirrorx'
import {Card, Row, Col, Switch} from 'antd'

class BeaconOobeCard extends PureComponent {

    constructor(props) {
        super(props)
        this.state = {
            checked: props.selectedBeacon ? props.selectedBeacon.oobe_state ==='NONE' : false,
        }
    }

    handleSwitchClick = () => {
        let payload = {
            beacon_id : this.props.selectedBeacon.pub_id,
            action: this.state.checked ? 'claim' : 'reset'
        }
        actions.sofiBeacon.updateBeaconOOBE(payload).then(()=> this.setState({checked: !this.state.checked}))
    }

    renderTitle = () => <Row type="flex" justify="space-between" >
        <Col span={18}>OOBE</Col>
        <Col span={6}><div className="toggle_switch">
            <Switch
                checked={this.state.checked}
                onChange={this.handleSwitchClick}
            />
        </div></Col>
    </Row>

    render() {
        return (
            <Card className="advanced_block" title={this.renderTitle()}>
                <p>Out of box experience. Determines whether or not the welcome wizard is shown</p>
            </Card>
        )
    }
}

export default BeaconOobeCard

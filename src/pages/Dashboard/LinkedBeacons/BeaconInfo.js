import { PureComponent } from 'react'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { Row, Col, Tooltip } from 'antd'
import { timeFromNow  } from '@/utility/Common'
import { globalConstants } from '@/_constants'
import DeviceStatus from '../../../components/DeviceStatus'
import {actions} from 'mirrorx'

function BeaconFieldInfo(props){
    return (
        props.value != null && (props.value !== '' || props.value === false) || props.value===0 ? props.children : 'No Data Yet'
    )
}

export default class BeaconInfo extends PureComponent {
    constructor(props) {
        super(props)
    }

    navigateDashboard = () => {
        actions.sofiBeacon.selectBeacon(this.props.selectedBeacon).then(()=>actions.routing.push('/beacon/dashboard'))
    }
    render() {
        let selectedBeaconHeadState = this.props.selectedBeaconHeadState || {}

        return (
            <div className="beaconPage-info">
                <Row>
                    <Col span={24}>
                        <Row type="flex" justify="space-between">
                            <Col>
                                <strong> { selectedBeaconHeadState.display_name } </strong>
                                <DeviceStatus status={selectedBeaconHeadState.beacon_status} />
                            </Col>
                            <Col>
                                {this.props.showMap ?
                                    <UpOutlined onClick={()=>this.props.expand()} /> :
                                    <DownOutlined onClick={()=>this.props.expand()} /> }
                            </Col>
                        </Row>
                        <Row gutter={18} type="flex" justify="space-between">
                            <Col>
                                Last seen:&nbsp;
                                <BeaconFieldInfo value={ selectedBeaconHeadState.last_message_server_received_at }>
                                    <Tooltip title={ timeFromNow(selectedBeaconHeadState.last_message_server_received_at,globalConstants.DATETIME_FORMAT) }>
                                        { timeFromNow(selectedBeaconHeadState.last_message_server_received_at,globalConstants.DATETIME_FORMAT) }
                                    </Tooltip>
                                </BeaconFieldInfo>
                            </Col>
                            <Col>
                                Battery Level:&nbsp;
                                <BeaconFieldInfo value={ selectedBeaconHeadState.battery_level }>
                                    <Tooltip title={`${selectedBeaconHeadState.battery_level}%`}>
                                        { selectedBeaconHeadState.battery_level }%
                                    </Tooltip>
                                </BeaconFieldInfo>
                            </Col>
                            <Col><a className="link" onClick={this.navigateDashboard}>Go to dashboard</a>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
        )
    }
}

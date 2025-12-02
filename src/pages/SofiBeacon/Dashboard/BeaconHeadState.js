import { PureComponent, Fragment } from 'react'
import { PhoneOutlined } from '@ant-design/icons'
import { Row, Col, Tooltip, Button, Switch } from 'antd'
import { generateBeacon4gIcon, timeFromNow } from '@/utility/Common'
import { globalConstants } from '@/_constants'
import DeviceStatus from '../../../components/DeviceStatus'
import { MobileView } from 'react-device-detect'

function BeaconFieldInfo(props){
    return (
        props.value != null && (props.value !== '' || props.value === false) || props.value===0 ? props.children : 'No Data Yet'
    )
}

export default class BeaconHeadState extends PureComponent {

    render() {
        const selectedBeaconHeadState = this.props.selectedBeaconHeadState || {}
        const selectedBeacon = this.props.selectedBeacon || {}
        const {showRadius} = this.props
        return (
            <div className="beaconPage-headstate">
                <Row gutter={18}>
                    <Col className="beaconPage-headstate-column" xs={24} sm={12} md={12} lg={8}>
                        <MobileView style={{paddingBottom:'8px'}}>
                            <Row type="flex" justify="center" >
                                <Col span={24}>
                                    <a href={`tel:${selectedBeacon.phone}`}> <Button style={{width:'100%'}}><PhoneOutlined />Call Beacon</Button></a>
                                </Col>
                            </Row>
                        </MobileView>
                        <Row>
                            <Col span={24}><strong> { selectedBeacon.display_name } </strong>
                                <DeviceStatus status={selectedBeaconHeadState.beacon_status} />
                                <span style={{ display: 'inline-block' , marginLeft: '10px'}} className="js-beacon-field-display"> (<BeaconFieldInfo value={selectedBeacon.phone}>
                                    <Tooltip title={ selectedBeacon.phone }> { selectedBeacon.phone } </Tooltip>
                                </BeaconFieldInfo>)
                                </span></Col>
                        </Row>
                        <Row>
                            <Col span={12} className="beaconPage-infor-label"> Last seen by cloud </Col>
                            <Col span={12} className="beaconPage-infor-display">
                                <BeaconFieldInfo value={ selectedBeaconHeadState.last_message_server_received_at }>
                                    <Tooltip title={ timeFromNow(selectedBeaconHeadState.last_message_server_received_at,globalConstants.DATETIME_TZ_FORMAT, selectedBeacon.timezone) }>
                                        { timeFromNow(selectedBeaconHeadState.last_message_server_received_at,globalConstants.DATETIME_TZ_FORMAT, selectedBeacon.timezone) }
                                    </Tooltip>
                                </BeaconFieldInfo>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12} className="beaconPage-infor-label"> Location updated:  </Col>
                            <Col span={12} className="beaconPage-infor-display">
                                <BeaconFieldInfo value={ selectedBeaconHeadState.gps_updated_at }>
                                    <Tooltip title={ timeFromNow(selectedBeaconHeadState.gps_updated_at,globalConstants.DATETIME_TZ_FORMAT, selectedBeacon.timezone)  }>
                                        { timeFromNow(selectedBeaconHeadState.gps_updated_at,globalConstants.DATETIME_TZ_FORMAT, selectedBeacon.timezone) }
                                    </Tooltip>
                                </BeaconFieldInfo>
                            </Col>
                        </Row>
                        {selectedBeaconHeadState.hdop && <Fragment>
                            <Row>
                                <Col className="beaconPage-infor-label">
                                    Location accurate to within {selectedBeaconHeadState.hdop * globalConstants.HDOP_TO_METER_RATIO} metres
                                </Col>
                            </Row>
                            <Row>
                                <Col span={16} className="beaconPage-infor-label">
                                    Show accuracy radius on map
                                </Col>
                                <Col span={8} className="beaconPage-infor-display">
                                    <Switch
                                        checked={showRadius}
                                        onChange={checked => this.props.handleShowRadius(checked)}
                                        checkedChildren="On"
                                        unCheckedChildren="Off"
                                    />
                                </Col>
                            </Row>
                        </Fragment>}
                    </Col>
                    <Col className="beaconPage-headstate-column" xs={24} sm={12} md={12} lg={16}>
                        <strong> Beacon Status :</strong>
                        <Row gutter={18} style={{marginBottom: 4}}>
                            <Col md={24} lg={12}>
                                <Row>
                                    <Col span={12} className="beaconPage-infor-label">Battery</Col>
                                    <Col span={12} className="beaconPage-infor-display">
                                        <BeaconFieldInfo value={ selectedBeaconHeadState.battery_level }>
                                            <Tooltip title={`${selectedBeaconHeadState.battery_level}%`}>
                                                { selectedBeaconHeadState.battery_level }%
                                            </Tooltip>
                                        </BeaconFieldInfo>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={12} className="beaconPage-infor-label"> Updated  </Col>
                                    <Col span={12} className="beaconPage-infor-display">
                                        <BeaconFieldInfo value={ selectedBeaconHeadState.battery_updated_at }>
                                            <Tooltip title={ timeFromNow(selectedBeaconHeadState.battery_updated_at,globalConstants.DATETIME_TZ_FORMAT, selectedBeacon.timezone) }>
                                                { timeFromNow(selectedBeaconHeadState.battery_updated_at,globalConstants.DATETIME_TZ_FORMAT, selectedBeacon.timezone) }
                                            </Tooltip>
                                        </BeaconFieldInfo>
                                    </Col>
                                </Row>
                            </Col>
                            <Col md={24} lg={12}>
                                <Row>
                                    <Col span={12} className="beaconPage-infor-label"> Current charging ? </Col>
                                    <Col span={12} className="beaconPage-infor-display">
                                        <BeaconFieldInfo value={ selectedBeaconHeadState.charging }>
                                            { selectedBeaconHeadState.charging ? 'Yes' : 'No' }
                                        </BeaconFieldInfo>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={12} className="beaconPage-infor-label"> Updated </Col>
                                    <Col span={12} className="beaconPage-infor-display">
                                        <BeaconFieldInfo value={ selectedBeaconHeadState.charging_last_updated }>
                                            <Tooltip title={ timeFromNow(selectedBeaconHeadState.charging_last_updated,globalConstants.DATETIME_TZ_FORMAT, selectedBeacon.timezone) }>
                                                { timeFromNow(selectedBeaconHeadState.charging_last_updated,globalConstants.DATETIME_TZ_FORMAT, selectedBeacon.timezone) }
                                            </Tooltip>
                                        </BeaconFieldInfo>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row gutter={18}>
                            <Col md={24} lg={12}>
                                <Row>
                                    <Col span={12} className="beaconPage-infor-label">Mobile Signal Strength</Col>
                                    <Col span={12} className="beaconPage-infor-display">
                                        <BeaconFieldInfo value={ selectedBeaconHeadState.signal_strength }>
                                            <Tooltip title={selectedBeaconHeadState.signal_strength}>
                                                {generateBeacon4gIcon(selectedBeaconHeadState.signal_strength) }
                                            </Tooltip>
                                        </BeaconFieldInfo>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={12} className="beaconPage-infor-label"> Updated </Col>
                                    <Col span={12} className="beaconPage-infor-display">
                                        <BeaconFieldInfo value={ selectedBeaconHeadState.signal_last_updated }>
                                            <Tooltip title={ timeFromNow(selectedBeaconHeadState.signal_last_updated,globalConstants.DATETIME_TZ_FORMAT, selectedBeacon.timezone) }>
                                                { timeFromNow(selectedBeaconHeadState.signal_last_updated,globalConstants.DATETIME_TZ_FORMAT, selectedBeacon.timezone) }
                                            </Tooltip>
                                        </BeaconFieldInfo>
                                    </Col>
                                </Row>
                            </Col>
                            <Col md={24} lg={12}>
                                <Row>
                                    <Col span={12}>
                                        <Button
                                            onClick={()=>this.props.handleFindAddress(selectedBeaconHeadState)}
                                            type="primary"
                                            style={{marginTop:'4px'}}>Find Address</Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
        )
    }
}

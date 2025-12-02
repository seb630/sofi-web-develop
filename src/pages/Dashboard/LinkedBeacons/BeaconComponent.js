import { Component } from 'react'
import BeaconMap from '../../SofiBeacon/Dashboard/BeaconMap'
import BeaconInfo from './BeaconInfo'
import { DownOutlined } from '@ant-design/icons'
import { Col, Row } from 'antd'
import DeviceStatus from '../../../components/DeviceStatus'


export default class BeaconComponent extends Component{
    constructor(props) {
        super(props)
        this.state = {
            showMap: true
        }
    }


    render(){
        const { headState } = this.props

        let lastLocation = {
            lat: headState && headState.decimal_degrees_latitude,
            lng: headState && headState.decimal_degrees_longitude
        }

        return this.state.showMap ?
            <Row className="beaconPage beaconMapContainer" style={{minHeight: '30vh', marginBottom: 24}}>

                <BeaconMap
                    spot={lastLocation}
                    fullScreen={false}
                    selectedBeacon={this.props.selectedHubBeacons.find(beacon=>beacon.id===headState.beacon_id)}
                />
                <BeaconInfo
                    showMap={this.state.showMap}
                    expand={()=>this.setState({showMap: !this.state.showMap})}
                    selectedBeaconHeadState={headState}
                    selectedBeacon={this.props.selectedHubBeacons.find(beacon=>beacon.id===headState.beacon_id)}
                />
            </Row>
            :
            <Row
                type="flex"
                justify="space-between"
                className="beaconInfoOff ant-collapse"
                onClick={()=>this.setState({showMap: !this.state.showMap})}>
                <Col className="ant-collapse-header">
                    <strong> { headState.display_name } </strong>
                    <DeviceStatus status={headState.beacon_status} />
                </Col>
                <Col>
                    <DownOutlined />
                </Col>
            </Row>
    }
}


import { Fragment, PureComponent } from 'react'
import { Button, Card, Col, Row } from 'antd'
import PropTypes from 'prop-types'
import AutoComplete from '../../../components/AutoComplete'
import {actions} from 'mirrorx'
import { globalConstants } from '@/_constants'
import { isLife, isWatch } from '@/utility/Common'

export default class BeaconGeofence extends PureComponent {

    navigateDashboard = () => {
        actions.sofiBeacon.selectBeacon(this.props.selectedBeacon).then(()=>actions.routing.push('/beacon/dashboard'))
    }

    render() {
        let geofences = this.props.geofences || []
        const { moveToGeofence, addGeofence, moveToLocation, maps, map, settings, selectedBeacon} = this.props
        const work_mode = settings?.work_mode ?? 0
        const deviceType = isLife(selectedBeacon) ?
            globalConstants.LIFE_SOFIHUB :
            isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB
        return (
            work_mode == 2 ? <Card title="Geofence" className="beaconPage-card beaconPage-geofence ">
                {geofences.length===0 ?
                    <span>It looks like you don&#39;t have any geofence yet.</span>
                    :<Fragment>
                        <Row gutter={16} type="flex" className="margin-bottom">
                            <Col>
                                Current geofence:
                            </Col>
                            {geofences.map(geofence=>{
                                return(
                                    <Col key={geofence.id}>
                                        <Button size="small" onClick={()=>moveToGeofence(geofence)}>{geofence.name}</Button>
                                    </Col>
                                )
                            })}
                        </Row>
                    </Fragment>}
                <Row>
                    {maps.places && <AutoComplete
                        maps = {maps}
                        onChange = {(result)=>moveToLocation(map,result, 17, null, true)}
                        location = {map.getCenter()}
                        radius = {100000}
                    />
                    }
                </Row>
                <Row>
                    <a onClick={()=>addGeofence()}>Add Geofence</a>
                </Row>
            </Card> : 
                selectedBeacon && <Card title={`Your ${deviceType} does not support Geo Fencing`} headStyle={{textAlign: 'center'}} className="beaconPage-card beaconPage-noGeofence ">
                    <p style={{textAlign: 'center', counterIncrement: 'line'}}>
                        Your {deviceType} only sends location data on button press or on fall event. Because of this Geo Fencing can not be switched on as it requires your location to be monitored at all times.
                    </p>
                    <Button type="primary" size="large" style={{display: 'block', margin: 'auto'}} onClick={this.navigateDashboard}>Go Back To Dashboard</Button>
                </Card>
        )
    }
}

BeaconGeofence.propTypes = {
    geofences: PropTypes.array,
    moveToGeofence: PropTypes.func,
    moveToLocation: PropTypes.func,
    addGeofence: PropTypes.func,
    maps:PropTypes.object,
    map: PropTypes.object,
}

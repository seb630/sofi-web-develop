import { Component } from 'react'
import { Spin } from 'antd'
import GroupBeaconMap from './BeaconMap'
import { globalConstants } from '@/_constants'

class GroupView extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { beacons , loading, selectedBeaconInMap, hoveredBeaconInMap } = this.props
        const points = beacons.filter(item=>item.decimal_degrees_latitude && item.decimal_degrees_longitude)?.map(item => ({
            ...item,
            lng: item.decimal_degrees_longitude,
            lat: item.decimal_degrees_latitude,
            type: 'Feature',
            properties: { cluster: false, beacon_id: item.beacon_id},
            geometry: {
                type: 'Point',
                coordinates: [
                    item.decimal_degrees_longitude,
                    item.decimal_degrees_latitude
                ]
            }
        }))
        return (
            <Spin spinning={ loading }>
                <div className="beaconPage" style={{minHeight: 'calc(100vh - 80px)'}}>
                    {points && <GroupBeaconMap
                        points={points}
                        selectedBeaconInMap = {points?.find(spot=>spot.id===selectedBeaconInMap?.id)}
                        hoveredBeaconInMap = {points?.find(spot=>spot.id===hoveredBeaconInMap?.id)}
                        defaultCenter={globalConstants.MELBOURNE}
                    />}
                </div>
            </Spin>)
    }
}

export default GroupView

import { Component } from 'react'
import { connect } from 'mirrorx'
import { Spin } from 'antd'
import _ from 'lodash'
import HistoricalMap from './HistoricalMap'
import HistoricalFilter from './HistoricalFilter'

const mapStateToProps = state => ({
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    selectedBeaconHeadState: state.sofiBeacon.selectedBeaconHeadState,
    historicalGps: state.sofiBeacon.historicalGps,
    loading: state.sofiBeacon.loading
})

class SofiBeaconHistory extends Component {
    constructor(props) {
        super(props)
        this.state={
            showRadius: false,
        }
    }

    handleShowRadius = (state) =>{
        this.setState({showRadius: state})
    }

    render() {
        const { loading , historicalGps , selectedBeacon , selectedBeaconHeadState } = this.props
        const { showRadius } = this.state
        const spots = historicalGps.map(item => {
            return item.decimal_degrees_latitude!==null && item.decimal_degrees_longitude!==null && {
                ...item,
                lat: item.decimal_degrees_latitude,
                lng: item.decimal_degrees_longitude,
                date: item.server_received_at,
                satLock: item.no_satellite_locked,
                satAvail: item.no_satellite_available,
                gpsFlag: item.gps_location_lock,
            }
        })

        const lastSpot = _.last(spots)

        const currentSpot = selectedBeaconHeadState ? {
            lat: +selectedBeaconHeadState.decimal_degrees_latitude,
            lng: +selectedBeaconHeadState.decimal_degrees_longitude,
            date: selectedBeaconHeadState.gps_updated_at
        } : { lat: 0 , lng: 0 }

        return (<Spin spinning={ loading }>
            <div className="beaconPage">
                <HistoricalFilter
                    selectedBeacon={selectedBeacon}
                    handleShowRadius={this.handleShowRadius}
                    showRadius={showRadius}
                    showRadiusLabel="Show accuracy on hover"
                    type="GPS"
                />
                <HistoricalMap showRadius={showRadius} spots={spots} defaultCenter={ lastSpot || currentSpot } device={selectedBeacon} />
            </div>
        </Spin>
        )
    }
}

export default connect(mapStateToProps,null)(SofiBeaconHistory)

import { Component } from 'react'
import { connect } from 'mirrorx'
import { Spin } from 'antd'
import _ from 'lodash'
import HistoricalMap from './SignalHistoricalMap'
import HistoricalFilter from '../HistoricalFilter'
import tinygradient from 'tinygradient'
import styled from '@/scss/colours.scss'

const mapStateToProps = state => ({
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    selectedBeaconHeadState: state.sofiBeacon.selectedBeaconHeadState,
    historicalGps: state.sofiBeacon.historicalGps,
    loading: state.sofiBeacon.loading
})

class SignalHistory extends Component {
    constructor(props) {
        super(props)
        this.state={
            showRadius: false,
        }
    }

    handleShowRadius = (state) =>{
        this.setState({showRadius: state})
    }

    signalToColorIndex = signal => signal>15 ? 15 : signal

    render() {
        const { loading , historicalGps , selectedBeacon , selectedBeaconHeadState } = this.props
        const {showRadius} = this.state
        const gradient = tinygradient([styled.red, styled.green])
        const colorsRgb = gradient.rgb(16)
        const colorStrings = colorsRgb.map((color) => color.toHexString())
        const spots = historicalGps?.filter(item=>item.decimal_degrees_latitude && item.decimal_degrees_latitude!==0 && item.decimal_degrees_longitude).map(item => {
            return {
                ...item,
                lat: item.decimal_degrees_latitude,
                lng: item.decimal_degrees_longitude,
                date: item.server_received_at,
                satLock: item.no_satellite_locked,
                satAvail: item.no_satellite_available,
                gpsFlag: item.gps_location_lock,
                signalColor: colorStrings[this.signalToColorIndex(item.signal_strength)]
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
                    showRadiusLabel = "Location Accuracy"
                    showRadius={showRadius}
                    type="GSM"
                />
                <HistoricalMap showRadius={showRadius} spots={spots} defaultCenter={ lastSpot || currentSpot } device={selectedBeacon}/>
            </div>
        </Spin>
        )
    }
}

export default connect(mapStateToProps,null)(SignalHistory)

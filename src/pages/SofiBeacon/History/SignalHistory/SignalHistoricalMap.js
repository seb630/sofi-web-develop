import { Component } from 'react'
import GoogleMapReact from 'google-map-react'
import { globalConstants } from '@/_constants'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Alert } from 'antd'
import { fitBounds } from 'google-map-react/utils'
import { buildBoundArea } from '../../Utils'
import { Dot } from '@/pages/SofiBeacon/History/HistoricalMap'
import { formatTimeOnly, isWatch } from '@/utility/Common'

class SignalHistoricalMap extends Component {

    constructor (props) {
        super(props)

        this.state = {
            mapsLoaded: false,
            map: null,
            maps: null,
            circles: []
        }
    }

    componentDidUpdate (prevProps) {
        if (prevProps.showRadius!==this.props.showRadius){
            this.props.showRadius && this.drawCircles()
            !this.props.showRadius && this.removeCircles()
        }
    }

    onMapLoaded (map, maps) {
        this.setState({
            ...this.state,
            mapsLoaded: true,
            map: map,
            maps: maps
        })

        this.props.showRadius && this.drawCircles(map, maps)
    }

    drawCircles = (map=this.state.map, maps=this.state.maps) => {
        let circles = []
        this.props.spots?.map(spot=>{
            const circle = this.drawHistoryHdop(maps,map,spot)
            circles.push(circle)
        })
        this.setState({circles})
    }

    removeCircles = () =>{
        this.state.circles.map(circle=>circle.setMap(null))
    }

    drawHistoryHdop = (maps, map, spot) => {
        return new maps.Circle({
            editable: false,
            strokeColor: spot.signalColor,
            strokeOpacity: 0.1,
            strokeWeight: 2,
            fillColor: spot.signalColor,
            fillOpacity: 0.1,
            map,
            radius: spot?.hdop * globalConstants.HDOP_TO_METER_RATIO || 0,
            center: {lat: spot.lat, lng: spot.lng},
            id: spot.date
        })
    }


    render() {
        const { spots, defaultCenter} = this.props
        const bounds = buildBoundArea(spots, defaultCenter)

        const size = {
            width: window.innerWidth - 300,// Map width in pixels
            height: window.innerHeight - 80, // Map height in pixels
        }

        const {center, zoom} = fitBounds(bounds, size)
        let spotArrays = []
        let starttime = moment(spots[0] && spots[0].server_received_at)
        let endtime = moment(spots[0] && spots[0].server_received_at)
        let timeList = []
        let continuous = true
        spots.map((spot, i) => {
            if (i <= spots.length - 1) {
                //return [spot, spots[i+1]]
                if (spot && spots[i + 1]) {
                    if (spot.lat !== spots[i + 1].lat || spot.lng !== spots[i + 1].lng) {
                        timeList.push({ start: formatTimeOnly(starttime), end: formatTimeOnly(endtime)})
                        starttime = moment(spot.server_received_at)
                        endtime = moment(spot.server_received_at)
                        continuous = true
                        spot.timeList = timeList
                        spotArrays.push([spot, spots[i + 1]])
                        timeList = []
                    } else {
                        continuous = moment(spot.server_received_at).diff(endtime, 'minutes') < 16
                        endtime = moment(spot.server_received_at)
                        if (!continuous) {
                            timeList.push({ start: formatTimeOnly(starttime), end: formatTimeOnly(endtime)})
                            starttime = moment(spot.server_received_at)
                            continuous = true
                        }
                    }

                }
            }
        })

        const dotSpots = spotArrays.reduce((a,b, i) => {
            if (i===spotArrays.length-1) return a.concat(b)
            else return a.concat(b[0])
        },[])
        if (dotSpots.length>0){
            dotSpots[dotSpots.length-1].timeList = [{ start: formatTimeOnly(starttime), end: formatTimeOnly(endtime)}]
        }

        return (
            <div id="beaconMap" className="beaconPage-map">
                <GoogleMapReact
                    key={dotSpots.length}
                    bootstrapURLKeys={{
                        key: globalConstants.GOOGLEMAP_KEY,
                        libraries: ['geometry','places']
                    }}
                    zoom={zoom}
                    center={center}
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={({map, maps}) => this.onMapLoaded(map, maps)}
                >
                    {
                        dotSpots.map((item, index) => {
                            return (<Dot id={index + 1} key={index} {...item} color={item.signalColor}/>)
                        })
                    }
                </GoogleMapReact>
                {
                    spots && spots.length === 0 &&
                    <div id="beaconPage-map-message" className="beaconPage-map-nolocation">
                        <Alert message={isWatch(this.props.device) ? globalConstants.EMPTY_HISTORICAL_FILTER.replace('beacon', 'Watch').replace('Beacon', 'Watch') 
                            : globalConstants.EMPTY_HISTORICAL_FILTER} type="info"/>
                    </div>
                }
            </div>
        )
    }
}

SignalHistoricalMap.propTypes = {
    spots: PropTypes.arrayOf(PropTypes.shape({ lat: PropTypes.number , lng: PropTypes.number, date: PropTypes.string })),
    defaultCenter: PropTypes.shape({ lat: PropTypes.number , lng: PropTypes.number }),
    showRadius: PropTypes.bool,
}

export default SignalHistoricalMap

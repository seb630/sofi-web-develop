import { Component } from 'react'
import GoogleMapReact from 'google-map-react'
import { globalConstants } from '@/_constants'
import { Alert } from 'antd'
import PropTypes from 'prop-types'
import { getZoomLevel, isWatch } from '@/utility/Common'

let circle

const Spot = ({ id }) =>   <div id={`spot-${id}`} >
    <img className='beaconPage-spot' src='https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png'  alt='spot'/>
</div>

class BeaconMap extends Component {

    constructor (props) {
        super(props)
        this.state = {
            mapsLoaded: false,
            map: null,
            maps: null,
            circles: [],
            markers: [],
        }
    }

    componentDidUpdate (prevProps) {
        prevProps.showRadius !== this.props.showRadius && circle.setMap(this.props.showRadius ? this.state.map : null)
        prevProps.spot !== this.props.spot && circle?.setCenter(this.props.spot)
    }

    drawGeofence = (maps, map, geofence) => {
        let {circles, markers} = this.state
        let circle = new maps.Circle({
            editable: false,
            strokeColor: '#81C6EE',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#81C6EE',
            fillOpacity: 0.7,
            map,
            ...geofence.shape.circle,
            id: geofence.id
        })
        let marker = new maps.Marker({
            label: {
                text:this.props.geofenceName,
                color: 'white',
                fontSize: '22px',
                fontWeight: 'bold'
            },
            map,
            position: geofence.shape.circle.center,
            icon: {
                url: globalConstants.BLUE_MARKER_URL,
                scaledSize: new maps.Size(44,44),
                labelOrigin: new maps.Point(16, 45),
            },
            id: geofence.id
        })

        map.addListener('zoom_changed', ()=>{
            map.getZoom() > 12 ? marker.setLabel({
                text:this.props.geofenceName,
                color: 'white',
                fontSize: '22px',
                fontWeight: 'bold'
            }) : marker.setLabel(null)
        })

        circles.push(circle)
        markers.push(marker)
        this.setState({circles, markers})
        return circle
    }

    onMapLoaded (map, maps) {
        this.setState({
            ...this.state,
            mapsLoaded: true,
            map: map,
            maps: maps
        })

        circle = new maps.Circle({
            editable: false,
            clickable: false,
            strokeColor: '#81C6EE',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#81C6EE',
            fillOpacity: 0.7,
            radius: this.props.spot?.radius,
            center: this.props.spot,
            map: this.props.showRadius && map,
        })

        const zoomLevel = getZoomLevel(circle) || 15

        map.addListener('zoom_changed', ()=>{
            if (map.getZoom() > zoomLevel-5 && this.props.spot?.radius>0 && this.props.showRadius){
                circle.setMap(map)
            }else {
                circle.setMap(null)
            }
        })

        this.props.geofences?.map(geofence=>{
            this.drawGeofence(maps,map,geofence)
        })

        return circle
    }


    render() {
        const { spot } = this.props
        const isEmptySpot = !spot.lat || !spot.lng

        const message = isWatch(this.props.selectedBeacon) ? globalConstants.EMPTY_BEACON_MAP.replace('Beacon', 'Watch') : globalConstants.EMPTY_BEACON_MAP

        return (
            <div id="beaconMap" className="beaconPage-map">
                <GoogleMapReact
                    bootstrapURLKeys={{
                        key: globalConstants.GOOGLEMAP_KEY,
                        libraries: ['geometry','places']
                    }}
                    zoom={15}
                    center={spot}
                    options={{fullscreenControl: this.props.fullScreen}}
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={({map, maps}) => this.onMapLoaded(map, maps)}
                >
                    {
                        !isEmptySpot && <Spot id={0} lat={spot.lat} lng={spot.lng} />
                    }
                </GoogleMapReact>
                {
                    isEmptySpot && (
                        <div id="beaconPage-map-message" className="beaconPage-map-nolocation">
                            <Alert  message={message} type="info" />
                        </div>
                    )
                }
            </div>
        )
    }
}

BeaconMap.defaultProps = {
    fullScreen: true
}

BeaconMap.propTypes = {
    spot: PropTypes.shape({ lat: PropTypes.number , lng: PropTypes.number }),
    fullScreen: PropTypes.bool
}

export default BeaconMap

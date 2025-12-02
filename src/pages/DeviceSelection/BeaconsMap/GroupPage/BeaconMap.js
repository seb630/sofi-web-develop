import { useEffect, useRef, useState } from 'react'
import GoogleMapReact from 'google-map-react'
import { globalConstants } from '@/_constants'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Col, Popover, Row } from 'antd'
import { actions } from 'mirrorx'
import { fitBounds } from 'google-map-react/utils'
import { buildBoundArea } from '@/pages/SofiBeacon/Utils'
import DeviceStatus from '../../../../components/DeviceStatus'
import useSupercluster from 'use-supercluster'
import { checkBeaconStatus } from '@/utility/Common'

const Marker = ({ children }) => children

const Spot = ({ id, gps_updated_at, display_name, beacon_status, beacon, hover}) =>  {
    const status = hover ? 'wht' : checkBeaconStatus(beacon)
    const content = (<div className="beaconPage-dot__popover">
        <Row type="flex" align="middle">
            <Col span={15}>
                <a onClick={()=>{
                    actions.sofiBeacon.selectBeacon(beacon).then(()=>actions.routing.push('/beacon/dashboard'))
                }}>{display_name}</a>
            </Col>
            <Col span={9} align="left">
                <div>
                    <DeviceStatus status={beacon_status}/>
                </div>

            </Col>
        </Row>
        <Row type="flex" align="middle">
            <Col span={10}>
                <strong>Update Time</strong>
            </Col>
            <Col span={14} align="left">
                <div> {moment(gps_updated_at).format(globalConstants.DATETIME_FORMAT)} </div>
            </Col>
        </Row>
    </div>)

    return (<div id={`spot-${id}`} >
        <Popover content={content} trigger="click">
            <img className='beaconPage-blueSpot' src={`https://maps.google.com/mapfiles/kml/paddle/${status}-blank.png`}/>
        </Popover>
    </div>)
}


const GroupBeaconMap = (props) => {
    const mapRef = useRef()
    const [bounds, setBounds] = useState(null)
    const [zoom, setZoom] = useState(10)

    const { points, defaultCenter, selectedBeaconInMap, hoveredBeaconInMap} = props
    const calculatedBounds = points && buildBoundArea(points, defaultCenter)
    const size = {
        width: window.innerWidth - 300,// Map width in pixels
        height: window.innerHeight - 80, // Map height in pixels
    }
    const sortByObject = {
        blu: 0,
        ylw: 1,
        red: 2,
        wht: 3,
    }

    const newBounds = fitBounds(calculatedBounds, size)
    const center = newBounds.center

    const { clusters, supercluster } = useSupercluster({
        points,
        bounds,
        zoom,
        options: {
            radius: 75,
            maxZoom: 20,
            map: (item) => {
                return ({
                    status: hoveredBeaconInMap?.id===item.beacon_id ? 'wht' : checkBeaconStatus(item),
                })
            },
            reduce: (acc, props) => {
                acc.status = sortByObject[acc.status] >= sortByObject[props.status] ? acc.status : props.status
                return acc
            },
        }
    })

    useEffect(() => {
        setZoom(newBounds.zoom)
    },[newBounds.zoom, selectedBeaconInMap])

    return (
        <div id="beaconMap" className="beaconPage-map">
            <GoogleMapReact
                bootstrapURLKeys={{
                    key: globalConstants.GOOGLEMAP_KEY,
                    libraries: ['geometry','places']
                }}
                defaultZoom={7}
                defaultCenter={center}
                zoom={selectedBeaconInMap ? 17 : zoom}
                center={selectedBeaconInMap ? selectedBeaconInMap : center}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={({ map }) => {
                    mapRef.current = map
                }}
                onChange={({ zoom, bounds }) => {
                    setZoom(zoom)
                    setBounds([
                        bounds.nw.lng,
                        bounds.se.lat,
                        bounds.se.lng,
                        bounds.nw.lat
                    ])
                }}
            >
                {clusters.map(cluster => {
                    const [longitude, latitude] = cluster.geometry.coordinates
                    const {
                        cluster: isCluster,
                        point_count: pointCount
                    } = cluster.properties
                    if (isCluster) {
                        return (
                            <Marker
                                key={`cluster-${cluster.id}`}
                                lat={latitude}
                                lng={longitude}
                            >
                                <div
                                    className={`cluster-marker marker-${cluster.properties?.status}`}
                                    style={{
                                        width: `${30 + (pointCount / points.length) * 40}px`,
                                        height: `${30 + (pointCount / points.length) * 40}px`
                                    }}
                                    onClick={() => {
                                        const expansionZoom = Math.min(
                                            supercluster.getClusterExpansionZoom(cluster.id),
                                            20
                                        )
                                        mapRef.current.setZoom(expansionZoom)
                                        mapRef.current.panTo({ lat: latitude, lng: longitude })
                                    }}
                                >
                                    {pointCount}
                                </div>
                            </Marker>
                        )
                    }

                    return (<Spot key={cluster.id} {...cluster} beacon={cluster} hover={hoveredBeaconInMap?.id===cluster.id}/>)
                })}
            </GoogleMapReact>
        </div>
    )
}

GroupBeaconMap.propTypes = {
    points: PropTypes.arrayOf(PropTypes.shape({ lat: PropTypes.number , lng: PropTypes.number, date: PropTypes.string })),
    defaultCenter: PropTypes.shape({ lat: PropTypes.number , lng: PropTypes.number }),
    hoveredBeaconInMap: PropTypes.object,
    selectedBeaconInMap: PropTypes.object
}

export default GroupBeaconMap

import { Component, Fragment } from 'react'
import GoogleMapReact from 'google-map-react'
import { globalConstants } from '@/_constants'
import PropTypes from 'prop-types'
import _ from 'lodash'
import moment from 'moment'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Alert, Col, Collapse, Popover, Row, Tooltip } from 'antd'
import { fitBounds } from 'google-map-react/utils'
import Polyline from '../../../components/Polyline/Polyline'
import tinygradient from 'tinygradient'
import LocationAccuracy from '../../../components/LocationAccuracy'
import styled from '../../../scss/colours.scss'
import { buildBoundArea } from '../Utils'
import { levelToDescription, strengthToLevel, formatTimeOnly, isWatch } from '@/utility/Common'

const Spot = ({ id, date , lat , lng, satLock, satAvail, battery_level, signal_strength, hdop }) =>  {
    const status = satLock>=4 ? 'Good' : satLock===3 ? 'Average' : 'Inaccurate'
    const content = (<div className="beaconPage-dot__popover">
        <Row align="middle">
            <Col span={15}>
                <strong>Location accuracy</strong>
            </Col>
            <Col span={9} align="left">
                <div>
                    <LocationAccuracy status={status}/>
                    <Tooltip title={globalConstants.LOCATION_ACCURACY_TOOLTIP}>
                        <InfoCircleOutlined className="infoIcon" />
                    </Tooltip>
                </div>

            </Col>
        </Row>

        {hdop && <Row align="middle">
            <Col>
                <span>Accuracy radius of {hdop * globalConstants.HDOP_TO_METER_RATIO} metres</span>
            </Col>
        </Row>}

        <Row align="middle">
            <Col span={6}>
                <strong>Time</strong>
            </Col>
            <Col span={18} align="left">
                {formatTimeOnly(date)}
            </Col>
        </Row>
        <Collapse
            style={{fontSize: '12px'}}
            bordered={false}
        >
            <Collapse.Panel
                key='more'
                header="See more"
                showArrow={false}
            >
                <Row align="middle">
                    <Col span={8}>
                        <strong>Lat/Long </strong>
                    </Col>
                    <Col span={16} align="left">
                        {`${lat},${lng}`}
                    </Col>
                </Row>

                <Row align="middle">
                    <Col span={18}>
                        <strong>Battery Level</strong>
                    </Col>
                    <Col span={6} align="left">
                        {battery_level}
                    </Col>
                </Row>

                <Row align="middle">
                    <Col span={18}>
                        <strong>Cellular Signal</strong>
                    </Col>
                    <Col span={6} align="left">
                        {levelToDescription(strengthToLevel(Number.parseInt(signal_strength)))}
                    </Col>
                </Row>

                <Row align="middle">
                    <Col span={18}>
                        <strong>Satellites Locked</strong>
                    </Col>
                    <Col span={6} align="left">
                        {satLock}
                    </Col>
                </Row>
                <Row align="middle">
                    <Col span={18}>
                        <strong>Satellites Available</strong>
                    </Col>
                    <Col span={6} align="left">
                        {satAvail}
                    </Col>
                </Row>
            </Collapse.Panel>
        </Collapse>
    </div>)

    return (<div id={`spot-${id}`} >
        <Popover content={content} trigger="click">
            <img alt="spot" className='beaconPage-spot' src={globalConstants.DEFAULT_MARKER_URL}/>
        </Popover>
    </div>)
}

export const Dot = ({id, date , lat , lng, satLock, satAvail, color, battery_level, signal_strength, timeList, hdop }) => {
    const status = satLock>=4 ? 'Good' : satLock===3 ? 'Average' : 'Inaccurate'
    const content = (<div className="beaconPage-dot__popover">
        <Row align="middle">
            <Col span={14}>
                <strong>Location accuracy</strong>
            </Col>
            <Col span={10} align="left">
                <div style={{display: 'flex'}}>
                    <LocationAccuracy status={status}/>
                    <Tooltip title={globalConstants.LOCATION_ACCURACY_TOOLTIP}>
                        <InfoCircleOutlined className="infoIcon" />
                    </Tooltip>
                </div>
            </Col>
        </Row>
        {hdop && <Row align="middle">
            <Col>
                <span>Accuracy radius of {hdop * globalConstants.HDOP_TO_METER_RATIO} metres</span>
            </Col>
        </Row>}
        <Row align="middle">
            <Col span={6}>
                <strong>Time</strong>
            </Col>
            <Col span={18} align="left">
                {timeList?.map((timerange, i)=> <Fragment key={i}>
                    {timerange.start === timerange.end ? <span> {timerange.start || formatTimeOnly(date)}</span>
                        :<span>
                            {/* From {timerange.start} to {timerange.end} */}
                            {timerange.end || formatTimeOnly(date)}
                        </span>
                    }
                    <br/>
                </Fragment>)}
            </Col>
        </Row>

        <Collapse
            style={{fontSize: '12px'}}
            bordered={false}
        >
            <Collapse.Panel
                key="more"
                header="See more"
                showArrow={false}
            >
                <Row align="middle">
                    <Col span={8}>
                        <strong>Lat/Long </strong>
                    </Col>
                    <Col span={16} align="left">
                        {`${lat},${lng}`}
                    </Col>
                </Row>

                <Row align="middle">
                    <Col span={18}>
                        <strong>Battery Level</strong>
                    </Col>
                    <Col span={6} align="left">
                        {battery_level}
                    </Col>
                </Row>

                <Row align="middle">
                    <Col span={18}>
                        <strong>Cellular Signal</strong>
                    </Col>
                    <Col span={6} align="left">
                        {levelToDescription(strengthToLevel(Number.parseInt(signal_strength)))}
                    </Col>
                </Row>

                <Row align="middle">
                    <Col span={18}>
                        <strong>Satellites Locked</strong>
                    </Col>
                    <Col span={6} align="left">
                        {satLock}
                    </Col>
                </Row>
                <Row align="middle">
                    <Col span={18}>
                        <strong>Satellites Available</strong>
                    </Col>
                    <Col span={6} align="left">
                        {satAvail}
                    </Col>
                </Row>
            </Collapse.Panel>

        </Collapse>

    </div>)

    return (<div id={`spot-${id}`}>
        <Popover content={content} trigger="hover" style={{background: color}}>
            <span style={{background: color}} className='beaconPage-dot' />
        </Popover>
    </div>)
}

let circle

class HistoricalMap extends Component {

    constructor (props) {
        super(props)

        this.state = {
            mapsLoaded: false,
            map: null,
            maps: null,
        }
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
            strokeColor: '#81C6EE',
            strokeOpacity: 0.6,
            strokeWeight: 2,
            fillColor: '#81C6EE',
            fillOpacity: 0.6,
            id: 'hdop'
        })
    }

    afterMapLoadChanges = (spotArrays, colorStrings) => {
        return spotArrays.map((spotpair,i) =>
            <Polyline
                key={i}
                map={this.state.map}
                maps={this.state.maps}
                markers={spotpair}
                color = {colorStrings[i]}
            />)
    }

    drawHdopCircle = (spot) =>{
        if (this.props.showRadius){
            circle.setRadius( spot?.hdop * globalConstants.HDOP_TO_METER_RATIO || 0)
            circle.setCenter({lat: spot?.lat, lng: spot?.lng})
            circle.setMap(this.state.map)
        }
    }

    removeHdopCircle = () =>{
        circle.setMap(null)
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
        let starttime = moment(spots[0] && spots[0].pendant_sent_at)
        let endtime = moment(spots[0] && spots[0].pendant_sent_at)
        let timeList = []
        let continuous = true
        spots.map((spot, i) => {
            if (i <= spots.length - 1) {
                //return [spot, spots[i+1]]
                if (spot && spots[i + 1] ) {
                    if (spot.lat !== spots[i + 1].lat || spot.lng !== spots[i + 1].lng) {
                        endtime = moment(spot.pendant_sent_at)
                        timeList.push({ start: formatTimeOnly(starttime), end: formatTimeOnly(endtime)})
                        starttime = moment(spot.pendant_sent_at)
                        continuous = true
                        spot.timeList = timeList
                        spotArrays.push([spot, spots[i + 1]])
                        timeList = []
                    } else {
                        continuous = moment(spot.pendant_sent_at).diff(endtime, 'minutes')<16
                        endtime = moment(spot.pendant_sent_at)
                        if (!continuous) {
                            timeList.push({ start: formatTimeOnly(starttime), end: formatTimeOnly(endtime)})
                            starttime = moment(spot.pendant_sent_at)
                            continuous = true
                        }
                    }
                }
            }
        })

        let filteredSpots = spotArrays.reduce((a,b, i) => {
            if (i===spotArrays.length-1) return a.concat(b)
            else return a.concat(b[0])
        },[])
        if (filteredSpots.length>0){
            filteredSpots[filteredSpots.length-1].timeList = [{ start: formatTimeOnly(starttime), end: formatTimeOnly(endtime)}]
        }
        const lastSpot = _.last(spots)
        const dotSpots = _.slice(filteredSpots, 0, spots.length - 1)
        const gradient = tinygradient([styled.gradientStart, styled.gradientEnd])
        const colorsRgb = gradient.rgb(spotArrays.length>2 ? spotArrays.length : 10)
        const colorStrings = colorsRgb.map((color) => color.toHexString())
        return (
            <div id="beaconMap" className="beaconPage-map">
                <GoogleMapReact
                    key={filteredSpots.length}
                    bootstrapURLKeys={{
                        key: globalConstants.GOOGLEMAP_KEY,
                        libraries: ['geometry','places']
                    }}
                    onChildMouseEnter={(key)=>this.drawHdopCircle(dotSpots[key])}
                    onChildMouseLeave={this.removeHdopCircle}
                    zoom={zoom}
                    center={center}
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={({map, maps}) => this.onMapLoaded(map, maps)}
                >
                    {
                        dotSpots.map((item, index) => {
                            return (<Dot id={index + 1} key={index} {...item} color={colorStrings[index]}/>)
                        })
                    }
                    {
                        lastSpot && <Spot id={0} {...lastSpot} />
                    }
                    {this.state.mapsLoaded ? this.afterMapLoadChanges(spotArrays,colorStrings) : ''
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

HistoricalMap.propTypes = {
    spots: PropTypes.arrayOf(PropTypes.shape({ lat: PropTypes.number , lng: PropTypes.number, date: PropTypes.string })),
    defaultCenter: PropTypes.shape({ lat: PropTypes.number , lng: PropTypes.number }),
    showRadius: PropTypes.bool,
}

export default HistoricalMap

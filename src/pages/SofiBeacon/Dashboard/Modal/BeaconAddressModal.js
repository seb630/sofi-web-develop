import { useState } from 'react'
import { Button, Col, List, Row, Switch, Typography } from 'antd'
import PropTypes from 'prop-types'
import { DraggableModal } from 'ant-design-draggable-modal'
import 'ant-design-draggable-modal/dist/index.css'
import { isMobile } from 'react-device-detect'
import GoogleMapReact from 'google-map-react'
import { globalConstants } from '@/_constants'
import { getZoomLevelByRadius } from '@/utility/Common'
import beaconService from '@/services/Beacon'

const BeaconAddressModal = (props) => {
    const { headState, open, width, onCancel, spot } = props
    const [address, setAddress] = useState()
    const [newMarker, setNewMarker] = useState()
    const [map, setMap] = useState()
    const [circle, setCircle] = useState()
    const [loading, setLoading] = useState(false)
    const [showRadius, setShowRadius] = useState(false)

    const cancel = () =>{
        newMarker.setMap(null)
        setAddress(null)
        onCancel()
    }
    let zoomLevel = getZoomLevelByRadius(spot?.radius) -1

    const handleGoogleMapApi = ({maps, map}) => {
        setMap(map)

        setCircle(new maps.Circle({
            editable: false,
            clickable: false,
            strokeColor: '#81C6EE',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#81C6EE',
            fillOpacity: 0.7,
            radius: spot?.radius,
            center: spot,
        }))

        new maps.Marker({
            map,
            position: spot
        })

        const _newMarker = new maps.Marker({
            icon:{
                url: globalConstants.BLUE_MARKER_URL,
                scaledSize: new maps.Size(44,44)
            },
        })

        map.addListener('click', (event)=>{
            showMarker(event.latLng, map, _newMarker)
            handleFindAddress(event.latLng)
        })
        setNewMarker(_newMarker)
    }

    const handleFindAddress = (latLng) => {
        setLoading(true)
        beaconService.getAddressFromCoord(latLng?.lat(),latLng?.lng()).then(result=> {
            let address = result.data.results?.slice(0,5)?.map(result=>result.formatted_address)
            setAddress(address)
            setLoading(false)
        })
    }

    const showMarker = (location, map, _newMarker) =>{
        _newMarker.setPosition(location)
        _newMarker.setMap(map)
    }

    const removeBlue = () =>{
        newMarker.setMap(null)
        setAddress(null)
    }

    map && circle?.setMap(showRadius?map:null)

    return (<DraggableModal
        destroyOnClose
        width={width}
        open={open}
        onCancel={cancel}
        onOk={cancel}
        title="Results"
        initialHeight={isMobile ? 400: 660}
    >
        <h4>Click on map to show address for different location</h4>

        <div className="beaconAddressModalMap margin-bottom">
            <GoogleMapReact
                bootstrapURLKeys={{
                    key: globalConstants.GOOGLEMAP_KEY,
                    libraries: ['geometry','places']
                }}
                zoom={zoomLevel|| 15}
                center={spot}
                options={{fullscreenControl: false}}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={({maps, map})=>handleGoogleMapApi({maps,map})}
            />
        </div>

        <Row justify="space-between" align="middle" className="margin-bottom">
            <Col>
                <div className="beaconAddressModalIconContainer">
                    <img alt="spot" height={40} src={newMarker?.getMap() ? globalConstants.BLUE_MARKER_URL: globalConstants.DEFAULT_MARKER_URL}/>
                </div>
                <b>Address for {newMarker?.getMap()? 'blue': 'red'} pin:</b>
            </Col>
            {newMarker?.getMap() && <Col>
                <Button type="primary" onClick={removeBlue}>Show address for red pin</Button>
            </Col>}
        </Row>
        <List
            loading={loading}
            bordered
            dataSource={address||headState.address}
            renderItem={item => (
                <List.Item>
                    <Typography.Text copyable>{item}</Typography.Text>
                </List.Item>
            )}
        />
        <Row>
            <Col span={12}>
                Show accuracy radius on map
            </Col>
            <Col span={12}>
                <Switch
                    checked={showRadius}
                    onChange={checked => setShowRadius(checked)}
                    checkedChildren="On"
                    unCheckedChildren="Off"
                />
            </Col>
        </Row>

    </DraggableModal>)
}

BeaconAddressModal.defaultProps = {
    width: isMobile ? 350: 600
}

BeaconAddressModal.propTypes = {
    width: PropTypes.number,
    open: PropTypes.bool,
    status: PropTypes.oneOf(['OFFLINE', 'WARNING']),
    onCancel: PropTypes.func
}

export default BeaconAddressModal

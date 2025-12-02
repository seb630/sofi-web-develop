import { Component, Fragment } from 'react'
import GoogleMapReact from 'google-map-react'
import { globalConstants } from '@/_constants'
import PropTypes from 'prop-types'
import { Form } from '@ant-design/compatible'
import { message, Modal } from 'antd'
import SettingModalPage from './SettingModal'
import { buildBoundArea } from '../Utils'
import { fitBounds } from 'google-map-react/utils'
import { actions } from 'mirrorx'
import BeaconGeofence from './BeaconGeofence'
import _ from 'lodash'
import AutoComplete from '../../../components/AutoComplete'
import RadiusModal from './RadiusModal'
import beaconService from '../../../services/Beacon'

let info = null

const defaultGeofence = {
    name: 'New Geofence',
    config: {
        shape:{
            circle:{
                center:{
                    lat:-37.849207,
                    lng:144.991848
                },
                radius:1000
            }
        },
        on_enter:null,
        on_exit:null
    }
}

class BeaconMap extends Component {
    constructor(props) {
        super(props)

        this.state = {
            mapApiLoaded: false,
            map: null,
            maps: null,
            address: null,
            position: null,
            radius: null,
            name: null,
            selectedGeofence: null,
            modal: false,
            edit: false,
            editRadius: false,
            editName: false,
            circles: [],
            markers: [],
            searchMarker: null,
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.geofences && prevProps.geofences!==this.props.geofences && this.reset()
    }


    getAddress = async (lat, lng) => {
        beaconService.getAddressFromCoord(lat,lng).then(result=> {
            let address = result.data.results && result.data.results[0].formatted_address
            this.setState({address: address, position: {lat,lng}})
            return address
        })
    }

    calculateRadius = (map, maps) => {
        const bounds = map.getBounds()
        const center = map.getCenter()
        if (bounds && center) {
            const ne = bounds.getNorthEast()
            // Calculate radius (in meters).
            const radius = maps.geometry.spherical.computeDistanceBetween(center, ne)
            return Math.max(Math.min(Math.round(radius*0.6), 1000),100)
        }
    }

    moveToGeofence = (geofence) => {
        const {map, maps} = this.state
        !this.state.modal && this.clickCircle(maps,map, geofence)
        this.moveToLocation(map, geofence.config.shape.circle.center)
    }

    moveToLocation = (map, result, zoom=15, selectedGeofence=null, pin=false) => {
        const center = {
            lat: result.lat,
            lng: result.lng
        }
        const {circles} = this.state
        if (selectedGeofence){
            let newGeofence = _.cloneDeep(selectedGeofence)

            newGeofence.config.shape.circle.center = center
            this.setState({selectedGeofence: newGeofence})
            let circle = circles.find(circle=> circle.id === newGeofence.id)
            circle.setCenter(center)
        }
        if (pin){
            const searchMarker = this.state.searchMarker
            searchMarker.setPosition(center)
            searchMarker.addListener('click', ()=>{this.addGeofence(center)})
        }
        this.setState({
            address: result.address,
            position: center,
            edit: false
        })
        map.panTo(center)
        map.setZoom(zoom)
    }

    addGeofence = (location=null) => {
        this.reset()
        const {maps, map} = this.state
        let geofence = _.cloneDeep(defaultGeofence)
        const lat = location ? location.lat: map.center.lat()
        const lng = location ? location.lng: map.center.lng()
        geofence.config.shape.circle.center = {lat, lng}
        geofence.config.shape.circle.radius = this.calculateRadius(map,maps)
        geofence.beacon_id = this.props.selectedBeacon.id
        geofence.pub_id = this.props.selectedBeacon.pub_id
        this.getAddress(lat,lng).then(()=>{
            const circle = this.drawGeofence(maps, map, geofence)
            this.clickCircle(maps, map, geofence, circle)
        })
    }

    reset = () => {
        const {maps, map, circles, markers} = this.state
        info && info.close()
        circles.map(circle=>circle.setMap(null))
        markers.map(marker=>marker.setMap(null))
        this.setState({circles: [], markers: []}, ()=>{
            this.props.geofences && maps && map && this.props.geofences.map(geofence=>{
                this.drawGeofence(maps, map, geofence)
            })
            this.setState({
                selectedGeofence:null,
                address: null,
                position: null,
                radius: null,
                name: null,
                edit: false
            })
        })
    }

    generateInfoWindow = (geofence, address=this.state.address) => {
        const pubId = this.props.selectedBeacon.pub_id
        window.cancel = ()=>{
            this.reset()
        }

        window.save = ()=>{
            let fence = {...this.state.selectedGeofence}
            if (geofence.id){
                if (this.state.radius<100) {
                    Modal.warning({
                        title: 'Hey, quick tip',
                        content: 'Quick note GPS is accurate to within 10 metres, we recommend that a geofence radius is 100 metres or larger'
                    })
                }else{
                    fence.config.shape.circle.center = this.state.position
                    fence.config.shape.circle.radius = this.state.radius
                    actions.sofiBeacon.updateBeaconGeofence(fence).then(()=>{
                        actions.sofiBeacon.getBeaconGeofence(pubId)
                        Modal.success({
                            title: 'Geofence Updated',
                        })
                    })
                }
            }else{
                this.setState({selectedGeofence: fence, modal: true})
            }
        }

        window.remove = () => {
            Modal.confirm({
                title: 'Remove geofence',
                content: 'Are you sure remove this geofence?',
                okText: 'Yes',
                cancelText: 'No',
                onOk() {
                    actions.sofiBeacon.deleteBeaconGeofence({geofenceId: geofence.id, beaconId: pubId})
                        .then(()=>{
                            message.success('Remove Success')
                        })
                }
            })
        }

        window.edit = () => {
            this.setState({
                selectedGeofence: geofence,
                edit: true
            })
        }

        window.editRadius = () => {
            this.setState({
                selectedGeofence: geofence,
                editRadius: true
            })
        }
        window.editName = () => {
            this.setState({
                selectedGeofence: geofence,
                editName: true
            })
        }

        window.editNotification = () => {
            let fence = {...this.state.selectedGeofence}
            fence.config.shape.circle.center = this.state.position
            fence.config.shape.circle.radius = this.state.radius
            fence.name = this.state.name
            this.setState({selectedGeofence: fence, modal: true})
        }

        const {radius, position, name} = this.state
        const editAddress = '<a onClick="edit()">Edit Address</a>'
        const first = `<p>Name: ${name} <a onclick="editName()" style="margin-right: 12px">Edit</a></p>`
        const second = address ? `<p>Address: ${address} ${editAddress}</p>` : ''
        const third = `<p>Radius: ${Math.round(radius)}m <a onclick="editRadius()">Edit</a></p>`
        const cancel = '<a onclick="cancel()">Cancel</a>'
        const save = '<a onclick="save()">Save</a>'
        const remove = '<a onclick="remove()">, Remove</a>'
        const editNotification = '<a onClick="editNotification()">, Edit Notification</a>'
        const content = geofence.id ? `${first}${second}${third}<p>${save}, ${cancel}${remove}${editNotification}</p>`
            : `${first}${third}<p>${save}, ${cancel}</p>`
        info.setContent(content)
        info.setPosition(position)
        info.addListener('closeclick', ()=> this.reset())
        return content
    }

    clickCircle = async(maps, map, geofence, circle=null) => {
        !circle && (await this.reset())
        this.moveToLocation(map, geofence.config.shape.circle.center)
        const {circles} = this.state
        this.setState({
            selectedGeofence: geofence,
            position: geofence.config.shape.circle.center,
            radius: geofence.config.shape.circle.radius,
            name: geofence.name
        },()=>{
            let newCircle = circle ? circle : circles.find(item=>item.id===geofence.id)
            if (newCircle){
                this.generateInfoWindow(geofence, this.state.address)
                info.open(map, newCircle)
                newCircle.setOptions({
                    strokeColor: 'black',
                    editable: true,
                    draggable: true
                })
            }
        })
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
            ...geofence.config.shape.circle,
            id: geofence.id
        })
        let marker = new maps.Marker({
            label: {
                text:geofence.name,
                color: 'white',
                fontSize: '22px',
                fontWeight: 'bold'
            },
            map,
            position: geofence.config.shape.circle.center,
            icon: {
                url: globalConstants.BLUE_MARKER_URL,
                scaledSize: new maps.Size(44,44),
                labelOrigin: new maps.Point(16, 45),
            },
            id: geofence.id
        })

        map.addListener('zoom_changed', ()=>{
            map.getZoom() > 12 ? marker.setLabel({
                text:geofence.name,
                color: 'white',
                fontSize: '22px',
                fontWeight: 'bold'
            }) : marker.setLabel(null)
        })

        circle.addListener('radius_changed', ()=>{
            const radius = Math.round(circle.getRadius())
            let newGeofence = _.cloneDeep(geofence)
            newGeofence.config.shape.circle. radius = radius
            this.setState({
                selectedGeofence: newGeofence,
                radius:radius
            },()=>
                this.generateInfoWindow(geofence,this.state.address))

        })

        circle.addListener('center_changed', async ()=> {
            marker.setPosition(circle.getCenter())
            let newGeofence = _.cloneDeep(geofence)
            newGeofence.config.shape.circle.center = circle.getCenter()
            this.setState({selectedGeofence: newGeofence})
            const newAddress = await this.getAddress(circle.getCenter().lat(),circle.getCenter().lng())
            this.generateInfoWindow(geofence, newAddress)
            info.setOptions({
                position: circle.getCenter()
            })
        })
        circle.addListener('click', ()=>{
            !this.state.modal && this.clickCircle(maps,map, geofence)
        })
        circles.push(circle)
        markers.push(marker)
        this.setState({circles, markers})
        return circle
    }

    handleGoogleMapApi = ({maps, map}) => {

        info = new maps.InfoWindow({content:null})
        let marker = new maps.Marker({
            map,
            position: this.props.spot,
        })

        let current = new maps.InfoWindow({content:`${globalConstants.PENDANT_GENERIC} was last seen here`})
        current.setPosition(this.props.spot)
        marker.addListener('click', ()=>{current.open(map, marker)})

        let searchMarker = new maps.Marker({
            map,
            icon: {
                url: globalConstants.PURPLE_MARKER_URL,
                scaledSize: new maps.Size(44,44)
            },
        })

        this.setState({
            mapApiLoaded: true,
            map: map,
            maps: maps,
            searchMarker: searchMarker
        })

        this.props.geofences?.map(geofence=>{
            this.drawGeofence(maps,map,geofence)
        })
    }

    handleModal = (state) => {
        this.setState({modal: state})
    }

    handleRadiusEdit = (geofence, value, field) => {

        if (field === 'radius'){
            this.state.circles.find(circle=>circle.id===geofence.id).setRadius(Number.parseInt(value))
            this.setState({
                editRadius: false
            })
        }else{
            const marker = this.state.markers.find(marker=>marker.id===geofence.id)
            marker.setLabel({
                ...marker.getLabel(),
                text: value
            })
            let newGeofence = _.cloneDeep(geofence)
            newGeofence.name = value
            this.setState({
                selectedGeofence: newGeofence,
                name: value,
                editName: false
            },()=>
                this.generateInfoWindow(newGeofence,this.state.address))
        }
    }

    render() {
        const { spot, carers,me, geofences, settings, selectedBeacon } = this.props
        const spots = geofences && geofences.map(geofence => {
            return {
                ...geofence,
                ...geofence.config.shape.circle.center
            }
        })
        const bounds = buildBoundArea(spots, spot)
        const size = {
            width: window.innerWidth - 300,// Map width in pixels
            height: window.innerHeight - 80, // Map height in pixels
        }

        const {center, zoom} = fitBounds(bounds, size)
        const {selectedGeofence, edit, editRadius, editName, maps, map, mapApiLoaded} = this.state
        
        return (
            <Fragment>
                {mapApiLoaded &&
                    <BeaconGeofence
                        geofences={geofences}
                        addGeofence={this.addGeofence}
                        moveToGeofence={this.moveToGeofence}
                        moveToLocation = {this.moveToLocation}
                        maps={maps}
                        map = {map}
                        settings={settings}
                        selectedBeacon={selectedBeacon}
                    />
                }
                <div id="beaconMap" className="beaconPage-map">
                    <GoogleMapReact
                        bootstrapURLKeys={{
                            key: globalConstants.GOOGLEMAP_KEY,
                            libraries: ['geometry','places']
                        }}
                        zoom={zoom}
                        center={center}
                        yesIWantToUseGoogleMapApiInternals
                        onGoogleApiLoaded={({maps, map})=>this.handleGoogleMapApi({maps,map})}
                        options={{fullscreenControl: false}}
                    >

                    </GoogleMapReact>

                    {selectedGeofence && <SettingModalPage
                        geofence={selectedGeofence}
                        open={this.state.modal}
                        carers={carers}
                        me={me}
                        onClose={()=>{
                            this.handleModal(false)
                            actions.sofiBeacon.getBeaconGeofence(this.props.selectedBeacon.pub_id)
                            this.reset()
                        }}
                    />}

                    {mapApiLoaded && <Modal
                        destroyOnClose
                        open={edit}
                        onCancel={() => {this.setState({edit: false})}}
                        footer={null}
                    >
                        <AutoComplete
                            maps={maps}
                            onChange={(result) => this.moveToLocation(map, result, map.getZoom(), selectedGeofence)}
                            location={map.getCenter()}
                            radius={100000}
                        />
                    </Modal>
                    }
                    {selectedGeofence &&
                    <RadiusModal
                        geofence={selectedGeofence}
                        open={editRadius || editName}
                        field={editName ? 'name' : 'radius'}
                        onClose={()=>this.setState({editRadius:false, editName: false})}
                        handleRadiusChange = {this.handleRadiusEdit}
                    />}
                </div>
            </Fragment>
        )
    }
}
const BeaconFence = Form.create({})(BeaconMap)

BeaconFence.defaultProps = {
    fullScreen: true
}

BeaconFence.propTypes = {
    spot: PropTypes.shape({ lat: PropTypes.number , lng: PropTypes.number }),
    geofences: PropTypes.array,
    fullScreen: PropTypes.bool,
    carers: PropTypes.array,
    me: PropTypes.object,
    selectedBeacon: PropTypes.object
}

export default BeaconFence

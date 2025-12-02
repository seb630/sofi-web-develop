import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { Alert, Spin } from 'antd'
import { globalConstants } from '@/_constants'
import moment from 'moment'
import BeaconMap from './BeaconMap'
import BeaconStatusInfoModal from './Modal/BeaconStatusInfoModal'
import { ExpiryBanner, WelcomeBanner } from '../../Common/Banner'
import BeaconWelcomePage from '../Welcome'
import beaconService from '../../../services/Beacon'
import BeaconAddressModal from './Modal/BeaconAddressModal'
import { DraggableModalProvider } from 'ant-design-draggable-modal'
import BeaconStatus from '@/pages/SofiBeacon/Dashboard/Status'
import Anomalies from '@/pages/SofiBeacon/Dashboard/Anomalies'
import OobeModal from '@/pages/Welcome/Modal'
import { getOobeStorage } from '@/utility/Storage'
import { isWatch } from '@/utility/Common'

const mapStateToProps = state => ({
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    selectedBeaconHeadState: state.sofiBeacon.selectedBeaconHeadState,
    beaconLastSeens: state.sofiBeacon.beaconLastSeens,
    loading: state.sofiBeacon.loading,
    subscription: state.billing.subscription,
    stripeEnabled: state.common.stripeEnabled,
    loneWorkerEnabled: state.common.loneWorkerEnabled
})

class SofiBeaconDashboard extends Component {
    constructor(props) {
        super(props)

        this.state = {
            beaconWarningOpen: false,
            addressModal: false,
            showRadius: false,
            oobeModal: false,
        }
    }

    componentDidUpdate = (prevProps) => {
        const { selectedBeacon } = this.props

        if(prevProps.selectedBeacon !== selectedBeacon
            && selectedBeacon && selectedBeacon.beacon_status
            && selectedBeacon.beacon_status !== 'ONLINE') {
            this.handleShowingBeaconWarning()
        }

        if(prevProps.selectedBeacon !== selectedBeacon){
            this.checkOobeModal()
        }
    }

    componentDidCatch = (error, errorInfo) => {
        console.error(error)
        console.error(errorInfo)
    }

    checkOobeModal = () => {
        const deviceOobe = getOobeStorage().find(item=>item.device_id === this.props.selectedBeacon.pub_id)
        if (!deviceOobe || deviceOobe && !deviceOobe.skip){
            this.setState({oobeModal: true})
        }
    }

    /** handle showing beacon warning */
    handleShowingBeaconWarning = () => {
        const { selectedBeacon, beaconLastSeens } = this.props
        const diffMinutes = moment().diff(moment(beaconLastSeens[selectedBeacon.id]),'minutes')
        if(diffMinutes > globalConstants.BEACON_DELAY_WARNING_TIME || !beaconLastSeens[selectedBeacon.id]) {
            this.showBeaconWarning(true)
            actions.sofiBeacon.setBeaconLastSeen({
                beaconId: selectedBeacon.id ,
                lastSeen: new Date() })
        }
    }

    handleFindAddress = (headstate) => {
        this.setState({addressModal: true})
        beaconService.getAddressFromCoord(headstate?.decimal_degrees_latitude,headstate?.decimal_degrees_longitude).then(result=> {
            let address = result.data.results?.slice(0,5)?.map(result=>result.formatted_address)
            const selectedBeaconHeadState = {...headstate, address}
            actions.sofiBeacon.save({
                selectedBeaconHeadState
            })
        })
    }

    handleShowRadius = (state) =>{
        this.setState({showRadius: state})
    }
    /** show Beacon warning
     * @param {boolean} show
    */
    showBeaconWarning = (show) => {
        this.setState({ beaconWarningOpen: show })
    }

    render() {
        const { selectedBeaconHeadState, selectedBeacon, loading, subscription, stripeEnabled, loneWorkerEnabled } = this.props
        const { beaconWarningOpen, addressModal, showRadius, oobeModal } = this.state
        const deviceOobe = getOobeStorage()?.find(item=>item.device_id === selectedBeacon?.pub_id)
        const oobe = selectedBeacon && selectedBeacon.oobe_state==='NONE'
        let lastLocation = {
            lat: selectedBeaconHeadState && +selectedBeaconHeadState.decimal_degrees_latitude,
            lng: selectedBeaconHeadState && +selectedBeaconHeadState.decimal_degrees_longitude,
            radius: selectedBeaconHeadState?.hdop * globalConstants.HDOP_TO_METER_RATIO || 0
        }
        const message = isWatch(selectedBeacon) ? globalConstants.EMPTY_BEACON_MAP.replace('Beacon', 'Watch') : globalConstants.EMPTY_BEACON_MAP
        return (<Spin spinning={ loading }>
            {selectedBeaconHeadState && <Anomalies selectedBeaconHeadState={selectedBeaconHeadState} timezone={selectedBeacon?.timezone}/>}
            {stripeEnabled && <ExpiryBanner subscription={subscription}/>}
            {oobe && <WelcomeBanner
                oobe={oobe}
                openModal={()=>actions.common.changeBeaconWelcomeModal(true)}
            />
            }
            {oobe && <BeaconWelcomePage />}
            {oobe && <OobeModal
                open={oobeModal}
                openModal={()=>actions.common.changeBeaconWelcomeModal(true)}
                onCancel={()=>this.setState({oobeModal: false})}
                deviceOobe={deviceOobe}
                selectedDevice={selectedBeacon}
            />}
            {
                selectedBeaconHeadState ?
                    (
                        <DraggableModalProvider>
                            <div className="beaconPage" style={{minHeight: oobe? 'calc(100vh - 195px)':'calc(100vh - 80px)'}}>
                                <BeaconStatus
                                    beacon={{...selectedBeacon, ...selectedBeaconHeadState}}
                                    handleFindAddress={this.handleFindAddress}
                                    handleShowRadius={this.handleShowRadius}
                                    showRadius={showRadius}
                                    loneWorkerEnabled={loneWorkerEnabled}
                                />
                                <BeaconMap spot={lastLocation} showRadius={showRadius} selectedBeacon={selectedBeacon}/>
                                { beaconWarningOpen && <BeaconStatusInfoModal status={selectedBeacon.beacon_status} selectedBeacon={selectedBeacon}
                                    open={beaconWarningOpen}
                                    onOk={() => { this.showBeaconWarning(false) }}
                                /> }
                                <BeaconAddressModal
                                    spot={lastLocation}
                                    open={addressModal}
                                    onCancel={()=>this.setState({addressModal: false})}
                                    headState={selectedBeaconHeadState}
                                />
                            </div>
                        </DraggableModalProvider>
                    ): (
                        <div className="contentPage">
                            <Alert message={message} type="info" />
                        </div>
                    )
            }
        </Spin>)
    }
}

export default connect(mapStateToProps,null)(SofiBeaconDashboard)

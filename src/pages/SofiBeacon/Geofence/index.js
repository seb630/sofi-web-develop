import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { Alert, Spin } from 'antd'
import { globalConstants } from '@/_constants'
import moment from 'moment'

import BeaconMap from './BeaconMap'
import BeaconStatusInfoModal from '../Dashboard/Modal/BeaconStatusInfoModal'
import { isWatch } from '@/utility/Common'

const mapStateToProps = state => ({
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    selectedBeaconHeadState: state.sofiBeacon.selectedBeaconHeadState,
    beaconLastSeens: state.sofiBeacon.beaconLastSeens,
    loading: state.sofiBeacon.loading,
    geofence: state.sofiBeacon.geofence || [],
    beaconUsers: state.sofiBeacon.selectedBeaconUsers || [],
    me: state.user.me,
    beaconSettings: state.sofiBeacon.settings || {}
})

class GeoFence extends Component {
    constructor(props) {
        super(props)

        this.state = {
            beaconWarningOpen: false
        }
    }

    componentDidUpdate = (prevProps) => {
        const { selectedBeacon } = this.props

        if(prevProps.selectedBeacon !== selectedBeacon
            && selectedBeacon && selectedBeacon.beacon_status
            && selectedBeacon.beacon_status !== 'ONLINE') {
            this.handleShowingBeaconWarning()
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

    /** show Beacon warning
     * @param {boolean} show
    */
    showBeaconWarning = (show) => {
        this.setState({ beaconWarningOpen: show })
    }

    render() {
        const { selectedBeaconHeadState, selectedBeacon , loading, geofence, beaconUsers, me, beaconSettings } = this.props
        const { beaconWarningOpen } = this.state
        let lastLocation = {
            lat: selectedBeaconHeadState && +selectedBeaconHeadState.decimal_degrees_latitude,
            lng: selectedBeaconHeadState && +selectedBeaconHeadState.decimal_degrees_longitude
        }

        const message = isWatch(selectedBeacon) ? globalConstants.EMPTY_BEACON_MAP.replace('Beacon', 'Watch') : globalConstants.EMPTY_BEACON_MAP
        return (<Spin spinning={ loading }>
            {
                selectedBeaconHeadState ?
                    (
                        <div className="beaconPage">
                            <BeaconMap spot={lastLocation} carers={beaconUsers} me={me} selectedBeacon={selectedBeacon} geofences={geofence} settings={beaconSettings}/>

                            { beaconWarningOpen && <BeaconStatusInfoModal status={selectedBeacon.beacon_status} selectedBeacon={selectedBeacon}
                                open={beaconWarningOpen}
                                onOk={() => { this.showBeaconWarning(false) }}
                            /> }
                        </div>
                    ): (
                        <div className="contentPage">
                            <Alert message={message} type="info" />
                        </div>
                    )
            }
        </Spin>)
    }
}

export default connect(mapStateToProps,null)(GeoFence)

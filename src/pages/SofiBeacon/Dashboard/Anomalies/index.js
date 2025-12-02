import moment from 'moment'
import { globalConstants } from '@/_constants'
import AnomalyBanner from '@/pages/SofiBeacon/Dashboard/Anomalies/AnomalyBanner'
import { formatTime } from '@/utility/Common'

const Anomalies = (props) => {
    const { selectedBeaconHeadState, timezone } = props
    moment.tz.setDefault(timezone?timezone : moment.tz.guess())
    if (selectedBeaconHeadState.currently_in_sos_mode &&
        selectedBeaconHeadState?.currently_in_sos_mode_last_updated &&
        moment().isBefore(moment(selectedBeaconHeadState?.currently_in_sos_mode_last_updated).add(globalConstants.BEACON_BANNER_TIMEOUT, 'minute')) &&
        selectedBeaconHeadState.currently_fallen_down &&
        selectedBeaconHeadState?.currently_fallen_down_last_updated &&
        moment().isBefore(moment(selectedBeaconHeadState?.currently_fallen_down_last_updated).add(globalConstants.BEACON_BANNER_TIMEOUT, 'minute'))) {
        return (
            <AnomalyBanner
                title="SOS Button Pressed and Fall Detected"
                content="The pendant will try to contact its saved emergency contacts"
            />
        )
    }else if (selectedBeaconHeadState.currently_fallen_down &&
        selectedBeaconHeadState?.currently_fallen_down_last_updated &&
        moment().isBefore(moment(selectedBeaconHeadState?.currently_fallen_down_last_updated).add(globalConstants.BEACON_BANNER_TIMEOUT, 'minute'))) {
        return (
            <AnomalyBanner
                title="Fall Detected"
                content={`A fall was detected at ${
                    formatTime(selectedBeaconHeadState?.currently_fallen_down_last_updated)}. The pendant will try to contact its saved emergency contacts.`}
            />
        )
    }else if (selectedBeaconHeadState.currently_in_sos_mode &&
        selectedBeaconHeadState?.currently_in_sos_mode_last_updated &&
        moment().isBefore(moment(selectedBeaconHeadState?.currently_in_sos_mode_last_updated).add(globalConstants.BEACON_BANNER_TIMEOUT, 'minute'))) {
        return (
            <AnomalyBanner
                title="SOS Button Pressed"
                content={`The SOS button was pressed ${formatTime(selectedBeaconHeadState?.currently_in_sos_mode_last_updated)
                }. The pendant will try to contact its saved emergency contacts.`}
            />)
    }else return (<div/>)
}

export default Anomalies

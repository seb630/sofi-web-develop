import PropTypes from 'prop-types'
import TCModal from '@/components/TCModal/TCModal'
import { globalConstants } from '@/_constants'

const AcceptTCModal = (props) => {
    const title = 'Before you accept your invitation:'

    const head = <p>In order to accept your invitation, you must agree to both our Privacy Policy, and our Terms and Conditions.</p>

    return <TCModal {...props} title={title} head={head} />
}

AcceptTCModal.defaultProps = {
    radarName: globalConstants.RADAR_HOBA,
    hubName: globalConstants.HUB_SOFIHUB,
    beaconName: globalConstants.BEACON_SOFIHUB
}

AcceptTCModal.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    modal: PropTypes.bool.isRequired,
    handleModalstate: PropTypes.func.isRequired,
}

export default AcceptTCModal

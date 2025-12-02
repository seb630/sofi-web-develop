import PropTypes from 'prop-types'
import TCModal from '@/components/TCModal/TCModal'
import { globalConstants } from '@/_constants'

const InviteTCModal = (props) => {
    const title = 'Before you invite a new carer:'

    const head = <p>In order to invite a new carer, you must agree to both our Privacy Policy, and our Terms and Conditions.</p>

    return <TCModal {...props} title={title} head={head} />
}

InviteTCModal.defaultProps = {
    radarName: globalConstants.RADAR_HOBA,
    hubName: globalConstants.HUB_SOFIHUB,
    beaconName: globalConstants.BEACON_SOFIHUB
}

InviteTCModal.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    modal: PropTypes.bool.isRequired,
    handleModalstate: PropTypes.func.isRequired,
}

export default InviteTCModal

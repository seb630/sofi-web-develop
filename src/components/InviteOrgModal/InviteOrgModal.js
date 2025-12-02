import PropTypes from 'prop-types'
import TCModal from '@/components/TCModal/TCModal'

const InviteModal = (props) => {
    const title = 'Before you invite a new member:'

    const head = <p>In order to invite a new member {props?.orgName && `to ${props?.orgName}`}, you must agree to both our Privacy Policy, and our Terms and Conditions.</p>

    return <TCModal {...props} title={title} head={head} />
}


InviteModal.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    modal: PropTypes.bool.isRequired,
    handleModalstate: PropTypes.func.isRequired,
    orgName: PropTypes.string,
}

export default InviteModal

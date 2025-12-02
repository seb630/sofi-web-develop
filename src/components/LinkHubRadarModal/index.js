import PropTypes from 'prop-types'
import TCModal from '@/components/TCModal/TCModal'
import { globalConstants } from '@/_constants'

const LinkHubRadarModal = (props) => {
    const {hubName, radarName} = props
    const title = `Before you link ${hubName} and ${radarName}...`
    const head = <p>Before you link your {radarName} to your {hubName} there are some things you should know.</p>

    return <TCModal {...props} title={title} head={head} />
}

LinkHubRadarModal.defaultProps = {
    radarName: globalConstants.RADAR_HOBA,
    hubName: globalConstants.HUB_SOFIHUB
}

LinkHubRadarModal.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    modal: PropTypes.bool.isRequired,
    handleModalstate: PropTypes.func.isRequired,
    radarName: PropTypes.string,
    hubName: PropTypes.string
}

export default LinkHubRadarModal

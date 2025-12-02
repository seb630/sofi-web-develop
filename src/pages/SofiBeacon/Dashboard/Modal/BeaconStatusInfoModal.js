import { InfoCircleOutlined } from '@ant-design/icons'
import { Button, Modal } from 'antd'
import PropTypes from 'prop-types'
import './BeaconStatusInfoModal.scss'
import { globalConstants } from '@/_constants'
import { isWatch } from '@/utility/Common'

function BeaconStatusInfoModal (props) {
    const { status, selectedBeacon, open, onOk , width } = props
    return (
        <Modal width={width}
            open={open}
            centered
            className={`modal-beaconStatus modal-beaconStatus--${status.toLowerCase()}`}
            footer={(<div className="d-flex justify-content-center">
                <Button className="button button-gotit" onClick={onOk}> Got it </Button>
            </div>)}>
            <div className="modal-beaconStatus-title">
                <InfoCircleOutlined className="modal-beaconStatus-icon" />
                <span> Before you take a look at the dashboard...</span>
            </div>
            <div className="modal-beaconStatus-message">Please note that the data you are looking at may not be up to date because the selected {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB} { status.toUpperCase() === 'WARNING' && 'has been offline for quite some time and' } has not contacted the cloud recently.</div>
        </Modal>
    )
}

BeaconStatusInfoModal.defaultProps = {
    width: 450
}

BeaconStatusInfoModal.propTypes = {
    width: PropTypes.number,
    open: PropTypes.bool,
    status: PropTypes.oneOf(['OFFLINE', 'WARNING']),
    onOk: PropTypes.func
}

export default BeaconStatusInfoModal

import { Component } from 'react'
import {Modal} from 'antd'
import PropTypes from 'prop-types'
import ResendConfigCard from './ResendConfigCard'
import StuckSensorCard from './StuckSensorCard'
import SensorInfoCard from './SensorInfoCard'
import CustomerOfflineTimeCard from './CustomerOfflineTimeCard'

class TroubleShootModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
        }
    }

    handleCloseModal = () => {
        this.props.onClose()
    }


    render() {
        const {device, selectedHub} = this.props
        return <Modal
            title={`Config & Troubleshoot sensor: ${device?.device_name}`}
            open={this.props.open}
            onCancel={this.handleCloseModal}
            width={900}
            footer={null}
            destroyOnClose={true}
        >
            <SensorInfoCard selectedHub={selectedHub} selectedSensor={device}/>
            <CustomerOfflineTimeCard selectedSensor={device}/>
            <ResendConfigCard selectedHub={selectedHub} selectedSensor={device}/>
            {selectedHub.hub_app_version>=202005131600 &&
                <StuckSensorCard selectedHub={selectedHub} selectedSensor={device}/>
            }
        </Modal>
    }
}

TroubleShootModal.propTypes= {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    device: PropTypes.object,
    selectedHub: PropTypes.object,
}

export default TroubleShootModal

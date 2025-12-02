import { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'
import { globalConstants } from '@/_constants'

class CreateBeaconIntro extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        const { open , onCancel , onNext , width} = this.props

        return (<Modal
            width={width}
            open={open}
            onCancel={onCancel}
            title={`Before you create a new ${globalConstants.BEACON_SOFIHUB}...`}
            footer={(<div className="d-flex justify-content-between">
                <Button key="back" onClick={onCancel}>Cancel</Button>
                <Button key="submit" type="primary" onClick={onNext}>Next</Button>
            </div>)}
        >
            <div>
                In order to create a new {globalConstants.BEACON_SOFIHUB} you need:
                <ul className="list-unstyled">
                    <li> - {globalConstants.BEACON_SOFIHUB} IMEI number </li>
                    <li> - SIM card which is activated</li>
                    <li> - Phone number for SIM card</li>
                </ul>
            </div>
            <p>
                After you have these details you can create the {globalConstants.BEACON_SOFIHUB} in the next step.
            </p>
            <div>
                After the {globalConstants.BEACON_SOFIHUB} is created you will need to turn on the {globalConstants.BEACON_SOFIHUB} and configure it using the admin page for that {globalConstants.BEACON_SOFIHUB}.
                You will need to send the commands listed on the admin tab including but not limited to:
                <ul className="list-unstyled">
                    <li> - Setting APN (to correct carrier for SIM)</li>
                    <li> - Turning on AGPS</li>
                    <li> - Send cloud address</li>
                    <li> - And more</li>
                </ul>
            </div>
            <p>
                You or the customer will not be able to use the {globalConstants.BEACON_SOFIHUB} until it is configured correctly.
            </p>
            <p>
                Lets get started!
            </p>
        </Modal>)
    }
}

CreateBeaconIntro.defaultProps = {
    width: 460
}

CreateBeaconIntro.propTypes = {
    width: PropTypes.number,
    open: PropTypes.bool.isRequired,
    onNext: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
}

export default CreateBeaconIntro

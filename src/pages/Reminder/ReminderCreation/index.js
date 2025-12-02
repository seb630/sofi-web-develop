import { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import CreateReminderIntro from './step-Intro'
import './ReminderModal.scss'
import { CheckCircleOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import { globalConstants } from '@/_constants'

class ReminderCreationModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            context: {
                hubId: props.hubId,
                isRemindToTakeBeacon: false,
                isRemindeToChargeBeacon: false,
                beaconSuggestions: {}
            }
        }
    }

    /** handle close */
    handleClose = () => {
        const { moveTo } = this.props
        moveTo(0)
    }

    successModal = () => {
        this.handleClose()
        Modal.success({
            icon: <CheckCircleOutlined />,
            content: 'Those reminders are saved and ready to be played. If you\'d like to change them in the future head on over to the ' +
                `Device section of the portal, choose the right ${globalConstants.HUB_SOFIHUB}, and click on "Reminders".`,
            okText: 'Close',
            title: 'We\'ve created your reminders!'
        })
    }

    render() {
        const { context } = this.state
        const { step , deviceType, beaconSuggestions } = this.props
        context.beaconSuggestions = beaconSuggestions
        return <Fragment>
            <CreateReminderIntro deviceType={deviceType} open={step === 1}
                onNext={this.successModal} onCancel={this.handleClose} context={context} />
        </Fragment>
    }
}

ReminderCreationModal.defaultProps = {
    step: 0
}

ReminderCreationModal.propTypes = {
    step: PropTypes.number,
    hubId: PropTypes.string.isRequired,
    deviceType: PropTypes.oneOf(['beacon','hub']),
    beaconSuggestions: PropTypes.shape({
        charge_on_week_day: PropTypes.string,
        charge_on_weekend: PropTypes.string,
        take_on_week_day: PropTypes.string,
        take_on_weekend: PropTypes.string
    }),
    moveTo: PropTypes.func,

}

export default ReminderCreationModal

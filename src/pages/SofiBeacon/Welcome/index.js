import { Component, Fragment } from 'react'
import { Form } from '@ant-design/compatible'
import { Modal, Steps } from 'antd'
import { actions, connect } from 'mirrorx'
import welcomeStep from './Steps/WelcomeStep'
import './welcomeWizard.scss'
import userStep from './Steps/UserStep'
import sosStep from './Steps/SosStep'
import emergencyStep from './Steps/EmergencyStep'
import geofenceStep from './Steps/GeofenceStep'
import finishStep from './Steps/FinishStep'
import carerStep from './Steps/CarerStep'
import fallStep from './Steps/FallStep'
import Media from 'react-media'
import { isMobile } from 'react-device-detect'
import informationStep from '@/pages/SofiBeacon/Welcome/Steps/InformationStep'
import { globalConstants } from '@/_constants'
import { isLife, isWatch } from '@/utility/Common'
import timezoneStep from './Steps/TimeZone'

const mapStateToProps = state => ({
    me: state.user.me,
    beacons: state.sofiBeacon.beacons.beacons,
    open: state.common.beaconWelcomeModal,
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    emergencyContacts: state.sofiBeacon.selectedBeaconEmergencyContacts || [],
    beaconUsers: state.sofiBeacon.selectedBeaconUsers,
    beaconInvitation: state.user.beaconInvitation,
    parsedBeaconSettings: state.sofiBeacon.selectedBeaconHeadState?.device_settings && JSON.parse(state.sofiBeacon.selectedBeaconHeadState.device_settings)
})

class BeaconWelcomeModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            current:0,
        }
    }

    next = () => {
        const current = this.state.current + 1
        document.getElementsByClassName('ant-steps-item-process')[0].scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        })
        this.setState({ current })
    }

    prev = () => {
        const current = this.state.current - 1
        document.getElementsByClassName('ant-steps-item-finish')[document.getElementsByClassName('ant-steps-item-finish').length-1].scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        })
        this.setState({ current })
    }

    componentDidUpdate(prevProps){
        const {selectedBeacon, open} = this.props
        if (!prevProps.open && open) {
            actions.sofiBeacon.fetchBeaconEmergencyContacts(selectedBeacon.pub_id)
            actions.sofiBeacon.fetchBeaconUsers(selectedBeacon.pub_id)
            actions.user.getInvitationByBeacon(selectedBeacon.pub_id)
            actions.sofiBeacon.fetchBeaconHeadState(selectedBeacon.pub_id)
        }
    }

    finish = () => {
        const payload = {
            beacon_id : this.props.selectedBeacon.pub_id,
            action: 'claim'
        }
        actions.sofiBeacon.updateBeaconOOBE(payload).then(()=> {
            actions.sofiBeacon.fetchBeaconByUser()
            actions.common.changeBeaconWelcomeModal(false)
            actions.routing.push('/beacon/dashboard')
        })
    }

    onChange = current => {
        this.setState({ current })
    }

    render() {
        const { current } = this.state
        const { form, open, selectedBeacon, emergencyContacts, me, beaconUsers, beaconInvitation, parsedBeaconSettings} =  this.props
        const deviceName =  isLife(selectedBeacon) ? globalConstants.LIFE_SOFIHUB : 
            isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB
        
        const work_mode = parsedBeaconSettings?.work_mode ?? 0
        
        const steps = work_mode == 2 ? [
            welcomeStep(this.next, selectedBeacon),
            informationStep(this.next, this.prev, deviceName),
            userStep(selectedBeacon, form, this.next,this.prev),
            sosStep(selectedBeacon, this.next,this.prev),
            emergencyStep(selectedBeacon, emergencyContacts, me, this.next,this.prev),
            fallStep(selectedBeacon, parsedBeaconSettings, this.next, this.prev),
            geofenceStep(selectedBeacon, this.next,this.prev),
            carerStep(selectedBeacon, beaconUsers, beaconInvitation, this.next, this.prev),
            timezoneStep(selectedBeacon, this.next, this.prev),
            finishStep(this.prev, this.finish)
        ] : [
            welcomeStep(this.next, selectedBeacon),
            informationStep(this.next, this.prev, deviceName),
            userStep(selectedBeacon, form, this.next,this.prev),
            sosStep(selectedBeacon, this.next,this.prev),
            emergencyStep(selectedBeacon, emergencyContacts, me, this.next,this.prev),
            fallStep(selectedBeacon, parsedBeaconSettings, this.next, this.prev),
            carerStep(selectedBeacon, beaconUsers, beaconInvitation, this.next, this.prev),
            timezoneStep(selectedBeacon, this.next, this.prev),
            finishStep(this.prev, this.finish)
        ]

        const modalTitle =
            <Media query="(max-width: 767px)">
                {matches =>
                    <Steps
                        className="welcomeSteps"
                        direction={matches ? 'vertical':'horizontal'}
                        current={current}
                        size="small"
                        onChange={this.onChange}
                        labelPlacement={isMobile ? 'horizontal' : 'vertical'}>
                        {steps.map(item => <Steps.Step key={item.title} title={item.title}/>)}
                    </Steps>
                }
            </Media>

        return <Media query="(max-width: 768px)">
            {matches =>
                <Modal
                    title={modalTitle}
                    open={open}
                    onCancel={() => actions.common.changeBeaconWelcomeModal(false)}
                    width={matches ? 520: 1040}
                    footer={null}
                    destroyOnClose
                    className={current===6 && 'noPaddingBody'}
                >
                    <Fragment>
                        <div className="steps-content">{steps[current].content}</div>
                        {
                            current !== steps.length - 2 && <div className="steps-action">{steps[current].action}</div>
                        }
                    </Fragment>
                </Modal>
            }</Media>
    }
}

const BeaconWelcomePage = Form.create({})(BeaconWelcomeModal)

export default connect(mapStateToProps, null) (BeaconWelcomePage)

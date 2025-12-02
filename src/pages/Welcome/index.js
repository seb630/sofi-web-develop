import { Component } from 'react'
import { Form } from '@ant-design/compatible'
import { Steps, Modal } from 'antd'
import { actions, connect } from 'mirrorx'
import welcomeStep from './Steps/WelcomeStep'
import userStep from './Steps/UserStep'
import finishStep from './Steps/FinishStep'
import carerStep from './Steps/CarerStep'
import Media from 'react-media'
import {isMobile} from 'react-device-detect'
import routineStep from './Steps/RoutineStep'
import anomalyStep from './Steps/AnomalyStep'
import reminderStep from './Steps/ReminderStep'
import sensorStep from './Steps/SensorStep'
import informationStep from './Steps/InformationStep'

const mapStateToProps = state => ({
    hubs: state.hub.hubs,
    open: state.common.hubWelcomeModal,
    selectedHub: state.hub.selectedHub,
    settings: state.setting.settings,
    anomalyPreferences: state.setting.anomalyPreferences,
    hubUsers: state.hub.hubUsers,
    hubInvitation: state.user.hubInvitation
})

class HubWelcomeModal extends Component {
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
        const {selectedHub, open} = this.props
        if (!prevProps.open && open) {
            actions.setting.getSettings(selectedHub.hub_id)
            actions.setting.getFeatureFlags(selectedHub.hub_id)
            actions.hub.getHubUsers(selectedHub.hub_id)
            actions.user.getInvitationByHub (selectedHub.hub_id)
            actions.setting.getAnomalyPreferences(selectedHub.hub_id)
        }
    }

    finish = () => {
        const payload = {
            hub_id : this.props.selectedHub.hub_id,
            action: 'claim'
        }
        actions.hub.updateHubOOBE(payload).then(()=> {
            actions.hub.getHubs()
            actions.common.changeHubWelcomeModal(false)
            actions.routing.push('/dashboard')
        })
    }

    onChange = current => {
        this.setState({ current })
    }

    render() {
        const { current } = this.state
        const { form, open, selectedHub, settings, anomalyPreferences, hubInvitation, hubUsers} =  this.props

        const steps = [
            welcomeStep(this.next, selectedHub, settings),
            informationStep(this.next, this.prev),
            userStep(selectedHub, form, settings, this.next,this.prev),
            routineStep(selectedHub, form, settings, this.next,this.prev),
            anomalyStep(selectedHub, settings, anomalyPreferences, this.next, this.prev),
            carerStep(selectedHub, settings, hubUsers, hubInvitation, this.next, this.prev),
            reminderStep(settings, this.next, this.prev),
            sensorStep(this.next, this.prev),
            finishStep(this.prev, this.finish)
        ]

        const modalTitle =
            <Media query="(max-width: 767px)">
                {matches =>
                    <Steps
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
            {matches =><Modal
                title={modalTitle}
                open={open}
                width={matches ? 520: 1080}
                onCancel={()=> actions.common.changeHubWelcomeModal(false)}
                footer={null}
                destroyOnClose
            >
                {steps[current].content}
            </Modal>}</Media>
    }
}

const HubWelcomePage = Form.create({})(HubWelcomeModal)

export default connect(mapStateToProps, null) (HubWelcomePage)

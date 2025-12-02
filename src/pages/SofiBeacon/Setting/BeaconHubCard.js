import { Component } from 'react'
import { Button, Card, message, Modal, Skeleton } from 'antd'
import { actions, connect } from 'mirrorx'
import LinkHubModal from './LinkHub'
import ReminderCreationModal from '../../Reminder/ReminderCreation/'
import HubService from '../../../services/Hub'
import { removeDuplicateDevices, isLife, isWatch } from '@/utility/Common'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    linkedHub: state.sofiBeacon.linkedHub,
    hubs: removeDuplicateDevices(state.user.dashboardOverview.hubs),
})

class BeaconHubCard extends Component {

    constructor(props) {
        super(props)

        this.state = {
            unlinking: false,
            createReminderStep:0,
            beaconSuggestions: {}
        }
    }

    /** handle unlink beacon */
    handleUnlinkBeacon = async () => {
        try {
            const { selectedBeacon } = this.props
            this.setState({ unlinking: true })
            await actions.sofiBeacon.dislinkBeacon({ beaconId:  selectedBeacon.pub_id })
            selectedBeacon.hub_id = null
            actions.sofiBeacon.save ( { linkedHub: {} })
            actions.sofiBeacon.selectBeacon(selectedBeacon)
        } catch (err) {
            err.global_errors && err.global_errors.map((msg) => {
                message.error(msg)
            })
        } finally {
            this.setState({ unlinking: false })
        }
    }

    handleConfirmUnlink = () => {
        Modal.confirm({
            title: `Are you sure you wish to unlink this ${globalConstants.HUB_SOFIHUB}?`,
            content: `If you unlink this ${globalConstants.HUB_SOFIHUB} you will no longer receive smart reminders if turned on.`,
            okText: 'Unlink',
            onOk: this.handleUnlinkBeacon
        })
    }

    /** move to create reminder step */
    moveToCreateReminderStep = (step) => {
        this.setState({
            createReminderStep: step
        })
    }

    navigateToHub = (hub) => {
        actions.hub.selectHub(hub)
        actions.routing.push('/dashboard')
    }

    render() {
        const { linkedHub, hubs, selectedBeacon } = this.props
        const { unlinking, createReminderStep, beaconSuggestions } = this.state
        const deviceType = isLife(selectedBeacon)? globalConstants.LIFE_SOFIHUB : 
            isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB

        return (<Card id='card-HubBeacon' className="beacon-card" title={`Link ${deviceType} to a ${globalConstants.HUB_SOFIHUB}`}>
            <Skeleton loading={linkedHub === null } active>
                <p> { linkedHub?.display_name ?
                    <span>{deviceType} is currently linked with {linkedHub.authorized ?
                        <a onClick={()=>this.navigateToHub(linkedHub)}>{linkedHub.display_name}</a> : linkedHub.display_name}
                            .</span>
                    : selectedBeacon && selectedBeacon.hub_id ? `This ${deviceType} is connected to a ${globalConstants.HUB_SOFIHUB}, but we cannot tell you which one because you are not a carer for that ${globalConstants.HUB_SOFIHUB}.`
                        : `${deviceType} is not currently linked with a ${globalConstants.HUB_SOFIHUB}.`} </p>
                <div className="d-flex align-items-center justify-content-end">
                    {linkedHub && linkedHub.display_name &&
                    <Button id='btn-unlinkBeacon' loading={unlinking} onClick={this.handleConfirmUnlink} style={{ marginRight: '10px' }} type="primary"> Unlink {globalConstants.HUB_GENERIC} </Button>}

                    {selectedBeacon && <LinkHubModal
                        selectedBeacon={selectedBeacon}
                        hubs={hubs}
                        onAfterSaved={async () => {
                            const { linkedHub } = this.props
                            const beaconSuggestions = await HubService.fetchBeaconSuggestionsTime({ hubId:linkedHub.hub_id })
                            this.setState({ beaconSuggestions })
                            this.moveToCreateReminderStep(1)
                        }}/>
                    }
                </div>
                {linkedHub && linkedHub.hub_id &&
                    <ReminderCreationModal hubId={linkedHub.hub_id}
                        beaconSuggestions={beaconSuggestions}
                        deviceType='hub' step={createReminderStep}
                        moveTo={this.moveToCreateReminderStep}/> }
            </Skeleton>
        </Card>)
    }
}

export default connect(mapStateToProps)(BeaconHubCard)

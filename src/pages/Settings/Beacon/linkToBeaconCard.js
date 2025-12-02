import { Component } from 'react'
import { actions } from 'mirrorx'
import { Button, Card, Col, Divider, message, Modal, Row, Skeleton } from 'antd'
import PropTypes from 'prop-types'
import { isMobile } from 'react-device-detect'
import LinkBeaconModal from './linkBeacon'
import ReminderCreationModal from '../../Reminder/ReminderCreation/'

import HubService from '../../../services/Hub'
import { globalConstants } from '@/_constants'

class LinkToBeaconCard extends Component {
    constructor(props) {
        super(props)

        this.state = {
            createReminderStep: 0,
            beaconSuggestions: {}
        }
    }


    /** handle unlink
     * @param {Object} item
    */
    handleUnLink = async (item) => {
        try {
            const { selectedHub } = this.props

            await actions.sofiBeacon.dislinkBeacon({ beaconId: item.pub_id })
            await Promise.all([
                actions.hub.fetchHubBeacon(selectedHub.hub_id),
                actions.sofiBeacon.fetchBeaconByUser()
            ])
        } catch(err) {
            err.global_errors && err.global_errors.map((msg) => {
                message.error(msg)
            })
        }
    }

    /** handle confirm unlink */
    handleConfirmUnlink = (item) => {
        Modal.confirm({
            title: `Are you sure you wish to unlink this ${globalConstants.BEACON_SOFIHUB}?`,
            content: `If you unlink this ${globalConstants.BEACON_SOFIHUB} you will no longer receive smart reminders if turned on.`,
            okText: 'Unlink',
            onOk: this.handleUnLink.bind(this,item)
        })
    }

    /** move to create reminder step */
    moveToCreateReminderStep = (step) => {
        this.setState({
            createReminderStep: step
        })
    }

    navigateToBeacon = (beacon) => {
        actions.sofiBeacon.selectBeacon(beacon).then(()=> actions.routing.push('/beacon/dashboard'))
    }

    viewReminders = (beacon) => {
        actions.sofiBeacon.selectBeacon(beacon).then(()=>actions.routing.push( '/beacon/settings/hub'))
    }

    render() {
        const { createReminderStep, beaconSuggestions } = this.state
        const { selectedHubBeacons, selectedHub , beacons , me, totalHubBeacons } = this.props
        const unlinkedBeacons = beacons.filter(x => x.hub_id == null)
        return (
            <Card className="beacon-card" id="hubBeaconsSettings" title={`Link to ${globalConstants.BEACON_SOFIHUB}`}>
                <Skeleton loading={selectedHubBeacons == null} active>
                    <p>
                        { totalHubBeacons>0
                            ? `There ${totalHubBeacons>1 ? `are ${totalHubBeacons} ${globalConstants.BEACON_SOFIHUB}s` : `is 1 ${globalConstants.BEACON_SOFIHUB}`} currently linked with this ${globalConstants.HUB_SOFIHUB} `
                            : `There is currently no linked ${globalConstants.BEACON_SOFIHUB}.` }
                    </p>
                    <div>
                        {
                            selectedHubBeacons && selectedHubBeacons.map ((item,index) => {
                                return (<Row key={index} style={{marginBottom: 10}}type="flex" justify="space-between">
                                    <Col xs={22} md={8}>
                                        <a onClick={()=>this.navigateToBeacon(item)}> - {item.display_name}</a>
                                    </Col>
                                    <Col xs={22} md={16}>
                                        {isMobile ?
                                            <Row gutter={8}>
                                                <Col span={12}>
                                                    <Button type="default" onClick={() => {this.viewReminders(item) } }>View Reminders </Button>
                                                </Col>
                                                <Col span={12}>
                                                    <Button type="default" onClick={() => {this.handleConfirmUnlink(item) } }>Unlink {globalConstants.BEACON_SOFIHUB}</Button>
                                                </Col>
                                            </Row>
                                            :
                                            <Row type="flex" justify="end">
                                                <Button type="default" onClick={() => {this.viewReminders(item) } }>View Reminders</Button>
                                                <Divider type='vertical' style={{height: 'auto'}}/>
                                                <Button type="default" onClick={() => {this.handleConfirmUnlink(item) } }>Unlink {globalConstants.BEACON_SOFIHUB}</Button>
                                            </Row>
                                        }
                                    </Col>
                                </Row>)
                            })
                        }
                    </div>
                    {
                        totalHubBeacons !== selectedHubBeacons.length &&
                        <div style={{ marginBottom: '10px'}} className="test-hubbeacon d-flex align-items-center justify-content-between" >
                            - {totalHubBeacons-selectedHubBeacons.length} {selectedHubBeacons.length>0 && 'other '}{globalConstants.BEACON_SOFIHUB} that you do not have permission to access.
                        </div>
                    }
                    <div className="d-flex justify-content-end">
                        {
                            me && selectedHub && <LinkBeaconModal me={me} hubId={selectedHub.hub_id} beacons={unlinkedBeacons} onAfterSaved={async () => {
                                const { selectedHub } = this.props
                                const beaconSuggestions = (await HubService.fetchBeaconSuggestionsTime({ hubId:selectedHub.hub_id })) || {}
                                this.setState({ beaconSuggestions })
                                this.moveToCreateReminderStep(1)
                            }} />
                        }
                    </div>
                </Skeleton>
                { selectedHub && <ReminderCreationModal
                    beaconSuggestions={beaconSuggestions}
                    hubId={selectedHub.hub_id}
                    deviceType='beacon'
                    step={createReminderStep}
                    moveTo={this.moveToCreateReminderStep}/> }
            </Card>
        )
    }
}

LinkToBeaconCard.propTypes = {
    selectedHubBeacons: PropTypes.arrayOf(PropTypes.shape({
        display_name: PropTypes.string,
    })),
    totalHubBeacons: PropTypes.number,
    selectedHub: PropTypes.shape({
        hub_id: PropTypes.string
    }),
    beacons: PropTypes.arrayOf(PropTypes.shape({
        hub_id: PropTypes.string
    })),
    me: PropTypes.shape({
        user_id: PropTypes.number
    })
}

export default LinkToBeaconCard

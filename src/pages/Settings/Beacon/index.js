import { Component } from 'react'
import { connect } from 'mirrorx'
import {  Row, Col } from 'antd'
import LinkToBeaconCard from './linkToBeaconCard'
import SmartReminderCard from './smartReminderCard'
import { removeDuplicateDevices } from '@/utility/Common'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    selectedHubBeacons: state.hub.selectedHubBeacons || [],
    totalHubBeacons: state.hub.totalHubBeacons,
    beacons: removeDuplicateDevices(state.user.dashboardOverview.beacons),
    me: state.user.me
})

class HubBeacon extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { selectedHubBeacons } = this.props
        return (
            <Row type="flex" justify="center">
                <Col xs={22} lg={16}>
                    <LinkToBeaconCard {...this.props} />
                    <SmartReminderCard beacons={selectedHubBeacons.filter(x => x.is_notification_on)} />
                </Col>
            </Row>
        )
    }
}

export default connect(mapStateToProps)(HubBeacon)

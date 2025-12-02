import { Component } from 'react'
import { Button, Col, Row } from 'antd'
import EmergencyContactTable from '@/pages/SofiBeacon/Setting/EmergencyContact/EmergencyContactTable'
import { globalConstants } from '@/_constants'
import { isLife, isWatch } from '@/utility/Common'

class EmergencyContactContent extends Component {
    render() {
        return (
            <div className="wizardContent">
                <p>Let&#39;s add some emergency contacts, remember these are the people that the {this.props.deviceName} will reach out to if
                    you press and hold the sos button. We suggest that emergency contacts are: close by geographically, and that the person is available -
                    meaning that they can help when the {this.props.deviceName} reaches out to them.</p>
                <p>Please make sure your emergency contact choices agree and are aware they are going to be used as emergency contacts.</p>
                <p>Let&#39;s add at least one emergency contact</p>

                <EmergencyContactTable
                    selectedBeaconEmergencyContacts={this.props.selectedBeaconEmergencyContacts}
                    selectedBeacon={this.props.selectedBeacon}
                />

            </div>
        )
    }
}

const emergencyStep = (selectedBeacon, selectedBeaconEmergencyContacts, me, next, prev) => {
    let loading = false
    const title = 'Emergency Contacts'
    const content = <EmergencyContactContent
        selectedBeacon={selectedBeacon}
        deviceName={isLife(selectedBeacon) ? globalConstants.LIFE_SOFIHUB : 
            isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB}
        selectedBeaconEmergencyContacts={selectedBeaconEmergencyContacts}
        me={me}
    />

    const action = <Row>
        <Col span={24}>
            <Button style={{ marginLeft: 8 }} onClick={prev}>Previous</Button>
            <Button
                type="primary"
                onClick={next}
                disabled={loading}
                className="floatRight">Next
            </Button>
        </Col>
    </Row>

    return { title, content, action }
}

export default emergencyStep

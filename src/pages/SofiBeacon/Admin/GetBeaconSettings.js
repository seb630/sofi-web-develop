import { Component } from 'react'
import { Card, Row, Col, Button, Modal } from 'antd'
import { actions } from 'mirrorx'
import PropTypes from 'prop-types'
import { isWatch } from '@/utility/Common'

export default class GetBeaconSettings extends Component {

    handleSendCommand = () => {
        actions.sofiBeacon.getSettingsCommand(this.props.selectedBeacon.pub_id).then(()=>{
            Modal.success({
                title:'Your changes have been sent!',
                content: 'Please note the changes may take 30 minutes to be accepted by the pendant, during this time this page will go back to displaying what was previously saved on the pendant. Once your pendant has accepted the changes then this page will update to the value you saved.',
                okText: 'Okay'
            })
        })
    }

    
    render() {
        const title = 'Get ' + (isWatch(this.props.selectedBeacon) ? 'Watch' : 'Beacon') + ' Settings'
        return (<Card className="beacon-card" title={title}>
            <Row type="flex" justify="space-between">
                <Col>
                    Once processed results are displayed in raw data tab.
                </Col>
                <Col>
                    <Button type="primary" onClick={this.handleSendCommand}>Send Get Settings Command</Button>
                </Col>
            </Row>

        </Card>)
    }
}

GetBeaconSettings.propTypes = {
    selectedBeacon: PropTypes.shape({
        beacon_id: PropTypes.string,
        imei: PropTypes.string,
        phone: PropTypes.string,
        archived: PropTypes.bool
    })
}

import { Component } from 'react'
import { connect } from 'mirrorx'
import { Card, Col, Row, Slider } from 'antd'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import PropTypes from 'prop-types'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    selectedBeacon: state.sofiBeacon.selectedBeacon,
})

class OldBeaconFall extends Component {
    constructor(props) {
        super(props)

        this.state = {
            sensitivity: 5,
        }
    }

    render() {
        const {selectedBeacon, settings} = this.props
        return <div className="contentPage">
            <Row type="flex" justify="center">
                <Col xs={24} lg={settings ? 24: 12}>
                    <Card className="beacon-card">
                        <h4>Would you like to turn on fall detection?</h4>
                        <p>To turn on fall detection you need to send some SMS commands to your {globalConstants.BEACON_SOFIHUB}.</p>
                        <ol>
                            <li>First tell how sensitive you&#39;d like the fall detection to be, where 1 is most sensitive and
                                9 is least sensitive.</li>
                            <Row type="flex" justify="center">
                                <Col xs={20} lg={16}>
                                    <Slider
                                        min={1}
                                        max={9}
                                        value={this.state.sensitivity}
                                        onChange={v=>this.setState({sensitivity: v})}
                                        marks={{1: 'Most', 9: 'Least'}}
                                    />
                                </Col>
                            </Row>
                            <li>Send the following text to the following number vis SMS:</li>
                            <Row type="flex" justify="center">
                                <Col xs={6} lg={3}>
                                    Send:
                                </Col>
                                <Col xs={12} lg={6}>
                                    FL1,{this.state.sensitivity}
                                </Col>
                            </Row>
                            <Row type="flex" justify="center">
                                <Col xs={6} lg={3}>
                                    To:
                                </Col>
                                <Col xs={12} lg={6}>
                                    {selectedBeacon && formatPhoneNumberIntl(selectedBeacon.phone)}
                                </Col>
                            </Row>
                            <li>If that change was successful, the {globalConstants.BEACON_SOFIHUB} will reply via SMS to you. This might take a minute or two.
                                If you don&#39;t get a reply, double check your message and make sure that the {globalConstants.BEACON_SOFIHUB} is within reception
                                range</li>
                        </ol>
                        <p>Congratulations, your {globalConstants.BEACON_SOFIHUB} will now send you an SMS when a fall is detected. Try dropping your {globalConstants.BEACON_SOFIHUB} onto a
                            pillow to test it, if you don&#39;t get an SMS try turning up the sensitivity.</p>

                    </Card>
                </Col>
            </Row>
            <Row type="flex" justify="center">
                <Col xs={24} lg={settings ? 24: 12}>
                    <Card className="beacon-card">
                        <h4>Would you also like the {globalConstants.BEACON_SOFIHUB} to call contacts on fall down?</h4>
                        <p>Send the following text to the following number vis SMS:</p>
                        <Row type="flex" justify="center">
                            <Col xs={6} lg={3}>
                                Send:
                            </Col>
                            <Col xs={12} lg={6}>
                                F12
                            </Col>
                        </Row>
                        <Row type="flex" justify="center">
                            <Col xs={6} lg={3}>
                                To:
                            </Col>
                            <Col xs={12} lg={6}>
                                {selectedBeacon && formatPhoneNumberIntl(selectedBeacon.phone)}
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
            <Row type="flex" justify="center">
                <Col xs={24} lg={settings ? 24: 12}>
                    <Card className="beacon-card">
                        <h4>Would you like to turn off fall detection?</h4>
                        <p>Send the following text to the following number vis SMS:</p>
                        <Row type="flex" justify="center">
                            <Col xs={6} lg={3}>
                                Send:
                            </Col>
                            <Col xs={12} lg={6}>
                                FL0
                            </Col>
                        </Row>
                        <Row type="flex" justify="center">
                            <Col xs={6} lg={3}>
                                To:
                            </Col>
                            <Col xs={12} lg={6}>
                                {selectedBeacon && formatPhoneNumberIntl(selectedBeacon.phone)}
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    }
}

OldBeaconFall.propTypes={
    settings: PropTypes.bool
}

export default connect(mapStateToProps, null) (OldBeaconFall)

import { Component, Fragment } from 'react'
import { actions } from 'mirrorx'
import { Button, Card, Col, message, Modal, Row, Skeleton } from 'antd'
import PropTypes from 'prop-types'
import { globalConstants } from '@/_constants'
import CounterLoading from '../../../components/CounterLoading'
import BeaconAdvancedSetting from './Advanced'

class BeaconConfigCard extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: {
                open: false,
                value: 0
            }
        }

        this.smsinterval = 0
    }

    componentWillUnmount() {
        if(this.smsinterval) {
            clearInterval(this.smsinterval)
        }
    }

    /** handle set APN */
    handleSetAPN = async () => {
        try {
            const { selectedBeacon, selectedAPN } = this.props
            if (selectedAPN) {
                const promises = [this.waitForSmS(globalConstants.TIME_WAIT_LONG_SMS), actions.sofiBeacon.smsAPN({ beaconId: selectedBeacon.pub_id, apnId: selectedAPN.pub_id })]
                await Promise.all(promises)
                message.success('APN Resent!')
            }else {
                Modal.error({
                    title: 'Cannot resend APN',
                    content: 'You do not have an APN selected, you cannot resend a null APN. Select an APN from the drop down menu above',
                    okText:'Okay'
                })
            }

        } catch (err) {
            err.global_errors && err.global_errors.map((msg) => {
                message.error(msg)
            })
        }
    }

    /** handle set Cloud Address */
    handleSetCloudAddress = async () => {
        try {
            const { selectedBeacon } = this.props
            const promises = [this.waitForSmS(globalConstants.TIME_WAIT_LONG_SMS), actions.sofiBeacon.smsServerAddress({ beaconId: selectedBeacon.pub_id })]
            await Promise.all(promises)
            message.success('Cloud Address Sent!')
        } catch (err) {
            err.global_errors && err.global_errors.map((msg) => {
                message.error(msg)
            })
        }
    }

    /** handle set AGPS */
    handleSetAGPS = async () => {
        try {
            const { selectedBeacon } = this.props
            const promises = [this.waitForSmS(globalConstants.TIME_WAIT_LONG_SMS), actions.sofiBeacon.smsAGPS({ beaconId: selectedBeacon.pub_id })]
            await Promise.all(promises)
            message.success('AGPS Sent!')
        } catch (err) {
            err.global_errors && err.global_errors.map((msg) => {
                message.error(msg)
            })
        }
    }

    /** waiting while send sms
     * @param {number} duration
    */
    waitForSmS = (duration) => {
        return new Promise((resolve) => {
            let count = duration/1000
            const distance = 100/count

            this.setState({
                loading: {
                    open: true,
                    value: this.state.loading.value + distance
                }
            })
            -- count
            this.smsinterval = setInterval(() => {
                if(count === 0) {
                    clearInterval(this.smsinterval)
                    this.setState({
                        loading: {
                            value: 0,
                            open: false
                        }
                    })
                    resolve()
                    return
                }

                this.setState({
                    loading: {
                        open: true,
                        value: this.state.loading.value + distance
                    }
                })
                --count
            },1000)
        })
    }

    render() {
        const { selectedBeacon } = this.props
        const { loading } = this.state
        const oldBeacon = this.props.selectedBeacon && this.props.selectedBeacon.model === globalConstants._3G_BEACON_MODEL

        return (<Fragment>
            <CounterLoading message={'Please wait while we send the command...'} {...loading}/>
            <Card className="beacon-card" title="Resend Configuration">
                <Skeleton loading={selectedBeacon == null}>
                    <p>You can resend configuration SMS and TCP here. Start from top to bottom, left to right.</p>
                    <Row gutter={{xs: 8, sm: 16, md: 24}}>
                        <Col xs={24} md={8} style={{ marginBottom: '24px'}}> <Button className="text-ellipsis" id="btn-resendCloudAddress" block type="primary" onClick={this.handleSetCloudAddress}> Resend Cloud Address SMS </Button> </Col>
                        <Col xs={24} md={8} style={{ marginBottom: '24px'}}> <Button className="text-ellipsis" id="btn-resendAGPS" block type="primary" onClick={this.handleSetAGPS}> Resend AGPS SMS </Button> </Col>
                        <Col xs={24} md={8} style={{ marginBottom: '24px'}}> <Button className="text-ellipsis" id="btn-resendAPN" block type="primary" onClick={this.handleSetAPN}> Resend APN SMS </Button> </Col>
                    </Row>
                    {!oldBeacon && <
                        BeaconAdvancedSetting
                        countDown={this.waitForSmS}
                    />}
                </Skeleton>
            </Card>
        </Fragment>)
    }
}

BeaconConfigCard.propTypes = {
    selectedBeacon: PropTypes.shape({
        beacon_id: PropTypes.string,
        imei: PropTypes.string,
        phone: PropTypes.string,
        archived: PropTypes.bool
    }),
    selectedAPN: PropTypes.object
}

export default BeaconConfigCard

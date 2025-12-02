import { Component } from 'react'
import { Button, Card, Col, message, Modal, Row } from 'antd'
import { actions } from 'mirrorx'
import PropTypes from 'prop-types'
import { globalConstants } from '@/_constants'
import { isWatch } from '@/utility/Common'

export default class RabbitMQ extends Component {

    showConfirm = () => {
        Modal.confirm({
            title: `Are you sure you want to purge the queue for this ${isWatch(this.props.selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC}?`,
            content: `Purging the queue will result in possible data loss, for example emergency contacts which have not made it to the ${
                isWatch(this.props.selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC} yet will be lost. You will need to resend them. Are you sure you want to purge?`,
            okText: 'Purge',
            okType: 'danger',
            onOk: this.handlePurge
        })
    }

    handlePurge = () => {
        actions.sofiBeacon.clearCommandQueue(this.props.selectedBeacon.pub_id).then(()=>{message.success('RabbitMQ queue cleared')})
    }
    render() {
        return (<Card className="beacon-card" title="RabbitMQ">
            <Row type="flex" justify="space-between">
                <Col>
                    Purge all existing messages for this {isWatch(this.props.selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC} in RabbitMQ.
                </Col>
                <Col>
                    <Button type="primary" onClick={this.showConfirm}>Purge</Button>
                </Col>
            </Row>

        </Card>)
    }
}

RabbitMQ.propTypes = {
    selectedBeacon: PropTypes.shape({
        beacon_id: PropTypes.string,
        imei: PropTypes.string,
        phone: PropTypes.string,
        archived: PropTypes.bool
    })
}

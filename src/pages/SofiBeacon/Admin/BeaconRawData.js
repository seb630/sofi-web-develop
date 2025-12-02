import { Component } from 'react'
import { Card } from 'antd'
import PropTypes from 'prop-types'

class BeaconRawDataCard extends Component {

    render() {
        const { rawData, title, receivedTime } = this.props
        return (<Card className="beacon-card" title={title}>
            <p>Server received at: {receivedTime} (in your timezone)</p>
            <p>Data: {rawData}</p>
        </Card>)
    }
}

BeaconRawDataCard.propTypes = {
    rawData: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.string]),
    title: PropTypes.string,
    receivedTime:PropTypes.string,
}

export default (BeaconRawDataCard)

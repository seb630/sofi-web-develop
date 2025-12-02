import { Component } from 'react'
import { connect } from 'mirrorx'
import { Card, Col, Row } from 'antd'
import { generate4gIcon, generateWifiIcon } from '@/utility/Common'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    network: state.hub.network
})

class Current extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        if (this.props.network) {
            const {network} = this.props
            const icon4g = generate4gIcon(network.mobile_signal_level)
            const iconWifi = generateWifiIcon(network.wifi_signal_level)
            const mobileType = network.config.mobile_stat.network_type && network.config.mobile_stat.network_type.split('_').join('').trimLeft()
            return (
                <Row type="flex" justify="center">
                    <Col xs={22} xl={16}>
                        <Card className="beacon-card">

                            <label>This {globalConstants.HUB_SOFIHUB} is currently connected to:</label>

                            <p>{mobileType} {icon4g} &nbsp; {network.wifi_ssid && <span>Wi-Fi {iconWifi}</span>} &nbsp; {network.wifi_ssid ?
                                <span>Currently connected to network &quot;<b>{network.wifi_ssid}</b>&quot;</span> :
                                'Not connected to any Wi-Fi network'}</p>

                            {network.wifi_ssid ? <p>We&#39;re currently using Wi-Fi as the primary source of communication, we&#39;ll use 4G
                                    if we can&#39;t connect to Wi-Fi or if something is wrong.</p> :
                                <p>We&#39;re currently using 4G as no available Wi-Fi networks are in range.</p>
                            }

                        </Card>
                    </Col>
                </Row>
            )
        }else return null
    }
}

export default connect(mapStateToProps,{})(Current)

import { Component } from 'react'
import { BellOutlined, NotificationOutlined } from '@ant-design/icons'
import { Card, Col, Row } from 'antd'
import { actions } from 'mirrorx'
import { globalConstants } from '@/_constants'

export default class OtherNotifications extends Component {

    render() {
        return (
            <Row type="flex" justify="center">
                <Col xs={22} lg={16}>
                    <Card className="advanced_block" title="Anomalies">
                        <Row type="flex" justify="center" gutter={24} align="middle">
                            <Col xs={4} md={3} align="center" >
                                <BellOutlined style={{fontSize: 40}} />
                            </Col>
                            <Col xs={20} md={21}>
                                As a carer you will always be notified by SMS if enabled anomalies are triggered. To see historical anomalies please go to
                                the <a onClick={()=>actions.routing.push('/alerts')}>anomalies tab</a>. If you want to change anomaly settings please go to
                                the <a onClick={()=>actions.routing.push('/settings/anomaly')}>anomaly tab under the settings page</a>.
                            </Col>
                        </Row>
                    </Card>

                    <Card className="advanced_block" title="Other Events">
                        <Row type="flex" justify="center" gutter={24} align="middle">
                            <Col xs={4} md={3} align="center" >
                                <NotificationOutlined style={{fontSize: 40}} />
                            </Col>
                            <Col xs={20} md={21}>
                                We can let you know if we notice that battery levels of your sensors or hub are low, or if the {globalConstants.HUB_SOFIHUB} has gone offline if you&#39;d like.
                                Head on over to the <a onClick={()=>actions.routing.push('/settings/notification')}>notification tab under the settings page</a> to see
                                the full list of events we can notify you about.
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        )
    }
}

import { Col, Row } from 'antd'
import { Link } from 'mirrorx'
import { ExclamationCircleOutlined } from '@ant-design/icons'

const AnomalyBanner = (props) => {
    const {title, content} = props
    return (
        <div className="dashboard_alert">
            <div className="urgent_alert alerts">
                <Row className="alert_title" align="middle">
                    <Col flex="auto">
                        <Link to='/beacon/alerts'>
                            <Row><Col><ExclamationCircleOutlined/></Col>
                                <Col>
                                    <div className="alert_title">{title}</div>
                                    <div className="alert_content">{content}
                                    </div>
                                </Col>
                            </Row>
                        </Link>

                    </Col>
                    <Col flex="150px" className="text-right">
                        <Link to='/beacon/alerts'>Learn More</Link>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default AnomalyBanner

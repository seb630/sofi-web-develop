import { Link } from 'mirrorx'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Col, Row } from 'antd'

const Anomalies = (props) => {
    const { selectedRadar } = props
    if (selectedRadar.in_fallen_down) {
        return (
            <div className="dashboard_alert">
                <div className="urgent_alert alerts">
                    <Row className="alert_title" align="bottom">
                        <Col xs={24} lg={18}>
                            <Link to='/radar/histories'>
                                <ExclamationCircleOutlined />
                                    A fall was detected and your attention is need.
                            </Link>
                        </Col>
                        <Col xs={24} lg={6} className="text-right">
                            <Link to='/radar/histories'>Learn More</Link>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }else return (<div/>)
}

export default Anomalies

import { Link } from 'mirrorx'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Row, Col } from 'antd'

const Anomalies = (props) => {
    const { anomalies } = props
    if (anomalies.length > 0 && anomalies.find((item) => item.status !== 'RESOLVED')) {
        return (
            <div className="dashboard_alert">
                <div className="urgent_alert alerts">
                    <Row className="alert_title">
                        <Col xs={24} lg={18}>
                            <Link to='/alerts'>
                                <ExclamationCircleOutlined />
                                    There is an urgent alert that cannot be dismissed and needs your attention.
                            </Link>
                        </Col>
                        <Col xs={24} lg={6} className="text-right">
                            <Link to='/alerts'> Learn More</Link>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }else return (<div/>)
}

export default Anomalies

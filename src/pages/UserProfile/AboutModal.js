import { Button, Col, Modal, Row } from 'antd'
import Logo from '../../images/logo.svg'
import moment from 'moment'

const About = props => {
    return (
        <Modal
            title="About"
            open={props.open}
            onCancel={props.onClose}
            footer={null}
        >
            <Row>
                <Col span={24}>
                    <div className="about_img">
                        <Logo width={230} height={120}/>
                    </div>
                    <div className="versions">
                        <ul>
                            <li>Portal Version: {process.env.APP_VERSION}</li>
                            <li>API Version: {props.apiVersion}</li>
                        </ul>
                    </div>
                </Col>
            </Row>
            <hr />
            <Row>
                <Col span={12} className="copy_right">
                    <span>Copyright ©Sofihub {moment().year()}</span>
                </Col>
                <Col span={12} className="footer_btn">
                    <Button key="back" onClick={props.onClose}>Close</Button>
                </Col>
            </Row>
        </Modal>
    )
}


export default About

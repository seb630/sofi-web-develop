import { Button, Col, message, Row } from 'antd'
import { AlertOutlined, RetweetOutlined } from '@ant-design/icons'
import { actions } from 'mirrorx'

const radarActions = (props) => {

    const {selectedRadar} = props
    const handleReboot = () => {
        actions.radar.rebootRadar(selectedRadar.id).then(()=>message.success('Reboot success!'))
    }

    const handleTestFall = () =>{
        actions.radar.sendTestFall(selectedRadar.id).then(()=>message.success('Test fall sent!'))
    }

    const handleTestActivation = () =>{
        actions.radar.sendTestActivation(selectedRadar.id).then(()=>message.success('Test activation sent!'))
    }

    return (
        <Row gutter={24}>
            <Col offset={2} span={5}>
                <Button icon={<RetweetOutlined />} onClick={handleReboot} disabled>Reboot Sensor</Button>
            </Col>
            <Col span={5}>
                <Button icon={<AlertOutlined />} onClick={handleTestFall}>Send a test fall</Button>
            </Col>
            <Col span={5}>
                <Button icon={<AlertOutlined />} onClick={handleTestActivation} disabled>Send a test activation</Button>
            </Col>
        </Row>
    )
}

export default radarActions

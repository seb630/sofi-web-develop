import { Button, Card, Col, message, Row } from 'antd'
import { actions } from 'mirrorx'
import { globalConstants } from '@/_constants'
import { titleCase } from 'change-case'

const RadarActionCard = (props) => {

    const {selectedRadar} = props

    const handleConfig = () => {
        const payload = {
            id: selectedRadar.id,
            command_type: 'GET_CONFIG'
        }
        actions.radar.createRadarCommand(payload).then(()=> {
            actions.radar.fetchRadarCommands(selectedRadar.id)
            message.success('Configuration request success!')
        })
    }

    const handleReboot = () => {
        const payload = {
            id: selectedRadar.id,
            command_type: 'REBOOT'
        }
        actions.radar.createRadarCommand(payload).then(()=>{
            actions.radar.fetchRadarCommands(selectedRadar.id)
            message.success('Reboot success!')
        })
    }

    const handleClear = () => {
        const payload = {
            id: selectedRadar.id,
            command_type: 'CLEAR'
        }
        actions.radar.createRadarCommand(payload).then(()=>{
            actions.radar.fetchRadarCommands(selectedRadar.id)
            message.success('Clear success!')
        })
    }


    const handleTestFall = () =>{
        actions.radar.sendTestFall(selectedRadar.id).then(()=>message.success('Test fall sent!'))
    }

    const handleTestActivation = () =>{
        actions.radar.sendTestActivation(selectedRadar.id).then(()=>message.success('Test activation sent!'))
    }

    return (
        <Card title={`Query ${globalConstants.RADAR_GENERIC} / ${globalConstants.RADAR_GENERIC} Actions`} className="margin-bottom">
            <Row gutter={[24,12]}>
                <Col>
                    <Button type="primary"  onClick={handleConfig} disabled>Get Configuration</Button>
                </Col>
                <Col>
                    <Button type="primary"  onClick={handleReboot} disabled>Reboot {titleCase(globalConstants.RADAR_GENERIC)}</Button>
                </Col>
                <Col>
                    <Button type="primary"  onClick={handleClear} disabled>Clear {titleCase(globalConstants.RADAR_GENERIC)}</Button>
                </Col>
                <Col>
                    <Button type="primary"  onClick={handleTestFall}>Send Test Fall</Button>
                </Col>
                <Col>
                    <Button type="primary"  onClick={handleTestActivation} disabled>Send Test Activation</Button>
                </Col>
            </Row>
        </Card>

    )
}

export default RadarActionCard

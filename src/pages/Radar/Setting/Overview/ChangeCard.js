import { Button, Card, Col, Row } from 'antd'
import PropTypes from 'prop-types'

const ChangeCard = (props) => {
    return <Card title="Need to make some changes?">
        <Row align="middle" justify="center" type="flex" className="margin-bottom" gutter={[16,16]}>
            <Col className="zeroPadding">
                <Button
                    style={{height: 'auto',whiteSpace:'normal'}}
                    onClick={()=>props.onTabChanged('general')}>Have you repositioned the sensor?</Button>
            </Col>
            {/*<Col className="zeroPadding">*/}
            {/*    <Button*/}
            {/*        style={{height: 'auto',whiteSpace:'normal'}}*/}
            {/*        onClick={()=>props.onTabChanged('general', 'bottom')}>Change Fall Detection Settings</Button>*/}
            {/*</Col>*/}
            {/*<Col className="zeroPadding">*/}
            {/*    <Button*/}
            {/*        style={{height: 'auto',whiteSpace:'normal'}}*/}
            {/*        onClick={()=>props.onTabChanged('general', 'calibrate')}>Calibrate or Recalibrate {globalConstants.RADAR_HOBA}</Button>*/}
            {/*</Col>*/}
            {/*<Col className="zeroPadding">*/}
            {/*    <Button*/}
            {/*        style={{height: 'auto',whiteSpace:'normal'}}*/}
            {/*        onClick={()=>props.onTabChanged('objectsFurniture')}>Add/Edit Objects/Furniture</Button>*/}
            {/*</Col>*/}
        </Row>
    </Card>
}

ChangeCard.propTypes={
    onTabChanged: PropTypes.func.isRequired
}

export default ChangeCard

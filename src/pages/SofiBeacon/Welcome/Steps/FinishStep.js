import { CheckCircleOutlined } from '@ant-design/icons'
import { Button, Col, Row } from 'antd'

const finishStep = (prev, done) =>{
    const title = 'Done'
    const content = <div className="wizardContent">
        <h4>You&#39;re all done!</h4>
        <CheckCircleOutlined className="finishCheckCircle" />
        <p>Anything you&#39;ve set up in this wizard you can update at any time in the portal, you can do so using the menu or the
            settings. We suggest you also test the SOS button and fall detection to make sure they are set up correctly - don&#39;t forget
            to let your emergency contacts know you&#39;re testing first!
        </p>
    </div>
    const action = <Row><Col span={24}><Button style={{ marginLeft: 8 }} onClick={prev}>
        Previous
    </Button>
    <Button
        type="primary"
        onClick={done}
        className="floatRight">Done</Button></Col>
    </Row>

    return {title,content, action}
}

export default finishStep

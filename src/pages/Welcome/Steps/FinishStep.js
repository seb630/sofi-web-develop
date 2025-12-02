import { CheckCircleOutlined } from '@ant-design/icons'
import { Button, Col, Row } from 'antd'
import { Fragment } from 'react'

const finishStep = (prev, done) =>{
    const title = 'Done'
    const content = <Fragment><div className="wizardContent">
        <h4>You&#39;re all done!</h4>
        <CheckCircleOutlined className="finishCheckCircle" />
        <p>Anything you&#39;ve set up in this wizard you can update at any time in the portal, you can do so using the menu or the
            settings. We suggest you now take the time to position your sensors, making sure that they cannot be knocked off out of
            position easily, and that they are not positioned directly across from a door. You can change the name of sensors and the room
            they belong to in the settings page at any time.
        </p>
    </div>
    <Row><Col span={24}><Button style={{ marginLeft: 8 }} onClick={prev}>
        Previous
    </Button>
    <Button
        type="primary"
        onClick={done}
        className="floatRight">Done</Button></Col>
    </Row>
    </Fragment>
    return {title,content}
}

export default finishStep

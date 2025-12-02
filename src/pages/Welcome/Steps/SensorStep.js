import { Button, Col, Row } from 'antd'
import { Fragment } from 'react'
import SensorIcon from '../../../images/sensor_outline_green_icon.svg'
import { globalConstants } from '@/_constants'

const SensorStep = (next, prev) =>{

    const title = 'Sensors'
    const content = <Fragment><Row type="flex" gutter={24}>
        <Col xs={24} lg={6} className="wizardContent">
            <SensorIcon className="sensorImg"/>
        </Col>
        <Col xs={24} lg={18}>
            <h4>You can now put the sensors around your home</h4>
            <p>Not quite sure how to put sensors up? We have some resources to help.</p>
            <p>
                We have a how-to video for the {globalConstants.HUB_SOFIHUB} which you can
                find <a href="https://www.sofihub.com/how-to-videos" target="_blank" rel="noopener noreferrer">here</a>.
                It has some quick and handy information for installing sensors.
            </p>

            <p>We also recommend the more in-depth guide in the user manual which can be found
                on <a href="https://www.sofihub.com/" target="_blank" rel="noopener noreferrer">sofihub.com</a>, simply click on the &quot;Resources&quot; menu
            and then select the &quot;{globalConstants.HUB_SOFIHUB} User Guide&quot; option.</p>
        </Col>
    </Row>
    <Row><Col span={24}><Button style={{ marginLeft: 8 }} onClick={prev}>
            Previous
    </Button>
    <Button
        type="primary"
        onClick={next}
        className="floatRight">Next</Button></Col>
    </Row>
    </Fragment>

    return {title,content}
}

export default SensorStep

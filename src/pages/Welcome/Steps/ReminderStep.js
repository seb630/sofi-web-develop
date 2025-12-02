import { MessageOutlined } from '@ant-design/icons'
import { Button, Col, Row } from 'antd'
import { Fragment } from 'react'
import HubIcon from '../../../images/hub_icon.svg'
import { globalConstants } from '@/_constants'

const reminderStep = (settings, next, prev) =>{

    const title = 'Reminder'
    const firstName = settings && settings.resident_profile.first_name
    const content = <Fragment><Row type="flex" gutter={24}>
        <Col xs={24} lg={6} className="wizardContent">
            <HubIcon className="reminderImg"/>
            <MessageOutlined className="messageIcon" />
        </Col>
        <Col xs={24} lg={18}>
            <h4>The {globalConstants.HUB_SOFIHUB} also offers reminders.</h4>
            <p>When you create a reminder you can type out what the {globalConstants.HUB_SOFIHUB} should say. Let us know
                when it should play, and the {globalConstants.HUB_SOFIHUB} will speak to {firstName}.
            </p>
            <p>
                Some good reminders SOFIHUB recommends you add are:
            </p>
            <ul className="reminders_ul">
                <li>Taking the bins out</li>
                <li>Exercise</li>
                <li>Medication</li>
                <li>Hydration</li>
                <li>Group activities</li>
                <li>Arriving carers or staff</li>
                <li>Checking for new mail</li>
                <li>Switch on TV or radio for favourite programmes</li>
            </ul>
            <p>If you&#39;re not sure what will work for {firstName}, start off small with a handful of reminders and add more later.</p>
            <p>Reminders can be added, changed, and removed via the &quot;Reminders&quot; tab.</p>
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

export default reminderStep

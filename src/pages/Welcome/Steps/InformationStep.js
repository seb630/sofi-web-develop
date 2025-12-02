import { Button, Col, Row, Typography } from 'antd'
import { Fragment } from 'react'
import { globalConstants } from '@/_constants'

const {Paragraph, Text} = Typography
const InformationStep = (next, prev) =>{

    const title = 'Information'
    const content = <Fragment><Typography>
        <Paragraph>Before we continue we need to define some terms:</Paragraph>
        <Paragraph><Text strong>{globalConstants.HUB_SOFIHUB} User</Text>  - this is the person who will be using the hub on a daily basis</Paragraph>
        <Paragraph><Text strong>Carer</Text>  - this is the person who the {globalConstants.HUB_SOFIHUB} will reach out to if you need assistance and can
        manage the hub via this portal and view things like reminders, and movement around the home</Paragraph>
        <Paragraph>
            A hub user can be a carer if they&#39;d like to manage their own device, BUT they should not be the only carer on the system!
            As the {globalConstants.HUB_SOFIHUB} needs to reach out to someone other than the hub user when assistance is needed.
        </Paragraph>

        <Paragraph>
            For example, Mary needs a {globalConstants.HUB_SOFIHUB} and she would like it to contact her daughter if she needed help as Mary&#39;s daughter lives nearby.
        </Paragraph>

        <Paragraph>
            In the above scenario: Mary is the {globalConstants.HUB_SOFIHUB} user, Mary&#39;s daughter is a carer - and Mary&#39;s daughter can manage the {globalConstants.HUB_SOFIHUB} via the portal.
        </Paragraph>

    </Typography>
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

export default InformationStep

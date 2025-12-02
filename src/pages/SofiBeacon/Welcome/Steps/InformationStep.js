import { Button, Col, Row } from 'antd'
import { globalConstants } from '@/_constants'

const informationStep = (next, prev, name) =>{
    const title = 'Information'
    const content = <div>
        <p>Before we continue we need to define some terms:</p>
        <ul>
            <li>
                <strong>{name} User</strong> - this is the person who will be using the {name} on a daily basis
            </li>
            <li>
                <strong>Emergency Contact</strong> - this is the person who will try to be react when the {name} user needs assistance
            </li>
            <li>
                <strong>Account Manager</strong> - this is the person who can manage the {name} via this portal and view things like location history
            </li>
        </ul>

        <p>A {name} user should not be an emergency contact! But they can be a account manager if they want to manage their own device. An emergency contact can also be a account manager or vice versa.</p>

        <p>For example, Mary needs a {name} and she would like it to contact her daughter if she needed help as Mary&#39;s daughter
            lives nearby. Mary isn&#39;t very confident with electronics but Mary has a granddaughter who is a whiz at that stuff - so Mary would love for her
            granddaughter to help them manage the {name}!</p>

        <p>In the above scenario: Mary is the {name} user, Mary&#39;s daughter is an emergency contact, and Mary&#39;s granddaughter is a account manager.</p>

    </div>
    const action = <Row><Col span={24}><Button style={{ marginLeft: 8 }} onClick={prev}>
        Previous
    </Button>
    <Button
        type="primary"
        onClick={next}
        className="floatRight">Next</Button></Col>
    </Row>
    return {title,content, action}
}

export default informationStep

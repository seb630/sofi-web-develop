import { Col, Row, Typography } from 'antd'
import { globalConstants } from '@/_constants'

const { Text, Paragraph } = Typography
const Intro = props => {
    return (
        <Row>
            <Col>
                <Typography>
                    <Text strong>Permissions & Roles & Security</Text>
                    <Paragraph>In this tab you can manage what the users in your organisation can see and do with resources in your organisation – for example you can restrict
                        or broaden the devices they can access (or see) as well as restrict or broaden the actions they can perform on those devices.</Paragraph>
                    <Paragraph>In order to manage what users can see and do you must allocate a user or a user group what&#39;s called a &quot;Policy&quot;.</Paragraph>
                    <Paragraph>A <a onClick={()=>props.onTabChanged('policies')}>Policy</a> consists of two components:</Paragraph>
                    <Paragraph><ul>
                        <li>
                            <a onClick={()=>props.onTabChanged('roles')}>Duty Roles</a>
                        </li>
                        <li>
                            <a onClick={()=>props.onTabChanged('profiles')}>Security Data Profiles</a>
                        </li>
                    </ul></Paragraph>
                    <Paragraph>A &quot;Duty Role&quot; is simply housing a collection of &quot;Privileges&quot;. A &quot;Privilege&quot; dictates the action a user can perform.
                        A &quot;Duty Role&quot; can house more than one &quot;Privilege&quot; as a duty that someone performs in an organisation may require multiple privileges
                        to get the job done. For example, a staff member who&#39;s job may include the duty of performing administrative tasks on the system may have the
                        privileges associated with adding new staff to the organisation, removing existing staff, and reorganising staff into different groups – all of which
                        are separate privileges.</Paragraph>
                    <Paragraph>A &quot;Security Data Profile&quot; dictates what scope a &quot;Duty Role&quot; has on resources – in other words what are the limitations on the
                        user&#39;s privileges. Using a &quot;Security Data Profile&quot; you can dictate if a user can read and modify all devices that are part of an
                        organisation, or just a subset of devices, or to use the administrative example from above: does that staff member have access to all the staff that
                        belong to an organisation or just the staff that reside within a single region the organisation operates in.</Paragraph>
                    <Paragraph>Lets provide an example: there is a company which sells both {globalConstants.HUB_GENERIC}s and {globalConstants.PENDANT_GENERIC}s, they operate in Australia. Australia is quite a large country
                        and stretches across multiple time zones – because of this there are two support teams that operate in the country: one that operates on the east
                        coast, and the other that operates on the west coast.</Paragraph>
                    <Paragraph>Staff members who work as part of the support team, one of the duties as part of their job is to be able to answer questions and solve issues
                        regarding the {globalConstants.HUB_GENERIC}s and {globalConstants.PENDANT_GENERIC}s. This means there would be a &quot;Duty Role&quot; that could be called &quot;Support Staff&quot;, and the
                        &quot;Privileges&quot; associated with that &quot;Duty Role&quot; would include being able to access devices as well as modify them.</Paragraph>
                    <Paragraph>However the company wants to minimise the number of devices their support staff have access to for security reasons – they want the west coast
                        team to have access to only west coast devices, and likewise the east coast team should only have access to east coast devices. Using &quot;Security Data
                        Profiles&quot; they can reduce the number of devices each team can see so that only the west coast can see west coast devices, and likewise the east
                        coast can only see the east coast devices.</Paragraph>
                    <Paragraph>In order to tie the two components together: the &quot;Duty Role&quot; and the &quot;Security Data Profile&quot; the company also creates two
                        &quot;Policies&quot;: one called &quot;Support Staff West&quot; (which includes the &quot;Support Staff&quot; &quot;Duty Role&quot; paired with the west
                        coast &quot;Security Data Profile&quot;), and another called &quot;Support Staff East&quot; (which includes the very same &quot;Support Staff&quot;
                        &quot;Duty Role&quot; paired with the east coast &quot;Security Data Profile&quot;).</Paragraph>
                    <Paragraph>Now they can allocate each of the two policies either directly to users (their staff members), or to a &quot;User Group&quot; and then add the
                        corresponding team members into the correct &quot;User Groups&quot;.</Paragraph>
                </Typography>
            </Col>
        </Row>
    )
}


export default Intro

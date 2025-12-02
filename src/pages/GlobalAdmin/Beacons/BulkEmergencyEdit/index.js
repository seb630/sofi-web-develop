import { Button, Card, Col, Form, Input, message, Modal, Row, Table, Typography } from 'antd'
import { Fragment, useEffect, useState } from 'react'
import { actions } from 'mirrorx'
import { globalConstants } from '@/_constants'
import { titleCase } from 'change-case'

const { Title,Paragraph, Text } = Typography

const BulkEmergencyEdit = () => {
    const [result, setResult] = useState()
    const [step, setStep] = useState(1)
    const [selectedKeys, setSelectedKeys] = useState([])
    const onSearch = (values) => {
        actions.sofiBeacon.fetchEmergencyContactsByNumber({
            name: values.name,
            number: values.number.replace('+','%2B')
        }).then(res=>{
            setResult(res)
            setSelectedKeys([])
            setStep(2)
        })
    }

    useEffect(()=>Modal.warn({
        title:'This feature is now deprecated',
        content: 'But it has been replaced with the \'Bulk Advanced Changes to Existing Pendants\' page which lets you replace emergency contacts in mass',
        okText: 'Take me there',
        onOk: ()=> actions.routing.push('/globalAdmin/bulk-phone-setting')
    }),[])

    const handleUpdate = (values) => {
        const payload = {
            number: values.new_number,
            contacts: result.filter(item=>selectedKeys.includes(item.key))
        }
        actions.sofiBeacon.UpdateBulkEmergencyContacts(payload).then(()=>{
            Modal.success({
                title: 'Your changes have been saved',
                content: `Please note it may take some time for the ${globalConstants.PENDANT_GENERIC}s to accept these changes. Any ${globalConstants.PENDANT_GENERIC}s outside of reception range or that have flat batteries will accept the changes when they appear back online`
            })
            setStep(1)
            setResult(null)
            setSelectedKeys([])
        }, ()=> message.error(globalConstants.WENT_WRONG))
    }

    const columns = [
        {
            title: `${titleCase(globalConstants.PENDANT_GENERIC)} Details`,
            children: [{
                title: 'Display name',
                dataIndex: 'display_name',
                key: 'display_name'
            },{
                title: 'IMEI',
                dataIndex: 'imei',
                key: 'imei'
            }]
        },
        {
            title: 'Emergency Contact Details',
            children: [{
                title: 'Contact Position',
                dataIndex: 'index',
                key: 'index'
            },{
                title: 'Contact Name',
                dataIndex: 'name',
                key: 'name'
            },]
        }
    ]

    const rowSelection = {
        selectedKeys,
        onChange: keys => setSelectedKeys(keys)
    }

    return (
        <Card title="Bulk Basic Emergency Contact Update">
            <Paragraph>
                This feature lets you edit an existing emergency contact entry across multiple beacons. The way it works is as follows:
            </Paragraph>
            <ul>
                <li>
                    Search for the emergency contact to update, you must provide a mobile phone number and optionally a contact name.
                </li>
                <li>
                    The system will return emergency contacts that match the phone number and optionally the name of the contact.
                </li>
                <li>
                    Select the beacons you want to update, and submit.
                </li>
            </ul>
            <Paragraph>
                <Text strong>Important:</Text> Emergency contact updates can take some time before the {globalConstants.PENDANT_GENERIC} accepts
                the changes. To speed up the process ensure the {globalConstants.PENDANT_GENERIC}s in question are switched on and are in strong
                cellular reception range.
            </Paragraph>
            <Paragraph>
                <Text strong type="danger">Warning:</Text> It&#39;s very important to make sure you are editing the
                correct contacts! SOFIHUB strongly recommends searching by mobile number AND contact name. Consider the
                following scenario:
            </Paragraph>
            <Paragraph>
                Bob has a mobile number, it is 0400 000 001. Betty has a mobile number 0400 000 002. Both Bob and Betty
                are emergency contacts for multiple beacons. There was a mistake and a tem member for a small amount of
                beacons listed the incorrect number for Bob, they wrote 0400 000 002 which is Betty&#39;s number.
            </Paragraph>
            <Paragraph>
                Using the bulk update and searching for just the mobile number in the above scenario would impact all
                of Betty&#39;s correctly set contacts if a search is not done by mobile number and contact name.
            </Paragraph>
            <Title level={5}>
                1. Search emergency contacts:
            </Title>
            <Form layout="inline" autoComplete="off" onFinish={onSearch}>
                <Form.Item
                    label="Number"
                    name="number"
                    help={<Fragment><div>Number must be ISO standard,</div><div> eg: +61400123456</div></Fragment>}
                    rules={[{ required: true, message: 'Please input the mobile number!' }]}
                >
                    <Input placeholder="eg: +61400123456"/>
                </Form.Item>
                <Form.Item
                    label="Contact name"
                    name="name"
                >
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Search
                    </Button>
                </Form.Item>
            </Form>
            {step>1 && <Fragment>
                <Title level={5}>
                    2. Select emergency contacts to update:
                </Title>
                <Table
                    size="small"
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={result}
                    key="key"
                    pagination={false}
                    className="margin-bottom"
                />
            </Fragment>}
            {selectedKeys.length>0 && <Fragment>
                <Title level={5}>
                    3. Tell up the new number:
                </Title>
                <Form autoComplete="off" onFinish={handleUpdate}>
                    <Form.Item
                        className="margin-bottom"
                        label="New Number"
                        name="new_number"
                        help="Number must be ISO standard, eg: +61400123456"
                        rules={[{ required: true, message: 'Please input the new number!' }]}
                    >
                        <Input
                            placeholder="EG: +61400123456"
                            style={{width:300}}
                        />
                    </Form.Item>
                    <Title level={5}>
                    4. Update selected contacts:
                    </Title>
                    <Row align="middle">
                        <Col flex="1 1 200px">
                        You have selected {selectedKeys.length} of contacts to update from result total of {result?.length}.
                        Are you sure you wish to update all of these emergency contacts?
                        </Col>
                        <Col flex="0 1 250px">
                            <Button type="primary" size="large" htmlType="submit">
                            Update Selected Emergency Contacts
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Fragment>}
        </Card>
    )
}

export default BulkEmergencyEdit

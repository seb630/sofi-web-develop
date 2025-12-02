import { Button, Col, Form, Input, Radio, Row, Select, Space, Typography } from 'antd'
import useSWR from 'swr'
import { actions } from 'mirrorx'
import {pickBy, identity} from 'lodash'

const BeaconFilters = (props) => {
    const {filter, orgs} = props
    const [form] = Form.useForm()

    const orgId = Form.useWatch('org_id', form)
    const fetcher = (id) => actions.organisation.fetchOrgDeviceGroups(id)

    const { data: orgGroups } = useSWR(orgId, fetcher)

    const handleFinish = (value) => {
        const payload = pickBy(value, identity)
        filter(payload)
    }

    const handleReset = () => {
        form.resetFields()
        filter({})
    }

    const handleOrgChange = () => {
        form.setFieldValue('device_group_id', null)
    }

    let orgOptions = orgs?.map(org=><Select.Option key={org.organization_id} value={org.organization_id}>{org.name}</Select.Option>)

    orgOptions?.unshift( <Select.Option key={'null'} value={''}>No Organisation</Select.Option>)

    let orgGroupsOptions = orgGroups?.map(group=><Select.Option key={group.organization_device_group_id} value={group.organization_device_group_id}>{group.name}</Select.Option>)

    orgGroupsOptions?.unshift( <Select.Option key={'null'} value={''}>No Device Group</Select.Option>)

    return <Space direction="vertical">
        <Typography.Text>
            Filters - Show only devices which match:
        </Typography.Text>
        <Form form={form} layout="vertical" onFinish={handleFinish} className="vertical-form-label-nowrap" preserve={false}>
            <Row gutter={[12,20]}>
                <Col span={12}>
                    <Form.Item name="imei" label='IMEI (partial match or whole)'>
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="mobile" label='Mobile number (partial match or whole)'>
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="display_name" label='Display name (partial match or whole)'>
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="beacon_status" label='Status: Online/Offline'>
                        <Radio.Group>
                            <Radio value="">All</Radio>
                            <Radio value="ONLINE">Online</Radio>
                            <Radio value="OFFLINE">Offline</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={[12,20]}>
                <Col span={12}>
                    <Form.Item name="ec_number" label='Emergency contact NUMBER (exact match)'>
                        <Input/>
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item name="ec_name" label='Emergency contact NAME (exact match)'>
                        <Input/>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={[12,20]}>
                <Col span={12}>
                    <Form.Item name="org_id" label='Organisation'>
                        <Select onChange={handleOrgChange}>
                            {orgOptions}
                        </Select>
                    </Form.Item>
                </Col>
                {orgId &&
                <Col span={12}>
                    <Form.Item name="device_group_id" label='Organisation device group'>
                        <Select>
                            {orgGroupsOptions}
                        </Select>
                    </Form.Item>
                </Col>
                }
            </Row>
            <Row gutter={[12,20]} justify="end">
                <Col>
                    <Button onClick={handleReset}>
                        Reset
                    </Button>
                </Col>
                <Col>
                    <Button htmlType="submit" type="primary">
                        Filter
                    </Button>
                </Col>
            </Row>
        </Form>
    </Space>
}

export default BeaconFilters

import { Button, Col, DatePicker, Form, Input, Row, Select, Space, Typography } from 'antd'
import useSWR from 'swr'
import { actions } from 'mirrorx'
import {pickBy, identity} from 'lodash'
import { globalConstants } from '@/_constants'
import moment from 'moment'


const BeaconFilters = (props) => {
    const {filter, providers, setSearchParams} = props
    const [form] = Form.useForm()

    const providerName = Form.useWatch('sim_provider', form)
    const fetcher = (name) => actions.SIM.fetchCarriers(name)
    const { data: carriers } = useSWR(providerName, fetcher)

    const handleFinish = (value) => {
        const payload = pickBy(value, identity)
        if (value?.last_seen_by_cloud){
            payload.last_seen_by_cloud = moment(value.last_seen_by_cloud).format('YYYY-MM-DD HH:mm')
        }
        filter(payload)
        setSearchParams(payload)
    }

    const handleReset = () => {
        form.resetFields()
        filter({})
        setSearchParams({})
    }

    return <Space direction="vertical">
        <Typography.Text>
            Filters - Show only records which match:
        </Typography.Text>
        <Form form={form} layout="vertical" onFinish={handleFinish} className="vertical-form-label-nowrap" preserve={false}>
            <Row gutter={[12,20]} style={{width: '100%', maxWidth:'1200px'}}>
                <Col span={12}>
                    <Form.Item name="username" label='Email'>
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="user_mobile" label='User Mobile number (partial match or whole)'>
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="user_first_name" label='User First Name'>
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="user_last_name" label='User Last Name'>
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="device_type" label='Product Type'>
                        <Select
                            allowClear={true}
                            options={[
                                {
                                    label: globalConstants.HUB_SOFIHUB, value: 'HUB'
                                },{
                                    label: globalConstants.BEACON_SOFIHUB, value: 'BEACON'
                                },{
                                    label: globalConstants.RADAR_HOBA, value: 'RADAR'
                                }]}/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="last_seen_by_cloud" label='Last seen by cloud'>
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm"
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="device_status" label='Device Status'>
                        <Select
                            allowClear={true}
                            options={[{
                                label: 'Online', value: 'ONLINE'
                            },{
                                label: 'Offline', value: 'OFFLINE'
                            }]}/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="device_mac_or_imei" label='MAC / IMEI (partial match or whole)'>
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="display_name" label='Display Name (partial match or whole)'>
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="device_first_name" label='Device First Name'>
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="device_last_name" label='Device Last Name'>
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="device_phone_number" label='Device Phone Number'>
                        <Input/>
                    </Form.Item>
                </Col>
                {providers?.length>0 && <>
                    <Col span={12}>
                        <Form.Item name="sim_status" label='SIM Status'>
                            <Select
                                allowClear={true}
                                options={[{
                                    label: 'Active', value: 'ACTIVE'
                                },{
                                    label: 'Not Active', value: 'NOT_ACTIVE'
                                }]}/>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="sim_ext_status " label='SIM External Status'>
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="sim_provider" label='SIM Provider'>
                            <Select
                                allowClear={true}
                                options={providers?.map(provider=>({
                                    label: provider.label,
                                    value: provider.name
                                }))}/>
                        </Form.Item>
                    </Col>
                    {providerName && <Col span={12}>
                        <Form.Item name="sim_carrier" label='SIM Carrier'>
                            <Select
                                allowClear={true}
                                options={carriers?.map(carrier=>({
                                    label: carrier.label,
                                    value: carrier.name
                                }))}/>
                        </Form.Item>
                    </Col>
                    }
                </>}
            </Row>
            <Row gutter={[12,20]} justify="start">
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

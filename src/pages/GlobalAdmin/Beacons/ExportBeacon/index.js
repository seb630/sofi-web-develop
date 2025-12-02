import { Button, Col, Form, Input, message, Row, Select, Space, Typography } from 'antd'
import { actions, connect } from 'mirrorx'
import {pickBy, identity} from 'lodash'
import { useEffect, useState } from 'react'
import BeaconService from '@/services/Beacon'
import FileSaver from 'file-saver'

const mapStateToProps = state => ({
    beaconModels: state.sofiBeacon.beaconModels,
    orgs: state.organisation.orgs,
    selectedOrg:state.organisation.selectedOrg
})


const ExportBeacon = (props) => {
    const { beaconModels, orgs, selectedOrg } = props
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()

    useEffect(()=>{
        actions.sofiBeacon.getBeaconModels()
        actions.organisation.fetchAllOrgs()
    },[])

    const handleFinish = (value) => {
        setLoading(true)
        const payload = pickBy(value, identity)
        BeaconService.postFilteredBeaconsExport(payload).then(file => {
            FileSaver.saveAs(file, 'ExportData.xlsx')
            setLoading(false)
        }).catch(() => message.error('You are unauthorized to access this functionality'))
    }

    const handleReset = () => {
        form.resetFields()
    }

    const beaconModelOptions = beaconModels?.map(model=>({
        label: model.name,
        value: model.name
    }))

    const orgOptions = orgs?.map(org=>({
        label: org.name,
        value: org.organization_id
    }))

    return <Space direction="vertical">
        <Typography.Text>
            Filters - Download only records which match:
        </Typography.Text>
        <Form form={form} layout="vertical" onFinish={handleFinish} className="vertical-form-label-nowrap" preserve={false}>
            <Row gutter={[12,20]} style={{width: '100%', maxWidth:'1200px'}}>
                <Col span={12}>
                    <Form.Item name="beacon_ids" label='Beacon IDs'>
                        <Select
                            mode="tags"
                            style={{ width: '100%' }}
                            options={[]}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="imei" label='IMEI'>
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="phone" label='Beacon Phone Number'>
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="display_name" label='Display Name'>
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="model" label='Model'>
                        <Select
                            allowClear={true}
                            options={beaconModelOptions}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="beacon_status" label='Device Status'>
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
                    <Form.Item name="ec_number" label='Emergency Contact Number'>
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="ec_name" label='Emergency Contact Name'>
                        <Input/>
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item name="org_id" label='Organisation' initialValue={selectedOrg?.organization_id}>
                        <Select
                            allowClear={true}
                            options={orgOptions}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="org_name" label='Organisation Name'>
                        <Input/>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={[12,20]} justify="start">
                <Col>
                    <Button onClick={handleReset}>
                        Reset
                    </Button>
                </Col>
                <Col>
                    <Button htmlType="submit" type="primary" loading={loading}>
                        Download
                    </Button>
                </Col>
            </Row>
        </Form>
    </Space>
}

export default connect(mapStateToProps, null) (ExportBeacon)

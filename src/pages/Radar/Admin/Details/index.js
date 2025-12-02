import { Component, createRef } from 'react'
import { actions, connect } from 'mirrorx'
import {Button, Card, Col, Form, Input, message, Row, Select, Spin} from 'antd'
import { globalConstants } from '@/_constants'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { CopyOutlined } from '@ant-design/icons'
import {buildTimezoneOptions} from '@/utility/Countries'

const mapStateToProps = state => ({
    selectedRadar: state.radar.selectedRadar,
})

class RadarAdminDetails extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isDirty: false,
            isSubmitting: false
        }
    }

    formRef = createRef()

    componentDidUpdate(prevProps) {
        prevProps.selectedRadar !== this.props.selectedRadar &&
        this.formRef.current.setFieldsValue({
            radarId: this.props.selectedRadar?.id,
            displayName: this.props.selectedRadar.display_name,
            sensorId: this.props.selectedRadar.pub_id,
            ...this.props.selectedRadar
        })
    }

    /** set Dirty */
    setDirty(value) {
        this.setState({
            isDirty: value
        })
    }

    /** save beacon card */
    save = (values) => {
        let data = {
            ...values,
            id: this.props.selectedRadar.id,
            display_name: values.displayName,
        }
        this.setState({ isSubmitting: true })
        actions.radar.saveRadarInfo(data).then(() => {
            this.setState({ isSubmitting: false })
            message.success('Saved successfully !!',3)
        }).catch(err => {
            this.setState({ isSubmitting: false })
            err.global_errors.forEach(e => {
                message.error(e.message,3)
            })
        })
        this.setDirty(false)
    }

    render() {
        const { selectedRadar } = this.props
        const timezones = buildTimezoneOptions()
        const formItemLayout = {
            labelCol: { span: 8},
            wrapperCol: { span: 12},
        }
        // const macAddress = this.formRef?.current?.getFieldValue('macAddress')||selectedRadar?.mac_address
        return (
            <Card
                className="beacon-card"
                title={`${globalConstants.RADAR_HOBA}`}
            >
                <Spin spinning={this.state.isSubmitting} delay={500}>
                    <Form
                        {...formItemLayout}
                        ref={this.formRef}
                        initialValues={{
                            ...selectedRadar,
                            radarId: selectedRadar?.id,
                            displayName: selectedRadar?.display_name,
                            sensorId: selectedRadar?.pub_id,
                            version: selectedRadar?.fw_version
                        }}
                        onFinish={this.save}
                        scrollToFirstError
                    >
                        <Form.Item
                            label={`${globalConstants.RADAR_HOBA} ID`}
                            name="radarId"
                        >
                            <Input
                                disabled
                                addonAfter={<CopyToClipboard options={{format: 'text/plain'}}
                                    text={selectedRadar?.id}
                                    onCopy={()=>message.success('Copied')}
                                >
                                    <CopyOutlined /></CopyToClipboard>}/>
                        </Form.Item>

                        <Form.Item
                            label="Display Name"
                            name="displayName"
                            rules={[{required: true, message: 'Please enter display name!'}]}>
                            <Input
                                maxLength={globalConstants.INPUT_MAX_LENGTH}
                                onChange={() => {this.setDirty(true)}}
                                addonAfter={<CopyToClipboard options={{format: 'text/plain'}}
                                    text={this.formRef?.current?.getFieldValue('displayName')||selectedRadar?.display_name}
                                    onCopy={()=>message.success('Copied')}
                                >
                                    <CopyOutlined /></CopyToClipboard>}
                            />
                        </Form.Item>
                        <Form.Item
                            name="location"
                            label="Location"
                        >
                            <Input
                                onChange={() => {this.setDirty(true)}}
                                addonAfter={<CopyToClipboard options={{format: 'text/plain'}}
                                    text={selectedRadar?.location}
                                    onCopy={()=>message.success('Copied')}
                                >
                                    <CopyOutlined /></CopyToClipboard>}/>
                        </Form.Item>

                        <Form.Item
                            name="timezone"
                            label="Timezone"
                        >
                            <Select
                                onChange={() => {this.setDirty(true)}}
                                style={{minWidth: 200}}
                                showSearch
                                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            >
                                {timezones}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Sensor ID"
                            name="sensorId"
                        >
                            <Input disabled addonAfter={<CopyToClipboard options={{format: 'text/plain'}}
                                text={selectedRadar?.pub_id}
                                onCopy={()=>message.success('Copied')}
                            >
                                <CopyOutlined /></CopyToClipboard>}/>
                        </Form.Item>
                        <Form.Item
                            name="ext_id"
                            label="External ID"
                        >
                            <Input
                                onChange={() => {this.setDirty(true)}}
                                addonAfter={<CopyToClipboard options={{format: 'text/plain'}}
                                    text={selectedRadar?.ext_id}
                                    onCopy={()=>message.success('Copied')}
                                >
                                    <CopyOutlined /></CopyToClipboard>}/>
                        </Form.Item>

                        <Form.Item
                            label="Version"
                            name="version"
                        >
                            <Input disabled addonAfter={<CopyToClipboard options={{format: 'text/plain'}}
                                text={selectedRadar?.version}
                                onCopy={()=>message.success('Copied')}
                            >
                                <CopyOutlined /></CopyToClipboard>}/>
                        </Form.Item>
                        <Row>
                            <Col lg={14}/>
                            <Col lg={10} className="beacon-buttonGroup">
                                <Button type="primary" disabled={!this.state.isDirty} htmlType="submit">Save</Button>
                            </Col>
                        </Row>
                    </Form>
                </Spin>
            </Card>
        )
    }
}

export default connect(mapStateToProps,{})(RadarAdminDetails)

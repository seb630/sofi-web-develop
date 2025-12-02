import { Component, createRef } from 'react'
import { actions, connect } from 'mirrorx'
import _ from 'lodash'
import { Button, Card, Col, Form, Input, message, Row, Spin } from 'antd'
import { globalConstants } from '@/_constants'
import { isWatch } from '@/utility/Common'

const mapStateToProps = state => ({
    selectedBeacon: state.sofiBeacon.selectedBeacon,
})

class BeaconInforCard extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isDirty: false,
            isSubmitting: false
        }
    }

    formRef = createRef()

    componentDidUpdate(prevProps) {
        prevProps.selectedBeacon !== this.props.selectedBeacon &&
            this.formRef.current.setFieldsValue({
                beaconName: this.props.selectedBeacon.display_name,
                firstName: this.props.selectedBeacon.first_name,
                lastName: this.props.selectedBeacon.last_name,
            })
    }

    componentDidCatch(error, errorInfo) {
        console.error(error)
        console.error(errorInfo)
    }

    /** set Dirty */
    setDirty(value) {
        this.setState({
            isDirty: value
        })
    }

    /** save beacon card */
    save = (values) => {
        let data = _.extend({}, this.props.selectedBeacon, {
            display_name: values.beaconName,
            first_name: values.firstName,
            last_name: values.lastName
        })
        this.setState({ isSubmitting: true })
        actions.sofiBeacon.saveBeaconInfor(data).then(() => {
            this.setState({ isSubmitting: false })
            message.success('Saved successfully !!', 3)
        }).catch(err => {
            this.setState({ isSubmitting: false })
            err.global_errors.forEach(e => {
                message.error(e.message, 3)
            })
        })
        this.setDirty(false)
    }

    render() {
        const { selectedBeacon } = this.props
        const formItemLayout = {
            labelCol: { span: 8, offset: 2 },
            wrapperCol: { span: 8 },
        }

        const title = (isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : 'Beacon') + ' Settings'
        return (
            <Card className="beacon-card" id="beaconInfoCard" title={title}>
                <Spin spinning={this.state.isSubmitting} delay={500}>
                    <Form
                        {...formItemLayout}
                        ref={this.formRef}
                        initialValues={{
                            beaconName: selectedBeacon?.display_name,
                            firstName: selectedBeacon?.first_name,
                            lastName: selectedBeacon?.last_name
                        }}
                        onFinish={this.save}
                    >
                        <Form.Item
                            label={`What should the name of ${isWatch(this.props.selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC} be`}
                            name="beaconName"
                            rules={[{ required: true, message: 'Please enter the name!' }]}>
                            <Input
                                maxLength={globalConstants.INPUT_MAX_LENGTH}
                                onChange={() => { this.setDirty(true) }}
                            />
                        </Form.Item>
                        <Form.Item
                            label={`What's the First name of ${isWatch(this.props.selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC} owner`}
                            name="firstName"
                            rules={[{ required: true, message: 'Please enter first name!' }]}>
                            <Input
                                maxLength={globalConstants.INPUT_MAX_LENGTH}
                                onChange={() => { this.setDirty(true) }}
                            />
                        </Form.Item>
                        <Form.Item
                            label={`What's the Last name of ${isWatch(this.props.selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC} owner`}
                            name="lastName"
                            rules={[{ required: true, message: 'Please enter last name!' }]}>
                            <Input
                                maxLength={globalConstants.INPUT_MAX_LENGTH}
                                onChange={() => { this.setDirty(true) }} />
                        </Form.Item>
                        <Row>
                            <Col lg={14} />
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

export default connect(mapStateToProps, {})(BeaconInforCard)

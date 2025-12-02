import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import moment from 'moment'
import { format4Api } from '@/utility/Locale'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Form } from '@ant-design/compatible'
import { Button, Col, Collapse, DatePicker, Divider, Input, message, Modal, Popconfirm, Row, Switch, Table, TimePicker, Tooltip, } from 'antd'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    holidays: state.setting.holidays || []
})

class Holiday extends Component{
    constructor(props) {
        super(props)
        this.state = {
            holidayData: null,
            holidayModalOpen: false,
            endOpen: false,
            error: false,
            help: ''
        }
    }

    handleOpen = () => {
        this.setState({ holidayModalOpen: true })
    }

    handleEdit = (holiday) => {
        this.setState({
            holidayData: holiday,
        })
        this.handleOpen()
    }

    handleClose = () => {
        this.setState({ holidayModalOpen: false, holidayData: null, error: false, help: '' })
    }

    handleStartOpenChange = open => {
        if (!open) {
            this.setState({ endOpen: true })
        }
    }

    handleEndOpenChange = open => {
        this.setState({ endOpen: open })
    }

    range = (start, end) => {
        const result = []
        for (let i = start; i < end; i++) {
            result.push(i)
        }
        return result
    }

    removeHoliday = (holidayId) => {
        const hubId = this.props.selectedHub.hub_id
        actions.setting.removeHoliday({
            hubId,
            holidayId
        })
    }

    validateEnd = (startTime, endTime) => {
        if (endTime &&  endTime.isSameOrBefore(moment())) {
            this.setState({
                error: true,
                help: 'Holiday end time must in the future'
            })
            return false
        } else if (endTime && endTime.isSameOrBefore(startTime.clone().add(1,'hour'))) {
            this.setState({
                error: true,
                help: 'Holiday period must be longer than one hour!'
            })
            return false
        } else {
            this.setState({
                error: false,
                help: ''
            })
            return true
        }
    }

    saveHoliday = () => {
        const hubId = this.props.selectedHub.hub_id
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                const startTime = values.starts_at.set(
                    {
                        hour: values.starts_fullDay ? 0 : values.starts_time.get('hour') ,
                        minute: values.starts_fullDay ? 0 : values.starts_time.get('minute') ,
                        second: 0,
                        millisecond: 0
                    }
                )
                const endTime = values.ends_at.set(
                    {
                        hour: values.ends_fullDay ? 23 : values.ends_time.get('hour') ,
                        minute: values.ends_fullDay ? 59 : values.ends_time.get('minute') ,
                        second: 0,
                        millisecond: 0
                    }
                )
                if (this.validateEnd (startTime, endTime)) {
                    if (this.state.holidayData) {
                        const payload = {
                            ...this.state.holidayData,
                            description: values.description,
                            starts_at: format4Api(values.starts_at),
                            ends_at: format4Api(values.ends_at),
                        }
                        actions.setting.updateHoliday ({hubId, holidayId: this.state.holidayData.holiday_id, holiday: payload}).then(()=>{
                            this.setState({ holidayModalOpen: false, holidayData: null })
                            message.success('Update Success')
                        }).catch((error)=>{
                            message.error(error.data.message, 10)
                        })
                    }else {
                        const payload = {
                            description: values.description,
                            hub_id: hubId,
                            starts_at: format4Api(values.starts_at),
                            ends_at: format4Api(values.ends_at),
                        }
                        actions.setting.addHoliday({hubId, holiday: payload}).then(()=>{
                            this.setState({ holidayModalOpen: false })
                            message.success('Create Success')
                        }).catch((error)=>{
                            message.error(error.data.message, 10)
                        })

                    }
                }
            }
        })
    }

    pastHolidayData = (data) => {
        return data.filter(res => !(res.ends_at.isSameOrAfter(moment(), 'days')))
    }

    hidePastHolidayData = (data) => {
        return data.filter(res => res.ends_at.isSameOrAfter(moment(), 'days'))
    }

    render(){
        const { holidays, form } = this.props
        const { getFieldDecorator } = form

        const switchLayout = {
            labelCol: { xs: {span: 24}, lg: {span: 9}},
            wrapperCol: { xs: {span: 24}, lg: {span: 13, offset: 2}},
        }

        const columns = [
            {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
            },
            {
                title: 'Start',
                dataIndex: 'starts_at',
                key: 'starts_at',
                render: text => moment(text).format('DD-MM-YYYY HH:mm')
            },
            {
                title: 'End',
                dataIndex: 'ends_at',
                key: 'ends_at',
                render: text => moment(text).format('DD-MM-YYYY HH:mm')
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, record) => (
                    <Fragment>
                        <a onClick={()=>this.handleEdit(record)}>Edit</a>
                        <Divider type={'vertical'}/>
                        <Popconfirm
                            title="Are you sure delete this holiday?"
                            onConfirm={() => this.removeHoliday(record.key)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Tooltip title="Delete this holiday"><DeleteOutlined /></Tooltip>
                        </Popconfirm>
                    </Fragment>
                )
            },
        ]

        const pastColumns = [
            {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
            },
            {
                title: 'Actual Start',
                dataIndex: 'actual_starts_at',
                key: 'actual_starts_at',
                render: text => text ? moment(text).format('DD-MM-YYYY HH:mm') : 'Never Started'
            },
            {
                title: 'Actual End',
                dataIndex: 'actual_ends_at',
                key: 'actual_ends_at',
                render: text => text ? moment(text).format('DD-MM-YYYY HH:mm') : 'Never Started'
            }
        ]

        const data = holidays && holidays.map((holiday) => {
            return {
                ...holiday,
                key: holiday.holiday_id,
                starts_at: moment(holiday.starts_at),
                ends_at: moment(holiday.ends_at)
            }
        })
        const currentHolidayData = this.hidePastHolidayData (data)
        const pastHolidayData = this.pastHolidayData(data)
        return (
            <Fragment>
                <Row type="flex" justify="center">
                    <Col xs={22} md={18}>
                        <Table scroll={{x: true}}
                            dataSource={currentHolidayData}
                            columns={columns}
                            footer={()=>
                                <Row>
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<PlusOutlined />}
                                        onClick={() => this.handleOpen()}
                                    >
                                        Add Holiday
                                    </Button>
                                </Row>
                            }
                        />
                    </Col>
                </Row>
                <Row type="flex" justify="center">
                    <Col xs={22} md={18}>
                        <Collapse>
                            <Collapse.Panel header="Past Holidays" key={0}>
                                <Table scroll={{x: true}}
                                    dataSource={pastHolidayData}
                                    columns={pastColumns}
                                />
                            </Collapse.Panel>
                        </Collapse>
                    </Col>
                </Row>
                <Modal
                    okText="Save"
                    open={this.state.holidayModalOpen} onCancel={this.handleClose}
                    onOk={()=>this.saveHoliday()}
                    centered={false} title="Add a holiday"  style={{width: '400px'}}
                    destroyOnClose
                >
                    <Form onSubmit={this.saveHoliday}>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    label="Description"
                                >
                                    {getFieldDecorator('description', {
                                        rules: [{ required: true, message: 'Please enter description!', whitespace: true }],
                                        initialValue: this.state.holidayData && this.state.holidayData.description,
                                    })(
                                        <Input />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Start date"
                                >
                                    {getFieldDecorator('starts_at', {
                                        rules: [{ required: true, message: 'Please select Start date!'},],
                                        initialValue: this.state.holidayData && moment(this.state.holidayData.starts_at),
                                    })(
                                        <DatePicker
                                            showToday={false}
                                            disabledDate={current => current && current <= moment().startOf('day')}
                                            style={{width: '100%'}}
                                            disabled={this.state.holidayData && moment(this.state.holidayData.starts_at).isBefore(moment())}
                                            placeholder="Start"
                                            onOpenChange={this.handleStartOpenChange}
                                        />
                                    )}
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="End date"
                                >
                                    {getFieldDecorator('ends_at', {
                                        rules: [{ required: true, message: 'Please select End date!'}],
                                        initialValue: this.state.holidayData && moment(this.state.holidayData.ends_at),
                                    })(
                                        <DatePicker
                                            showToday={false}
                                            disabledDate={current => current && current <= moment().startOf('day')}
                                            style={{width: '100%'}}
                                            placeholder="End"
                                            open={this.state.endOpen}
                                            onOpenChange={this.handleEndOpenChange}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        {!this.state.holidayData &&
                        <Row gutter={16}>
                            <Col span={12}>
                                {this.props.form.getFieldValue('starts_at') &&
                                <Form.Item
                                    label="Full day"
                                    {...switchLayout}
                                >
                                    {getFieldDecorator('starts_fullDay', {
                                        initialValue: true
                                    })(
                                        <Switch defaultChecked/>
                                    )}
                                </Form.Item>
                                }
                            </Col>

                            <Col span={12}>
                                {this.props.form.getFieldValue('ends_at') &&
                                <Form.Item
                                    label="Full day"
                                    {...switchLayout}
                                >
                                    {getFieldDecorator('ends_fullDay', {
                                        initialValue: true
                                    })(
                                        <Switch defaultChecked/>
                                    )}
                                </Form.Item>
                                }
                            </Col>
                        </Row>
                        }
                        <Row gutter={16}>
                            <Col span={12}>
                                {(!this.props.form.getFieldValue('starts_fullDay') && this.props.form.getFieldValue('starts_at') || this.state.holidayData) &&
                                <Form.Item
                                    label="Start Time"
                                    {...switchLayout}
                                >
                                    {getFieldDecorator('starts_time', {
                                        initialValue: this.state.holidayData ? moment(this.state.holidayData.starts_at): moment('00:00','HH:mm'),
                                    })(
                                        <TimePicker
                                            allowClear={false}
                                            disabled={this.state.holidayData && moment(this.state.holidayData.starts_at).isBefore(moment())}
                                            inputReadOnly
                                            format='HH:mm'
                                            minuteStep={60}
                                        />
                                    )}
                                </Form.Item>
                                }
                            </Col>

                            <Col span={12}>
                                {(!this.props.form.getFieldValue('ends_fullDay') && this.props.form.getFieldValue('ends_at') || this.state.holidayData) &&
                                <Form.Item
                                    label="End Time"
                                    {...switchLayout}
                                >
                                    {getFieldDecorator('ends_time', {
                                        initialValue: this.state.holidayData ? moment(this.state.holidayData.ends_at): moment('23:00','HH:mm'),
                                    })(
                                        <TimePicker
                                            allowClear={false}
                                            inputReadOnly
                                            format='HH:mm'
                                            minuteStep={60}
                                        />
                                    )}
                                </Form.Item>
                                }
                            </Col>
                        </Row>

                        {this.state.error &&
                        <Row>
                            <div className="ant-form-item-control has-error">
                                <div className="ant-form-explain">{this.state.help}</div>
                            </div>
                        </Row>
                        }
                    </Form>
                </Modal>
            </Fragment>
        )
    }
}

const HolidayPage = Form.create({})(Holiday)


export default connect(mapStateToProps, null) (HolidayPage)

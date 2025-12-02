import { Fragment, useState } from 'react'
import { Form } from '@ant-design/compatible'
import { Button, Card, Col, Input, message, Row, TimePicker } from 'antd'
import { globalConstants } from '@/_constants'
import _ from 'lodash'
import { actions } from 'mirrorx'
import moment from 'moment'
import { changeMinsToMillsec } from '@/utility/Common'

const RoutineStepContent = (props) => {
    const [part, setPart] = useState(1)
    const {selectedHub, form, settings, next, prev} = props
    const { getFieldDecorator } = form
    const format = globalConstants.LONG_TIME_FORMAT
    const firstName = settings && settings.resident_profile.first_name
    const formItemLayout = {
        labelCol: { xs: 24, sm: 12 },
        wrapperCol: { xs: 24, sm: 12 },
    }
    const config = {rules: [{ type: 'object', required: true, message: 'Please select time!' }]}

    const saveRoutine = () => {
        form.validateFields((err, values) => {
            if (!err) {
                if (part===2 && (values.earliestWeekdaysWaking.isSameOrAfter(values.latestWeekdaysWaking) ||
                    values.earliestWeekendsWaking.isSameOrAfter(values.latestWeekendsWaking))){
                    message.error(globalConstants.ERROR_RTIME)
                }else{
                    let data = _.cloneDeep(settings)
                    if (part===1){
                        data.routine.sleeping.weekdays.earliest = values.earliestWeekdaysSleeping.format('HH:mm')
                        data.routine.sleeping.weekdays.latest = values.latestWeekdaysSleeping.format('HH:mm')
                        data.routine.sleeping.weekends.earliest = values.earliestWeekendsSleeping.format('HH:mm')
                        data.routine.sleeping.weekends.latest = values.latestWeekendsSleeping.format('HH:mm')
                    }else if (part===2){
                        data.routine.waking.weekdays.earliest = values.earliestWeekdaysWaking.format('HH:mm')
                        data.routine.waking.weekdays.latest = values.latestWeekdaysWaking.format('HH:mm')
                        data.routine.waking.weekends.earliest = values.earliestWeekendsWaking.format('HH:mm')
                        data.routine.waking.weekends.latest = values.latestWeekendsWaking.format('HH:mm')
                    } else {
                        data.routine.bathing.duration = changeMinsToMillsec(values.bathroom)
                    }

                    actions.setting.saveSettings({hubId: selectedHub.hub_id, settings: data}).then(() => {
                        part===3 ? next():setPart(part+1)
                        message.success('Saved successfully !!', 3)
                    }).catch(err => {
                        err.global_errors.forEach(e => {
                            message.error(e.message, 3)
                        })
                    })
                }
            }
        })
    }

    const renderPart1 = () => {

        return <Card title={`1. When does ${firstName} go to bed?`} className="welcomeCard" size="small" bordered={false}>
            <Form {...formItemLayout} className="noBottomMargin">
                <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}} type="flex" justify="center">
                    <Col xs={24} lg={11} className="margin-bottom">
                        <Card title={`On weekdays ${firstName} might be in bed:`} size="small" >
                            <Row>
                                <Form.Item label="at the earliest">
                                    {
                                        getFieldDecorator('earliestWeekdaysSleeping', {
                                            ...config,
                                            initialValue: settings && moment(settings.routine.sleeping.weekdays.earliest, format)
                                        })(
                                            <TimePicker
                                                showSecond={false}
                                                placeholder='HH:MM AM/PM'
                                                defaultOpenValue={moment('00:00', globalConstants.LONG_TIME_FORMAT)}
                                                format={globalConstants.LONG_TIME_FORMAT}
                                                use12Hours={true}
                                                allowClear={false}
                                            />
                                        )
                                    }
                                </Form.Item>
                                <Form.Item label="at the latest">
                                    {
                                        getFieldDecorator('latestWeekdaysSleeping', {
                                            ...config,
                                            initialValue: settings && moment(settings.routine.sleeping.weekdays.latest, format)
                                        })(
                                            <TimePicker
                                                showSecond={false}
                                                placeholder='HH:MM AM/PM'
                                                defaultOpenValue={moment('00:00', globalConstants.LONG_TIME_FORMAT)}
                                                format={globalConstants.LONG_TIME_FORMAT}
                                                use12Hours={true}
                                                allowClear={false}
                                            />
                                        )
                                    }
                                </Form.Item>
                            </Row>
                        </Card>
                    </Col>
                    <Col xs={24} lg={11} className="margin-bottom">
                        <Card title={`On weekends ${firstName} might be in bed:`} size="small" >
                            <Row>
                                <Form.Item label="at the earliest">
                                    {
                                        getFieldDecorator('earliestWeekendsSleeping', {
                                            ...config,
                                            initialValue: settings && moment(settings.routine.sleeping.weekends.earliest, format)
                                        })(
                                            <TimePicker
                                                showSecond={false}
                                                placeholder='HH:MM AM/PM'
                                                defaultOpenValue={moment('00:00', globalConstants.LONG_TIME_FORMAT)}
                                                format={globalConstants.LONG_TIME_FORMAT}
                                                use12Hours={true}
                                                allowClear={false}
                                            />
                                        )
                                    }
                                </Form.Item>
                                <Form.Item label="at the latest">
                                    {
                                        getFieldDecorator('latestWeekendsSleeping', {
                                            ...config,
                                            initialValue: settings && moment(settings.routine.sleeping.weekends.latest, format)
                                        })(
                                            <TimePicker
                                                showSecond={false}
                                                placeholder='HH:MM AM/PM'
                                                defaultOpenValue={moment('00:00', globalConstants.LONG_TIME_FORMAT)}
                                                format={globalConstants.LONG_TIME_FORMAT}
                                                use12Hours={true}
                                                allowClear={false}
                                            />
                                        )
                                    }
                                </Form.Item>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </Card>
    }

    const renderPart2 = () => {

        return <Card title={`2. When does ${firstName} wake up?`} className="welcomeCard" size="small" bordered={false}>
            <Form {...formItemLayout} className="noBottomMargin">
                <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}} type="flex" justify="center">
                    <Col xs={24} lg={11} className="margin-bottom">
                        <Card title={`On weekdays ${firstName} might be out of bed:`} size="small" >
                            <Row>
                                <Form.Item label="at the earliest">
                                    {
                                        getFieldDecorator('earliestWeekdaysWaking', {
                                            ...config,
                                            initialValue: settings && moment(settings.routine.waking.weekdays.earliest, format)
                                        })(
                                            <TimePicker
                                                showSecond={false}
                                                placeholder='HH:MM AM/PM'
                                                defaultOpenValue={moment('00:00', globalConstants.LONG_TIME_FORMAT)}
                                                format={globalConstants.LONG_TIME_FORMAT}
                                                use12Hours={true}
                                                allowClear={false}
                                            />
                                        )
                                    }
                                </Form.Item>
                                <Form.Item label="at the latest">
                                    {
                                        getFieldDecorator('latestWeekdaysWaking', {
                                            ...config,
                                            initialValue: settings && moment(settings.routine.waking.weekdays.latest, format)
                                        })(
                                            <TimePicker
                                                showSecond={false}
                                                placeholder='HH:MM AM/PM'
                                                defaultOpenValue={moment('00:00', globalConstants.LONG_TIME_FORMAT)}
                                                format={globalConstants.LONG_TIME_FORMAT}
                                                use12Hours={true}
                                                allowClear={false}
                                            />
                                        )
                                    }
                                </Form.Item>
                            </Row>
                        </Card>
                    </Col>
                    <Col xs={24} lg={11} className="margin-bottom">
                        <Card title={`On weekends ${firstName} might be out of bed:`} size="small" >
                            <Row>
                                <Form.Item label="at the earliest">
                                    {
                                        getFieldDecorator('earliestWeekendsWaking', {
                                            ...config,
                                            initialValue: settings && moment(settings.routine.waking.weekends.earliest, format)
                                        })(
                                            <TimePicker
                                                showSecond={false}
                                                placeholder='HH:MM AM/PM'
                                                defaultOpenValue={moment('00:00', globalConstants.LONG_TIME_FORMAT)}
                                                format={globalConstants.LONG_TIME_FORMAT}
                                                use12Hours={true}
                                                allowClear={false}
                                            />
                                        )
                                    }
                                </Form.Item>
                                <Form.Item label="at the latest">
                                    {
                                        getFieldDecorator('latestWeekendsWaking', {
                                            ...config,
                                            initialValue: settings && moment(settings.routine.waking.weekends.latest, format)
                                        })(
                                            <TimePicker
                                                showSecond={false}
                                                placeholder='HH:MM AM/PM'
                                                defaultOpenValue={moment('00:00', globalConstants.LONG_TIME_FORMAT)}
                                                format={globalConstants.LONG_TIME_FORMAT}
                                                use12Hours={true}
                                                allowClear={false}
                                            />
                                        )
                                    }
                                </Form.Item>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </Card>
    }

    const renderPart3 = () => {

        return <Card title={`3. What would the longest amount of time ${firstName} spend in the bathroom?`} className="welcomeCard" size="small" bordered={false}>
            <Form className="noBottomMargin">
                <div style={{textAlign: 'center'}}>
                    <p>SOFIHUB finds that most people spend about 45 minutes in the bathroom as most people usually have a morning routine
                    to get ready which can include: going to the bathroom, taking a shower, doing their hair, etc... Some people need more
                    time, others less. SOFIHUB recommends about 45 minutes.</p>
                    <Form.Item>
                        {firstName} wouldn&#39;t spend more than {
                            getFieldDecorator('bathroom', {
                                initialValue: settings && parseInt(settings.routine.bathing.duration/60000,10)
                            })(
                                <Input style={{width: '55px'}} type="text" />
                            )
                        } minutes in the bathroom.
                    </Form.Item>
                </div>
            </Form>
        </Card>
    }

    return (
        <Fragment>
            <span>We need to know a bit about {firstName}&#39;s daily routine - if you&#39;re not sure about the answers you can always
            update them later in the settings page.</span>
            {part === 1  ? renderPart1() : part===2 ? renderPart2(): renderPart3()}
            <Row><Col span={24}><Button style={{ marginLeft: 8 }} onClick={ ()=> {part===1 ? prev() : setPart(part-1) }}>
                Previous
            </Button>
            <Button
                type="primary"
                onClick={()=>{saveRoutine()}}
                className="floatRight">Next</Button></Col>
            </Row>
        </Fragment>

    )
}

const routineStep = (selectedHub, form, settings, next, prev) =>{
    const title = 'Routine'
    const content = <RoutineStepContent form={form} selectedHub={selectedHub} settings={settings} next={next} prev={prev}/>
    return {title,content}
}

export default routineStep

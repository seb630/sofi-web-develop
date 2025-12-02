import { Button, Card, Col, Form, Input, message, Modal, Row, Select, Space, Typography } from 'antd'
import { actions } from 'mirrorx'
import { Fragment, useState } from 'react'
import { globalConstants } from '@/_constants'
import moment from 'moment'
import { format4Api } from '@/utility/Locale'
import ContractOptions from '@/pages/Subscription/ContractDetailForm'
import _ from 'lodash'
import UpdateSubscriptionOwner from '@/pages/Subscription/UpdateSubscriptionOwner'

const EditModal = (props) => {
    const {open, onOk, onCancel, subscription} = props
    const [form] = Form.useForm()

    return (<Modal
        open={open}
        onCancel={onCancel}
        onOk={() => {form.validateFields().then(values => {
            onOk(values).then(()=> form.resetFields())
        })
            .catch(info => {
                console.log('Validate Failed:', info)
            })
        }}
        title="Update contract subscription"
        width={640}
        destroyOnClose
    >
        <Form
            form={form}
            onFinish={onOk}
            initialValues={{
                ...subscription,
            }}
            labelWrap
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 12 }}
        >
            <Form.Item name="subscription_status" label="Subscription status">
                <Input disabled />
            </Form.Item>
            <ContractOptions form={form} {...props}/>
        </Form>
    </Modal>)
}

const SubscriptionCard = (props) => {
    const {subscriptionStatus, subscription, productId, carers, productType} = props
    const [form] = Form.useForm()
    const statusValue = Form.useWatch('subscription_status', form)
    const [editModal, setEditModal] = useState(false)

    const onReset = () => {
        form.resetFields()
    }

    const handleSaveClick = (values) => {
        if (productType === 'Radar' && !subscription) {
            const payload = {
                product_type: 'RADAR',
                status: values.subscription_status,
                product_ids: [productId]
            }
            actions.billing.createSubscription(payload).then(()=>{
                message.success('Subscription status updated')
                actions.billing.fetchSubscription(productId)
                setEditModal(false)
            })
        } else {
            let newSubscription = {...subscription, ...values}
            if (values.subscription_status === 'CONTRACT' || values.subscription_status === 'LOAN_PERIOD' || values.subscription_status === 'GRACE_PERIOD') {
                newSubscription.type = 'contract'
                if (values.contract) {
                    if (values.subscription_status === 'CONTRACT') {
                        if (values.condition === 'NONE') {
                            newSubscription.contract_end_date = values.contract === 'custom' ? format4Api(values.customDate) : format4Api(moment().add(values.contract,'month'))
                        } else if (values.condition === 'CAA') {
                            newSubscription.contract_end_date = values.contract === 'custom' ? format4Api(moment().add(values.days,'days')) : format4Api(moment().add(values.contract,'month'))
                        }
                        newSubscription.period = null
                    } else if (values.subscription_status === 'LOAN_PERIOD') {
                        newSubscription.loan_period_end_date = values.contract === 'custom' ? format4Api(values.customDate) : format4Api(moment().add(values.contract,'month'))
                        newSubscription.type = 'loan-period'
                    } else if (values.subscription_status === 'GRACE_PERIOD') {
                        newSubscription.grace_period_end_date = values.contract === 'custom' ? format4Api(values.customDate) : format4Api(moment().add(values.contract,'month'))
                        newSubscription.type = 'grace-period'
                    }
                }
            }
            if (values.subscription_status === subscription.subscription_status) {
                actions.billing.updateSubscriptionPeriod(newSubscription).then(() => {
                    message.success('Subscription status updated')
                    actions.billing.fetchSubscription(productId)
                    setEditModal(false)
                })
            } else {
                if (!values.subscription_status) {
                    Modal.confirm({
                        title: 'Are you sure?',
                        content: 'Changing to null will cancel the subscription BUT will not schedule a termination of the SIM card. ' +
                    'You must cancel from the Setting → Subscription page instead to automatically schedule a SIM card termination in the future. Are you sure you wish to cancel the subscription?',
                        okText: 'Yes',
                        onOk: ()=> Modal.confirm({
                            title: 'Are you sure you want to change the subscription status?',
                            content: 'Changing the subscription status will cancel any active subscription currently being used.',
                            okText: 'Yes',
                            onOk: ()=>{
                                actions.billing.updateSubscription({productId,payload:newSubscription}).then(()=>{
                                    message.success('Subscription status updated')
                                    Modal.destroyAll()
                                })
                            },
                            onCancel: ()=>Modal.destroyAll()
                        })
                    })
                } else {
                    Modal.confirm({
                        title: 'Are you sure you want to change the subscription status?',
                        content: 'Changing the subscription status will cancel any active subscription currently being used.',
                        okText: 'Yes',
                        onOk: ()=>{
                            actions.billing.updateSubscription({productId,payload:newSubscription}).then(()=>{
                                message.success('Subscription status updated')
                                actions.billing.fetchSubscription(productId)
                            })
                        }
                    })
                }
            }
        }
    }

    const renderEndDate = (subs) => {
        if (subs.subscription_status === 'CONTRACT'){
            if (subs.condition === 'NONE') {
                return subscription.contract_end_date ? moment(subscription.contract_end_date).format(globalConstants.DATE_FORMAT) : 'Unknown'
            } else if (subs.condition === 'CAA') {
                return (subscription.period ? moment.duration(subscription.period).asDays() : 'Unknown') + ' days After Device Claim/Activation'
            }
        } else if (subs.subscription_status === 'LOAN_PERIOD') {
            return subscription.loan_period_end_date ? moment(subscription.loan_period_end_date).format(globalConstants.DATE_FORMAT) : 'Unknown'
        } else if (subs.subscription_status === 'GRACE_PERIOD') {
            return subscription.grace_period_end_date ? moment(subscription.grace_period_end_date).format(globalConstants.DATE_FORMAT) : 'Unknown'
        }
    }

    let statusOptions =subscriptionStatus?.map(status=>(
        <Select.Option key={status} value={status}>{status}</Select.Option>
    ))
    const nullOption =  <Select.Option key={-1} value={null}>Null Status</Select.Option>
    statusOptions = [nullOption].concat(statusOptions)

    return (<Row className="systemDetails" justify="center">
        <Col xs={22} xxl={18}>
            <Card className="advanced_block" title="Subscription">
                <Form
                    className="last-margin-bottom-form"
                    onFinish={handleSaveClick}
                    form={form}
                    layout="inline"
                    initialValues={{
                        ...subscription,

                    }}
                    labelWrap
                    labelCol={{ span: 10 }}
                    wrapperCol={{ span: 14 }}
                >
                    <Form.Item name="subscription_status" labelCol={{span:0}} wrapperCol={{span:24}}>
                        <Select
                            className="margin-bottom"
                            style={{width: 220}}
                            size="large"
                        >{statusOptions}
                        </Select>
                    </Form.Item>
                    {statusValue==='ACTIVE' &&
                        <UpdateSubscriptionOwner
                            subscription={subscription}
                            carers={carers}
                        />
                    }
                    { (statusValue === 'CONTRACT' || statusValue?.includes('PERIOD')) && <Fragment>
                        {subscription.subscription_status !== statusValue ? <ContractOptions form={form} {...props} /> : <Space direction="vertical" className="large-margin-bottom">
                            <Row gutter={12}>
                                <Col>
                                    Set to end: {renderEndDate(subscription)}
                                </Col>
                                <Col>
                                    <a onClick={()=>setEditModal(true)}>Edit</a>
                                </Col>
                            </Row>
                            <Typography.Text type="secondary">
                                    (Please note if this date is approx 100 years in future is considered &quot;never&quot;).
                            </Typography.Text>
                            {subscription.status === 'CONTRACT' &&
                            <Row gutter={12}>
                                <Col>
                                    Requested
                                    by: {subscription.contract_email || 'Unknown'}{subscription.contract_company && ` through ${subscription.contract_company}`}.
                                    Sofi Reference: {subscription.contract_finance_ref || 'null'}
                                </Col>
                                <Col>
                                    <a onClick={() => setEditModal(true)}>Edit</a>
                                </Col>
                            </Row>
                            }
                        </Space>}
                    </Fragment>}
                    <Form.Item style={{position:'absolute', right:0, bottom: '10px'}} labelCol={{span:0}} wrapperCol={{span:24}}>
                        <Space size={[8, 8]} wrap>
                            <Button htmlType="button" onClick={onReset} disabled={!form.isFieldsTouched({allTouched:true})}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" disabled={_.isEqual(form.getFieldsValue(true), subscription)}>
                                Save
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </Col>
        <EditModal
            open={editModal}
            onCancel={()=>setEditModal(false)}
            subscription={subscription}
            onOk={handleSaveClick}
            {...props}
        />
    </Row>
    )
}

export default SubscriptionCard

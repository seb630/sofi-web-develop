import { Fragment, useState } from 'react'
import PropTypes from 'prop-types'
import { actions } from 'mirrorx'
import { Button, Checkbox, Col, message, Modal, Row, Typography, } from 'antd'
import { dollarSymbol, showCompanyName } from '@/utility/Common'
import moment from 'moment'
import { MyIcon } from '@/pages/Common/Common'
import { CloseOutlined, MessageOutlined } from '@ant-design/icons'
import styles from '@/scss/colours.scss'

const CancelSubscriptionModal = (props) =>{
    const [step, setStep] = useState(1)
    const {open,onCancel, subscription, product_id, product} = props
    const [checkedUnderstand, setCheckedUnderstand] = useState(false)

    const onOk = () => {
        product==='Radar' ? actions.billing.cancelRadarSubscription({
            productId: product_id,
            subscriptionId: subscription.id,
        }).then(
            ()=>{
                message.success('Your subscription has been cancelled')
                onCancel()
            })
            .catch((e)=>message.error(e.message)) :
            actions.billing.cancelSubscription({productId:product_id}).then(
                ()=>{
                    message.success('Your subscription has been cancelled')
                    onCancel()
                })
                .catch((e)=>message.error(e.message))
    }

    const renderFooter = () => {
        const byPassSIM = !(props.product === 'Home' || props.product === 'Beacon')
        let rightButtons
        if (step===1){
            rightButtons = <Button type="primary" onClick={()=>setStep(byPassSIM? 3 : 2)}>Next</Button>
        }else if (step === 2){
            rightButtons = <Row gutter={[12,12]}>
                <Col><Button type="primary" onClick={()=>setStep(1)}>Back</Button></Col>
                <Col><Button type="primary" onClick={()=>setStep(3)}>I understand, Next</Button></Col>
            </Row>
        }
        else if (step === 3){
            rightButtons = <Row gutter={[12,12]}>
                <Col><Button type="primary" onClick={()=>setStep(byPassSIM? 1 : 2)}>Back</Button></Col>
                <Col><Button type="primary" onClick={()=>setStep(4)}>I understand, Next</Button></Col>
            </Row>
        }
        else if (step === 4){
            rightButtons = <Row gutter={[12,12]}>
                <Col><Button type="primary" onClick={()=>setStep(3)}>Back</Button></Col>
                <Col><Button type="primary" onClick={onOk} disabled={!checkedUnderstand}>Cancel Subscription</Button></Col>
            </Row>
        }
        return <Row justify="space-between">
            <Col><Button type="primary" onClick={onCancel}>Cancel</Button></Col>
            <Col>
                {rightButtons}
            </Col>
        </Row>
    }

    const renderContent = (step) => {
        if (step===1){
            return <div className="margin-bottom">
                <Typography.Paragraph>
                Before you cancel the subscription, we need to explain what precisely is being cancelled and what functionality is being lost.
                </Typography.Paragraph>
                <Row justify="space-between">
                    <Col>
                        Your subscription costs:
                    </Col>
                    <Col>
                        {dollarSymbol(subscription.currency)+subscription.price} per month
                    </Col>
                </Row>
                <Row justify="space-between">
                    <Col xs={24} md={15}>
                        <Row>The device will stop working on:</Row>
                    </Col>
                    <Col>
                        {moment(subscription.period_end).format('dddd DD MMMM YYYY')}
                    </Col>
                </Row>
                <Row>
                    {subscription?.products?.length>1 ?
                        <Typography.Text type="secondary">
                            On this day you will also lose access to this device as well as the following devices:
                            <ul>
                                {subscription?.products?.filter(product=>product.pub_id !==product_id).map(product=><li key={product.pub_id}>{product.display_name}</li>)}
                            </ul>
                            On this day these devices will also cease to function.
                        </Typography.Text> :
                        <Typography.Text type="secondary">
                        (On this day you will also lose access to this device via the portal, if you cancel today)
                        </Typography.Text>}
                </Row>
            </div>
        } else if (step===2){
            return <Row wrap={false} align="middle" className="margin-bottom">
                <Col flex='200px' className="text-center">
                    <MyIcon type='icon-Sim-Card' className='cancelSubscriptionIcon-SIM'/>
                </Col>
                <Col flex='auto'>
                    <Typography.Paragraph>
                        Your device contains a SIM card owned and managed by {showCompanyName(window.location.hostname)}.
                    </Typography.Paragraph>
                    <Typography.Paragraph>
                        Your subscription covers the costs of this SIM card. Cancelling the subscription cancels the SIM card.
                    </Typography.Paragraph>
                    <Typography.Paragraph strong className="cancelSubscriptionText">
                        Your device cannot work without this active SIM card and without an active subscription.
                    </Typography.Paragraph>
                    <Typography.Paragraph type="secondary">
                        Once a SIM is cancelled, it is irreversible. If you wish to use the device again in the future you will need to return it to our offices to be fixed for an administration fee.
                    </Typography.Paragraph>
                </Col>
            </Row>
        } else if (step===3){
            return <Row wrap={false} align="middle" className="margin-bottom">
                <Col flex='200px' className="text-center">
                    <MessageOutlined className='cancelSubscriptionIcon-message'/>
                    <CloseOutlined className='cancelSubscriptionIcon-close'/>
                </Col>
                <Col flex='auto'>
                    <Typography.Paragraph>
                        Once your subscription is cancels and runs out:
                    </Typography.Paragraph>
                    <Typography.Paragraph>
                        <Typography.Text strong className="cancelSubscriptionText">Your device will be unable to reach out to carers if you need assistance, </Typography.Text>
                        even if it verbally (or otherwise) states it is attempting to do so.
                    </Typography.Paragraph>
                    {subscription?.products?.length>1 ?
                        <Typography.Paragraph>
                            You will also lose access to the all of the following devices
                            <ul>
                                {subscription?.products?.map(product=><li key={product.pub_id}>{product.display_name}</li>)}
                            </ul>
                            and you will lose access to all historical events and data
                        </Typography.Paragraph> :
                        <Typography.Paragraph>
                            You will also lose access to this device via the portal and lose access to all historical events and data.
                        </Typography.Paragraph>}
                </Col>
            </Row>
        }else if (step===4){
            return <Fragment>
                <Typography.Paragraph>
                    Last step, before you cancel your subscription:
                </Typography.Paragraph>
                <Typography.Paragraph>
                    I confirm and understand that by cancelling the subscription:
                    {subscription?.products?.length>1 ? <ol>
                        <li>The following devices will stop working on/after {moment(subscription.period_end).format('DD MMM YYYY')}</li>
                        <ul>
                            {subscription?.products?.map(product=><li key={product.pub_id}>{product.display_name}</li>)}
                        </ul>
                        <li>All carers will lose access to these devices and their history on/after {moment(subscription.period_end).format('DD MMM YYYY')}</li>
                        <li>The devices will be unable to call carers for assistance.</li>
                    </ol>:
                        <ol>
                            <li>The device will stop working on/after {moment(subscription.period_end).format('DD MMM YYYY')}</li>
                            <li>All carers will lose access to this device and its history on/after {moment(subscription.period_end).format('DD MMM YYYY')}</li>
                            <li>The device will be unable to call carers for assistance.</li>
                            {(product === 'Home' || product === 'Beacon')&&<li>The SIM card managed by {showCompanyName(window.location.hostname)}, required by the device to operate will also be cancelled. This action is irreversible.</li>}
                        </ol>}
                </Typography.Paragraph>
                <Row className="margin-bottom"><Checkbox checked={checkedUnderstand} onChange={(e)=>setCheckedUnderstand(e.target.checked)}>I understand, proceed with subscription cancellation<sup style={{color: styles.red}}>*</sup></Checkbox></Row>
                <Row justify="end"><span style={{color: styles.red}}>*You must agree above</span></Row>
            </Fragment>
        }
    }

    return <Modal
        width={650}
        open={open}
        onCancel={onCancel}
        footer={null}
        title="Are you sure you want to cancel the subscription?"
    >
        {renderContent(step)}
        {renderFooter()}
    </Modal>


}

CancelSubscriptionModal.propTypes={
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    subscription: PropTypes.object,
    product_id: PropTypes.string,
    product: PropTypes.string
}

export default CancelSubscriptionModal

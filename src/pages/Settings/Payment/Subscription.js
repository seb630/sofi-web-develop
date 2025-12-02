import { Component } from 'react'
import { DollarOutlined } from '@ant-design/icons'
import {Card, Col, Row, Button, Space} from 'antd'
import PropTypes from 'prop-types'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import { activeButNotMonthlySub, dollarSymbol, requirePayment, showProductName } from '@/utility/Common'
import {actions} from 'mirrorx'

class Subscription extends Component{

    renderCompanyInfo = () => {
        if (globalConstants.BILLING_COMPANY_EMAIL || globalConstants.BILLING_COMPANY_NAME || globalConstants.BILLING_COMPANY_PHONE) {
            return <p>
                    For more information and billing enquires, please get in touch with {globalConstants.BILLING_COMPANY_NAME}.
                {globalConstants.BILLING_COMPANY_EMAIL && globalConstants.BILLING_COMPANY_PHONE ? `You can call us on ${globalConstants.BILLING_COMPANY_PHONE} or via email on ${globalConstants.BILLING_COMPANY_EMAIL}` : globalConstants.BILLING_COMPANY_PHONE ? `You can call us on ${globalConstants.BILLING_COMPANY_PHONE}`:
                        `You can email us on ${globalConstants.BILLING_COMPANY_EMAIL}`}
            </p>
        }else return <div/>
    }

    handleManual = () => {
        const {product, subscription} = this.props
        return <div>
            <p>
                Your {showProductName(product)} subscription is being managed manually outside of this portal.
            </p>
            {this.renderCompanyInfo()}
            <p className="desc">
                Billing Status: {subscription.subscription_status}
            </p>
        </div>
    }

    handleGracePeriod = () => {
        const {product, subscription} = this.props
        return <div>
            <p>
                Your {showProductName(product)} subscription is currently on a grace period. This means you will not be charged. Your grace period is set to {
                    subscription?.grace_period_end_date && moment(subscription.grace_period_end_date).isBefore(moment().add(50,'year')) ?
                    `will end on ${moment(subscription.grace_period_end_date).format(globalConstants.LONGDATE_FORMAT)}` :
                        'never end'}.
            </p>
            {subscription?.grace_period_end_date && moment(subscription.grace_period_end_date).isBefore(moment().add(50,'year')) && <p>
                At the end of this grace period you will need to start a month to month subscription to continue using this device. Otherwise your {showProductName(product)} will stop working.
            </p>}
            {this.renderCompanyInfo()}
            <p className="desc">
                Billing Status: {subscription.subscription_status}
            </p>
        </div>
    }

    handleLoanPeriod = () => {
        const {product, subscription} = this.props
        return <div>
            <p>
                Your {showProductName(product)} subscription is currently set up as a loan/demonstrator unit. This means you will not be charged. This period {
                    subscription?.loan_period_end_date && moment(subscription.loan_period_end_date).isBefore(moment().add(50,'year')) ?
                    `will end on ${moment(subscription.loan_period_end_date).format(globalConstants.LONGDATE_FORMAT)}` :
                        'never end'}.
            </p>
            {subscription?.loan_period_end_date && moment(subscription.loan_period_end_date).isBefore(moment().add(50,'year')) && <p>
                At the end of this grace period you will need to start a month to month subscription to continue using this device. Otherwise your {showProductName(product)} will stop working.
            </p>}
            {this.renderCompanyInfo()}
            <p className="desc">
                Billing Status: {subscription.subscription_status}
            </p>
        </div>
    }

    handleContractPeriod = () => {
        const {product, subscription} = this.props
        return <div>
            <p>
                Your {showProductName(product)} subscription is currently set up on contract. Your contract period will end on {
                    subscription?.contract_end_date && moment(subscription.contract_end_date).format(globalConstants.LONGDATE_FORMAT)}.
            </p>
            <p>
                At the end of your contract {subscription?.contract_end_date && moment(subscription.contract_end_date).format(globalConstants.LONGDATE_FORMAT)}, you
                have the option to renew it or start a new one. Alternatively you will be move to month to month payments and you will need to provide payment information in order to continue using your {showProductName(product)}.
            </p>

            <p>
                If you have any questions, or need help with renewal of your contract or starting a new one, please get in touch with {globalConstants.BILLING_COMPANY_NAME}.
                {globalConstants.BILLING_COMPANY_EMAIL && globalConstants.BILLING_COMPANY_PHONE ? `You can call us on ${globalConstants.BILLING_COMPANY_PHONE} or via email 
                    on ${globalConstants.BILLING_COMPANY_EMAIL}` : globalConstants.BILLING_COMPANY_PHONE ? `You can call us on ${globalConstants.BILLING_COMPANY_PHONE}`:
                    `You can email us on ${globalConstants.BILLING_COMPANY_EMAIL}`}
            </p>
            <p className="desc">
                Billing Status: {subscription.subscription_status}
            </p>
        </div>
    }

    handleFree = () => {
        const {product, subscription} = this.props
        return <div>
            <p>
                Your {showProductName(product)} subscription is currently set to &quot;free&quot; this means you will not be charged. This status may be changed in the future without warning.
            </p>
            {this.renderCompanyInfo()}
            <p className="desc">
                Billing Status: {subscription.subscription_status}
            </p>
        </div>
    }

    noSubscription = (plan) => {
        const {product} = this.props
        return <div>
            {product==='Radar' ? <p>
                    Your {showProductName(product)} does not have an active subscription. A subscription is needed to use your {showProductName(product)}. The
                    subscription is {`${dollarSymbol(plan.currency)}${plan?.tiers && plan?.tiers[0].amount}`} per month.
            </p>:
                <p>
                Your {showProductName(product)} does not have an active subscription. A subscription is needed to use your {showProductName(product)}. The
                subscription is {dollarSymbol(plan.currency)+ plan.price} per month.
                </p>
            }
            <p>
                To start your subscription add payment details below.
            </p>
        </div>
    }

    renderCanceledSubscription = (subscription) => {
        const {product} = this.props
        return <div>
            <p>
                Your {showProductName(product)} has an active subscription however it is marked to be cancelled on the {moment(
                    subscription.period_end).format('DD-MMM-YYYY')}. Your subscription was {dollarSymbol(subscription.currency)+subscription.price} per
                month.
            </p>
            <p>
                The last charge was on {moment(subscription.period_start).format(globalConstants.LONGDATE_FORMAT)}.<br />
                Your subscription is marked as cancelled and there will be no further charges.
            </p>
        </div>
    }

    activeSubscription = (subscription) => {
        const {product} = this.props
        const canceled = subscription.cancel_at_period_end
        return canceled ? this.renderCanceledSubscription(subscription) : <div>
            <p>
                Your {showProductName(product)} has an active subscription. Which is {dollarSymbol(subscription.currency)+subscription.price} per month.
            </p>
            <p>

                {subscription.payment_paused ? <span>
                    <span>
                        Your account records show that <strong>payment have been paused</strong> by a support staff member.
                    </span><br/>
                    {subscription.resume_at ? <strong>Payment will resume on or after {moment(subscription.resume_at).format(globalConstants.LONGDATE_FORMAT)}.</strong> :
                        <span><strong>This means you will not be charged until payments are resumed</strong> by a support staff member.</span>}
                </span> :
                    <span>The last charge was on {moment(subscription.period_start).format(globalConstants.LONGDATE_FORMAT)}.<br />
                        The next charge was on {moment(subscription.period_end).format(globalConstants.LONGDATE_FORMAT)}
                    </span>}
            </p>
        </div>
    }

    handleGoToDevice = (product) => {
        actions.radar.selectRadar(product).then(()=>actions.routing.push('/radar/dashboard'))
    }

    render(){
        const {subscription, plan, product, stripeEnabled, selectedDevice} = this.props
        const canceled = subscription.cancel_at_period_end
        const showCancel = !activeButNotMonthlySub(subscription.subscription_status)

        return (
            <Card className="advanced_block" title="Subscription">
                <Row type="flex" justify="center" gutter={24} align="middle">
                    <Col xs={8} md={6} align="center" >
                        <DollarOutlined style={{fontSize: 80}} />
                    </Col>
                    <Col xs={16} md={18}>
                        {subscription.subscription_status ?
                            subscription.subscription_status==='THIRD_PARTY_BILLING'|| subscription.subscription_status==='MANUAL' || !stripeEnabled ? this.handleManual()
                                : subscription.subscription_status==='GRACE_PERIOD' ? this.handleGracePeriod()
                                    : subscription.subscription_status==='LOAN_PERIOD' ? this.handleLoanPeriod()
                                        : subscription.subscription_status==='CONTRACT' ? this.handleContractPeriod()
                                            : subscription.subscription_status==='FREE' ? this.handleFree() :
                                                requirePayment(subscription.subscription_status) ? this.noSubscription(plan)
                                                    : this.activeSubscription(subscription)
                            : this.noSubscription(plan)
                        }
                    </Col>
                </Row>
                <Row>
                    {canceled && showCancel && <p>
                        <span style={{color:'red'}}>Your {showProductName(product)} will stop working on the {moment(subscription.period_end)
                            .format(globalConstants.LONGDATE_FORMAT)} as your subscription has been scheduled to cancel.</span> You can resume your
                        subscription before then and continue to use your {showProductName(product)} by clicking &quot;Resume Subscription&quot; below.
                    </p>}
                    {(subscription.subscription_status ==='ACTIVE' || canceled) &&
                    <Row className="margin-bottom">Payment for this subscription was last updated by {subscription.full_name} (Who&#39;s email is {
                        subscription.email} and phone is {subscription.phone}.</Row>
                    }
                </Row>
                {subscription?.products?.length>0 &&
                <>
                    <Row>
                        Your subscription covers the following devices:
                    </Row>
                    <Space direction="vertical" style={{width: '100%'}}>
                        {subscription?.products?.map(subProduct=><Row key={subProduct.id} justify="space-between">
                            <Col>  -{subProduct.display_name} {selectedDevice.id === subProduct.id && '(which is this device)'}</Col>
                            <Col><Button type="primary" onClick={()=>this.handleGoToDevice(subProduct)}>Go To Device</Button></Col>
                        </Row>)}
                    </Space>
                </>}
            </Card>
        )
    }
}

Subscription.propTypes = {
    product: PropTypes.string,
    subscription: PropTypes.object,
    plan: PropTypes.object,
    stripeEnabled: PropTypes.bool,
    selectedDevice: PropTypes.object
}
export default Subscription

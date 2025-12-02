import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import {Button, message, Modal, Row, Spin} from 'antd'
import PropTypes from 'prop-types'
import {dollarSymbol, moreRadars, showProductName} from '@/utility/Common'

const mapStateToProps = state => ({
    paymentMethod: state.billing.paymentMethod,
    me: state.user.me,
    admin: state.user.me?.authorities.some(role=>role.includes('ADMIN')),
    stripeKey: state.billing.stripeKey,
    userRadarSubscriptions: state.billing.userRadarSubscriptions,
})

class RadarPaymentMethodModal extends Component {
    constructor(props) {
        super(props)
        this.state={
            loading: false,
            confirmPage: false,
        }
    }

    componentDidMount() {
        !this.props.stripeKey && actions.billing.fetchStripeKey()
    }

    renderAddContent = () => {
        const {userRadarSubscriptions, stripePlan} = this.props
        const radarSubscriptions = userRadarSubscriptions?.filter(subscription=>subscription.product_type==='RADAR')
        const product = 'radar'

        return <div className="advanced_block" style={{marginBottom:0}}>
            {radarSubscriptions?.length>0 ? <>
                <p>A subscription is needed to use your {showProductName(product)}. You cannot use your {showProductName(product)} without a valid subscription and valid payment method.</p>
                <p>We&#39;ve found an existing subscription associated with your account, which means we can add this {showProductName(product)} to your existing subscription.</p>
                <p>Your existing subscription is current {dollarSymbol(radarSubscriptions[0].currency)+radarSubscriptions[0].price} per month for {radarSubscriptions[0]?.products?.length || 1} radars, and {
                    moreRadars(radarSubscriptions[0], stripePlan)}</p>
                <Row justify="center"><Button type="primary" onClick={()=>this.handleAdd(radarSubscriptions[0])}>Add to existing subscription</Button></Row>
            </>:
                <>
                    <p>A subscription is needed to use your {showProductName(product)}. You cannot use your {showProductName(product)} without a valid subscription and valid payment method.</p>
                    <p>
                        To start a new subscription, click the button below to be taken to the checkout page via our payment partner Stripe.
                    </p>
                    <Row justify="center"><Button type="primary" onClick={this.handleCheckout}>Start a new subscription</Button></Row>
                </>
            }
        </div>
    }

    renderUpdateContent = () => {
        return <Row justify="center">  <Button onClick={this.handleUpdate} type="primary">Update Payment Detail on Stripe</Button></Row>
    }

    handleUpdate = () => {
        const {subscription, selectedRadar} = this.props
        const domain = window.location.hostname.includes('localhost') || window.location.hostname.includes('192.168') ? 'https://portal.au-sofihub-develop.sofieco.net' : window.location.origin
        const payload = {
            stripe_customer_id: subscription.stripe_customer_id,
            success_url: `${domain}/radars/${selectedRadar.pub_id}/dashboard`,
            cancel_url: `${domain}/radars/${selectedRadar.pub_id}/dashboard`,
        }
        actions.billing.updateCheckoutPaymentMethod(payload).then(result=>window.open(result?.checkout_url))
    }

    handleCheckout = () => {
        const {me, selectedRadar} = this.props
        const domain = window.location.hostname.includes('localhost') || window.location.hostname.includes('192.168') ? 'https://portal.au-sofihub-develop.sofieco.net' : window.location.origin
        const payload = {
            user_id: me.user_id,
            product_type: 'RADAR',
            product_ids: [selectedRadar.pub_id],
            success_url: `${domain}/radars/${selectedRadar.pub_id}/dashboard`,
            cancel_url: `${domain}/radars/${selectedRadar.pub_id}/dashboard`,
        }
        actions.billing.createCheckout(payload).then(result=>window.open(result?.checkout_url))
    }

    handleAdd = (radarSubscription) => {
        const {selectedRadar} = this.props
        const payload = {
            subscription_id: radarSubscription.id,
            product_ids: [selectedRadar.pub_id]
        }
        actions.billing.addToSubscription(payload).then(()=>{
            message.success('Subscription Added')
            actions.routing.push('/radar/dashboard')
        })
    }

    render() {
        const { open, onCancel,type, } = this.props

        return (
            <Modal
                width={600}
                title={`${type} Payment Method`}
                open={open}
                onCancel={onCancel}
                footer={null}
                destroyOnClose
            >
                <Spin spinning={this.state.loading}>
                    {type==='Add' && this.renderAddContent()}

                    {type==='Update' && this.renderUpdateContent()}
                </Spin>
            </Modal>
        )
    }
}

RadarPaymentMethodModal.propTypes = {
    type: PropTypes.string,
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    product: PropTypes.string.isRequired,
    product_id: PropTypes.string,
    physical_id: PropTypes.string,
    period_end: PropTypes.string,
    stripePlan: PropTypes.object
}

export default connect(mapStateToProps,null)(RadarPaymentMethodModal)

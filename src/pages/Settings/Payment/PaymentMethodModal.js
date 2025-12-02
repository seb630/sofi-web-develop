import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { Button, Col, Modal, Row, Spin } from 'antd'
import CardMinimal from '../../../components/Stripe/CardMinimal'
import PropTypes from 'prop-types'
import moment from 'moment'
import { dollarSymbol } from '@/utility/Common'
import NDISDevice from '@/pages/Settings/Payment/NDISDevice'

const mapStateToProps = state => ({
    paymentMethod: state.billing.paymentMethod,
    me: state.user.me,
    admin: state.user.me?.authorities.some(role=>role.includes('ADMIN')),
    stripeKey: state.billing.stripeKey,
})

class PaymentMethodModal extends Component {
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

    afterVerify = () => {
        this.setState({confirmPage: true})
    }

    confirmPayment = () => {
        const {me, paymentMethod, product, product_id, physical_id, onCancel, type} = this.props
        let payload
        this.setState({loading: true})
        if (type==='Add'){
            payload = {
                payment_method: paymentMethod.id,
                email:me.email,
                product: product ==='Beacon' ? product: product ==='Radar' ? 'radar':  'Hub',
                product_id: product_id,
                physical_id: physical_id
            }
            actions.billing.createCustomer(payload).then(()=>{
                actions.billing.fetchSubscription(product_id)
                onCancel()
            }).finally(()=>this.setState({loading:false}))
        }else{
            payload = {
                payment_method: paymentMethod.id,
                product_id: product_id,
            }
            actions.billing.updateCardDetail(payload).then(()=>{
                actions.billing.fetchSubscription(product_id)
                onCancel()
            }).finally(()=>this.setState({loading:false}))
        }
    }

    paymentConfirmation = (product, stripePlan, period_end, last4, type, subscription) => {
        const {loading} = this.state
        const expired = !period_end || moment(period_end).isBefore(moment())
        return (
            <div>
                <h4>Confirm your subscription and payment method</h4>
                <p>Summary:</p>
                <ul>
                    <li>You are updating the payment method for a subscription which costs {type==='Add' ? dollarSymbol(stripePlan.currency)+stripePlan.price: dollarSymbol(subscription.currency)+subscription.price} monthly.</li>
                    <li>{expired ? 'Your subscription requires payment now, your ' +
                        'card will be charged today.' : `Your next payment will be made on ${
                        moment(period_end).format('DD-MMM-YYYY')}` }
                    </li>
                    <li>The payment will be made to the card ending in {last4}</li>
                </ul>
                <Row type="flex" justify="end">
                    <Col>
                        <Button
                            loading={loading}
                            type="primary"
                            onClick={this.confirmPayment}
                            disabled = {loading}
                        >Agree and Save</Button>
                    </Col>
                </Row>
            </div>
        )
    }

    render() {
        const { open, onCancel, product, stripePlan, period_end, paymentMethod, type, subscription, admin, physical_id } = this.props
        const { confirmPage } = this.state
        const last4 = paymentMethod ? paymentMethod.card.last4 : ''

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
                    {confirmPage ?
                        this.paymentConfirmation(product, stripePlan, period_end, last4, type, subscription):
                        <div className="advanced_block" style={{marginBottom:0}}>
                            <CardMinimal
                                admin={admin}
                                button="Verify Card"
                                afterVerify={this.afterVerify}
                            />
                            <p className="desc" style={{margin: '0 20px 12px 20px'}}>Verifying your card does not charge your card or start
                                subscription.
                                Once your card is verified the next screen will ask you to confirm before we charge your card.</p>
                            <NDISDevice product={product} physicalId={physical_id} />
                        </div>
                    }
                </Spin>
            </Modal>
        )
    }
}

PaymentMethodModal.propTypes = {
    type: PropTypes.string,
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    product: PropTypes.string.isRequired,
    product_id: PropTypes.string,
    physical_id: PropTypes.string,
    period_end: PropTypes.string,
    stripePlan: PropTypes.object
}

export default connect(mapStateToProps,null)(PaymentMethodModal)

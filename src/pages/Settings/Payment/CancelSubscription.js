import { Component } from 'react'
import { Button, Card, Col, message, Modal, Row } from 'antd'
import PropTypes from 'prop-types'
import moment from 'moment'
import { actions } from 'mirrorx'
import { dollarSymbol, showProductName } from '@/utility/Common'
import CancelSubscriptionModal from '@/pages/Settings/Payment/CancelSubscriptionModal'

class CancelSubscription extends Component{

    constructor(props) {
        super(props)
        this.state={
            cancelModal: false
        }
    }

    openCancelModal = () =>{
        this.setState({cancelModal: true})
    }

    closeCancelModal = () => {
        this.setState({cancelModal: false})
    }

    handleResume = () =>{
        const {product_id, product, subscription} = this.props
        Modal.confirm({
            width: 700,
            title: 'Resume Subscription',
            content: <div>
                <ul>
                    <li>
                        You are resuming a subscription which costs {dollarSymbol(subscription.currency)+subscription.price} monthly.
                    </li>
                    <li>
                        Your next charge will be {subscription && moment(subscription.period_end).format('DD-MMM-YYYY')} to the card ending {subscription.payment_card_last4}.
                    </li>
                    <li>
                        To update these payment details, visit the payment setting page.
                    </li>
                </ul>
            </div>,
            okText: 'Agree and Resume Subscription',
            okType: 'primary',
            cancelText: 'Cancel',
            onOk() {
                product==='Radar' ? actions.billing.resumeRadarSubscription({
                    productId: product_id,
                    subscriptionId: subscription.id,
                }).then(
                    ()=>{
                        message.success('Your subscription has been resumed')
                    })
                    .catch((e)=>message.error(e.message)) :
                    actions.billing.resumeSubscription(product_id).then(
                        ()=>{
                            message.success('Your subscription has been resumed')
                        })
                        .catch((e)=>message.error(e.message))
            },
        })
    }

    renderTitle = (cancelAtPeriodEnd) => <Row type="flex" justify="space-between" >
        <Col xs={24} md={12}><div style={{color:'red'}}>Cancel Subscription</div></Col>
        <Col xs={24} md={12}><div className="toggle_switch">
            {cancelAtPeriodEnd ?
                <Button danger onClick={this.handleResume} className="floatRight">Resume Subscription</Button>
                : <Button danger onClick={this.openCancelModal} className="floatRight">Cancel Subscription</Button>}

        </div></Col>
    </Row>

    render(){
        const {subscription, product, product_id} = this.props
        let cancelAtPeriodEnd = subscription && subscription.cancel_at_period_end
        return (
            <Card className="advanced_block" title={this.renderTitle(cancelAtPeriodEnd)}>

                <Row type="flex" justify="end" gutter={24} className="margin-bottom">
                    {cancelAtPeriodEnd ? <Col>
                        Your subscription is currently active but is due to be cancelled on {subscription && moment(subscription.period_end).format('DD-MMM-YYYY')}.
                            After this date your {showProductName(product)} will stop functioning. <br/>
                            You can resume your subscription before {subscription && moment(subscription.period_end).format('DD-MMM-YYYY')} by clicking on the button below.
                    </Col>
                        :
                        <Col>
                            In order to use your {showProductName(product)}, a valid subscription and payment method is required. By canceling your
                            subscription your {showProductName(product)} will stop functioning and appear unavailable after {
                                subscription && moment(subscription.period_end).format('DD-MMM-YYYY')}
                        </Col>
                    }
                </Row>
                <CancelSubscriptionModal
                    open={this.state.cancelModal}
                    onCancel={this.closeCancelModal}
                    subscription={subscription}
                    product_id={product_id}
                    product={product}
                />
            </Card>
        )
    }
}

CancelSubscription.propTypes = {
    product: PropTypes.string,
    subscription: PropTypes.object,
    product_id: PropTypes.string
}

export default CancelSubscription

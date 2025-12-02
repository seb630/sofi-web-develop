import { Component } from 'react'
import { connect } from 'mirrorx'
import { Col, Row } from 'antd'
import PaymentDetail from './PaymentDetail'
import Subscription from './Subscription'
import CancelSubscription from './CancelSubscription'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub || {},
    subscription: state.billing.subscription || {},
    stripePlan: state.billing.stripePlan || {},
    stripeEnabled: state.common.stripeEnabled,
    paymentRequired: state.billing.paymentRequired
})

class HubPayment extends Component {
    render() {
        const {subscription, stripePlan, selectedHub, stripeEnabled} = this.props
        return (
            <Row type="flex" justify="center">
                <Col xs={22} lg={16}>
                    <Subscription
                        stripeEnabled={stripeEnabled}
                        product="Home"
                        subscription={subscription}
                        plan={stripePlan}
                    />
                    <PaymentDetail
                        product="Home"
                        product_id={selectedHub.hub_id}
                        physical_id={selectedHub.mac_address}
                        period_end={subscription.period_end}
                        {...this.props}
                    />
                    {subscription.subscription_status === 'ACTIVE' &&
                    <CancelSubscription subscription={subscription} product="Home" product_id={selectedHub.hub_id}/>}
                </Col>
            </Row>
        )
    }
}

export default connect(mapStateToProps,null)(HubPayment)

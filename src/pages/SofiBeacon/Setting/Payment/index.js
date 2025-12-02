import { Component } from 'react'
import { connect } from 'mirrorx'
import { Col, Row } from 'antd'
import PaymentDetail from '../../../Settings/Payment/PaymentDetail'
import Subscription from '../../../Settings/Payment/Subscription'
import CancelSubscription from '../../../Settings/Payment/CancelSubscription'
import { isLife, isWatch } from '@/utility/Common'

const mapStateToProps = state => ({
    selectedBeacon: state.sofiBeacon.selectedBeacon || {},
    subscription: state.billing.subscription || {},
    stripePlan: state.billing.stripePlan || {},
    stripeEnabled: state.common.stripeEnabled,
    paymentRequired: state.billing.paymentRequired
})

class BeaconPayment extends Component {
    render() {
        const { subscription, stripePlan, selectedBeacon, stripeEnabled } = this.props
        const product = isLife(selectedBeacon) ? 'Life' : isWatch(selectedBeacon) ? 'Watch' : 'Beacon'
        return (
            <Row type="flex" justify="center">
                <Col xs={22} lg={16}>
                    <Subscription
                        stripeEnabled={stripeEnabled}
                        product={product}
                        subscription={subscription}
                        plan={stripePlan}
                    />
                    <PaymentDetail
                        product={product}
                        product_id={selectedBeacon.pub_id}
                        physical_id={selectedBeacon.imei}
                        period_end={subscription.period_end}
                        {...this.props}
                    />
                    {
                        subscription.subscription_status === 'ACTIVE' &&
                        <CancelSubscription 
                            subscription={subscription} 
                            product={product}
                            product_id={selectedBeacon.pub_id}
                        />
                    }
                </Col>
            </Row>
        )
    }
}

export default connect(mapStateToProps, null)(BeaconPayment)

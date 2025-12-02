import { Component } from 'react'
import { connect } from 'mirrorx'
import { Col, Row } from 'antd'
import Subscription from '../../../Settings/Payment/Subscription'
import CancelSubscription from '../../../Settings/Payment/CancelSubscription'
import RadarPaymentDetail from '@/pages/Radar/Setting/Payment/PaymentDetail'

const mapStateToProps = state => ({
    selectedRadar: state.radar.selectedRadar || {},
    subscription: state.billing.subscription || {},
    stripePlan: state.billing.stripePlan || {},
    stripeEnabled: state.common.stripeEnabled,
    paymentRequired: state.billing.paymentRequired
})

class RadarPayment extends Component {
    render() {
        const {subscription, stripePlan, selectedRadar, stripeEnabled} = this.props
        return (
            <Row type="flex" justify="center">
                <Col xs={22} lg={16}>
                    <Subscription
                        selectedDevice={selectedRadar}
                        stripeEnabled={stripeEnabled}
                        product="Radar"
                        subscription={subscription}
                        plan={stripePlan}
                    />
                    <RadarPaymentDetail
                        product="Radar"
                        product_id={selectedRadar.pub_id}
                        physical_id={selectedRadar.ext_id}
                        period_end={subscription.period_end}
                        {...this.props}
                    />
                    {subscription.subscription_status === 'ACTIVE' &&
                    <CancelSubscription subscription={subscription} product="Radar" product_id={selectedRadar.pub_id}/>}
                </Col>
            </Row>
        )
    }
}

export default connect(mapStateToProps,null)(RadarPayment)

import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import {Button, Card, Col, message, Modal, Row, Spin} from 'antd'
import CardMinimal from '../../../components/Stripe/CardMinimal'
import PortalLayout from '../Layouts/PortalLayout'
import {dollarSymbol, moreRadars, showProductName} from '@/utility/Common'
import NDISDevice from '@/pages/Settings/Payment/NDISDevice'
import RemoveDeviceCard from '@/pages/Common/RemoveDeviceCard'

const mapStateToProps = state => ({
    paymentMethod: state.billing.paymentMethod,
    stripePlan: state.billing.stripePlan,
    me: state.user.me,
    selectedHub: state.hub.selectedHub,
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    selectedRadar: state.radar.selectedRadar,
    subscription: state.billing.subscription,
    userRadarSubscriptions: state.billing.userRadarSubscriptions,
    admin: state.user.me?.authorities.some(role=>role.includes('ADMIN')),
    hubs: state.hub.hubs,
    radars: state.radar.radars,
    beacons: state.sofiBeacon.beacons.beacons,
    loading: state.billing.loading,
    paymentRequired: state.billing.paymentRequired
})

class UnpaidPage extends Component {
    constructor(props) {
        super(props)
        this.state={
            confirmPage: false,
            product: props.match.params.product?.toLowerCase()
        }
    }

    componentDidMount() {
        const {me,hubs, beacons,radars, selectedBeacon, selectedHub, selectedRadar, match} = this.props
        hubs?.length===0 && beacons?.length===0 && radars?.length===0 &&
            actions.hub.getSofiDevices()

        if(match.params.product.toLowerCase()==='beacon'){
            actions.billing.fetchStripePlanByPubId({product:'beacon',pub_id:selectedBeacon.pub_id})
        }else actions.billing.fetchStripePlan(match.params.product.toLowerCase()==='radar'? 'radar': 'hub')

        match.params.product.toLowerCase()==='beacon'?
            selectedBeacon && actions.billing.fetchSubscription(selectedBeacon.pub_id):
            match.params.product.toLowerCase()==='radar'?
                selectedRadar && actions.billing.fetchSubscription(selectedRadar.pub_id):
                selectedHub && actions.billing.fetchSubscription(selectedHub.hub_id)

        me && match.params.product.toLowerCase()==='radar' && actions.billing.fetchUserRadarSubscriptions(me.email)
    }

    componentDidUpdate(prevProps) {
        const {me, stripePlan, subscription, selectedBeacon, selectedHub, selectedRadar, match, paymentRequired} = this.props
        if(!stripePlan) {
            if(match.params.product.toLowerCase()==='beacon'){
                actions.billing.fetchStripePlanByPubId({product:'beacon',pub_id:selectedBeacon.pub_id})
            }else actions.billing.fetchStripePlan(match.params.product.toLowerCase()==='radar'? 'radar': 'hub')
        }

        match.params.product.toLowerCase()==='hub' && prevProps.selectedHub!== selectedHub && actions.billing.fetchSubscription(selectedHub.hub_id)

        match.params.product.toLowerCase()==='beacon' && prevProps.selectedBeacon!== selectedBeacon && actions.billing.fetchSubscription(selectedBeacon.pub_id)

        match.params.product.toLowerCase()==='radar' && prevProps.selectedRadar!== selectedRadar && actions.billing.fetchSubscription(selectedRadar.pub_id)

        prevProps.subscription !== subscription && !paymentRequired &&
        actions.routing.push(match.params.product.toLowerCase()==='beacon' ? '/beacon/dashboard': match.params.product.toLowerCase()==='radar' ? '/radar/dashboard':'/dashboard')
        prevProps.me !== me && match.params.product.toLowerCase()==='radar' && actions.billing.fetchUserRadarSubscriptions(me.email)
    }

    afterVerify = () => {
        this.setState({confirmPage: true})
    }

    confirmPayment = () => {
        const {me, paymentMethod, selectedBeacon, selectedHub, selectedRadar} = this.props
        const {product} = this.state
        const product_id = product==='beacon' ? selectedBeacon.pub_id : product==='radar' ? selectedRadar.pub_id : selectedHub.hub_id
        const physical_id = product==='beacon' ? selectedBeacon.imei : product==='radar' ? selectedRadar.mac_address : selectedHub.mac_address
        let payload = {
            payment_method: paymentMethod.id,
            email:me.email,
            product: product ==='beacon' ? product: product ==='radar' ? 'radar':  'Hub',
            product_id: product_id,
            physical_id: physical_id
        }

        actions.billing.setLoading(true)
        actions.billing.createCustomer(payload).then(()=>{
            actions.billing.fetchSubscription(product_id)
            this.setState({confirmPage: false})
            actions.routing.push(product==='beacon' ? '/beacon/dashboard': product==='radar' ? '/radar/dashboard':'/dashboard')
        }).finally(()=>actions.billing.setLoading(false))
    }

    bypassPayment = () => {
        const {product} = this.state
        actions.billing.save({bypassPayment: true})
        actions.routing.push(product==='beacon' ? '/beacon/dashboard': product==='radar' ? '/radar/dashboard':'/dashboard')
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
        actions.billing.addToSubscription(payload).then(() => {
            message.success('Subscription Added')
            actions.routing.push('/radar/dashboard')
        })
    }

    renderTitle = () => (
        <Row type="flex" justify="space-between" gutter={[8,8]} className="break-space" >
            <Col>Whoops, we&#39;re missing your payment details!</Col>
            <Col>{this.props.admin && <Button onClick={this.bypassPayment}>Skip (Admin only)</Button>}</Col>
        </Row>
    )

    renderRadarContent = () => {
        const {userRadarSubscriptions, stripePlan} = this.props
        const radarSubscriptions = userRadarSubscriptions?.filter(subscription=>subscription.product_type==='RADAR')
        const {product} = this.state

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

    renderOtherContent = () => {
        const  {stripePlan, admin, selectedBeacon, selectedRadar, selectedHub } = this.props
        const {product} = this.state
        const physicalId = product==='beacon' ? selectedBeacon?.imei : product==='radar' ? selectedRadar?.mac_address : selectedHub?.mac_address

        return <div className="advanced_block" style={{marginBottom:0}}>
            <p>A subscription is needed to use your {showProductName(product)}. We need a payment method for the subscription.
                The subscription is {stripePlan ? dollarSymbol(stripePlan.currency)+stripePlan.price:''} per month.</p>
            <p>
                You cannot use your {showProductName(product)} without a valid subscription and valid payment method.
            </p>
            <p>
                Please add your payment details below to start your subscription.
            </p>
            <div align="center">
                <CardMinimal
                    admin={admin}
                    button="Verify Card"
                    afterVerify={this.afterVerify}
                />
            </div>

            <p className="desc" style={{margin: '0 30px'}}>Verifying your card does not charge your card or start
                subscription.
                Once your card is verified the next screen will ask you to confirm before we charge your card.</p>
            <NDISDevice product={product} physicalId={physicalId} />
        </div>
    }

    renderPageContent() {
        const { stripePlan, paymentMethod, loading } = this.props
        const { confirmPage, product } = this.state
        const last4 = paymentMethod ? paymentMethod.card.last4 : ''
        return (
            <Row type="flex" justify="center">
                <Col xs={22} md={16} >
                    <Card title= {this.renderTitle()}>
                        <Spin spinning={loading}>
                            {product==='radar'? this.renderRadarContent() : this.renderOtherContent()}
                            <Modal
                                confirmLoading={loading}
                                open={confirmPage}
                                title="Adding Payment Method"
                                okText="Agree and Pay"
                                onCancel={()=>this.setState({confirmPage: false})}
                                onOk={this.confirmPayment}
                            >
                                <p>Summary:</p>
                                <ul>
                                    <li>You are adding a payment method for a subscription which costs {stripePlan ? dollarSymbol(stripePlan.currency)+stripePlan.price:''} monthly.</li>
                                    <li>Your subscription requires payment now, your card will be charged today.</li>
                                    <li>The payment will be made to the card ending in {last4}</li>
                                    <li>Should you want to update these payment details in the future, you can change them in the setting page</li>
                                </ul>
                            </Modal>
                        </Spin>
                    </Card>
                    <RemoveDeviceCard product={product}/>
                </Col>
            </Row>

        )
    }

    render() {
        return (
            <PortalLayout
                menu={this.state.product==='home' ? 'hub':this.state.product}
                contentClass="contentPage"
                content={ this.renderPageContent()}
            />
        )
    }
}

export default connect(mapStateToProps,null)(UnpaidPage)

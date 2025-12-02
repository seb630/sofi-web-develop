import { Fragment } from 'react'
import PauseSubscriptionCard from '@/pages/Subscription/PauseSubscriptionCard'
import EmailNotificationCard from '@/pages/Subscription/EmailNotificationCard'
import SubscriptionCard from '@/pages/Subscription/SubscriptionCard'
import { connect } from 'mirrorx'

const mapStateToProps = state => ({
    subscriptionStatus: state.billing.subscriptionStatus,
    subscriptionConditions: state.billing.subscriptionConditions,
    subscription: state.billing.subscription,
    stripeEnabled: state.common.stripeEnabled,
    beaconCarer: state.sofiBeacon.selectedBeaconUsers,
    hubCarer: state.hub.hubUsers,
    radarCarer: state.radar.radarUsers,
})

const SubscriptionSettings = (props) =>{
    const {stripeEnabled, subscription, hubCarer, beaconCarer, radarCarer} = props
    const carers = subscription?.product_type === 'HUB' ? hubCarer : subscription?.product_type === 'BEACON' ? beaconCarer : radarCarer
    return (
        <Fragment>
            <SubscriptionCard {...props} carers={carers} />
            {stripeEnabled && <EmailNotificationCard {...props}/>}
            {stripeEnabled && <PauseSubscriptionCard {...props}/>}
        </Fragment>
    )
}

export default connect(mapStateToProps, null)(SubscriptionSettings)

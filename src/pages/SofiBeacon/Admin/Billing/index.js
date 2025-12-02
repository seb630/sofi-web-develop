import SubscriptionCard from '../../../Subscription/SubscriptionTab'

const beaconBilling = (props) =>{
    return (<SubscriptionCard productId={props?.selectedBeacon?.pub_id} />)
}

export default beaconBilling

import SubscriptionCard from '@/pages/Subscription/SubscriptionTab'

const hubBilling = (props) =>{
    return (<SubscriptionCard productId={props?.selectedHub?.hub_id} />)
}

export default hubBilling

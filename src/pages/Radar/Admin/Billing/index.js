import SubscriptionCard from '@/pages/Subscription/SubscriptionTab'

const radarBilling = (props) =>{
    return (<SubscriptionCard productId={props?.selectedRadar?.pub_id} productType="Radar"/>)
}

export default radarBilling

import { Progress, Row } from 'antd'
import StripePayment from '../../../components/Stripe/CardMinimal'
import { dollarSymbol, isBeacon, showProductName } from '@/utility/Common'
import NDISDevice from '@/pages/Settings/Payment/NDISDevice'

export const noPayment = (product) => <div>
    <h4>Subscription and Payment</h4>
    <p>It looks like this {showProductName(product)} already has payment details entered in already. No action necessary. You can check these
        details on the settings page once we&#39;re finished.</p>
    <Row type="flex"  className='margin-bottom' justify="center">
        <Progress type="circle" percent={100}  strokeColor='#44AF86'/>
    </Row>
</div>

export const payment = (product, stripePlan, admin=false) => <div className="advanced_block">
    <h4>Subscription and Payment</h4>
    <p>In order to use your {showProductName(product)}, there is a monthly subscription fee which is {dollarSymbol(stripePlan.currency)+stripePlan.price}.
        Before you can start using your {showProductName(product)} we need you to fill in payment information:</p>
    <div className='margin-bottom' align="center">
        <StripePayment admin={admin}/>
    </div>
    <p className="desc" style={{margin:'0 50px'}}>Verifying your card does not charge your card or start subscription. Once your card is verified the next screen will ask you
        to confirm before we charge your card.</p>
    <NDISDevice product={product} physicalId={isBeacon(product)?product.imei : product.mac_address} />
</div>

export const paymentConfirmation = (product, stripePlan, last4) => <div>
    <h4>Confirm your subscription and payment method</h4>
    <p>Summary:</p>
    <ul>
        <li>You are signing up for a subscription which will charge your card {stripePlan ? dollarSymbol(stripePlan.currency)+stripePlan.price: ''} today.</li>
        <li>Next month, and every month afterwards we will charge your card {stripePlan ? dollarSymbol(stripePlan.currency)+stripePlan.price: ''}.</li>
        <li>The payment will be made to the card ending in {last4}</li>
        <li>In order to user your {showProductName(product)} requires a subscription and valid payment.</li>
        <li>You can update this payment method any time in the settings page.</li>
        <li>You can also cancel this subscription in the setting page or by contacting our support team</li>
    </ul>
    <p>If you understand and agree please continue by pressing &quot;Agree and Pay&quot;</p>
</div>

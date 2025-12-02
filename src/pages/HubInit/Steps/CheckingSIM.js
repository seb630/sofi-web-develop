import { CheckCircleOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { Button, Spin } from 'antd'
import { dollarSymbol, showProductName } from '@/utility/Common'

export const checkLoading = () => <div className="advanced_block">
    <h4>Please wait while we do some checks...</h4>
    <p>This will only take a sec...</p>
    <div className='margin-bottom' align="center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 108 }} spin />} />
    </div>
</div>

export const needActivate = (product, handleActivate, withTitle= true) => <div className="advanced_block">
    {withTitle && <h4>We need to activate the SIM card in your {showProductName(product)} before we can continue</h4>}
    <p>This process normally takes less than 30 minutes. To activate SIM card press the button below.
        SIM card activation happens in the background so that means you can stay here on this page and we will update you once the SIM is activated or you can come back later at any time.</p>
    <div className='margin-bottom' align="center">
        <Button onClick={handleActivate} type="primary">Activate SIM</Button>
    </div>
</div>

export const activating = (product) => <div className="advanced_block">
    <h4>We are activating the SIM card in your {showProductName(product)}, please wait!</h4>
    <p>This process normally takes less than 30 minutes, but it can take up to 1 hour. You can stay here and we will automatically keep checking if its finished for you.
        You can close this window if you like and return at a later stage*, we will keep monitoring activation in the background.</p>

    <p>If your activation takes longer than 1 hour please reach out to our support team: support@sofihub.com, or 1300 110 366.</p>
    <div className='margin-bottom' align="center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 108 }} spin />} />
    </div>
    <p className="messageDescription"><sup>*</sup>You will need to enter the MAC or IMEI number again to return to this
    step.</p>
</div>

export const activeSuccess = () => <div className="advanced_block">
    <div className='margin-bottom' align="center">
        <CheckCircleOutlined className="successStatusIcon" />
        <p>Your SIM card has been activated!</p>
        <p>Please click the Next button below to proceed.</p>
    </div>
</div>

export const activeFail = () => <div className="advanced_block">
    <h4>SIM Card Activation Failed</h4>
    <div className='margin-bottom' align="center">
        <ExclamationCircleOutlined className="failStatusIcon" />
        <p>Please contact support for further assistance.</p>
    </div>
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

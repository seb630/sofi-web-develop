import { Collapse, Typography } from 'antd'
import { isBeacon, showProductName } from '@/utility/Common'
import { Link } from 'mirrorx'

const {Paragraph} = Typography

const NDISDevice = (props) => {
    const {product, physicalId} = props

    const productName = showProductName(product)

    const imeiOrMac = typeof product ==='object' ? isBeacon(product)? 'IMEI': 'MAC' : product.toLowerCase() ==='beacon' ? 'IMEI': 'MAC'

    return (
        <Collapse className="NDISCollapse">
            <Collapse.Panel header={<span style={{fontSize:14}}>Click here if this device is supposed to be part of a Home Care Package or NDIS Package</span>} key="1">

                <Paragraph>You&#39;re seeing the above credit card payment screen because at the moment SOFIHUB has not
                    been notified about this device being part of a Home Care Package or NDIS Package (or we have not
                    received payment from your provider). Please note that SOFIHUB requires a subscription to use our devices on an ongoing basis.</Paragraph>

                <Paragraph>In order to arrange for your Home Care Provider or NDIS Provider to pay for ongoing subscription fees, please:
                    <ol>
                        <li>Download <Link to="/files/Subscription_form.pdf" target="_blank" download>this form</Link></li>
                        <li>Fill it out</li>
                        <li>And send the form back to us at our email <a href={'support@sofihub.com'}>support@sofihub.com</a></li>
                    </ol>
                </Paragraph>

                <Paragraph>
                    Tip: You are filling out the form for a {productName} with {imeiOrMac}: {physicalId}
                </Paragraph>

                <Paragraph>Once we receive your form with all the details filled out, we can then reach out to them to organise that the subscription fees are covered by your package. However please note this can take some time to organise - and during this period you will not be able to access your device.</Paragraph>

                <Paragraph>If you&#39;d like immediate access to this device you can use a card payment in the interim period - but please do not forget to download the form, fill it out, and send it to us via email first!</Paragraph>

                <Paragraph  style={{marginBottom: 0}}>If you need any assistance please reach out to us at support@sofihub.com or call us on 1300 110 366</Paragraph>
            </Collapse.Panel>
        </Collapse>
    )
}

export default NDISDevice

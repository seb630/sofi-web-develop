import {actions, connect} from 'mirrorx'
import {Button, Card, message, Modal, Space, Typography} from 'antd'
import {globalConstants} from '@/_constants'
import {useState} from 'react'

const mapStateToProps = state => ({
    stripeEnabled: state.common.stripeEnabled
})

const productName = {
    hub: globalConstants.HUB_SOFIHUB,
    beacon: globalConstants.BEACON_SOFIHUB,
    eazense: globalConstants.RADAR_RAYTEL,
    radar: globalConstants.RADAR_HOBA,
    all: 'All products',
    null: ''
}

const StripeUpdate = (props) => {
    const [open, setOpen] = useState(false)
    const [product, setProduct] = useState()
    const [loading, setLoading] = useState(false)
    const hostname = window.location.hostname
    const isDevelop = hostname.includes('develop') || hostname.includes('localhost')

    const handleOpen = (product) => {
        setOpen(true)
        setProduct(product)
    }

    const handleSync = () => {
        setLoading(true)
        actions.billing.updateStripeSync(product).then(()=>{
            message.success('Success')
            setProduct(null)
            setOpen(false)
        }).catch(err=>message.error(err)).finally(()=>setLoading(false))
    }

    const renderNotEnabled = () => <span>Please note this is a Sofihub only function. Stripe is not available.</span>
    const renderEnabled = () => <Space direction="vertical" size="large" style={{ display: 'flex' }}>
        <Typography.Paragraph>
            If there has been a pricing change via the Stripe web console, you can use the buttons here to:
            <ol>
                <li>
                    Update all existing subscriptions to put them on the new pricing model.
                </li>
                <li>
                    Update the database to reflect the new pricing for existing customers.
                </li>
                <li>
                    Ensure both new customers and old customers are on the most up to date pricing structure.
                </li>
            </ol>
        </Typography.Paragraph>
        <Typography.Paragraph>
            You can update all subscriptions (new/existing) to the new pricing structure for the following products:
        </Typography.Paragraph>
        <div style={{textAlign:'center'}}>
            <Space>
                <Button type="primary" onClick={()=>handleOpen('hub')}>{globalConstants.HUB_SOFIHUB}</Button>
                <Button type="primary" onClick={()=>handleOpen('beacon')}>{globalConstants.BEACON_SOFIHUB}</Button>
                {isDevelop && <>
                    <Button type="primary" onClick={()=>handleOpen('eazense')}>{globalConstants.RADAR_RAYTEL}</Button>
                    <Button type="primary" onClick={()=>handleOpen('radar')}>{globalConstants.RADAR_HOBA}</Button>
                    <Button type="primary" onClick={()=>handleOpen('all')}>All products</Button>
                </>}
            </Space>
        </div>
    </Space>

    return <><Card title="Stripe Pricing Update">
        {props.stripeEnabled ? renderEnabled() : renderNotEnabled()}
    </Card>
    <Modal
        open={open}
        onCancel={()=>setOpen(false)}
        okButtonProps={{loading: loading}}
        okText={`Update pricing for ${productName[product]}`}
        onOk={handleSync}
        title="Are you sure you want to update all subscriptions (new/existing) with the latest pricing model stored in the Stripe web console?"
    >
        <ul>
            <li>
                New pricing must exist in Stripe web console and be the new default pricing model
            </li>
            <li>
                You may need to inform customers about the change in their subscription pricing.
            </li>
            <li>
                All new and old subscriptions will be impacted.
            </li>
            <li>
                This change is not reversible
            </li>
        </ul>
    </Modal>
    </>
}

export default connect(mapStateToProps, {})(StripeUpdate)

import {Button, message, Typography} from 'antd'
import {globalConstants} from '@/_constants'
import {actions} from 'mirrorx'
import { isWatch } from '@/utility/Common'

const ResendCloudAddressField = (props) => {

    const handleSetCloudAddress = async () => {
        try {
            const { selectedBeacon } = props
            await actions.sofiBeacon.smsServerAddress({ beaconId: selectedBeacon.pub_id })
            message.success('Cloud Address Sent!')
        } catch (err) {
            err.global_errors?.map((msg) => {
                message.error(msg)
            })
        }
    }

    return (
        <Typography.Paragraph>
            <Typography.Text strong>2. Getting the {isWatch(props.selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC} pointed to the right portal/cloud:</Typography.Text><br/>
            <Button type="primary" onClick={handleSetCloudAddress} className="margin-right"> Resend Cloud Address SMS </Button>
            <Typography.Text type="secondary" style={{fontSize: 14}}>This button will ask the {isWatch(props.selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC} to speak to this portal/cloud.</Typography.Text>
        </Typography.Paragraph>
    )
}

export default ResendCloudAddressField

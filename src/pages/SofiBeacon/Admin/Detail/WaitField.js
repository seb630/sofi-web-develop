import {Typography} from 'antd'
import {formatPhoneNumberIntl} from 'react-phone-number-input'
import {globalConstants} from '@/_constants'
import {titleCase} from 'change-case'
import { isWatch } from '@/utility/Common'

const WaitField = (props) => {
    const {selectedBeacon} = props
    return (
        <Typography>
            <Typography.Text strong>3. Sit back and wait 5-10 minutes:</Typography.Text><br/>
            <Typography.Paragraph>
                Performing steps 1 and 2 can take 5-10 minutes for the change to take effect. Check the device dashboard to see if the {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC} has come online.
            </Typography.Paragraph>
            <Typography.Paragraph>
                {titleCase(isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC)} is still &quot;Offline&quot; and you&#39;ve waited 10 minutes?
                <ul>
                    <li>
                        Is the {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC} switched on?
                    </li>
                    <li>
                        Is the {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC} SIM card active?
                    </li>
                    <li>
                        Is the right SIM card in the right {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC}? <br/>
                        (You can send &quot;v?&quot; to {formatPhoneNumberIntl(selectedBeacon?.phone)} and the response should match {selectedBeacon?.imei})
                    </li>
                    <li>
                        Does the {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC} have good reception? <br/>
                        (The &quot;v?&quot; from the previous command will specify signal strength, a value above 5 is recommended).
                    </li>
                    <li>
                        Restart the {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC}. (You can do this remotely by sending &quot;reboot!&quot; to {formatPhoneNumberIntl(selectedBeacon?.phone)}
                    </li>
                </ul>
            </Typography.Paragraph>
            <Typography.Paragraph>
                IMPORTANT: Your {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC} must be switched off before a SIM card has been acvitated. Only after the carrier has confirmed the SIM card is active may you switch on your {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC}. If you have switched on your {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC} before SIM card activation, restart your {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC} and wait. You may need to go back to step 1 if problems persist.
            </Typography.Paragraph>
        </Typography>
    )
}

export default WaitField

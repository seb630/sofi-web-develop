import { Col, Modal, Row, Typography } from 'antd'
import { globalConstants } from '@/_constants'
import { BrowserView, MobileView } from 'react-device-detect'
import InboundCalls from '@/images/beacon_restrict_inbound_calls_icon.png'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import Icon from '@/images/beacon_hang_up_icon.gif'
import Watch from '@/images/beacon_watch_icon.png'
import { isWatch, showCompanyName } from '@/utility/Common'

export const autoAnswerInfo = () => {
    Modal.info({
        title: 'What is "Auto Answer Inbound Phone Calls"?',
        width: 700,
        closable: true,
        content: <Typography>
            <Typography.Paragraph>
                Your {globalConstants.PENDANT_GENERIC} can auto answer incoming phone calls after a certain amount of rings. By default this is enabled.
                    The {globalConstants.PENDANT_GENERIC} will still make audible ringtone before answering the call when enabled. When disabled the {globalConstants.PENDANT_GENERIC} will ring and wait for an answer by button press.
            </Typography.Paragraph>
            <Typography.Paragraph>
                    By default this function is enabled and set to 2 rings.
            </Typography.Paragraph>
        </Typography>
    })
}


export const inboundInfo = (selectedBeacon) => {
    const deviceType = isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB
    Modal.info({
        width: 700,
        title: 'What is "Restrict Inbound Calls"?',
        closable: true,
        content: <>
            <MobileView>
                <Row type="flex" gutter={[16,16]}>
                    <Col xs={24}>
                        <div id="inboundCalls">
                            <img src={InboundCalls} alt="Beacon Restrict Inbound Calls Icon"/>
                        </div>
                    </Col>
                    <Col xs={24}>
                        <p>Your {deviceType} can be called directly on {selectedBeacon ? formatPhoneNumberIntl(selectedBeacon?.phone): 'phone number'}.
                            This means you can call the {deviceType}, but it also means that others such as telemarketers and call centers can also call the {deviceType}.
                        </p>
                        <p>You can restrict inbound calls to only be allowed through if they are on the list of emergency contact numbers.</p>
                        <p>Please note support staff will not be able to conduct diagnostics if enabled.</p>
                    </Col>
                </Row>
            </MobileView>
            <BrowserView><Row type="flex" gutter={16} wrap={false}>
                <Col flex="270px">
                    <div id="inboundCalls">
                        <img src={InboundCalls} alt="Beacon Restrict Inbound Calls Icon"/>
                    </div>
                </Col>
                <Col flex="auto">
                    <p>Your {deviceType} can be called directly on {selectedBeacon ? formatPhoneNumberIntl(selectedBeacon?.phone): 'phone number'}.
                        This means you can call the {deviceType}, but it also means that others such as telemarketers and call centers can also call the {deviceType}.
                    </p>
                    <p>You can restrict inbound calls to only be allowed through if they are on the list of emergency contact numbers.</p>
                    <p>Please note support staff will not be able to conduct diagnostics if enabled.</p>
                </Col>
            </Row>
            </BrowserView>
        </>
    })
}

export const hangUpInfo = (selectedBeacon) => {
    const deviceType = isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB
    const imageSrc = isWatch(selectedBeacon) ? Watch : Icon
    Modal.info({
        title: `What is "Allow ${deviceType} To Hang Up By Button Press"?`,
        width: 700,
        closable: true,
        content:
            <Row type="flex" gutter={16} wrap={false}>
                <Col flex="110px">
                    <div id="hangUpIcon">
                        <img src={imageSrc} alt="Beacon hang up icon"/>
                    </div>
                </Col>
                <Col flex="auto">
                    <Typography>
                        <Typography.Paragraph>Your {deviceType} supports hanging up phone calls on the pendant end by pressing the SOS button.
                        </Typography.Paragraph>
                        <Typography.Paragraph>By default {showCompanyName(window.location.hostname)} disables this as in a panic the user or a {globalConstants.PENDANT_GENERIC} may press the SOS
                            button multiple times trying to get help. But in reality end up hanging up the call.</Typography.Paragraph>
                        <Typography.Paragraph>{showCompanyName(window.location.hostname)} recommends leaving this disabled, however if you understand the implications you can enable this function.</Typography.Paragraph>
                    </Typography>
                </Col>
            </Row>

    })
}

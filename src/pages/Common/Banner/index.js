import { DollarOutlined, MailOutlined, PhoneOutlined, SettingOutlined, ToolOutlined } from '@ant-design/icons'
import { Button, Col, Row } from 'antd'
import moment from 'moment-timezone'
import DownTime from '../../../_constants/downtime'
import { actions, connect } from 'mirrorx'
import { formatTemplateToString, formatTimeWithTimezone, paymentFailed } from '@/utility/Common'

export const VerificationBanner = (props) => {
    const { verified, openModal, mobile } = props
    if (!verified && mobile) {
        return (
            <div className="dashboard_alert">
                <div className="normal_alert alerts">
                    <Row type="flex" wrap={false}>
                        <Col flex="72px">
                            <PhoneOutlined />
                        </Col>
                        <Col flex="auto">
                            <div className="title">Verify your mobile phone number now!</div>
                            <div>You won&#39;t receive any SMS notifications until your mobile is verified.</div>
                            <Button onClick={openModal} type="ghost">Verify Mobile Number</Button>
                        </Col>
                    </Row>

                </div>
            </div>
        )
    }else return (<div/>)
}

export const NewEmailBanner = (props) => {
    const { newEmail, rollback } = props
    if (newEmail) {
        return (
            <div className="dashboard_alert">
                <div className="normal_alert alerts">
                    <Row type="flex" wrap={false}>
                        <Col flex="72px">
                            <MailOutlined />
                        </Col>
                        <Col flex="auto">
                            <div className="title">We&#39;ve received a request to change your account&#39;s email
                                address</div>
                            <div>A verification email has been sent to your new email
                                address: {newEmail} - click the link in that email to confirm your new email address,
                                or you can cancel this email change by pressing the &quot;Roll Back&quot; button</div>
                            <Button type="ghost" onClick={()=>rollback()}>Roll Back</Button>
                        </Col>
                    </Row>

                </div>
            </div>
        )
    }else return (<div/>)
}

export const WelcomeBanner = (props) => {
    const { oobe, openModal } = props
    if (oobe) {
        return (
            <div className="dashboard_alert">
                <div className="normal_alert alerts">
                    <Row type="flex" wrap={false}>
                        <Col flex="72px">
                            <SettingOutlined />
                        </Col>
                        <Col flex="auto">
                            <div className="title">Welcome! Let&#39;s finish setting up!</div>
                            <div>We need a few more details to get up and running properly - let&#39;s get started!</div>
                            <Button type="ghost"  onClick={openModal}>Get Started</Button>
                        </Col>
                    </Row>

                </div>
            </div>
        )
    }else return (<div/>)
}

export const ExpiryBanner = (props) => {
    const {subscription} = props
    const expiringMonthYear = subscription && moment(subscription.payment_card_expiry, 'M/YYYY')
    const expiring = moment().isSame(expiringMonthYear,'month')
    const failed = paymentFailed(subscription?.subscription_status)
    const handleUpdateInfo = () => {
        let destination
        if (subscription.product_type === 'RADAR') {
            destination = '/radar/settings/subscription'
        }else if (subscription.product_type === 'BEACON') {
            destination = '/beacon/settings/subscription'
        }else {
            destination = '/settings/subscription'
        }
        actions.routing.push(destination)
    }

    if (failed){
        return (
            <div className="dashboard_alert">
                <div className="warning_alert alerts">
                    <Row type="flex" wrap={false}>
                        <Col flex="72px">
                            <DollarOutlined />
                        </Col>
                        <Col flex="auto">
                            <div className="title">Your most recent subscription payment failed!</div>
                            <div>This might be because you do not have enough funds on your card. Please ensure there is enough funds on the card. We will auto retry the payment automatically.
                                If you’d like to provide new card details you can do so <a onClick={handleUpdateInfo}>here</a>.
                                If the payment fails again will ask for a new payment method, and if none is provided we will terminate your service (this means your device will stop working and will no longer be able to call for help even if it verbally states its attempting to do so).
                            </div>
                        </Col>
                    </Row>

                </div>
            </div>
        )
    }
    if (expiring && subscription?.subscription_status==='ACTIVE'){
        return (
            <div className="dashboard_alert">
                <div className="warning_alert alerts">
                    <Row type="flex" wrap={false}>
                        <Col flex="72px">
                            <DollarOutlined />
                        </Col>
                        <Col flex="auto">
                            <div className="title">Your payment method is about to expire!</div>
                            <div>Please make sure to update your payment method details as soon as you can. You can
                                click <a onClick={handleUpdateInfo}>here</a> to go to the subscription settings page
                                to update your payment method.
                            </div>
                        </Col>
                    </Row>

                </div>
            </div>
        )
    }else return (<div/>)
}

const mapStateToProps = state => ({
    showDownTime: state.common.showDownTime,
})

const _DownTimeBanner = (props) => {
    const dismiss = () => {
        actions.common.changeShowDownTime(false)
        actions.routing.push('/maintenance')
    }
    const dontShow = (id) => {
        if (localStorage) {
            localStorage.setItem('dontShow', id)
        }
        actions.common.changeShowDownTime(false)
    }

    const {showDownTime, timezone} = props
    const latestDownTime = DownTime[DownTime.length-1]
    const show = showDownTime && localStorage && Number(localStorage.getItem('dontShow')) < latestDownTime.id
    const start = formatTimeWithTimezone(latestDownTime.outageDateTimeStart, timezone)
    const end = formatTimeWithTimezone(latestDownTime.outageDateTimeEnd, timezone)

    if ( show && moment(latestDownTime.notificationDateTimeStart).isBefore(moment()) && moment(latestDownTime.notificationDateTimeEnd).isAfter(moment())) {
        return (
            <div className="dashboard_alert">
                <div className="normal_alert alerts">
                    <Row type="flex" wrap={false}>
                        <Col flex="72px">
                            <ToolOutlined />
                        </Col>
                        <Col flex="auto">
                            <div className="title">{latestDownTime.notificationTitle}</div>
                            <div>{formatTemplateToString(latestDownTime.notificationBody, {start, end})}</div>
                            <Button type="ghost" onClick={dismiss} style={{marginRight:12}}>More Details</Button>
                            <Button type="ghost" onClick={()=>dontShow(latestDownTime.id)}>Don&#39;t show again</Button>
                        </Col>
                    </Row>

                </div>
            </div>
        )
    }else return (<div/>)
}

export const DownTimeBanner = connect (mapStateToProps)(_DownTimeBanner)

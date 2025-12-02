import { Component, createRef, Fragment } from 'react'
import { Form } from '@ant-design/compatible'
import { Button, Col, Divider, Input, message, Modal, Row, Steps, Select } from 'antd'
import label from '../../../images/imei_label.png'
import { actions, connect } from 'mirrorx'
import { globalConstants } from '@/_constants'
import ReCAPTCHA from 'react-google-recaptcha'
import { noPayment, payment, paymentConfirmation } from '../../HubInit/Steps/Payment'
import { lockContent } from '../../HubInit/Steps/LockDevice'
import { activating, activeFail, activeSuccess, checkLoading, needActivate } from '../../HubInit/Steps/CheckingSIM'
import moment from 'moment'
import { getOobeStorage, storeJSONData } from '@/utility/Storage'
import Media from 'react-media'
import { deviceType, isMobile } from 'react-device-detect'
import { isWatch } from '@/utility/Common'
import { buildTimezoneOptions } from '@/utility/Countries'

const mapStateToProps = state => ({
    me: state.user.me,
    admin: state.user.me?.authorities.some(role => role.includes('ADMIN')),
    newBeaconModal: state.common.newBeaconModal,
    newWatchModal: state.common.newWatchModal,
    beacons: state.sofiBeacon.beacons.beacons,
    paymentMethod: state.billing.paymentMethod,
    dashboardOverview: state.user.dashboardOverview,
    paymentRequired: state.billing.paymentRequired,
    stripePlan: state.billing.stripePlan,
    productActivation: state.SIM.productActivation,
})

let interval = 0

class BeaconInitModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            current: 0,
            lock: true,
            newBeaconId: '',
            imei: null,
            loading: false,
            confirmPage: false,
            activateSent: false,
            timezone: 'Not set',
            hastimezone: true
        }
        this.recaptchaRef = createRef()
    }

    componentDidUpdate(prevProps) {
        const { newBeaconModal, productActivation } = this.props
        newBeaconModal && prevProps.productActivation !== productActivation &&
            productActivation?.request_status === 'PENDING' && !productActivation?.skip_activation &&
            productActivation?.sim_status !== 'ACTIVE' && this.autoFetch()
    }

    next = () => {
        const deviceType = this.props.newWatchModal ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB
        const { paymentRequired } = this.props
        if (this.state.current === 0) {
            //actions.billing.fetchStripePlan('beacon')
            const current = this.state.current + 1
            this.setState({ current })
        } else if (this.state.current === 2) {
            this.recaptchaRef.current.execute()
        } else if (this.state.current === 3 && !paymentRequired) {
            this.handleSIMVerification()
        } else if (this.state.current === 3 && paymentRequired) {
            this.setState({
                confirmPage: true
            })
        }
        else if (this.state.current === 5) {
            actions.user.dashboardOverview()
            const current = this.state.current + 1
            this.setState({ current })         
        } else if (this.state.current === 6 && deviceType === 'Watch') {
            if (this.state.timezone === 'Not set') {
                this.setState({hastimezone: false})
            } else {
                this.setState({hastimezone: true})
                const current = this.state.current + 1
                this.setState({ current })    
            }
        }
        else {
            const current = this.state.current + 1
            this.setState({ current })
        }
    }

    prev = () => {
        const current = this.state.current - 1
        this.setState({ current })
    }

    handleSIMVerification = () => {
        const payload = {
            macOrImei: this.state.imei.toLowerCase().trim(),
            type: 'BEACON'
        }
        actions.SIM.fetchSIMByProduct(payload)
            .then((result) => {
                const skip = !result || result?.skip_activation
                const current = this.state.current + (skip ? 2 : 1)
                this.setState({ current, imei: this.state.imei.toLowerCase(), confirmPage: false })
                !skip ? new Promise(resolve => setTimeout(resolve, 3000)).then(() => {
                    this.setState({ loading: false })
                }) : this.setState({ loading: false })
            }).catch((error) => {
                message.error(error.message, 10)
                this.setState({ loading: false })
            })

    }

    handleTimeZoneChange(value) {
        this.setState({ timezone: value, isDirty: true })
        if (value !== 'Not set') {
            this.setState({hastimezone: true})
        }
    }

    captchaSuccess = (captcha) => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.setState({ imei: values.imei.toLowerCase() })

                const current = this.state.current + 1
                const payload = {
                    imei: values.imei.toLowerCase(),
                    captcha: captcha
                }
                actions.sofiBeacon.requestLinkingBeacon(payload).then((result) => {
                    actions.billing.fetchSubscription(result.beacon_pub_id).then(() => {
                        this.setState({ 
                            newBeaconId: result.beacon_pub_id, 
                            current,
                            timezone: this.props.beacons.length > 0 ? (this.props.beacons.find(beacon => beacon.pub_id === result.beacon_pub_id).timezone ?? 'Not set') : 
                                'Not set'
                        })
                    })
                    actions.sofiBeacon.fetchBeaconByUser()
                    actions.billing.fetchStripePlanByPubId({product:'beacon',pub_id:result.beacon_pub_id})
                }).catch((error) => {
                    this.recaptchaRef.current.reset()
                    message.error(error.message, 10)
                })
            }
        })
    }

    handleLockBeacon = () => {
        const deviceType = this.props.newWatchModal ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB
        const beaconId = this.state.newBeaconId
        const newBeacon = this.props.beacons.find(beacon => beacon.pub_id === beaconId)
        const payload = deviceType === 'Watch' ? {
            ...newBeacon,
            locked: this.state.lock,
            timezone: this.state.timezone
        } : {
            ...newBeacon,
            locked: this.state.lock,
        }
        const newArray = {
            device_id: beaconId,
            time: moment().format(),
            skip: false,
        }
        let storageValue = getOobeStorage()
        storageValue.push(newArray)
        storeJSONData('oobe', storageValue, true)

        actions.sofiBeacon.saveBeaconInfor(payload)
        actions.common.changeNewBeaconModal(false)
        actions.common.changeNewWatchModal(false)
        this.setState({current: 0})
        actions.sofiBeacon.selectBeacon(newBeacon).then(() => {
            actions.routing.push('/beacon/dashboard')
        })
    }

    autoFetch = () => {
        const payload = {
            macOrImei: this.state.imei?.trim(),
            type: 'BEACON'
        }
        clearInterval(interval)
        interval = setInterval(() =>
            actions.SIM.fetchSIMByProduct(payload).then((result) => {
                (result?.skip_activation || result?.sim_status === 'ACTIVE') && clearInterval(interval)
            }), globalConstants.GENERAL_AUTO_REFRESH_TIME)
    }

    handleActivate = () => {
        const { productActivation, admin } = this.props
        this.setState({ loading: true })
        actions.SIM.activateSIM({ id: productActivation?.id, notify: !admin }).then((result) => {
            result && !result.errors && message.success('Activate requested, Please wait up to five minutes')
            result?.errors?.includes('already been activated') && message.success('The SIM has already been activated')
            this.setState({ activateSent: true, loading: false })
        }).catch(() => this.setState({ loading: false }))
        this.autoFetch()
    }

    confirmPayment = () => {
        const { me, paymentMethod } = this.props
        let payload = {
            payment_method: paymentMethod.id,
            email: me.email,
            product: 'beacon',
            product_id: this.state.newBeaconId,
            physical_id: this.state.imei
        }
        this.setState({ loading: true })
        actions.billing.createCustomer(payload).then(() => {
            this.handleSIMVerification()
            actions.user.dashboardOverview()
            actions.billing.save({ paymentMethod: null, stripePlan: null })
        }).finally(() => this.setState({ loading: false }))
    }

    handleCancel = () => {
        this.setState({
            current: 0,
            lock: true,
            newBeaconId: '',
            imei: null,
            loading: false,
            confirmPage: false,
            activateSent: false,
        })
        actions.common.changeNewBeaconModal(false)
        actions.common.changeNewWatchModal(false)
    }

    render() {
        const { current, loading, confirmPage, activateSent, lock } = this.state
        const { form, paymentRequired, paymentMethod, stripePlan, productActivation, admin } = this.props
        const { getFieldDecorator } = form
        const last4 = paymentMethod ? paymentMethod.card.last4 : ''
        const deviceType = this.props.newWatchModal ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB

        const introContent = <div>
            <h4>Add a new {deviceType} to your {globalConstants.COMPANY_BRAND} account</h4>
            <p>Click Get Started below.</p>
            <p>
                <strong>Please note:</strong> If the {deviceType} you are trying to add has already been added to another account, you may not be able to add it to your account. In this instance, you would need to be sent an invitation from an account linked to that {deviceType}.
            </p>
        </div>

        const switchOffContent = <div>
            <h3 style={{ textAlign: 'center' }}>Please keep your {deviceType} switched off</h3>
            <p><strong>How can I tell if the {deviceType} is on or off?</strong><br />
                {
                    deviceType === 'Watch' ? 'The watch is off if when you raise it the screen stays black, or if when you tap the screen it stays black.' 
                        : `There are some lights on the side of the ${deviceType} that will flash every few seconds. This indicates that the device is on.
                        If you do not see any lights after 30 seconds, the device is switched off.`
                }   
            </p>
            <p>
                <strong>My {deviceType} is on, how do I turn it off?</strong><br />
                {
                    deviceType === 'Watch' ? <>1. Wake the watch by tapping the screen or clicking the button on the front (the watch screen should show the time).<br/> 
                    2. Using your finger swipe it from the right of the screen to the left until you see the &quot;Settings&quot; icon,<br/>&nbsp;&nbsp;&nbsp;&nbsp;tap the settings icon to enter the settings page.<br/>
                    3. Tap the &quot;System&quot; menu item.<br/>
                    4. Tap the &quot;Power Off&quot; menu item.<br/>
                    5. Tap &quot;Power off&quot; again to confirm.<br/></> :
                    `Please wait at least 2 minutes after turning on the ${deviceType}, before attempting to turn it off. You can turn it off
                    by pressing and holding the following buttons together for 5 seconds:`    
                }
                <br />
                {
                    deviceType === 'Watch' ? 'It may take the watch a minute to turn off, you may feel it vibrates as it turns off.' :
                        <><strong>The front SOS button</strong><br />
                        AND<br />
                            <strong>The top side button (closest to the keychain hole)</strong></>
                }
            </p>
            {
                deviceType === 'Watch' ? <></> :
                    <p>
                        You may feel the device vibrate as it turns off. The lights on the side may continue to flash for another 30 seconds.
                    </p>
            }
        </div>

        const enterCodeContent =
            <div>
                <h4>Enter the IMEI code of your {deviceType}</h4>
                <p>You can find this unique code by looking on the side or bottom of the {deviceType} box. The unique code you
                    are looking for is called &quot;IMEI&quot;.</p>
                <Row gutter={24}>
                    <Col xs={24} md={7}>
                        <img src={label} width="100%" alt="SOFIHUB beacon Label" />
                    </Col>
                    <Col xs={24} md={17}>
                        <p>Please enter the code in the box below:</p>
                        <Form>
                            <Form.Item>
                                {
                                    getFieldDecorator(
                                        'imei',
                                        {
                                            rules: [
                                                { required: true, message: globalConstants.ENTER_IMEI },
                                                {
                                                    pattern: globalConstants.IMEI_REGEX,
                                                    message: globalConstants.INVALID_IMEI,
                                                }
                                            ]
                                        }
                                    )(
                                        <Input placeholder="IMEI number" />
                                    )
                                }
                            </Form.Item>
                        </Form>
                        <Divider />
                        <p>Once you&#39;ve typed in the code, please press next.</p>
                        <ReCAPTCHA
                            ref={this.recaptchaRef}
                            size='invisible'
                            badge='inline'
                            sitekey={globalConstants.RECAPTCHA_KEY}
                            onChange={this.captchaSuccess}
                        />
                    </Col>
                </Row>
            </div>

        const checkCodeContent = <div>
            {loading ? checkLoading() :
                productActivation?.skip_activation || productActivation?.sim_status === 'ACTIVE' ? activeSuccess() :
                    !(activateSent || productActivation?.request_status || productActivation?.sim_status === 'ACTIVE') ?
                        needActivate('beacon', this.handleActivate) :
                        productActivation?.request_status === 'PENDING' || productActivation?.request_status === 'SUCCESS' ? activating('beacon') : activeFail()}
        </div>

        const switchOnContent =
            <div>
                <h4>Please switch on your {deviceType}</h4>
                <p>You can switch on your {deviceType} in two ways:</p>
                <ol>
                    <li>
                        Putting your safety {deviceType === 'Watch' ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC} on to charge on the charging base (recommended option).
                    </li>
                    <ol type="a">
                        <li>
                            {
                                deviceType === 'Watch' ? 'Locate the flat charging pad, USB cable, and AC wall adapter' :
                                    'Locate the charging cable coiled underneath the charging dock'
                            }
                        </li>
                        <li>
                            {
                                deviceType === 'Watch' ? 'Plug the USB cable into the charging pad, and AC wall adapter' :
                                    'Plug charging cable into the included AC adaptor'
                            }
                        </li>
                        <li>
                            Plug the AC adapter into the wall
                        </li>
                        <li>
                            Place your {deviceType} into the charging base
                        </li>
                    </ol>
                    <p>
                        {
                            deviceType === 'Watch' ? 'Once placed on the charging pad, the watch should turn on and show you the time, it may take a few minutes to update and show the correct time' :
                                `Once placed in the charging base, the lights on the side of the ${deviceType} start to flash; this indicates that it is switching on.`
                        }
                    </p>
                    <li>
                        {
                            deviceType === 'Watch' ? 'Hold down the button on the watch face for 5 seconds.' :
                                'Hold down the top side button (the one closest to the keychain loop) for 5 seconds.'
                        }
                    </li>
                </ol>
                {
                    deviceType === 'Watch' ? <></> : <p>The {deviceType} will vibrate to indicate it has been switched on.</p>
                }
            </div>

        const timezones = buildTimezoneOptions()

        const timeZoneContent = 
            <div>
                <h3 style={{ textAlign: 'center' }}>Set your Time Zone</h3>
                <p style={{textAlign: 'center'}}>
                    In order to make sure the watch tells you the correct time please set the time zone:
                </p>
                <Row justify="center" type="flex" className="margin-bottom">
                    <Col>
                        <Select
                            style={{ minWidth: 200 }}
                            showSearch
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            size="large"
                            value={this.state.timezone}
                            onChange={value => this.handleTimeZoneChange(value)}
                        >
                            {timezones}
                        </Select>
                        {
                            !this.state.hastimezone && <p style={{textAlign: 'center', color: 'red'}}>You must set a timezone.</p>
                        }
                    </Col>
                </Row>
                <p style={{textAlign: 'center', marginTop: '30px'}}>
                    You can change the time zone at any time later in the settings page.
                </p>
            </div>

        const subscriptionContent =
            <div>
                {confirmPage ? paymentConfirmation(deviceType, stripePlan, last4) :
                    paymentRequired && stripePlan ? payment(deviceType, stripePlan, admin) : noPayment(deviceType)}
            </div>

        const steps = deviceType === 'Watch' ? [{
            title: 'Intro',
            content: introContent,
        }, 
        {
            title: 'Switch Off',
            content: switchOffContent
        },
        {
            title: 'Enter Code',
            content: enterCodeContent,
        }, 
        {
            title: 'Subscription',
            content: subscriptionContent,
        }, 
        {
            title: 'SIM Card',
            content: checkCodeContent,
        }, 
        {
            title: 'Switch On',
            content: switchOnContent,
        },
        {
            title: 'Time Zone',
            content: timeZoneContent,
        },
        {
            title: 'Lock',
            content: lockContent(deviceType, (e) => this.setState({ lock: e.target.value }), lock),
        }] : [{
            title: 'Intro',
            content: introContent,
        }, 
        {
            title: 'Switch Off',
            content: switchOffContent
        },
        {
            title: 'Enter Code',
            content: enterCodeContent,
        }, 
        {
            title: 'Subscription',
            content: subscriptionContent,
        }, 
        {
            title: 'SIM Card',
            content: checkCodeContent,
        }, 
        {
            title: 'Switch On',
            content: switchOnContent,
        },
        {
            title: 'Lock',
            content: lockContent(deviceType, (e) => this.setState({ lock: e.target.value }), lock),
        }]

        const modalTitle = <Media query="(max-width: 767px)">
            {matches => <Steps
                current={current}
                direction={matches ? 'vertical' : 'horizontal'}
                size="small"
                labelPlacement={isMobile ? 'horizontal' : 'vertical'}
                items={steps}
            />
            }
        </Media>

        return <Modal
            title={modalTitle}
            open={this.props.newBeaconModal || this.props.newWatchModal}
            onCancel={this.handleCancel}
            width={950}
            footer={null}
            destroyOnClose
        >
            <Fragment>
                <div className="steps-content">{steps[current].content}</div>
                <div className="steps-action">
                    {
                        current === 0 &&
                        <Button type="primary" onClick={this.next} className="floatRight">Get Started</Button>
                    }
                    {
                        current !== 0 && current < steps.length - 1 && !confirmPage
                        && <Button
                            type="primary"
                            loading={loading}
                            onClick={this.next}
                            disabled={current === 4 && !productActivation?.skip_activation && productActivation?.request_status !== 'Success' && productActivation?.sim_status !== 'ACTIVE' ||
                                current === 3 && paymentRequired && !paymentMethod}
                            className="floatRight">Next</Button>
                    }
                    {
                        current === steps.length - 1
                        && <Button type="primary" onClick={this.handleLockBeacon} className="floatRight">Finish</Button>
                    }
                    {
                        current > 0 && current < 3
                        && (
                            <Button style={{ marginLeft: 8 }} onClick={this.prev}>
                                Previous
                            </Button>
                        )
                    }
                    {confirmPage && <Button
                        loading={loading}
                        type="primary"
                        onClick={this.confirmPayment}
                        disabled={loading}
                        className="floatRight">Agree and Pay</Button>}
                    {confirmPage && <Button
                        style={{ marginLeft: 8 }}
                        onClick={() => {
                            this.setState({ confirmPage: false })
                            actions.billing.save({ paymentMethod: null })
                        }}
                    >Previous</Button>}
                </div>
            </Fragment>
        </Modal>
    }
}

const BeaconInitPage = Form.create({})(BeaconInitModal)

export default connect(mapStateToProps, null)(BeaconInitPage)

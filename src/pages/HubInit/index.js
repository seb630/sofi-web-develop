import { Component, createRef, Fragment } from 'react'
import './HubInit.scss'
import { Form } from '@ant-design/compatible'
import { Button, Col, message, Modal, Row, Steps } from 'antd'
import label from '../../images/hub_label_box_label.webp'
import Mask from 'react-text-mask'
import { actions, connect } from 'mirrorx'
import { globalConstants } from '@/_constants'
import { noPayment, payment, paymentConfirmation } from './Steps/Payment'
import { activating, activeFail, activeSuccess, checkLoading, needActivate } from './Steps/CheckingSIM'
import { lockContent } from './Steps/LockDevice'
import moment from 'moment'
import { getOobeStorage, storeJSONData } from '@/utility/Storage'
import { isMobile } from 'react-device-detect'
import Media from 'react-media'
import ReCAPTCHA from 'react-google-recaptcha'

const mapStateToProps = state => ({
    me: state.user.me,
    admin: state.user.me?.authorities.some(role=>role.includes('ADMIN')),
    newHubModal: state.common.newHubModal,
    paymentMethod: state.billing.paymentMethod,
    productActivation: state.SIM.productActivation,
    dashboardOverview: state.user.dashboardOverview,
    paymentRequired:  state.billing.paymentRequired,
    stripePlan: state.billing.stripePlan,
})

let interval = 0

class HubInitModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            current:0,
            lock: true,
            mac: '',
            newHubId: '',
            verified: false,
            loading: false,
            confirmPage: false,
            activateSent: false,
        }
        this.recaptchaRef = createRef()
    }

    componentDidUpdate (prevProps) {
        const {newHubModal, productActivation} = this.props
        newHubModal && prevProps.productActivation !== productActivation &&
        productActivation?.request_status==='PENDING' && !productActivation?.skip_activation &&
        productActivation?.sim_status !== 'ACTIVE' && this.autoFetch()
    }

    next = () =>{
        const {paymentRequired} = this.props
        if (this.state.current===0){
            actions.billing.fetchStripePlan( 'hub')
            const current = this.state.current + 1
            this.setState({ current })
        }
        else if (this.state.current===2){
            this.recaptchaRef.current.execute()
        } else if (this.state.current===3 && !paymentRequired) {
            this.handleSIMVerification()
        } else if (this.state.current===3 && paymentRequired) {
            this.setState({
                confirmPage: true
            })
        } else if (this.state.current===5) {
            actions.user.dashboardOverview()
            const current = this.state.current + 1
            this.setState({ current })
        } else {
            const current = this.state.current + 1
            this.setState({ current })
        }
    }

    prev = () => {
        const current = this.state.current - 1
        this.setState({ current })
    }

    captchaSuccess = (captcha) => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.setState({loading:true, mac: values.mac.toLowerCase().trim()})
                const payload = {
                    hub_mac_address: values.mac.toLowerCase().trim(),
                    user_id: this.props.me.user_id,
                    captcha: captcha
                }

                actions.user.associateHub({payload, newHub:true}).then((result)=>{
                    actions.billing.fetchSubscription(result.hub_id).then(()=>{
                        const current = this.state.current + 1
                        this.setState({current, newHubId: result.hub_id})
                    })
                }).catch((error)=>{
                    this.recaptchaRef.current.reset()
                    message.error(error?.response?.data?.message, 10)
                }).finally(()=>this.setState({loading:false}))
            }})
    }

    handleSIMVerification = () => {
        this.setState({loading:true, confirmPage: false})
        const payload = {
            macOrImei: this.state.mac,
            type: 'HUB'
        }
        actions.SIM.fetchSIMByProduct(payload)
            .then((result)=>{
                const skip = !result || result?.skip_activation
                const current = this.state.current + (skip ? 2 : 1)
                this.setState({current, mac:this.state.mac})
                !skip ? new Promise(resolve => setTimeout(resolve, 3000)).then(()=>{
                    this.setState({loading: false})
                }) : this.setState({loading: false})
            }).catch((error)=>{
                message.error(error?.response?.data?.message, 10)
                this.setState({loading: false})
            })
    }

    autoFetch = () => {
        const payload = {
            macOrImei: this.state.mac?.trim(),
            type: 'HUB'
        }
        clearInterval(interval)
        interval = setInterval(() =>
            actions.SIM.fetchSIMByProduct(payload).then((result)=>{
                (result?.skip_activation || result?.sim_status === 'ACTIVE') && clearInterval(interval)
            }), globalConstants.GENERAL_AUTO_REFRESH_TIME)
    }

    handleActivate = ()=>{
        const {productActivation, admin} = this.props
        this.setState({loading:true})
        actions.SIM.activateSIM({id: productActivation?.id, notify: !admin}).then((result)=>{
            result && !result.errors && message.success('Activate requested, Please wait up to five minutes')
            result?.errors?.includes('already been activated') && message.success('The SIM has already been activated')
            this.setState({activateSent: true, loading: false})
        }).catch(()=>this.setState({loading: false}))
        this.autoFetch()
    }

    handleLockHub = () => {
        const hubId = this.state.newHubId
        const device = this.props.dashboardOverview?.hubs.find(hub=>hub.hub_id===hubId)
        const payload = {
            user_request_linking: this.state.lock ? 'DISABLED' : 'ENABLED'
        }

        const newArray = {
            device_id: hubId,
            time: moment().format(),
            skip: false,
        }
        let storageValue = getOobeStorage()
        storageValue.push(newArray)
        storeJSONData('oobe',storageValue,true)

        actions.setting.saveFeatureFlags({hubId, featureFlags: payload})
        actions.common.changeNewHubModal(false)
        actions.hub.selectHub(device).then(()=>{actions.routing.push('/dashboard')})
    }

    handleCancel = () => {
        this.setState({
            current:0,
            lock: true,
            mac: '',
            newHubId: '',
            verified: false,
            loading: false,
            confirmPage: false,
            activateSent: false,
        })
        actions.common.changeNewHubModal(false)
    }

    confirmPayment = () => {
        const {me, paymentMethod} = this.props
        let payload = {
            payment_method: paymentMethod.id,
            email:me.email,
            product: 'hub',
            product_id: this.state.newHubId,
            physical_id: this.state.mac
        }
        this.setState({loading:true})
        actions.billing.createCustomer(payload).then(()=>{
            this.handleSIMVerification()
            actions.user.dashboardOverview()
            actions.billing.save({paymentMethod: null, stripePlan: null})
        }).finally(()=>this.setState({loading:false}))
    }

    render() {
        const { current, loading, confirmPage, activateSent } = this.state
        const { form, paymentRequired, paymentMethod, stripePlan, productActivation, admin } =  this.props
        const { getFieldDecorator } = form
        const last4 = paymentMethod ? paymentMethod.card.last4: ''

        const introContent = <div>
            <h4>Add a new {globalConstants.HUB_SOFIHUB} to your {globalConstants.COMPANY_BRAND} account</h4>
            <p>Click Get Started below.</p>
            <p>
                <strong>Please note:</strong> you may not be able to add a device which has previously been set up. To gain {globalConstants.COMPANY_BRAND} portal
                access to a device what has already been set up, you need to be invited via an account linked to that device.
            </p>
        </div>

        const switchOffContent = <div>
            <h3 style={{textAlign: 'center'}}>Please keep your {globalConstants.HUB_SOFIHUB} <u>switched off</u>!</h3>
            <p><strong>How can I tell if I&#39;ve switched it on?</strong><br/>
                On the back there is a switch, make sure it&#39;s in the &quot;off&quot; position and that there is no red light glowing through the light switch.</p>
            <p>
                <strong>I&#39;ve turned it on, what now?</strong><br/>
                If you have turned on your {globalConstants.HUB_SOFIHUB}, please wait 2 minutes before switching it off. To switch it off simply use the switch on the back of the device and make sure it&#39;s in the &quot;off&quot; position.
            </p>
        </div>

        const findCodeContent =
            <div>
                <h4>Find the unique code for your {globalConstants.HUB_SOFIHUB}</h4>
                <p>In order to claim a {globalConstants.HUB_SOFIHUB} for your account you will need to tell us the
                    unique code for your {globalConstants.HUB_SOFIHUB}.</p>
                <p>You can find this unique code by looking on the base of the {globalConstants.HUB_SOFIHUB}, or on a sticker on the
                    side of the {globalConstants.HUB_SOFIHUB} box. The unique code you are looking for is called &quot;MAC&quot;.</p>
                <Row gutter={24}>
                    <Col xs={24} md={7}>
                        <img src={label} width="100%" alt="SOFIHUB home Label"/>
                    </Col>
                    <Col xs={24} md={17}>
                        <p>Please type the code here:</p>
                        <Form>
                            <Form.Item>
                                {
                                    getFieldDecorator('mac', {
                                        rules: [{ required: true, message: globalConstants.ENTER_MAC },
                                            {
                                                pattern: globalConstants.MAC_ADDRESS_REGEX,
                                                message: globalConstants.INVALID_MAC
                                            }],
                                    })(
                                        <Mask
                                            name="mac"
                                            style={{marginBottom:'24px', width: '180px'}}
                                            placeholder="12:34:56:78:90:AB"
                                            className="ant-input"
                                            pipe={ (value) => ({value: value.toUpperCase()})}
                                            mask={[/[0-9A-Fa-fa-f]/, /[0-9A-Fa-f]/, ':',/[0-9A-Fa-f]/, /[0-9A-Fa-f]/, ':',/[0-9A-Fa-f]/, /[0-9A-Fa-f]/, ':',
                                                /[0-9A-Fa-f]/, /[0-9A-Fa-f]/, ':',/[0-9A-Fa-f]/, /[0-9A-Fa-f]/, ':',/[0-9A-Fa-f]/, /[0-9A-Fa-f]/]}
                                            render={(ref, props) => (
                                                <input ref={ref} {...props} />
                                            )}
                                        />
                                    )
                                }
                            </Form.Item>
                        </Form>
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
                        needActivate('home', this.handleActivate):
                        productActivation?.request_status==='PENDING' || productActivation?.request_status==='SUCCESS' ? activating('home') : activeFail() }
        </div>

        const switchOnContent =
            <div>
                <h4>Make sure your {globalConstants.HUB_SOFIHUB} is switched on</h4>
                <p>In order to do this:</p>
                <ol>
                    <li>Plug in the wall adapter into a power socket and the power cable into the back of the {globalConstants.HUB_SOFIHUB}.</li>
                    <li>Turn on the switch at the wall as well as the switch on the back of the {globalConstants.HUB_SOFIHUB}. A little
                        red light should be visible on the power switch on the back of the {globalConstants.HUB_SOFIHUB} when its
                        turned on.</li>
                    <li>You should hear a chime.</li>
                    <li>After the chime your {globalConstants.HUB_SOFIHUB} may need another minute or two to turn on.</li>
                </ol>
                <p>Once your {globalConstants.HUB_SOFIHUB} is switched on proceed to the next step.</p>
            </div>

        const subscriptionContent  =
            <div>
                {confirmPage ? paymentConfirmation('home', stripePlan, last4):
                    paymentRequired && stripePlan ? payment('home', stripePlan, admin) : noPayment('home')}
            </div>

        const steps = [{
            title: 'Intro',
            content: introContent,
        },{
            title: 'Switch Off',
            content: switchOffContent
        },{
            title: 'Find Code',
            content: findCodeContent,
        },{
            title: 'Subscription',
            content: subscriptionContent,
        },{
            title: 'SIM Card',
            content: checkCodeContent,
        },{
            title: 'Switch On',
            content: switchOnContent,
        }, {
            title: 'Lock',
            content: lockContent('home', (e)=>this.setState({lock: e.target.value}), this.state.lock),
        }]

        const modalTitle =  <Media query="(max-width: 767px)">
            {matches =><Steps
                current={current}
                direction={matches ? 'vertical':'horizontal'}
                size="small"
                labelPlacement={isMobile ? 'horizontal' : 'vertical'}
                items={steps}
            />
            }
        </Media>

        return <Modal
            title={modalTitle}
            open={this.props.newHubModal}
            onCancel={this.handleCancel}
            width={960}
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
                            onClick={this.next}
                            loading={loading}
                            className="floatRight"
                            disabled={current===4 && !productActivation?.skip_activation && productActivation?.request_status !=='Success' && productActivation?.sim_status !== 'ACTIVE'
                            || current === 3 && paymentRequired && !paymentMethod }
                        >Next</Button>
                    }
                    {
                        current === steps.length - 1
                        && <Button type="primary" onClick={this.handleLockHub} className="floatRight">Finish</Button>
                    }
                    {
                        current > 0 && current < 5
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
                        disabled = {loading}
                        className="floatRight">Agree and Pay</Button> }
                    {confirmPage && <Button
                        style={{ marginLeft: 8 }}
                        onClick={()=>{
                            this.setState({confirmPage: false})
                            actions.billing.save({paymentMethod: null})
                        }}
                    >Previous</Button> }
                </div>
            </Fragment>
        </Modal>
    }
}

const HubInitPage = Form.create({})(HubInitModal)

export default connect(mapStateToProps, null) (HubInitPage)

import { Component, createRef, Fragment } from 'react'
import { Button, Col, Form, message, Modal, Row, Steps } from 'antd'
import label from '../../../images/radar_label.png'
import Mask from 'react-text-mask'
import { actions, connect } from 'mirrorx'
import { globalConstants } from '@/_constants'
import { noPayment, payment, paymentConfirmation } from '../../HubInit/Steps/Payment'
import { lockContent } from '../../HubInit/Steps/LockDevice'
import ReCAPTCHA from 'react-google-recaptcha'

const mapStateToProps = state => ({
    me: state.user.me,
    admin: state.user.me?.authorities.some(role=>role.includes('ADMIN')),
    newRadarModal: state.common.newRadarModal,
    paymentMethod: state.billing.paymentMethod,
    dashboardOverview: state.user.dashboardOverview,
    paymentRequired:  state.billing.paymentRequired,
    stripePlan: state.billing.stripePlan,
})

class RadarInitModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            current:0,
            lock: true,
            mac: '',
            error: '',
            newRadarId: '',
            newRadarPubId: '',
            loading: false,
            confirmPage: false,
            codeSent: false,
        }
        this.formRef = createRef()
        this.recaptchaRef = createRef()
    }

    next = () =>{
        const {paymentRequired} = this.props
        if (this.state.current===0){
            actions.billing.fetchStripePlan('radar')
            const current = this.state.current + 1
            this.setState({ current })
        }
        else if (this.state.current===1){
            const mac = this.formRef.current.getFieldValue('mac')
            const current = this.state.current + 1
            this.setState({mac, current})
        }
        else if (this.state.current===2){
            this.recaptchaRef.current.execute()
        } else if (this.state.current===3 && paymentRequired) {
            this.setState({
                confirmPage: true
            })
        } else if (this.state.current===3) {
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
        const current = this.state.current + 1
        const payload = {
            mac_address: this.state.mac,
            captcha: captcha
        }
        actions.radar.requestLinkingRadar(payload).then((result)=>{
            actions.billing.fetchSubscription(result.radar_pub_id).then(()=>{
                this.setState({newRadarId: result.id, newRadarPubId: result.radar_pub_id, current})
            })
            actions.radar.fetchAllRadars()
        }).catch((error)=>{
            this.recaptchaRef.current.reset()
            message.error(error.message, 10)
        })
    }

    handleLockRadar = () => {
        const radarId = this.state.newRadarId
        const device = this.props.dashboardOverview?.radars?.find(radar=>radar.id===radarId)
        const payload = {
            ...device,
            is_locked: this.state.lock
        }
        actions.radar.saveRadarInfo(payload)
        actions.common.changeNewRadarModal(false)
        actions.radar.selectRadar(device).then(()=>{actions.routing.push('/radar/dashboard')})
    }

    handleCancel = () => {
        this.setState({
            current:0,
            lock: true,
            mac: '',
            error: '',
            newRadarId: '',
            newRadarPubId: '',
            loading: false,
            confirmPage: false,
            codeSent: false
        })
        actions.common.changeNewRadarModal(false)
    }

    confirmPayment = () => {
        const {me, paymentMethod} = this.props
        let payload = {
            payment_method: paymentMethod.id,
            email:me.email,
            product: 'radar',
            product_id: this.state.newRadarPubId,
            physical_id: this.state.mac
        }
        this.setState({loading:true})
        actions.billing.createCustomer(payload).then(()=>{
            actions.user.dashboardOverview()
            const current = this.state.current + 1
            this.setState({current, confirmPage: false})
            actions.billing.save({paymentMethod: null, stripePlan: null})
        }).finally(()=>this.setState({loading:false}))
    }

    render() {
        const { current, loading, confirmPage } = this.state
        const { paymentRequired, paymentMethod, stripePlan, admin } =  this.props
        const last4 = paymentMethod ? paymentMethod.card.last4: ''

        const introContent = <div>
            <h4>Add a new {globalConstants.RADAR_HOBA} to your {globalConstants.COMPANY_BRAND} account</h4>
            <p>Click Get Started below.</p>
            <p>
                <strong>Please note:</strong> you may not be able to add a device which has previously been set up. To gain {globalConstants.COMPANY_BRAND} portal
                access to a device what has already been set up, you need to be invited via an account linked to that device.
            </p>
        </div>

        const findCodeContent =
            <div>
                <h4>Find the unique code for your {globalConstants.RADAR_HOBA}</h4>
                <p>In order to claim a {globalConstants.RADAR_HOBA} for your account you will need to tell us the unique code for your
                    {globalConstants.RADAR_HOBA}.</p>
                <p>You can find this unique code by looking on the side of the {globalConstants.RADAR_HOBA} box, or on the back of your
                    {globalConstants.RADAR_HOBA}. The unique code you are looking for is called &quot;MAC&quot;.</p>
                <Row gutter={24}>
                    <Col xs={24} md={7}>
                        <img src={label} width="100%" alt="SOFIHUB radar Label"/>
                    </Col>
                    <Col xs={24} md={17}>
                        <p>Please type the code here:</p>
                        <Form
                            ref={this.formRef}
                        >
                            <Form.Item
                                name="mac"
                                rules={ [{ required: true, message: globalConstants.ENTER_MAC },
                                    {
                                        pattern: globalConstants.MAC_ADDRESS_REGEX,
                                        message: globalConstants.INVALID_MAC
                                    }]}
                            >
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
                            </Form.Item>
                        </Form>
                        <p>Once you&#39;ve typed in the code, please press next.</p>
                    </Col>
                </Row>
            </div>

        const switchOnContent =
            <div>
                <h4>Make sure your {globalConstants.RADAR_HOBA} is switched on</h4>
                <p>We recommend you turn on your {globalConstants.RADAR_HOBA} now. To turn it on you must plug in the cable into the unit.</p>
                <p>We recommend that you do not affix your radar to your room walls until the end of this claim process,
                which you are currently half way through. Once you finished this claim process we recommend that you
                consult the installation guide for help and tips on installing your radar.</p>
                <p>Before you can proceed to the next step of this claim process you must complete a reCAPTCHA. Please
                press &quot;Next&quot; to proceed.</p>
                <ReCAPTCHA
                    ref={this.recaptchaRef}
                    size='invisible'
                    badge='inline'
                    sitekey={globalConstants.RECAPTCHA_KEY}
                    onChange={this.captchaSuccess}
                />
            </div>

        const subscriptionContent  =
            <div>
                {confirmPage ? paymentConfirmation('radar', stripePlan, last4):
                    paymentRequired && stripePlan ? payment('radar', stripePlan, admin) : noPayment('radar')}
            </div>

        const steps = [{
            title: 'Intro',
            content: introContent,
        },{
            title: 'Find Code',
            content: findCodeContent,
        },{
            title: 'Switch On',
            content: switchOnContent,
        },{
            title: 'Subscription',
            content: subscriptionContent,
        }, {
            title: 'Lock Device',
            content: lockContent('radar', (e)=>this.setState({lock: e.target.value}), this.state.lock),
        }]

        const modalTitle =  <Steps current={current} size="small">
            {steps.map(item => <Steps.Step key={item.title} title={item.title} />)}
        </Steps>

        return <Modal
            title={modalTitle}
            open={this.props.newRadarModal}
            onCancel={this.handleCancel}
            width={920}
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
                            disabled={current === 3 && paymentRequired &&!paymentMethod }
                        >Next</Button>
                    }
                    {
                        current === steps.length - 1
                        && <Button type="primary" onClick={this.handleLockRadar} className="floatRight">Finish</Button>
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

export default connect(mapStateToProps, null) (RadarInitModal)

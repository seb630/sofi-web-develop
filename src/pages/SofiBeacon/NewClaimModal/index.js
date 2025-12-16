import { Component, createRef, Fragment } from 'react'
import { Form } from '@ant-design/compatible'
import { Button, Col, Divider, Input, message, Modal, Row, Steps } from 'antd'
import label from '../../../images/imei_label.png'
import successBouque from '../../../images/success_bouque.png'
import { actions, connect } from 'mirrorx'
import { globalConstants } from '@/_constants'
import ReCAPTCHA from 'react-google-recaptcha'
import moment from 'moment'
import { getOobeStorage, storeJSONData } from '@/utility/Storage'
import Media from 'react-media'
import { deviceType, isMobile } from 'react-device-detect'

const mapStateToProps = state => ({
    newBeaconModal: state.common.newBeaconModal,
    newWatchModal: state.common.newWatchModal,
    newLifeModal: state.common.newLifeModal,
    beacons: state.sofiBeacon.beacons.beacons,
})

class NewClaimModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            current: 0,
            lock: true,
            newBeaconId: '',
            imei: null,
            loading: false,
            timezone: 'Not set'
        }
        this.recaptchaRef = createRef()
    }


    next = () => {
        if (this.state.current === 0) {
            const current = this.state.current + 1
            this.setState({ current })
        } else if (this.state.current === 1) {
            this.recaptchaRef.current.execute()
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
                this.setState({ imei: values.imei.toLowerCase() })

                const current = this.state.current + 1
                const payload = {
                    imei: values.imei.toLowerCase(),
                    captcha: captcha
                }
                actions.sofiBeacon.requestLinkingBeacon(payload).then((result) => {
                    this.setState({ 
                        newBeaconId: result.beacon_pub_id, 
                        current,
                        timezone: this.props.beacons.length > 0 ? (this.props.beacons.find(beacon => beacon.pub_id === result.beacon_pub_id).timezone ?? 'Not set') : 
                            'Not set'
                    })
                    actions.sofiBeacon.fetchBeaconByUser()
                }).catch((error) => {
                    if (error?.status === 400) {
                        // Proceed to next step on 400 response
                        this.setState({ 
                            current,
                            timezone: 'Not set'
                        })
                    } else {
                        this.recaptchaRef.current.reset()
                        message.error(error.message, 10)
                    }
                })
            }
        })
    }

    handleContinue = () => {
        const beaconId = this.state.newBeaconId
        
        if (!beaconId) {
            // If no beaconId, just close modals and navigate to dashboard
            actions.common.changeNewBeaconModal(false)
            actions.common.changeNewWatchModal(false)
            actions.common.changeNewLifeModal(false)
            this.setState({current: 0})
            actions.routing.push('/beacon/dashboard')
            return
        }
        
        let newBeacon = this.props.beacons.find(beacon => beacon.pub_id === beaconId)
        
        const navigateToDashboard = (beacon) => {
            if (beacon) {
                actions.common.changeNewBeaconModal(false)
                actions.common.changeNewWatchModal(false)
                actions.common.changeNewLifeModal(false)
                this.setState({current: 0})
                actions.sofiBeacon.selectBeacon(beacon).then(() => {
                    actions.routing.push('/beacon/dashboard')
                })
            } else {
                // If beacon still not found after fetch, navigate anyway
                actions.common.changeNewBeaconModal(false)
                actions.common.changeNewWatchModal(false)
                actions.common.changeNewLifeModal(false)
                this.setState({current: 0})
                actions.routing.push('/beacon/dashboard')
            }
        }
        
        if (newBeacon) {
            navigateToDashboard(newBeacon)
        } else {
            // If beacon not found, fetch beacons first then navigate
            actions.sofiBeacon.fetchBeaconByUser().then((beacons) => {
                newBeacon = beacons.find(beacon => beacon.pub_id === beaconId)
                navigateToDashboard(newBeacon)
            }).catch(() => {
                // On error, still navigate to dashboard
                actions.common.changeNewBeaconModal(false)
                actions.common.changeNewWatchModal(false)
                actions.common.changeNewLifeModal(false)
                this.setState({current: 0})
                actions.routing.push('/beacon/dashboard')
            })
        }
    }


    handleCancel = () => {
        this.setState({
            current: 0,
            lock: true,
            newBeaconId: '',
            imei: null,
            loading: false,
        })
        actions.common.changeNewBeaconModal(false)
        actions.common.changeNewWatchModal(false)
        actions.common.changeNewLifeModal(false)
    }

    render() {
        const { current, loading, lock } = this.state
        const { form } = this.props
        const { getFieldDecorator } = form
        const deviceType = this.props.newWatchModal ? globalConstants.BEACON_WATCH : 
            this.props.newLifeModal ? globalConstants.LIFE_SOFIHUB : 
                globalConstants.BEACON_SOFIHUB

        const introContent = this.props.newLifeModal ? (
            <div>
                <h4>Let&apos;s add your {deviceType} to your account</h4>
                <p>To do this we will need an IMEI number which is unique to each product. You can find your IMEI number written on the back of your {deviceType} or on the side of the box (please note it might be hidden behind the box lid).</p>
                <p>Once you&apos;ve found your box press the next button to continue.</p>
                <p><strong>Please note:</strong> If your {deviceType} has already been added to someone else&apos;s account, you will need to ask the other account holder invite you to be able to access this {deviceType}.</p>
            </div>
        ) : (
            <div>
                <h4>Let&apos;s add your {deviceType} to your account</h4>
                <p>To do this we will need an IMEI number which is unique to each product. You can find your IMEI number written on the base of the box your {deviceType} came in.</p>
                <p>Once you&apos;ve found your box press the next button to continue.</p>
                <p><strong>Please note:</strong> If your {deviceType} has already been added to someone else&apos;s account, you will need to ask the other account holder invite you to be able to access this {deviceType}.</p>
            </div>
        )

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

        const steps = [{
            title: 'Intro',
            content: introContent,
        }, 
        {
            title: 'Enter IMEI',
            content: enterCodeContent,
        },
        {
            title: 'Success',
            content: <div style={{ textAlign: 'center', padding: '0px 0' }}>
                <h4 style={{ marginBottom: '20px' }}>We&apos;ve added your {deviceType} to your account!</h4>
                <div style={{ marginBottom: '10px' }}>
                    <img src={successBouque} alt="Success" style={{ width: '20%', height: 'auto' }} />
                </div>
                <p>Next we&apos;ll take you through device set up</p>
            </div>,
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
            open={this.props.newBeaconModal || this.props.newWatchModal || this.props.newLifeModal}
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
                        <Button type="primary" onClick={this.next} className="floatRight">Next</Button>
                    }
                    {
                        current !== 0 && current < steps.length - 1
                        && <Button
                            type="primary"
                            loading={loading}
                            onClick={this.next}
                            className="floatRight">Next</Button>
                    }
                    {
                        current === steps.length - 1
                        && <div style={{ textAlign: 'center', width: '100%' }}>
                            <Button type="primary" onClick={this.handleContinue}>Continue</Button>
                        </div>
                    }
                    {
                        current > 0 && current < steps.length - 1
                        && (
                            <Button style={{ marginLeft: 8 }} onClick={this.prev}>
                                Previous
                            </Button>
                        )
                    }
                </div>
            </Fragment>
        </Modal>
    }
}

const NewClaimPage = Form.create({})(NewClaimModal)

export default connect(mapStateToProps, null)(NewClaimPage)


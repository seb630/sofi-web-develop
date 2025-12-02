import { Component, Fragment } from 'react'
import '../HubInit.scss'
import { Button, Checkbox, Col, Modal, Row, Space, Typography } from 'antd'
import { actions, connect } from 'mirrorx'
import HubIcon from '../../../images/hub_icon.svg'
import WatchIcon from '.././../../images/beacon_watch_icon.png'
import BeaconIcon from '../../../images/beacon_icon.svg'
import RadarIcon from '.././../../images/radar_sensor_icon.png'
import LifeIcon from '.././../../images/beacon_teq_life.png'
import RadarQR from '@/images/radar_claim_qr.png'
import TCPage from '../../../components/TCPage'
import { showProductName } from '@/utility/Common'
import { globalConstants } from '@/_constants'
import PrivacyPage from '@/components/TCPage/PrivacyPage'

const mapStateToProps = state => ({
    me: state.user.me,
    newDeviceModal: state.common.newDeviceModal,
})

class DeviceSelection extends Component {

    constructor(props) {
        super(props)
        this.state = {
            tcPage: false,
            tcAgreed: false,
            product: null,
            radarPage: false,
            tcOpen: false,
            privacyOpen: false,
        }
    }

    onChange = e => {
        this.setState({
            tcAgreed: e.target.checked,
        })
    }

    handleAgreeTC = (product) => {
        this.setState({
            tcPage: false,
            tcAgreed: false,
            product: null
        })
        actions.common.changeNewDeviceModal(false)
        product.toLowerCase() === 'beacon'? actions.common.changeNewBeaconModal(true) : 
            product.toLowerCase() == 'watch' ? actions.common.changeNewWatchModal(true) : product.toLowerCase() === 'life' ? actions.common.changeNewLifeModal(true) :
                product.toLowerCase() === 'radar' ? actions.common.changeNewRadarModal(true) : actions.common.changeNewHubModal(true)

    }

    renderTCpage = () => {
        const { product, tcOpen, privacyOpen } = this.state
        return (<Fragment>
            <div className="margin-bottom">
                <h3>In order to use our system, and claim your {showProductName(product)} you must agree to both our Privacy Policy, and our Terms and Conditions.</h3>
                <Typography.Paragraph>
                    You can read our <a onClick={() => this.setState({ privacyOpen: true })}>Privacy Policy here</a>, and you can read our <a onClick={() => this.setState({ tcOpen: true })}>Terms and Conditions</a> here.
                </Typography.Paragraph>
                <Checkbox onChange={this.onChange}>I have read and agree to both the Privacy Policy and the Terms and Conditions.</Checkbox>

                <TCPage open={tcOpen} onCancel={() => this.setState({ tcOpen: false })} />
                <PrivacyPage open={privacyOpen} onCancel={() => this.setState({ privacyOpen: false })} />
            </div>
        </Fragment>)
    }

    renderRadarPage = () => {
        return (<Space direction="vertical" style={{ width: '100%', textAlign: 'center', marginTop: 20 }}>
            <Row justify="center">
                <img src={RadarIcon} className="claimRadarImg" alt="RadarLogo" />
            </Row>
            <h3>Set up your {globalConstants.RADAR_HOBA} using your smartphone</h3>
            <b>Scan the QR code below, or visit <a href="https://www.sofihub.com/setup">page</a> to download the SOFIHUB app from Google Play or the App Store</b>
            <img src={RadarQR} alt="APP Page" width={300} />
            <Button type="primary" onClick={this.handleCancel}>Got it!</Button>
        </Space>)
    }

    handleNewHub = () => {
        this.setState({ product: 'Home', tcPage: true })
    }

    handleNewRadar = () => {
        this.setState({ radarPage: true })
    }

    handleNewBeacon = (product) => {
        this.setState({ product: product, tcPage: true })
    }

    handleNewLife = () => {
        this.setState({ product: 'Life', tcPage: true })
    }

    handleCancel = () => {
        this.setState({
            tcPage: false,
            tcAgreed: false,
            product: null,
            radarPage: false,
            tcOpen: false,
            privacyOpen: false,
        })
        actions.common.changeNewDeviceModal(false)
        actions.common.changeNewHubModal(false)
        actions.common.changeNewRadarModal(false)
        actions.common.changeNewBeaconModal(false)
        actions.common.changeNewWatchModal(false)
        actions.common.changeNewLifeModal(false)
    }

    render() {
        const { tcPage, product, tcAgreed, radarPage } = this.state
        return <Modal
            destroyOnClose
            title={!tcPage && !radarPage && 'Which device do you have?'}
            open={this.props.newDeviceModal}
            onCancel={this.handleCancel}
            width={900}
            footer={tcPage ? <div className="d-flex justify-content-between">
                <Button onClick={this.handleCancel}>Cancel</Button>
                <Button
                    disabled={!tcAgreed}
                    type="primary"
                    onClick={() => this.handleAgreeTC(product)}
                >Agree, and Continue</Button>
            </div> : null}
        >
            {tcPage ? this.renderTCpage() : radarPage ? this.renderRadarPage() :
                <Col>
                    <Row gutter={16} justify="center" style={{marginBottom: '24px'}}>
                        <Col span={8}>
                            <Row justify="center">
                                <div className="roundLogoContainer" onClick={this.handleNewLife}>
                                    <img src={LifeIcon} height='100px' alt="LifeLogo" />
                                </div>
                            </Row>
                            <Row justify="center">
                                <a className="claimText" onClick={this.handleNewLife}>
                                    <div>
                                        <Row>{globalConstants.LIFE_SOFIHUB}</Row>
                                    </div>
                                </a>
                            </Row>
                        </Col>
                        <Col span={8}>
                            <Row justify="center">
                                <div className="roundLogoContainer" onClick={this.handleNewRadar} >
                                    <img src={RadarIcon} className="claimRadarImg" alt="RadarLogo" />
                                </div>
                            </Row>
                            <Row justify="center">
                                <a className="claimText" onClick={this.handleNewRadar}>
                                    <div>
                                        <Row>{globalConstants.RADAR_HOBA}</Row>
                                    </div>
                                </a>
                            </Row>
                        </Col>
                    </Row>
                    <Row gutter={16} justify="center">                        
                        <Col span={8}>
                            <Row justify="center">
                                <div className="roundLogoContainer" onClick={()=>this.handleNewBeacon('Beacon')}>
                                    <BeaconIcon className="claimImg" />
                                </div>
                            </Row>
                            <Row justify="center">
                                <a className="claimText" onClick={()=>this.handleNewBeacon('Beacon')}>
                                    <div>
                                        <Row>{globalConstants.BEACON_SOFIHUB}</Row>
                                    </div>
                                </a>
                            </Row>
                        </Col>
                        <Col span={8}>
                            <Row justify="center">
                                <div className="roundLogoContainer" onClick={()=>this.handleNewBeacon('Watch')}>
                                    <img src={WatchIcon} height='100px' alt='Watch Logo'/>
                                </div>
                            </Row>
                            <Row justify="center">
                                <a className="claimText" onClick={()=>this.handleNewBeacon('Watch')}>
                                    <div>
                                        <Row>{globalConstants.BEACON_WATCH}</Row>
                                    </div>
                                </a>
                            </Row>
                        </Col>
                    </Row>
                </Col>

            }
        </Modal>
    }
}

export default connect(mapStateToProps, null)(DeviceSelection)

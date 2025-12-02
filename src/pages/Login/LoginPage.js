import { Component } from 'react'
import 'url-search-params-polyfill'
import Login from './Login'
import Forgot from './Forgot'
import Create from './Create'
import { actions, connect } from 'mirrorx'
import { DownOutlined } from '@ant-design/icons'
import { Button, Col, Dropdown, message, Modal, Progress, Row } from 'antd'
import './LoginPage.scss'
import DownTime from '../../_constants/downtime'
import moment from 'moment'
import { regionLink } from '@/utility/Common'
import EmailVerifyCard from '@/pages/Login/EmailVerifyCard'

const latestDownTime = DownTime[DownTime.length - 1]
const start = moment(latestDownTime.outageDateTimeStart)
const end = moment(latestDownTime.outageDateTimeEnd)
const blockAccess = latestDownTime.blockPortalAccess


const mapStateToProps = state => ({
    location: state.routing.location,
    beacons: state.sofiBeacon.beacons.beacons,
    hubs: state.hub.hubs,
    me: state.user.me
})

class LoginPage extends Component {

    constructor(props) {
        super(props)
        this.state = {
            forgot: !!props.forgot,
            registration: !!props.reg,
            verified: props.location.state && props.location.state.verified || null,
            error: props.location.state && props.location.state.error || null,
            count: 0
        }
    }

    componentDidMount () {
        if (moment().isBetween(start,end) && blockAccess){
            actions.routing.push('/offline')
        }

    }

    handleForgot = () => {
        this.setState({forgot: true})
    }

    handleForgotBack = () => {
        this.setState({forgot: false})
    }

    handleRegistration = () => {
        this.setState({registration: true})
    }

    handleRegistrationBack = () => {
        this.setState({registration: false})
    }

    resend = () => {
        const payload = {
            token: this.props.location.state.token,
        }
        actions.user.resendVerifyEmail (payload).then(()=> {
            this.setState({error: null})
            message.success('Verification email resent')
        })
    }

    renderExpireModal = () => {
        return (
            <Modal
                width={400}
                open={!!this.state.error}
                closable={false}
                maskClosable={false}
                footer={null}
            >
                <div align="center">
                    <Progress type="circle" percent={100} strokeColor="#E03B50" status="exception" width={64} strokeWidth={8}/>
                    <p className='error'>Email verification failed!</p>
                </div>
                <div align="center" className='margin-bottom'>
                    <div>The verification link expired, we need to resend you the verification email.</div>
                </div>
                <div align="center">
                    <Button
                        className="button button-submit" type='primary' size="large"
                        onClick={this.resend}>Resend</Button>
                </div>
            </Modal>
        )
    }

    handleMenuClick = (e) => {
        window.location.href= regionLink[e.key]
    }

    onButtonClick = () => {
        this.setState({count: this.state.count+1})
    }

    handleLogin = () => {
        this.setState({verified: false, error: null})
    }

    showCurrentLocation = () => {
        const hostname = window.location.hostname
        return hostname.includes('nz') ? 'New Zealand' :
            hostname.includes('tp') ? 'Threat Protect' :
                hostname.includes('us') ? 'United States' :
                    hostname.includes('gsp') ? 'Guardian Safety Pendants Australia' :
                        hostname.includes('develop') ? 'Develop':
                            hostname.includes('internal') ? 'Internal' :
                                hostname.includes('portal.sofihub.com') || hostname.includes('au')? 'Australia' : hostname
    }

    checkURL = () => {
        const hostname = window.location.hostname
        if(hostname.includes('localhost') || hostname.includes('portal.sofihub.com') || hostname.includes('portal.au-sofihub-production.sofieco.net') || hostname.includes('portal.us-sofihub-production.sofieco.net')){
            return true
        }
        return false
    }

    render() {
        const menu = [{
            label: 'Australia',
            key: 'AU'
        },
        {
            label: 'United States',
            key: 'US'
        },
        this.state.count>10 && {
            label: 'AU-sofihub-develop',
            key: 'DEV'
        },
        this.state.count>10 && {
            label: 'AU-sofihub-internal',
            key: 'INT'
        }]

        return (
            <div id="loginPage" className="loginPage">
                <div className="loginPage-container">
                    <div className="loginPage-left-container">
                        <Row className="loginPage-content">
                            {this.state.registration ?
                                <Create onBack={this.handleRegistrationBack}/>
                                : this.state.forgot ?
                                    <Forgot onBack={this.handleForgotBack}/>
                                    : this.state.verified ? <EmailVerifyCard handleLogin={this.handleLogin}/>
                                        :  <Login
                                            {...this.props}
                                            sourcePage={this.props.location.state?.from||this.props.location.search?.replace('?path=','')}
                                            onForgot={this.handleForgot}
                                            onCreate={this.handleRegistration}
                                        />
                            }
                        </Row>
                        <Row type="flex" className="loginPage-footer" justify="space-between">
                            <Col>
                                {this.checkURL() &&
                                    <Dropdown menu={{
                                        items:menu,
                                        onClick:this.handleMenuClick
                                    }} >
                                        <a onClick={this.onButtonClick}>
                                        
                                            <DownOutlined /> {this.showCurrentLocation()}
                                        </a>
                                    </Dropdown>    
                                }
                            </Col>
                            <Col>
                                <Row type="flex">
                                    <Col style={{paddingRight: 30}}>
                                        <a href='https://www.sofihub.com/contact-us/'>Contact Us</a>
                                    </Col>
                                    <Col>
                                        <a href='https://support.sofihub.com/'>Help</a>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>
                </div>
                {this.renderExpireModal()}
            </div>
        )
    }
}

export default connect(mapStateToProps, null) (LoginPage)

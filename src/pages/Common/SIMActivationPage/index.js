import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { CheckCircleOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { Button, Card, Col, message, Row, Spin } from 'antd'
import PortalLayout from '../Layouts/PortalLayout'
import { needActivate } from '../../HubInit/Steps/CheckingSIM'
import { globalConstants } from '@/_constants'
import RemoveDeviceCard from '@/pages/Common/RemoveDeviceCard'

const mapStateToProps = state => ({
    productActivation: state.SIM.productActivation,
    me: state.user.me,
    selectedHub: state.hub.selectedHub,
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    admin: state.user.me?.authorities.some(role=>role.includes('ADMIN')),
    hubs: state.hub.hubs,
    beacons: state.sofiBeacon.beacons.beacons
})

let interval = 0

class SIMActivationPage extends Component {
    constructor(props) {
        super(props)
        this.state={
            loading: false,
            activateSent: false,
            product: props.match.params.product.toLowerCase(),
            result: null,
        }
    }

    componentDidMount() {
        const { hubs, beacons, selectedBeacon, selectedHub} = this.props
        hubs && hubs.length===0 && beacons && beacons.length===0 &&
            actions.hub.getSofiDevices()

        this.props.match.params.product.toLowerCase()==='beacon'?
            selectedBeacon && actions.SIM.fetchSIMByProduct({type: 'BEACON', macOrImei: selectedBeacon.imei}):
            selectedHub && actions.SIM.fetchSIMByProduct({type: 'HUB', macOrImei: selectedHub.mac_address})
    }

    componentDidUpdate(prevProps) {
        prevProps.selectedHub!== this.props.selectedHub && this.props.match.params.product.toLowerCase()==='home' &&
        actions.SIM.fetchSIMByProduct({type: 'HUB', macOrImei: this.props.selectedHub.mac_address})

        prevProps.selectedBeacon!== this.props.selectedBeacon && this.props.match.params.product.toLowerCase()==='beacon' &&
        actions.SIM.fetchSIMByProduct({type: 'BEACON', macOrImei: this.props.selectedBeacon.imei})

        prevProps.productActivation !== this.props.productActivation &&
        this.props.productActivation?.request_status==='PENDING' && this.autoFetch()

    }

    autoFetch = () => {
        const {selectedHub, selectedBeacon} = this.props
        const {product} = this.state
        const payload = {
            macOrImei: product==='beacon'? selectedBeacon.imei : selectedHub.mac_address,
            type: product==='beacon' ? 'BEACON' : 'HUB'
        }
        clearInterval(interval)
        interval = setInterval(() =>
            actions.SIM.fetchSIMByProduct(payload), globalConstants.GENERAL_AUTO_REFRESH_TIME)
    }

    bypassPayment = () => {
        actions.SIM.save({bypassSIMActivation: true})
        actions.routing.push(this.state.product === 'beacon' ? '/beacon/dashboard':'/dashboard')
    }

    renderTitle = (title) => (
        <Row type="flex" justify="space-between" gutter={[8,8]} className="break-space" >
            <Col>{title}</Col>
            <Col>{this.props.admin && <Button onClick={this.bypassPayment}>Skip (Admin only)</Button>}</Col>
        </Row>
    )

    handleActivate = ()=>{
        const {productActivation, admin} = this.props
        const {result} = this.state
        this.setState({loading:true})
        actions.SIM.activateSIM({id: productActivation?.id, notify: !admin}).then((result)=>{
            this.setState({activateSent: true, loading: false, result})
        })
        new Promise(resolve => setTimeout(resolve, 3000)).then(()=>{
            result && !result.errors && message.success('Activate requested, Please wait up to five minutes')
            result?.errors?.includes('already been activated') && message.success('The SIM has already been activated')
        })
        this.autoFetch()
    }

    generateContent = () => {
        const { productActivation} = this.props
        const { product, activateSent } = this.state
        if (!(activateSent || productActivation?.request_status || productActivation?.sim_status==='ACTIVE')) {
            return {
                title: `Whoops, we need to activate the SIM in your ${product === 'beacon' ? globalConstants.BEACON_SOFIHUB:globalConstants.HUB_SOFIHUB}!`,
                content: needActivate(product, this.handleActivate, false)
            }
        } else if ( productActivation?.skip_activation || productActivation?.sim_status === 'ACTIVE') {
            return {title: 'SIM Card Activation Complete!',
                content: <div align="center"><div className='margin-bottom' align="center">
                    <CheckCircleOutlined className="successStatusIcon" />
                    <p>You can proceed to the dashboard when ready!</p>
                </div>
                <Button type="primary" onClick={()=>
                    actions.routing.push(product==='beacon'?'/beacon/dashboard':'/dashboard')}>
                            Take me to dashboard</Button>
                </div>
            }
        }else if (productActivation?.request_status==='PENDING' || productActivation?.request_status==='SUCCESS'){
            return {title: `We are activating the SIM card in your SOFIHUB ${product}, please wait!`,
                content: <div className="advanced_block">
                    <p>This process normally takes less than 30 minutes, but it can take up to 1 hour. You can stay here and we will automatically keep checking if its finished for you.
                        You can close this window if you like and return at a later stage*, we will keep monitoring activation in the background.</p>

                    <p>If your activation takes longer than 1 hour please reach out to our support team: support@sofihub.com, or 1300 110 366.</p>
                    <div className='margin-bottom' align="center">
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 108 }} spin />} />
                    </div>
                    <p className="messageDescription"><sup>*</sup>You will need to pick this device again from the
                        device selection screen.</p>
                </div>
            }
        }else{
            return {title: 'SIM Card Activation Failed!',
                content: <div className='margin-bottom' align="center">
                    <ExclamationCircleOutlined className="failStatusIcon" />
                    <p>Please contact support for further assistance.</p>
                </div>
            }
        }
    }

    renderPageContent() {
        const { loading } = this.state
        const {title, content, product} = this.generateContent()
        return (
            <Row type="flex" justify="center">
                <Col xs={22} md={16} >
                    <Card title= {this.renderTitle(title)}>
                        <Spin spinning={loading}>
                            {content}
                        </Spin>
                    </Card>
                    <RemoveDeviceCard product={product}/>
                </Col>
            </Row>

        )
    }

    render() {
        const content = this.props.productActivation && this.renderPageContent()
        return (
            <PortalLayout
                menu={this.state.product==='home' ? 'hub':this.state.product}
                contentClass="contentPage"
                content={content}
            />
        )
    }
}

export default connect(mapStateToProps,null)(SIMActivationPage)

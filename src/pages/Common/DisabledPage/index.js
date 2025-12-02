import { Component } from 'react'
import {actions, connect} from 'mirrorx'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Card, Spin, Row, Col, Button } from 'antd'
import PortalLayout from '../Layouts/PortalLayout'
import colours from '../../../scss/colours.scss'
import RemoveDeviceCard from '@/pages/Common/RemoveDeviceCard'

const mapStateToProps = state => ({
    disabledProduct: state.billing.disabledProduct,
    me: state.user.me,
    selectedHub: state.hub.selectedHub,
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    selectedRadar: state.radar.selectedRadar,
    admin: state.user.me?.authorities.some(role=>role.includes('ADMIN')),
    hubs: state.hub.hubs,
    beacons: state.sofiBeacon.beacons.beacons,
    radars: state.radar.radars
})

class DisabledPage extends Component {
    constructor(props) {
        super(props)
        this.state={
            loading: false,
            confirmPage: false,
            product: props.match.params.product?.toLowerCase()
        }
    }

    componentDidMount() {
        const { hubs, beacons, radars, selectedBeacon, selectedHub, selectedRadar} = this.props
        hubs && hubs.length===0 && beacons && beacons.length===0 && radars && radars.length===0 &&
        actions.hub.getSofiDevices()

        this.props.match.params.product.toLowerCase()==='beacon'?
            selectedBeacon && actions.billing.fetchDisableStatus(selectedBeacon.pub_id):
            this.props.match.params.product.toLowerCase()==='radar'?
                selectedRadar && actions.billing.fetchDisableStatus(selectedRadar.pub_id):
                selectedHub && actions.billing.fetchDisableStatus(selectedHub.hub_id)
    }

    componentDidUpdate(prevProps) {
        prevProps.selectedHub!== this.props.selectedHub && this.props.match.params.product.toLowerCase()==='home' &&
        actions.billing.fetchDisableStatus(this.props.selectedHub.hub_id)

        prevProps.selectedBeacon!== this.props.selectedBeacon && this.props.match.params.product.toLowerCase()==='beacon' &&
        actions.billing.fetchDisableStatus(this.props.selectedBeacon.pub_id)

        prevProps.selectedRadar!== this.props.selectedRadar && this.props.match.params.product.toLowerCase()==='radar' &&
        actions.billing.fetchDisableStatus(this.props.selectedRadar.pub_id)

        prevProps.disabledProduct !== this.props.disabledProduct && !this.props.disabledProduct?.is_disabled &&
        actions.routing.push(this.props.match.params.product.toLowerCase()==='beacon' ? '/beacon/dashboard':
            this.props.match.params.product.toLowerCase()==='radar' ? '/radar/dashboard':'/dashboard')
    }

    bypassPayment = () => {
        actions.billing.save({bypassDisable: true})
        actions.routing.push(this.state.product === 'beacon' ? '/beacon/dashboard':
            this.state.product === 'radar' ? '/radar/dashboard':'/dashboard')
    }

    renderTitle = () => (
        <Row type="flex" justify="space-between" gutter={[8,8]} className="break-space" >
            <Col>Device Disabled</Col>
            <Col>{this.props.admin && <Button onClick={this.bypassPayment}>Skip (Admin only)</Button>}</Col>
        </Row>
    )

    renderPageContent() {
        const { disabledProduct, selectedHub, selectedBeacon, selectedRadar } = this.props
        const { loading, product } = this.state
        const selectedDevice = product==='beacon'? selectedBeacon :product==='radar'? selectedRadar : selectedHub
        return (
            <Row type="flex" justify="center">
                <Col xs={22} md={16} >
                    <Card title= {this.renderTitle()}>
                        <Spin spinning={loading}>
                            <div className="advanced_block text-center">
                                <ExclamationCircleOutlined style={{fontSize: 90, marginBottom: 16, color: colours.red}} />
                                <p>You cannot access {selectedDevice?.display_name}, because it has been disabled. <br/> The reason it has been disabled is: {disabledProduct?.reason}<br/>
                                    You can resolve this by contacting {disabledProduct?.support_name} on {disabledProduct?.phone}
                                </p>
                            </div>
                        </Spin>
                    </Card>
                    <RemoveDeviceCard product={product}/>
                </Col>

            </Row>
        )
    }

    render() {
        return (
            <PortalLayout
                menu={this.state.product==='home' ? 'hub':this.state.product}
                contentClass="contentPage"
                content={ this.renderPageContent()}
            />
        )
    }
}

export default connect(mapStateToProps,null)(DisabledPage)

import { Component } from 'react'
import { Button, Row, Col } from 'antd'
import NoDeviceIcon from '../../images/no_hub_no_beacon_combined.svg'
import PortalLayout from '../Common/Layouts/PortalLayout'
import { actions, connect } from 'mirrorx'

const mapStateToProps = state => ({
    hubs: state.hub.hubs,
    beacons: state.sofiBeacon.beacons.beacons,
    radars:  state.radar.radars,
    newBeaconModal: state.common.newBeaconModal,
    newLifeModal: state.common.newLifeModal,
    newHubModal: state.common.newHubModal,
    newRadarModal: state.common.newRadarModal,
})

class noDevice extends Component {

    componentDidMount(){
        actions.user.dashboardOverview()
        actions.hub.getSofiDevices()
    }

    componentDidUpdate(prevProps) {
        const {hubs, beacons, radars, newBeaconModal, newLifeModal, newHubModal, newRadarModal} = this.props
        prevProps.hubs !== hubs && hubs.length>0 && !newHubModal && actions.routing.push('/deviceSelection')
        prevProps.beacons !== beacons && beacons.length>0 && !newBeaconModal && actions.routing.push('/deviceSelection')
        prevProps.beacons !== beacons && beacons.length>0 && !newLifeModal && actions.routing.push('/deviceSelection')
        prevProps.radars !== radars && radars.length>0 && !newRadarModal && actions.routing.push('/deviceSelection')
    }


    handleClaim = () => {
        actions.common.changeNewDeviceModal(true)
    }

    handleFindOutMore = () => {
        window.open('https://support.sofihub.com')
    }
    /** render page content */
    renderPageContent() {
        return (
            <div>
                <Row type="flex" justify="center">
                    <Col>
                        <Row type="flex" justify="center">
                            <NoDeviceIcon className="no_hub_img"/>
                        </Row>
                        <div className="versions">
                            <div>
                                <p>You don&#39;t have any devices linked to your account. Click the button below to add a device.</p>
                            </div>
                            <Button type="primary" onClick={this.handleClaim}>Add a device</Button><br/><br/>

                            <div>Need help? Visit our support page.</div><br/>
                            <Button type="primary" onClick={this.handleFindOutMore}>Sofihub support</Button><br/><br/>
                        </div>
                    </Col>
                </Row>
            </div>
        )
    }

    render() {
        return (
            <PortalLayout
                menu="noMenu"
                contentClass="contentPage"
                content={ this.renderPageContent()}
            />
        )
    }
}

export default connect(mapStateToProps,{})(noDevice)


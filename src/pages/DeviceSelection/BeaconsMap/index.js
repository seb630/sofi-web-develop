import { Component } from 'react'
import HeaderBar from '../../Common/HeaderBar/'
import { actions, connect } from 'mirrorx'
import { LoadingOutlined } from '@ant-design/icons'
import { Layout, Modal, Spin } from 'antd'
import PropTypes from 'prop-types'
import Sidebar from './Sidebar'
import GroupView from './GroupPage'
import { globalConstants } from '@/_constants'
import { retrieveJSONData } from '@/utility/Storage'
import { removeDuplicateDevices } from '@/utility/Common'
import { titleCase } from 'change-case'

const { Header, Content } = Layout

const mapStateToProps = state => ({
    selectedBeaconHeadState: state.sofiBeacon.selectedBeaconHeadState,
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    sideMenuCollapsed: state.common.sideMenuCollapsed,
    me: state.user.me,
    loading: state.sofiBeacon.loading,
    groupBeacons: state.sofiBeacon.groupBeacons,
    beaconHeadstates: state.sofiBeacon.beaconHeadstates,
    dashboardOverview: state.user.dashboardOverview
})

class BeaconsMap extends Component {
    constructor(props){
        super(props)
        this.state={
            selectedBeaconInMap: null,
            hoveredBeaconInMap: null,
        }
    }

    selectBeacon = (selectedBeaconInMap) => {
        this.setState({selectedBeaconInMap})
    }

    hoverBeacon = (hoveredBeaconInMap) => {
        this.setState({hoveredBeaconInMap})
    }

    componentDidMount() {
        const storedBeaconIds = retrieveJSONData('selectedBeacons')
        this.autoRefresh = setInterval(() => {
            actions.sofiBeacon.fetchBeaconHeadstates(storedBeaconIds)
        }, globalConstants.BEACON_AUTO_REFRESH_TIME*2)
        actions.user.dashboardOverview()
        this.props.me && actions.user.getUserOrgs(this.props.me.user_id)
        actions.hub.getSofiDevices()
        if (!storedBeaconIds || storedBeaconIds.length===0){
            Modal.error({
                title: `You didn't select any ${globalConstants.PENDANT_GENERIC}`,
                content: `Please click "${titleCase(globalConstants.PENDANT_GENERIC)} Map Screen" button to select some beacons want to see`,
                onOk: ()=>actions.routing.push('/deviceSelection')
            })
        }
    }

    componentDidUpdate (prevProps) {
        if (prevProps.dashboardOverview !== this.props.dashboardOverview){
            const allBeacons = this.props.dashboardOverview.beacons
            const storedBeaconIds = retrieveJSONData('selectedBeacons')
            const selectedBeacons = allBeacons?.filter(beacon=>storedBeaconIds?.includes(beacon.pub_id))
            actions.sofiBeacon.selectBeacons(selectedBeacons)
        }
    }

    componentWillUnmount() {
        clearInterval(this.autoRefresh)
    }

    render () {
        const { loading, sideMenuCollapsed, groupBeacons, beaconHeadstates, dashboardOverview} = this.props
        const {selectedBeaconInMap, hoveredBeaconInMap} = this.state
        const moreCard = dashboardOverview?.hubs?.length>0 || dashboardOverview?.beacons?.length>groupBeacons?.length
        let beacons = groupBeacons?.map(beacon=>({...beacon, ...beaconHeadstates?.find(headstate=>headstate.beacon_id === beacon.id)})) || []
        beacons = removeDuplicateDevices(beacons)
        const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />
        return (
            <Spin
                tip="This is taking longer than usual, we'll need another minute"
                indicator={antIcon}
                delay={2000}
                spinning={loading}
            >
                <Layout className="fullscreen">
                    <Sidebar
                        {...this.props}
                        beacons={beacons}
                        onCollapse={() => {actions.common.toggleSideMenu()}}
                        collapsed={sideMenuCollapsed}
                        selectBeacon = {this.selectBeacon}
                        hoverBeacon = {this.hoverBeacon}
                        moreCard = {moreCard}
                    />
                    <Layout>
                        <Header style={{ background: '#fff', padding: 0 }}>
                            <HeaderBar
                                showToggle
                                breadCrumb={null}
                            />
                        </Header>
                        <Content>
                            <GroupView
                                {...this.props}
                                selectedBeaconInMap={selectedBeaconInMap}
                                hoveredBeaconInMap={hoveredBeaconInMap}
                                beacons={beacons}
                            />
                        </Content>
                    </Layout>
                </Layout>
            </Spin>
        )
    }
}

BeaconsMap.propTypes = {
    selectedHub: PropTypes.object,
    content: PropTypes.node,
    contentClass: PropTypes.string,
    aboveContent: PropTypes.node,
    menu: PropTypes.string,
    ctmBreadCrumb: PropTypes.node,
    showToggle: PropTypes.bool,
}

export default connect(mapStateToProps, null) (BeaconsMap)

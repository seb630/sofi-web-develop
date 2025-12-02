import { Component, Fragment } from 'react'
import { FilterOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Checkbox, Col, Divider, Empty, Input, Modal, Popover, Row, Select, Switch } from 'antd'
import { actions, connect } from 'mirrorx'
import { isWatch, removeDuplicateDevices, requirePayment, sortString } from '@/utility/Common'
import { isMobile } from 'react-device-detect'
import './index.scss'
import DeviceSelectionLayout from '../Common/Layouts/DeviceSelectionLayout'
import DeviceGroup from './DeviceGroup'
import * as _ from 'lodash'
import { retrieveJSONData, storeJSONData } from '@/utility/Storage'
import AutoRefreshComponent from '@/components/AutoRefreshComponent'
import { ExpiringSoonBanner } from '@/pages/DeviceSelection/Banner'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import { titleCase } from 'change-case'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    hubs: state.hub.hubs || [],
    beacons: state.sofiBeacon.beacons.beacons || [],
    pathname: state.routing.location.pathname,
    me: state.user.me,
    dashboardOverview: state.user.dashboardOverview,
    userOrgs: state.user.userOrgs,
    userHubs: state.user.userHubs,
    admin: state.user.me?.authorities.some(role=>role.includes('ADMIN')),
    userSubscriptions: state.billing.userSubscriptions,
    stripeEnabled: state.common.stripeEnabled
})

const initialFilterState = {
    mobileOnlineFilter: false,
    noDeviceModal: false,
    selectBeaconModal: false,
    searchModal: false,
    selectedOrg: 'all',
    idView: retrieveJSONData('idView')|| false,
    onlineFilter: false,
    anomalyFilter: false,
    sensorLBFilter: false,
    sensorOfflineFilter: false,
    noMainPowerFilter: false,
    hubOffline: false,
    beaconOffline: false,
    radarOffline: false,
    beaconLBFilter: false,
    sensorWarningFilter: false,
    beaconHeartBeatFilter: false,
    beacon: [],
    loading: false,
}

class HubSelection extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ...initialFilterState,
            nameFilter: '',
            mobileNameFilter: '',
            onlineFilter: retrieveJSONData('onlineFilter')|| false,
        }
    }

    componentDidMount(){
        actions.user.dashboardOverview()
        this.props.me && actions.user.getUserOrgs(this.props.me.user_id)
        actions.common.save({ adminPortal: false})
        let action = []
        action.push(actions.hub.resetState())
        action.push(actions.setting.resetState())
        action.push(actions.radar.resetState())
        action.push(actions.sofiBeacon.resetState())
        action.push(actions.billing.resetState())
        action.push(actions.SIM.resetState())
        Promise.all(action).then(()=>
        {
            actions.hub.getSofiDevices()
            // actions.billing.fetchExpiringCards()
            actions.billing.fetchUserSubscriptions()
        })
        actions.common.toggleSideMenu(false)
    }

    componentDidUpdate(prevProps) {
        prevProps.me!==this.props.me && actions.user.getUserOrgs(this.props.me?.user_id)
    }

    resetFilters = () => {
        this.setState(initialFilterState)
    }

    generateDeviceList = () => {
        const {onlineFilter, nameFilter, selectedOrg} = this.state
        let hubs = this.props.dashboardOverview.hubs
        let beacons = this.props.dashboardOverview.beacons
        let radars = this.props.dashboardOverview.radars || []
        hubs = onlineFilter ? hubs.filter(hub=>hub.connectivity_state==='ONLINE') : hubs
        beacons = onlineFilter ? beacons.filter(x => x.beacon_status === 'ONLINE') : beacons
        radars = onlineFilter ? radars?.filter(x => x.status === 'ONLINE') : radars
        let devices = hubs.concat(beacons, radars)
        devices = nameFilter !== '' ? devices.filter(
            device=>device.display_name?.toLowerCase().includes(nameFilter.toLowerCase()) ||
                device.mac_address?.toLowerCase().includes(nameFilter.toLowerCase()) ||
                device.imei?.toLowerCase().includes(nameFilter.toLowerCase()) ||
                device.phone?.toLowerCase().includes(nameFilter.toLowerCase())||
                device.ext_id?.toLowerCase().includes(nameFilter.toLowerCase())
        ) : devices
        devices = selectedOrg!== 'all' ? selectedOrg=== 'personal' ? devices.filter(device=>device.user_id === this.props.me.user_id) :
            devices.filter(device=>device.organization_id === selectedOrg) : devices
        devices = removeDuplicateDevices(devices)
        devices = devices.sort((a,b)=>sortString(a,b,'display_name'))
        devices = this.sortDeviceToPairedGroups(devices)
        devices = this.groupDevices(devices)
        return devices
    }

    generateNameFilterOnlyDeviceList = () => {
        const {nameFilter} = this.state
        let hubs = this.props.dashboardOverview.hubs
        let beacons = this.props.dashboardOverview.beacons
        let radars = this.props.dashboardOverview.radars || []
        let devices = hubs.concat(beacons, radars)
        devices = nameFilter !== '' ? devices.filter(
            device=>device.display_name?.toLowerCase().includes(nameFilter.toLowerCase()) ||
                device.mac_address?.toLowerCase().includes(nameFilter.toLowerCase()) ||
                device.imei?.toLowerCase().includes(nameFilter.toLowerCase()) ||
                device.phone?.toLowerCase().includes(nameFilter.toLowerCase())
        ) : devices
        devices = removeDuplicateDevices(devices)
        return devices
    }

    checkFilters = (onLine) => {
        const {onlineFilter, anomalyFilter, sensorWarningFilter, radarOffline, sensorLBFilter, sensorOfflineFilter, noMainPowerFilter, hubLBFilter, hubOffline, beaconOffline, beaconLBFilter, beaconHeartBeatFilter } = this.state
        const otherFilters = anomalyFilter || sensorLBFilter || sensorOfflineFilter || noMainPowerFilter || hubLBFilter || hubOffline || beaconOffline || beaconLBFilter || radarOffline || sensorWarningFilter || beaconHeartBeatFilter
        return onLine ? onlineFilter || otherFilters : otherFilters
    }

    generateAnomalyTitle = (anomaly) =>{
        if (anomaly==='LATE_SLEEP') return 'Late to sleep'
        else if (anomaly==='LATE_WAKE_UP') return 'Late to wake'
        else if (anomaly==='BATHROOM_TOO_LONG') return 'Long bathroom duration'
        else return anomaly
    }

    groupDevices = (devices) => {
        const { anomalyFilter, sensorLBFilter, sensorOfflineFilter, noMainPowerFilter, sensorWarningFilter, hubOffline, beaconOffline, beaconHeartBeatFilter, radarOffline, beaconLBFilter } = this.state
        const filterOn = this.checkFilters(false)
        const deviceGroup = {
            distress: [],
            offline: [],
            required: [],
            warning: [],
            good: []
        }
        devices.map(device=>{
            if (device.anomaly_status ){
                device.title = this.generateAnomalyTitle(device.anomaly_classification)
                device.desc = 'Click for more details'
                if (!filterOn || anomalyFilter) deviceGroup.distress.push(device)
            }else if (device.in_fallen_down ) {
                device.title = 'Fall Detected'
                device.desc = 'Click for more details'
                if (!filterOn || anomalyFilter) deviceGroup.distress.push(device)
            }else if (device.in_activation ) {
                device.title = 'Motion above threshold detected'
                device.desc = 'Click for more details'
                if (!filterOn || anomalyFilter) deviceGroup.distress.push(device)
            }else if (device.in_sos ) {
                device.title = 'SOS Button Press'
                device.desc = 'Click for more details'
                if (!filterOn || anomalyFilter) deviceGroup.distress.push(device)
            }else if (device.connectivity_state==='OFFLINE' || device.connectivity_state===null) {
                device.title = `${globalConstants.HUB_SOFIHUB} Offline`
                device.desc = 'Click for more details'
                if (!filterOn || hubOffline) deviceGroup.offline.push(device)
            }else if (device.beacon_status==='OFFLINE' || device.beacon_status === null) {
                device.title = `${isWatch(device) ? titleCase(globalConstants.BEACON_WATCH) : titleCase(globalConstants.PENDANT_GENERIC)} Offline`
                device.desc = 'Click for more details'
                if (!filterOn || beaconOffline) deviceGroup.offline.push(device)
            }else if (device.status==='OFFLINE' || device.status === null) {
                device.title = `${globalConstants.RADAR_HOBA} Offline`
                device.desc = 'Click for more details'
                if (!filterOn || radarOffline) deviceGroup.offline.push(device)
            }else if (device.ups_status !== 'CHARGE_COMPLETE' && device.ups_status !== 'CHARGING' && device.hub_id && device.mac_address ) {
                device.title = 'Lost Main Power'
                device.desc = 'Click for more details'
                if (!filterOn || noMainPowerFilter) deviceGroup.required.push(device)
            }else if (device.sensor_offline_count>0 ) {
                device.title = 'Sensors Offline'
                device.desc = 'Click for more details'
                if (!filterOn || sensorOfflineFilter) deviceGroup.required.push(device)
            }else if (device.battery_level && device.battery_level<=10 ) {
                device.title = 'Battery Critically Low'
                device.desc = 'Click for more details'
                if (!filterOn || beaconLBFilter) deviceGroup.required.push(device)
            }else if (device.beacon_status === 'WARNING' ) {
                device.title = 'No Device Heartbeat'
                device.desc = 'Click for more details'
                if (!filterOn || beaconHeartBeatFilter) deviceGroup.required.push(device)
            }else if (device.battery_level && device.battery_level<=20 ) {
                device.title = 'Low Battery'
                device.desc = 'Click for more details'
                if (!filterOn || beaconLBFilter) deviceGroup.warning.push(device)
            }else if (device.sensor_low_battery_count>0  ) {
                device.title = 'Low Sensor Battery'
                device.desc = 'Click for more details'
                if (!filterOn || sensorLBFilter) deviceGroup.warning.push(device)
            }else if (device.sensor_warning_count >0  ) {
                device.title = 'Sensors on Warning'
                device.desc = 'Click for more details'
                if (!filterOn || sensorWarningFilter) deviceGroup.warning.push(device)
            }else {
                if (!filterOn ) deviceGroup.good.push(device)
            }
        })
        return deviceGroup
    }

    sortDeviceToPairedGroups = (devices)=> {
        let newDeviceList = devices.filter(device=> !(device.hub_id && device.imei))
        let pairedBeacons = devices.filter(device=> device.hub_id && device.imei)
        pairedBeacons.map(beacon=> {
            newDeviceList.splice(newDeviceList.findIndex(device=> device.hub_id === beacon.hub_id && !device.imei)+1,0,beacon)
        })
        return newDeviceList
    }

    handleNewDeviceModal = (state) => {
        actions.common.fetchStripeEnabled()
        this.props.userOrgs.length > 0 ? Modal.confirm({
            title: 'Warning, you are about to claim a device and associate it with your personal SOFIHUB account!',
            content: <div>We&#39;ve noticed you are part of at least one organisation, if you are wanting to claim a SOFIHUB device for
                that organisation you must claim it via the organisation settings page. <br/>
                Are you sure you wish to claim a new device for your personal account?</div>,
            okText: 'Yes',
            onOk: ()=>{
                Modal.destroyAll()
                actions.common.changeNewDeviceModal(state)
            }
        }):
            actions.common.changeNewDeviceModal(state)
    }

    handleSearchModal = (state) =>{
        this.setState({
            searchModal: state,
            mobileNameFilter: this.state.nameFilter,
            mobileOnlineFilter: this.state.onlineFilter
        })
    }

    // renderBreadCrumb = () => {
    //     const firstName = this.props.me && this.props.me.first_name
    //     return <div style={{lineHeight: 1.5715 }}>
    //         <Row style={{fontWeight: 500, fontSize: '18px'}}>Hello {firstName}!</Row>
    //         <Row>Pick a device to see more details.</Row>
    //     </div>
    // }

    buildOrgOptions = () => {
        const orgs = this.props.userOrgs
        return  [<Select.Option value='all' key='all'>All Devices</Select.Option>,
            <Select.Option value='personal' key='personal'>Personal Devices</Select.Option>].concat(
            orgs?.filter(org=>org.organization.active)?.map(org=><Select.Option value={org.organization.organization_id} key={org.organization.organization_id}>{org.organization.name}</Select.Option>)
        )
    }

    handleCancelSelectBeacon = () => {
        this.setState({selectBeaconModal: false, beacon: [], loading: false})
    }

    handleSelectOrg = (value) => {
        this.setState({selectedOrg: value})
    }

    handleOnlineSwitch = (checked) =>{
        this.setState({onlineFilter: checked})
        storeJSONData('onlineFilter',checked)
    }

    handleIDSwitch = (checked) =>{
        this.setState({idView: checked})
        storeJSONData('idView',checked)
    }

    handleSelectAll = () => {
        this.setState({loading: true})
        let filteredBeacons = removeDuplicateDevices(this.props.dashboardOverview.beacons)
        actions.sofiBeacon.selectBeacons(filteredBeacons).finally(()=>{
            this.handleCancelSelectBeacon()
            actions.routing.push('/beaconsMap')
        })
    }

    handleSelectOnline = () => {
        this.setState({loading: true})
        let filteredBeacons = removeDuplicateDevices(this.props.dashboardOverview.beacons).filter(x => x.beacon_status === 'ONLINE')
        actions.sofiBeacon.selectBeacons(filteredBeacons).finally(()=>{
            this.handleCancelSelectBeacon()
            actions.routing.push('/beaconsMap')
        })
    }


    handleSelectBeaconSubmit = () => {
        const beaconIds = this.state.beacon
        let filteredBeacons = removeDuplicateDevices(this.props.dashboardOverview.beacons)
        let beacons = beaconIds.map(beaconId=>filteredBeacons.find(beacon=>beacon.pub_id===beaconId))
        actions.sofiBeacon.selectBeacons(beacons).finally(()=>{
            this.handleCancelSelectBeacon()
            actions.routing.push('/beaconsMap')
        })
    }

    buildFilterContent = () => {
        const {onlineFilter, anomalyFilter, sensorLBFilter, sensorOfflineFilter, noMainPowerFilter, hubOffline, beaconOffline,beaconLBFilter, sensorWarningFilter,beaconHeartBeatFilter, idView } = this.state
        return <Fragment>
            <Checkbox checked={onlineFilter} onChange={e=>this.handleOnlineSwitch(e.target.checked)}>Online devices</Checkbox><br />
            {isMobile && <Fragment><Checkbox checked={idView} onChange={e=>this.setState({idView:e.target.checked})}>Show IDs instead of display names</Checkbox><br /></Fragment>}
            <Divider style={{width: 200}}>Filters - Show only:</Divider>
            <Checkbox checked={anomalyFilter} onChange={e=>this.setState({anomalyFilter:e.target.checked})}>Anomaly/distress in progress</Checkbox><br />
            <Checkbox checked={sensorLBFilter} onChange={e=>this.setState({sensorLBFilter:e.target.checked})}>Sensor low battery</Checkbox><br />
            <Checkbox checked={sensorWarningFilter} onChange={e=>this.setState({sensorWarningFilter:e.target.checked})}>Sensor on Warning</Checkbox><br />
            <Checkbox checked={sensorOfflineFilter} onChange={e=>this.setState({sensorOfflineFilter:e.target.checked})}>Sensor Offline</Checkbox><br />
            <Checkbox checked={noMainPowerFilter} onChange={e=>this.setState({noMainPowerFilter:e.target.checked})}>No mains power (for hub)</Checkbox><br />
            <Checkbox checked={hubOffline} onChange={e=>this.setState({hubOffline:e.target.checked})}>{titleCase(globalConstants.HUB_GENERIC)} offline</Checkbox><br />
            <Checkbox checked={beaconLBFilter} onChange={e=>this.setState({beaconLBFilter:e.target.checked})}>{titleCase(globalConstants.PENDANT_GENERIC)} low battery</Checkbox><br />
            <Checkbox checked={beaconOffline} onChange={e=>this.setState({beaconOffline:e.target.checked})}>{titleCase(globalConstants.PENDANT_GENERIC)} offline</Checkbox><br />
            <Checkbox checked={beaconHeartBeatFilter} onChange={e=>this.setState({beaconHeartBeatFilter:e.target.checked})}>{titleCase(globalConstants.PENDANT_GENERIC)} No Heartbeat</Checkbox>
        </Fragment>
    }

    handleSelectBeaconModal = () => {
        let beacons = this.props.dashboardOverview.beacons
        beacons = removeDuplicateDevices(beacons)
        beacons.length > 10 ? this.setState({selectBeaconModal: true}) : actions.sofiBeacon.selectBeacons(beacons).finally(()=>actions.routing.push('/beaconsMap'))
    }

    generateBeaconOptions = () => {
        let beacons = this.props.dashboardOverview.beacons
        beacons = removeDuplicateDevices(beacons)
        return beacons.map(beacon=><Select.Option value={beacon.pub_id} key={beacon.pub_id}>{beacon.display_name}</Select.Option>)
    }

    handleChange = (value) => {
        this.setState({beacon: value})
    }

    subscriptionFilter = (allSubs) => {
        return allSubs?.filter(subs=>requirePayment(subs.subscription_status)|| subs.subscription_status==='ACTIVE' &&
            subs.payment_card_expiry && moment().isSameOrAfter(moment(subs.payment_card_expiry, 'M/YYYY'),'month'))
    }

    renderPageContent = () => {
        const {userOrgs, admin, dashboardOverview, userSubscriptions, stripeEnabled} = this.props
        let devices = this.generateDeviceList()
        const nameFilterOnlyDevices = this.generateNameFilterOnlyDeviceList()
        const {nameFilter, searchModal, mobileNameFilter, mobileOnlineFilter, selectedOrg, idView, selectBeaconModal, beacon, loading} = this.state
        const orgOptions = this.buildOrgOptions()
        const filterContent = this.buildFilterContent()
        const filterOn = this.checkFilters()
        const subscriptionWithIssues = this.subscriptionFilter(userSubscriptions)
        return (
            <Fragment>
                {stripeEnabled && <ExpiringSoonBanner
                    subsRecords={subscriptionWithIssues}
                    dashboardOverview={dashboardOverview}
                />}
                <div className="contentPage">
                    {isMobile ? <Fragment>
                        <Row className="margin-bottom" type="flex" gutter={16} justify="space-between">
                            {dashboardOverview?.beacons?.length>0 &&  <Col>
                                <Button
                                    type="primary"
                                    onClick={this.handleSelectBeaconModal}>{titleCase(globalConstants.PENDANT_GENERIC)} Map Screen</Button>
                            </Col>}
                            <Col>
                                <Button
                                    type="primary"
                                    onClick={()=>this.handleNewDeviceModal(true)}>Claim a new device</Button>
                            </Col>
                        </Row>
                        <Row className="margin-bottom" type="flex" gutter={12}>
                            { (userOrgs?.length>0 || admin) && <Col><Select
                                style={{width: 150}}
                                placeholder="Organisation ..."
                                onChange={this.handleSelectOrg}
                                value={this.state.selectedOrg}
                            >
                                {orgOptions}
                            </Select>
                            </Col>}
                            <Col>
                                <Button
                                    icon={<SearchOutlined />}
                                    className="searchButton"
                                    onClick={()=>this.handleSearchModal(true)}
                                >
                                    {nameFilter || 'Search...'}
                                </Button>
                            </Col>
                            <Col>
                                <Popover placement="bottom" content={filterContent} trigger="click">
                                    <Button type={filterOn? 'primary':'default'} shape="circle" icon={<FilterOutlined />} />
                                </Popover>
                            </Col>
                        </Row>
                        <Modal
                            okText="Search"
                            open={searchModal} onCancel={()=>this.handleSearchModal(false)}
                            onOk={()=> {
                                this.setState({
                                    nameFilter: mobileNameFilter,
                                    onlineFilter: mobileOnlineFilter
                                })
                                this.handleSearchModal(false)
                            }}
                        >
                            <Row type="flex" gutter={[16,16]} align="middle">
                                <Col span={14}>
                                    <Input.Search
                                        className="mobileSearch"
                                        value={mobileNameFilter}
                                        placeholder="Search..."
                                        onChange={e=>this.setState({mobileNameFilter: e.target.value})}
                                        autoFocus
                                    />
                                </Col>
                                <Col span={8}>
                                    <Switch
                                        checkedChildren="ONLINE"
                                        unCheckedChildren="ALL"
                                        checked={mobileOnlineFilter}
                                        onChange={checked=>this.setState({mobileOnlineFilter: checked})}
                                    />
                                </Col>
                            </Row>
                        </Modal>
                    </Fragment> :
                        <Row className="search" type="flex" gutter={[16,16]} align="middle" justify="space-between">
                            <Col>
                                <Row type="flex" gutter={[16,16]} align="middle">
                                    {(admin || userOrgs?.length>0) && <Col>
                                        <Select
                                            style={{width: 200}}
                                            placeholder="Organisation ..."
                                            onChange={this.handleSelectOrg}
                                            value={this.state.selectedOrg}
                                        >
                                            {orgOptions}
                                        </Select>
                                    </Col>
                                    }
                                    <Col className="search-col">
                                        <Input.Search
                                            value={this.state.nameFilter}
                                            style={{width: 200}}
                                            placeholder="Search..."
                                            onChange={e=>this.setState({nameFilter: e.target.value})}
                                            autoFocus = {!isMobile}
                                        />
                                    </Col>
                                    <Col className="search-col">
                                        <Popover placement="bottom" content={filterContent} trigger="click">
                                            <Button type={filterOn? 'primary':'default'} shape="circle" icon={<FilterOutlined />} />
                                        </Popover>
                                    </Col>
                                    <Col>
                                        {(admin || userOrgs?.length>0) &&<Switch
                                            checkedChildren="IDs"
                                            unCheckedChildren="Display Names"
                                            checked={this.state.idView}
                                            onChange={checked=>this.handleIDSwitch(checked)}
                                        />}
                                        <Switch
                                            checkedChildren="Online Devices Only"
                                            unCheckedChildren="All Devices"
                                            checked={this.state.onlineFilter}
                                            onChange={checked=>this.handleOnlineSwitch(checked)}
                                        />
                                    </Col>
                                    <Col>
                                        <AutoRefreshComponent refresh={()=>actions.user.dashboardOverview()}/>
                                    </Col>
                                    {dashboardOverview?.beacons?.length>0 && <Col>
                                        <Button
                                            type="primary"
                                            onClick={this.handleSelectBeaconModal}>{titleCase(globalConstants.PENDANT_GENERIC)} Map Screen
                                        </Button>
                                    </Col>}
                                </Row>
                            </Col>
                            <Col>
                                <Button
                                    className="floatRight"
                                    type="primary"
                                    onClick={()=>this.handleNewDeviceModal(true)}>Claim a new device</Button>
                            </Col>
                        </Row>}
                    {Object.values(devices).flat().length>0 ? <>
                        <DeviceGroup
                            devices={devices.distress}
                            title={`Action Required - Distress Event (${devices.distress.length} Devices)`}
                            iconClassName = "distress"
                            textClassName = "distress"
                            idView={idView}
                        />
                        <DeviceGroup
                            devices={devices.offline}
                            title={`Action Required - Offline (${devices.offline.length} Devices)`}
                            iconClassName = "offline"
                            textClassName = "offline"
                            idView={idView}
                        />
                        <DeviceGroup
                            degraded
                            devices={devices.required}
                            title={`Action Required - Device Health (${devices.required.length} Devices)`}
                            iconClassName = "warning"
                            textClassName = "warning"
                            idView={idView}
                        />
                        <DeviceGroup
                            devices={devices.warning}
                            title={`Action Required Soon (${devices.warning.length} Devices)`}
                            iconClassName = "warning"
                            textClassName = "warning"
                            idView={idView}
                        />
                        <DeviceGroup
                            devices={devices.good}
                            title={_.isString(selectedOrg) ? `No Action Required (${devices.good.length} Devices)` : isMobile ? `No Action Required (Remaining ${devices.good.length} Devices)`:
                        `No Action Required (Remaining ${devices.good.length} Devices In Fleet) `}
                            iconClassName = "good"
                            textClassName = "good"
                            idView={idView}
                        />
                    </> : <>
                        <Empty
                            description={
                                this.checkFilters(true) ? nameFilterOnlyDevices.length>0 ? <>
                                    <small>No results matching &quot;{nameFilter}&quot; with current filters applied</small><br/>
                                    <b>{nameFilterOnlyDevices.length} results if you <a onClick={this.resetFilters}>remove filters</a></b>
                                </> : <>
                                    <b>No results matching &quot;{nameFilter}&quot; with current filters applied</b><br/>
                                    <small>No results with filters removed</small>
                                </>
                                    :<b>{nameFilter ? `No results matching "${nameFilter}"` : 'No Devices'}</b>
                            }
                        />
                    </>}
                </div>
                <Modal
                    open={selectBeaconModal}
                    onCancel={this.handleCancelSelectBeacon}
                    footer={[
                        <Row type="flex" justify="space-between" gutter={[12,12]} key="row">
                            <Col>
                                <Button onClick={this.handleSelectAll} loading={loading} className="margin-right">Select All</Button>
                                <Button onClick={this.handleSelectOnline} loading={loading}>Select Online</Button>
                            </Col>
                            <Col>
                                <Button onClick={this.handleCancelSelectBeacon} className="margin-right">Cancel</Button>
                                <Button
                                    type="primary"
                                    onClick={this.handleSelectBeaconSubmit}
                                    disabled={!this.state.beacon || this.state.beacon.length===0}
                                >Submit</Button>
                            </Col>
                        </Row>]}
                >
                    <p> Please select {titleCase(globalConstants.PENDANT_GENERIC)}s from the list below or search: </p>
                    <Select
                        className="beaconSelect"
                        autoClearSearchValue={false}
                        showSearch
                        mode="multiple"
                        filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                        size="large"
                        value={beacon}
                        onChange={this.handleChange}
                        placeholder={`Please select ${titleCase(globalConstants.PENDANT_GENERIC)}s...`}
                    >
                        {this.generateBeaconOptions()}
                    </Select>
                </Modal>
            </Fragment>
        )
    }
    render() {
        return (
            <DeviceSelectionLayout
                content={this.renderPageContent()}
                // ctmBreadCrumb={this.renderBreadCrumb()}
            />
        )
    }
}

export default connect(mapStateToProps,null)(HubSelection)

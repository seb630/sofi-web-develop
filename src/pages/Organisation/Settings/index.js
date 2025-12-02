import { Component } from 'react'
import { actions, connect, Route } from 'mirrorx'
import { BankOutlined, CloseOutlined } from '@ant-design/icons'
import { Col, Layout, Row, Select } from 'antd'
import PropTypes from 'prop-types'
import '../organisation.scss'
import Sidebar from '../../Common/Sidebar'
import DeviceSelectionLayout from '../../Common/Layouts/DeviceSelectionLayout'
import Profile from '../../GlobalAdmin/Organisation/Organisations/Profile'
import OrgContacts from '../../GlobalAdmin/Organisation/Organisations/Contact'
import OrgUsers from '../../GlobalAdmin/Organisation/Organisations/User'
import OrgHubs from '../../GlobalAdmin/Organisation/Organisations/Hub'
import OrgBeacons from '../../GlobalAdmin/Organisation/Organisations/Beacon'
import OrgRadars from '../../GlobalAdmin/Organisation/Organisations/Radar'
import Action from '../../GlobalAdmin/Organisation/Organisations/Action'
import { isMobile } from 'react-device-detect'
import OrgDeviceGroups from '../../GlobalAdmin/Organisation/Organisations/DeviceGroup'
import OrgUserGroups from '../../GlobalAdmin/Organisation/Organisations/UserGroup'
import OrgTP from '../../GlobalAdmin/Organisation/Organisations/ThirdParty'
import Permissions from '../../GlobalAdmin/Organisation/Organisations/Permission'
import OrgAPN from '../../GlobalAdmin/Organisation/Organisations/APN'

const { Header, Content } = Layout

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    selectedOrg: state.organisation.selectedOrg,
    sideMenuCollapsed: state.common.sideMenuCollapsed,
    me: state.user.me,
    userOrgs: state.user.userOrgs,
    lastDevicePage: state.common.lastDevicePage,
    allOrgs: state.organisation.orgs,
    admin: state.user.me?.authorities.some(role=>role.includes('ADMIN'))
})

class OrganisationSettings extends Component {
    constructor(props){
        super(props)
        this.state={
            mobileModal: false,
        }
    }

    buildOrgOptions = () => {
        const {userOrgs, allOrgs, admin} = this.props
        if (admin) {
            const userGroup = <Select.OptGroup label="You belong to:" key='belongs'>
                {userOrgs?.map(org=><Select.Option value={org.organization.organization_id} key={org.organization.organization_id}>{org.organization.name}</Select.Option>)}
            </Select.OptGroup>
            const otherGroup = <Select.OptGroup label="You don&#39;t belong to:" key='others'>
                {allOrgs?.filter(org=> !userOrgs?.some(userOrg=> userOrg.organization.organization_id===org.organization_id))?.map(
                    org=><Select.Option value={org.organization_id} key={org.organization_id}>{org.name}</Select.Option>)}
            </Select.OptGroup>
            return [userGroup,otherGroup]
        }else return userOrgs?.filter(org=>org.organization.active)?.map(org=><Select.Option value={org.organization.organization_id} key={org.organization.organization_id}>{org.organization.name}</Select.Option>)
    }

    handleSelectOrg = (value) => {
        const {userOrgs, allOrgs, admin} = this.props
        const org = admin ? allOrgs.find(org=>org.organization_id===value) : userOrgs.find(org=>org.organization.organization_id===value)?.organization
        actions.organisation.selectOrg(org).then(()=>{
            actions.organisation.save({
                orgHubs: null,
                orgBeacons: null,
                orgRadars: null,
                orgUsers: null,
                orgTPs: null,
                orgAPNs: null,
                contacts: null,
                orgInvitation: null,
                orgContactType: null,
                orgDeviceGroups: null,
                orgDeviceGroupDevices: null,
                orgUserGroups: null,
                orgUserGroupUsers: null,
                orgUserGroupRoles: null,
                orgUserRoles: null,
                allUserGroupUsers: null,
                allDeviceGroupDevices: null,
            })
            actions.permission.save({
                orgRoles: null,
                orgProfiles: null
            })
            actions.routing.push(this.props.pathname)
        }
        )
    }

    handleCloseOrg = () => {
        const {lastDevicePage} = this.props
        actions.organisation.selectOrg(null)
        actions.routing.push( lastDevicePage === 'deviceSelection'? '/deviceSelection' : lastDevicePage === 'beacon' ? '/beacon/dashboard' : lastDevicePage === 'radar' ? '/radar/dashboard': '/dashboard')
    }

    renderPageContent = () =>{
        const { sideMenuCollapsed, selectedOrg} = this.props
        const orgOptions = this.buildOrgOptions()
        return (
            <Layout>
                <Header className='OrgHeader'>
                    {isMobile ? <Row type="flex">
                        <Col span={3}><BankOutlined className='OrgHeader-Icon'  style={{scale:'0.8'}}  /></Col>
                        <Col span={18} className="mobileOrgSelection"><span>Organisation Settings</span>
                            <Select
                                placeholder="Please select an organisation ..."
                                onChange={this.handleSelectOrg}
                            >
                                {orgOptions}
                            </Select></Col>
                        <Col span={3}>
                            <CloseOutlined className='OrgHeader-Icon' onClick={this.handleCloseOrg}  style={{scale:'0.5'}}  />
                        </Col>

                    </Row>:<Row type="flex" justify="space-between">
                        <Col>
                            <BankOutlined className='OrgHeader-Icon'  style={{scale:'0.8'}}  />
                            <span className='OrgHeader-Title'>Organisation Settings</span>
                            <Select
                                placeholder="Please select an organisation ..."
                                onChange={this.handleSelectOrg}
                                size="large">
                                {orgOptions}
                            </Select>
                        </Col>
                        <Col>
                            <CloseOutlined className='OrgHeader-Icon' onClick={this.handleCloseOrg} style={{scale:'0.5'}} />
                        </Col>
                    </Row>}
                </Header>
                {selectedOrg && <Layout className='OrgBody'>
                    <Sidebar
                        onCollapse={() => {actions.common.toggleSideMenu()}}
                        menu='org'
                        collapsed={sideMenuCollapsed}
                        logos={false}
                    />
                    <Content>
                        <Route exact path='/organisationSettings/details' render={(props)=>
                            <Profile {...props} currentOrg={selectedOrg} readOnly/>
                        }/>
                        <Route exact path='/organisationSettings/contacts' render={(props)=><OrgContacts {...props} currentOrg={selectedOrg}/>}  />
                        <Route exact path='/organisationSettings/users' render={(props)=><OrgUsers {...props} currentOrg={selectedOrg}/>}  />
                        <Route exact path='/organisationSettings/hubs' render={(props)=><OrgHubs {...props} currentOrg={selectedOrg}/>}  />
                        <Route exact path='/organisationSettings/radars' render={(props)=><OrgRadars {...props} currentOrg={selectedOrg}/>}  />
                        <Route exact path='/organisationSettings/beacons' render={(props)=><OrgBeacons {...props} currentOrg={selectedOrg}/>}  />
                        <Route exact path='/organisationSettings/permissions' render={(props)=><Permissions {...props} currentOrg={selectedOrg}/>}  />
                        <Route exact path='/organisationSettings/actions' render={(props)=><Action {...props} currentOrg={selectedOrg}/>}  />
                        <Route exact path='/organisationSettings/device-groups' render={(props)=><OrgDeviceGroups {...props} currentOrg={selectedOrg}/>}  />
                        <Route exact path='/organisationSettings/user-groups' render={(props)=><OrgUserGroups {...props} currentOrg={selectedOrg}/>}  />
                        <Route exact path='/organisationSettings/third-party-endpoints' render={(props)=><OrgTP {...props} currentOrg={selectedOrg}/>} />
                        <Route exact path='/organisationSettings/apns' render={(props)=><OrgAPN {...props} currentOrg={selectedOrg}/>}  />
                    </Content>
                </Layout>}
            </Layout>
        )
    }

    render () {
        return (
            <DeviceSelectionLayout
                showToggle = {!!this.props.selectedOrg}
                content={this.renderPageContent()}
            />
        )
    }
}

OrganisationSettings.propTypes = {
    selectedHub: PropTypes.object,
    content: PropTypes.node,
    contentClass: PropTypes.string,
    aboveContent: PropTypes.node,
    menu: PropTypes.string,
}

export default connect(mapStateToProps, null) (OrganisationSettings)

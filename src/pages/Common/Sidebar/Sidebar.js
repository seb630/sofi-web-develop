import { Component, Fragment } from 'react'
import Logo from '../../../images/logo.svg'
import { actions, connect, Link } from 'mirrorx'
import PropTypes from 'prop-types'
import {
    ApartmentOutlined,
    ApiOutlined,
    AppstoreOutlined,
    BankOutlined,
    BellOutlined,
    BuildOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ContactsOutlined,
    DashboardOutlined,
    DesktopOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    EyeOutlined,
    HomeOutlined,
    InteractionOutlined,
    MedicineBoxOutlined,
    MobileOutlined,
    SelectOutlined,
    SettingOutlined,
    SoundOutlined,
    StarOutlined,
    TeamOutlined,
    UserOutlined,
    VideoCameraOutlined
} from '@ant-design/icons'
import { Layout, Menu } from 'antd'
import { MyIcon } from '../Common'
import { globalConstants } from '@/_constants'
import { titleCase } from 'change-case'

const { Sider } = Layout
const { SubMenu } = Menu

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub || null,
    selectedBeacon: state.sofiBeacon.selectedBeacon || null,
    selectedRadar:state.radar.selectedRadar || null,
    selectedOrg: state.organisation.selectedOrg || null,
    hubs: state.hub.hubs,
    pathname: state.routing.location.pathname,
    timezone: state.user.useHubTimeZone && state.setting.settings?.preferences?.timezone,
    admin: state.user.me?.authorities.some(role=>role.includes('ADMIN')),
    myPrivileges: state.user.myPrivileges,
    me: state.user.me,
    sideMenuCollapsed: state.common.sideMenuCollapsed,
    paymentRequired: state.billing.paymentRequired,
    disabledDevice: state.billing.disabledProduct?.is_disabled,
    userOrgs: state.user.userOrgs,
    loading: state.hub.loading || state.sofiBeacon.loading || state.radar.loading
})

let firstMount = true

class SideBar extends Component {

    handleMenuClick = () => {
        this.props.isMobile && actions.common.toggleSideMenu()
    }

    componentDidMount() {
        firstMount = false
    }

    accessAdmin = () => {
        const {admin, myPrivileges} = this.props
        const hasTPAccess = myPrivileges && (Object.values(myPrivileges)?.flat()?.find(privilege=>privilege.includes('THIRD_PARTY')) || Object.values(myPrivileges)?.flat()?.find(privilege=>privilege.includes('APN')))
        return admin || hasTPAccess
    }
    /** create Hub Links */
    createHubLinks = () => {
        const {  selectedHub , admin, paymentRequired, disabledDevice,} = this.props
        return [
            { shown: !!selectedHub, to:'/glance' , icon: <CheckCircleOutlined /> , displayName:'At a glance', key:'hub-glance' , disabled: (paymentRequired || disabledDevice) && !admin},
            { shown: !!selectedHub, to:'/dashboard' , icon:<DashboardOutlined /> , displayName:'Dashboard', key:'hub-dashboard' , disabled: (paymentRequired || disabledDevice) && !admin },
            { shown: !!selectedHub, to:'/timeline' , icon:<ClockCircleOutlined /> , displayName:'Timeline', key:'hub-timeline'  , disabled: (paymentRequired || disabledDevice) && !admin},
            { shown: !!selectedHub, to:'/medication' , icon:<MedicineBoxOutlined/> , displayName:'Medication', key:'hub-medication' , disabled: (paymentRequired || disabledDevice) && !admin },
            { shown: !!selectedHub, to:'/alerts' , icon:<BellOutlined /> , displayName:'Anomalies', key:'hub-anomalies' , disabled: (paymentRequired || disabledDevice) && !admin },
            { shown: !!selectedHub, to:'/reminders' , icon:<SoundOutlined/> , displayName:'Reminders' , key:'hub-reminders'  , disabled: (paymentRequired || disabledDevice) && !admin},
            { shown: !!selectedHub, to:'/rules' , icon:<InteractionOutlined/> , displayName:'Event Rules' , key:'hub-rules'  , disabled: (paymentRequired || disabledDevice) && !admin},
            { shown: !!selectedHub, to:'/settings' , icon:<SettingOutlined /> , displayName:'Settings' , key:'hub-settings' , disabled: (paymentRequired || disabledDevice) && !admin},
            { shown: this.accessAdmin(), to:'/admin' , icon:<StarOutlined /> , displayName:'Admin', key:'hub-admin' }
        ]
    }

    /** create Beacon links */
    createBeaconLinks = () => {
        const {  selectedBeacon , admin, paymentRequired,disabledDevice } = this.props
        const disabledProduct = (paymentRequired || disabledDevice) && !admin
        return  [
            { shown: !!selectedBeacon, to:'/beacon/dashboard' , icon:<DashboardOutlined />, displayName:'Dashboard' , key:'beacon-dashboard' , disabled: disabledProduct},
            disabledProduct ? { shown: !!selectedBeacon ,to:'/beacon/dashboard', displayName:'Device History' , key:'location-history' , disabled: disabledProduct, icon:<EnvironmentOutlined/> }
                : { shown: !!selectedBeacon , displayName:'Device History' , key:'device-history' , icon:<EnvironmentOutlined/> , children: [
                    { shown: !!selectedBeacon , to:'/beacon/history/gps' , displayName:'Location History' , key:'location-history', },
                    { shown: !!selectedBeacon , to:'/beacon/history/signal' , displayName:'Cellular Signal History', key:'cellular-history', },
                ]},
            { shown: !!selectedBeacon, to:'/beacon/alerts' , icon:<BellOutlined /> , displayName:'Alert History', key:'beacon-alert', disabled: disabledProduct},
            { shown: !!selectedBeacon, to:'/beacon/geofence' , icon:<EyeOutlined /> , displayName:'Geo Fence', key:'beacon-fence', disabled: disabledProduct },
            { shown: !!selectedBeacon, to:'/beacon/settings' , icon:<SettingOutlined />, displayName:'Settings', key:'beacon-settings', disabled: disabledProduct},
            { shown: this.accessAdmin(), to:'/beacon/admin' , icon:<StarOutlined />, displayName:'Admin' , key:'beacon-admin'}
        ]
    }

    /** create Radar links */
    createRadarLinks = () => {
        const { selectedRadar, disabledDevice,paymentRequired, admin } = this.props
        const disabledProduct = (paymentRequired || disabledDevice) && !admin
        return  [
            { shown: !!selectedRadar, to:'/radar/dashboard' , icon:<DashboardOutlined />, displayName:'Dashboard' , key:'radar-dashboard', disabled: disabledProduct},
            { shown: !!selectedRadar, to:'/radar/histories' , icon:<BellOutlined /> , displayName:'Event History', key:'radar-history',disabled: disabledProduct},
            { shown: !!selectedRadar, to:'/radar/settings' , icon:<SettingOutlined />, displayName:'Settings', key:'radar-settings', disabled: disabledProduct},
            { shown: this.accessAdmin(), to:'/radar/admin' , icon:<StarOutlined />, displayName:'Admin' , key:'radar-admin' }
        ]
    }

    /** create Organisation links */
    createOrgLinks = () => {
        const {  selectedOrg , admin } = this.props
        return  [
            { shown: !!selectedOrg, to:'/organisationSettings/details' , icon:<DashboardOutlined />, displayName:'Details' , key:'org-dashboard'},
            { shown: !!selectedOrg, to:'/organisationSettings/contacts' , icon:<ContactsOutlined /> , displayName:'Organisation Contacts', key:'org-contacts'},
            { shown: !!selectedOrg, to:'/organisationSettings/users' , icon:<UserOutlined/> , displayName:'Users', key:'org-users'},
            { shown: !!selectedOrg, to:'/organisationSettings/hubs' , icon:<DesktopOutlined/>, displayName:`${titleCase(globalConstants.HUB_GENERIC)}s`, key:'org-hubs'},
            { shown: !!selectedOrg, to:'/organisationSettings/beacons' , icon:<MobileOutlined/> , displayName:`${titleCase(globalConstants.PENDANT_GENERIC)}s`, key:'org-beacons'},
            { shown: !!selectedOrg, to:'/organisationSettings/radars' , icon:<VideoCameraOutlined /> , displayName:`${titleCase(globalConstants.RADAR_GENERIC)}s`, key:'org-radars'},
            { shown: !!selectedOrg, to:'/organisationSettings/apns' , icon:<BuildOutlined/> , displayName:'APNs', key:'apns'},
            { shown: !!selectedOrg, to:'/organisationSettings/permissions' , icon:<SelectOutlined/> , displayName:'Permissions & Roles', key:'permissions'},
            { shown: !!selectedOrg, to:'/organisationSettings/device-groups' , icon:<ApartmentOutlined/> , displayName:'Device Groups', key:'device-groups'},
            { shown: !!selectedOrg, to:'/organisationSettings/user-groups' , icon:<TeamOutlined /> , displayName:'User Groups', key:'user-groups'},
            { shown: !!selectedOrg, to:'/organisationSettings/third-party-endpoints' , icon:<ApiOutlined/> , displayName:'Third Party Endpoints', key:'third-party-endpoints'},
            { shown: !!admin, to:'/organisationSettings/admin' , icon:<StarOutlined /> , displayName:'Admin' , key:'org-admin'}
        ]
    }

    /** create Global Admin links */
    createGlobalAdminLinks = () => {
        const { admin } = this.props
        const hubChildren = [
            { shown: !!admin , to:'/globalAdmin/hub-dashboard' , displayName:`${titleCase(globalConstants.HUB_GENERIC)} Dashboard`, key:'hub-dashboard' },
            { shown: !!admin , to:'/globalAdmin/hub' , displayName:`All ${titleCase(globalConstants.HUB_GENERIC)}s` , key:'hub-alls'},
            { shown: !!admin , displayName:`${titleCase(globalConstants.HUB_GENERIC)} Releases` , key:'hub-release' , children: [
                { shown: !!admin , to:'/globalAdmin/release-dashboard' , displayName:'Dashboard' , key:'hub-release-dashboard' },
                { shown: !!admin , to:'/globalAdmin/release' , displayName:'All Releases', key:'hub-release-alls' },
            ] }
        ]

        const beaconChildren = [
            { shown: !!admin , to:'/globalAdmin/beacon-dashboard' , displayName:`${titleCase(globalConstants.PENDANT_GENERIC)} Dashboard` , key:'beacon-dashboard' },
            { shown: !!admin , to:'/globalAdmin/beacon' , displayName:`All ${titleCase(globalConstants.PENDANT_GENERIC)}s`, key:'beacon-alls' },
            { shown: !!admin , to:'/globalAdmin/export-beacon' , displayName:`Export ${titleCase(globalConstants.PENDANT_GENERIC)}s`, key:'beacon-export' },
            { shown: !!admin , displayName: 'Bulk Changes' , key:'bulk Change' , children: [
                { shown: !!admin , to:'/globalAdmin/bulk-emergency-edit' , displayName:'Basic EC Replace', key:'bulk-emergency-edit' },
                { shown: !!admin , to:'/globalAdmin/bulk-upload', displayName:`New ${titleCase(globalConstants.PENDANT_GENERIC)} Onboarding` ,key:'bulkUpload' },
                { shown: !!admin , to:'/globalAdmin/bulk-phone-setting' , displayName:'Bulk Advanced Changes', key:'bulk-phone-setting' },
            ] },

            { shown: !!admin , displayName:`${titleCase(globalConstants.PENDANT_GENERIC)} Releases` , key:'beacon-release' , children: [
                { shown: !!admin , to:'/globalAdmin/brelease-dashboard' , displayName:'Dashboard' , key:'beacon-release-dashboard' },
                { shown: !!admin , to:'/globalAdmin/brelease' , displayName:`All ${titleCase(globalConstants.PENDANT_GENERIC)} Releases`, key:'beacon-release-alls' },
            ] },
            { shown: !!admin , displayName:'APNs', key:'apns' , children: [
                { shown: !!admin , to:'/globalAdmin/apn-dashboard' , displayName:'APN Dashboard', key:'apns-dashboard' },
                { shown: !!admin , to:'/globalAdmin/apn' , displayName:'All APNs' ,key:'apns-all'},
            ] }
        ]

        const radarChildren = [
            { shown: !!admin , to:'/globalAdmin/radar-dashboard' , displayName:`${titleCase(globalConstants.RADAR_GENERIC)} Dashboard`, key:'radar-dashboard' },
            { shown: !!admin , to:'/globalAdmin/radar' , displayName:`All ${titleCase(globalConstants.RADAR_GENERIC)}s` , key:'radar-alls'},
            { shown: !!admin , displayName:`${titleCase(globalConstants.RADAR_GENERIC)} Releases` , key:'radar-release' , children: [
                { shown: !!admin , to:'/globalAdmin/rrelease-dashboard' , displayName:'Dashboard' , key:'radar-release-dashboard' },
                { shown: !!admin , to:'/globalAdmin/rrelease' , displayName:`All ${titleCase(globalConstants.RADAR_GENERIC)} Releases`, key:'radar-release-alls' },
            ] },
        ]


        const userChildren = [
            { shown: !!admin , to:'/globalAdmin/user' , displayName:'All Users', key:'user-alls' },
            { shown: !!admin , to:'/globalAdmin/export-user' , displayName:'Export Users', key:'user-export' },
            { shown: !!admin , to:'/globalAdmin/email' , displayName:'Email', key:'email' },
            // { shown: !!admin , to:'/globalAdmin/hub-invite' , displayName:`All ${titleCase(globalConstants.HUB_GENERIC)} Invites` , key:'hub-invite'},
            { shown: !!admin , to:'/globalAdmin/beacon-invite' , displayName:`All ${titleCase(globalConstants.PENDANT_GENERIC)} Invites` , key:'beacon-invite'},
            { shown: !!admin , to:'/globalAdmin/radar-invite' , displayName:`All ${titleCase(globalConstants.RADAR_GENERIC)} Invites`, key:'radar-invite'},
        ]

        const billingChildren = [
            // { shown: !!admin , to:'/globalAdmin/orgs' , displayName:'Organisations', key:'orgs' },
            { shown: !!admin , to:'/globalAdmin/subscriptions' , displayName:'Subscriptions', key:'subs' },
            { shown: !!admin , to:'/globalAdmin/invoices' , displayName:'Current and Past Invoices' , key:'invoices'},
            { shown: !!admin , to:'/globalAdmin/stripe' , displayName:'Stripe' , key:'stripe'},
        ]

        const simChildren = [
            { shown: !!admin , to:'/globalAdmin/SIM-activation' , displayName:'SIM Activations', key:'activation' },
            { shown: !!admin , to:'/globalAdmin/SIM-termination' , displayName:'SIM Terminations' , key:'termination'},
        ]

        return [
            { shown: !!admin , to:'/globalAdmin/home' , icon: <HomeOutlined />, displayName:'Env Admin Home' ,key:'home'},
            // { shown: !!admin, icon:<DesktopOutlined/>, displayName:titleCase(globalConstants.HUB_GENERIC) , children:hubChildren , key:'hubs'},
            { shown: !!admin, icon:<MobileOutlined/>, displayName:titleCase(globalConstants.PENDANT_GENERIC) , children: beaconChildren , key:'beacons'},
            { shown: !!admin, icon: <VideoCameraOutlined />, displayName: titleCase(globalConstants.RADAR_GENERIC) , children: radarChildren , key:'radar'},
            { shown: !!admin, icon:<UserOutlined/>, displayName:'Users' , children: userChildren, key:'users' },
            { shown: !!admin, icon:<DollarOutlined/>, displayName:'Billing' , children: billingChildren, key:'billing' },
            { shown: !!admin , to:'/globalAdmin/organisations' , icon:<BankOutlined/>,
                displayName:'Organisations' ,key:'orgs'},
            { shown: !!admin , to:'/globalAdmin/tp-destination' , icon:<ApiOutlined/>,
                displayName:'Third Party Destinations' ,key:'TPs'},
            { shown: !!admin, customIcon:'icon-Sim-Card', displayName:'SIMs' , children: simChildren, key:'SIMs' },
            { shown: !!admin , to:'/globalAdmin/features' , icon:<AppstoreOutlined />,
                displayName:'Portal Features' ,key:'features'}
        ]
    }

    /** build Menu Tree
     * @param {Array} links
     * @param withSelect
     * @return {Fragment} Menu
     */
    buildMenuTree = (links,withSelect=true) => {
        const {menu, loading} = this.props
        let menus = []
        if (withSelect && (menu==='hub' ||menu === 'beacon' || menu === 'radar')){
            menus.push(<Menu.Item key="selection" disabled={loading}>
                <Link to="/deviceSelection" onClick={this.handleMenuClick}>
                    <AppstoreOutlined />
                    <span className="deviceSelectionTitle">Select another device</span>
                </Link>
            </Menu.Item>)
            menus.push(<Menu.Divider style={{marginTop: 0, marginBottom: 12}} key="divider"/>)
        }
        return menus.concat(links.map((item) => {
            if(item.shown && item.children) {
                const title = (<Fragment>
                    { item.icon }
                    { item.customIcon &&  <MyIcon type={item.customIcon} /> }
                    <span>{item.displayName}</span>
                </Fragment>)

                return ( <SubMenu key={item.key} title={title}>
                    { this.buildMenuTree(item.children, false) }
                </SubMenu>)
            }

            return item.shown && !item.children  && (
                <Menu.Item className="ant-menu-item" key={item.key} disabled={item.disabled}>
                    <Link to={item.to} onClick={this.handleMenuClick}>
                        { item.icon }
                        { item.customIcon &&  <MyIcon type={item.customIcon} /> }
                        <span> {item.displayName}</span>
                    </Link>
                </Menu.Item>
            )
        }))
    }

    /** create flatten menu */
    createFlattenMenu = (menu, result) => {
        menu.forEach(x => {
            if (x.children) {
                return this.createFlattenMenu(x.children,result)
            } else {
                result.push(x)
            }
        })

        return result
    }

    render() {
        const { sideMenuCollapsed,isMobile, pathname, logos } = this.props
        const hubLinks = this.createHubLinks()
        const beaconLinks = this.createBeaconLinks()
        const orgLinks = this.createOrgLinks()
        const globalAdminLinks = this.createGlobalAdminLinks()
        const radarLinks = this.createRadarLinks()

        const menus = {
            'hub': hubLinks,
            'beacon': beaconLinks,
            'radar': radarLinks,
            'globalAdmin': globalAdminLinks,
            'org': orgLinks,
            'noMenu': [],
        }

        const menu = menus[this.props.menu] || hubLinks
        const flattenMenu = this.createFlattenMenu(menu,[])
        const selectedItem = flattenMenu.find((item) => { return pathname.startsWith(item.to) })

        return (
            <Sider id="nav-container" width={300} trigger={null}
                breakpoint="xl"
                collapsed={sideMenuCollapsed}
                collapsible
                onCollapse={ collapse => {
                    if (firstMount || !isMobile) {
                        actions.common.changeLayoutCollapsed(collapse)
                    }
                }}
                className="sideBar sideBar--rose">
                {logos && <div className="sideBar__logo">
                    <Link to="/deviceSelection"><Logo width={ sideMenuCollapsed ? 90 : 125} height={79}/></Link>
                    {/* <div className='version'>{process.env.APP_VERSION}</div> */}
                </div>}
                <Menu
                    className="sideBar__menu"
                    theme="light"
                    mode="inline"
                    inlineIndent={36}
                    selectedKeys={[`${selectedItem && selectedItem.key}`]}>
                    { this.buildMenuTree(menu)}
                </Menu>

            </Sider>)
    }
}

SideBar.defaultProps = {
    logos: true
}

SideBar.propTypes = {
    menu: PropTypes.string,
    isMobile: PropTypes.bool,
    logos: PropTypes.bool
}

export default connect(mapStateToProps,{})(SideBar)

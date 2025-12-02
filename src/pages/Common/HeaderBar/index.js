import { Component, Fragment } from 'react'

import {
    BankOutlined, BellOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ProfileOutlined,
    SettingOutlined,
    UserOutlined
} from '@ant-design/icons'

import { Button, Col, Menu, Row, message } from 'antd'
import { About, UserProfile } from '../../UserProfile'
import { clearStorage } from '@/utility/Storage'
import PropTypes from 'prop-types'
import { actions, connect } from 'mirrorx'
import NotificationIcon from '../Header/NotificationIcon'
import MobileVerification from '../../UserProfile/MobileVerificationModal'
import { isMobile } from 'react-device-detect'
import './index.scss'
import NotificationProfileModal from '@/pages/UserProfile/NotificationProfileModal'

const SubMenu = Menu.SubMenu

const mapStateToProps = state => ({
    user: state.user.me,
    apiVersion: state.setting.apiVersion,
    admin: state.user.me?.authorities.some(role => role.includes('ADMIN')),
    adminPortal: state.common.adminPortal,
    lastDevicePage: state.common.lastDevicePage,
    sideMenuCollapsed: state.common.sideMenuCollapsed
})

class HeaderBar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            userProfileModal: false,
            aboutModal: false,
            mobileModal: false,
            notificationModal: false,
        }
    }

    componentDidMount() {
        !this.props.user && actions.user.me()
    }

    componentDidUpdate(prevProps) {
        prevProps.mobileModal !== this.props.mobileModal && this.setState({
            mobileModal: this.props.mobileModal
        })
    }

    handleButton = () => {
        const { lastDevicePage, adminPortal } = this.props
        const admin = window.location.href.includes('global')
        const deviceSelection = !admin && (window.location.href.includes('deviceSelection') || window.location.href.includes('organisationSettings'))
        const beacon = !admin && window.location.href.includes('beacon')
        const radar = !admin && window.location.href.includes('radar')
        if (admin || adminPortal) {
            actions.routing.push(lastDevicePage === 'deviceSelection' ? '/deviceSelection' : lastDevicePage === 'beacon' ? '/beacon/dashboard' : lastDevicePage === 'radar' ? '/radar/dashboard' : '/dashboard')
            actions.common.save({ adminPortal: !adminPortal, lastDevicePage: null })
        } else if (deviceSelection) {
            actions.routing.push('/globalAdmin/home')
            actions.common.save({ adminPortal: !adminPortal, lastDevicePage: 'deviceSelection' })
        } else if (beacon) {
            actions.routing.push('/globalAdmin/home')
            actions.common.save({ adminPortal: !adminPortal, lastDevicePage: 'beacon' })
        } else if (radar) {
            actions.routing.push('/globalAdmin/home')
            actions.common.save({ adminPortal: !adminPortal, lastDevicePage: 'radar' })
        } else {
            actions.routing.push('/globalAdmin/home')
            actions.common.save({ adminPortal: !adminPortal, lastDevicePage: 'hub' })
        }
    }

    /** toggle side menu*/
    toggleCollapsed = () => {
        actions.common.toggleSideMenu()
    }

    handleProfileModal = (state) => {
        this.setState({ userProfileModal: state })
    }

    handleAboutModal = (state) => {
        this.setState({ aboutModal: state })
    }

    handleNotificationModal = (state) => {
        this.setState({ notificationModal: state })
    }


    handleOrgPage = () => {
        const deviceSelection = window.location.href.includes('deviceSelection') || window.location.href.includes('organisationSettings')
        const beacon = window.location.href.includes('beacon')
        const radar = window.location.href.includes('radar')

        if (deviceSelection) {
            actions.common.save({ lastDevicePage: 'deviceSelection' })
        } else if (beacon) {
            actions.common.save({ lastDevicePage: 'beacon' })
        } else if (radar) {
            actions.common.save({ lastDevicePage: 'radar' })
        } else {
            actions.common.save({ lastDevicePage: 'hub' })
        }
        actions.routing.push('/organisationSettings/details')
    }

    logout = () => {
        actions.user.logoutUser().then(()=> {
            message.success('Log out')
        })
        clearStorage()
        actions.routing.push('/login')
    }

    render() {
        const { user, admin, breadCrumb, apiVersion, showToggle, sideMenuCollapsed, adminPortal } = this.props

        const userSubMenu = <SubMenu key="header_user" title={!isMobile && user?.first_name} icon={<UserOutlined />}>
            <Menu.Item key="header_userProfile" className="d-flex align-items-center" onClick={() => { this.handleProfileModal(true) }} >
                <ProfileOutlined />
                <span className="editUser">User Profile & Settings</span>
            </Menu.Item>
            <Menu.Item key="header_notification" className="d-flex align-items-center" onClick={() => { this.handleNotificationModal(true) }}>
                <BellOutlined />
                <span className="editUser">Notification Preferences</span>
            </Menu.Item>
            <Menu.Item key="header_orgSetting" className="d-flex align-items-center" onClick={this.handleOrgPage}>
                <BankOutlined />
                <span className="editUser">Organisation</span>
            </Menu.Item>
            {/* <Menu.Item key="header_about" className="d-flex align-items-center" onClick={()=>{ this.handleAboutModal(true) }}>
                <UserOutlined />
                <span className="editUser">About</span>
            </Menu.Item> */}
            <Menu.Divider />
            <Menu.Item key="header_logout" className="d-flex align-items-center" onClick={this.logout}>
                <LogoutOutlined />
                <span className="editUser">Logout</span>
            </Menu.Item>
        </SubMenu>

        return (
            <Row type="flex" className="headerBar" justify="space-between" align="middle" style={{ height: '80px' }}>
                <Col span={isMobile ? 4 : 12} className="d-flex align-items-center" style={{ marginLeft: '12px' }}>
                    {
                        showToggle && (sideMenuCollapsed ?
                            <MenuUnfoldOutlined style={{ marginRight: '12px' }} onClick={this.toggleCollapsed} /> :
                            <MenuFoldOutlined style={{ marginRight: '12px' }} onClick={this.toggleCollapsed} />)
                    }
                    {!isMobile && breadCrumb}
                    {!isMobile && adminPortal && <Row align="middle"><span className="title marginLR">Environment Admin Menu
                    </span><Button type="primary" onClick={this.handleButton} className="marginLR">Close Menu</Button></Row>}
                </Col>
                <Col span={isMobile ? 18 : 10} >
                    <div className="right">
                        <Menu
                            mode="horizontal"
                            title="Menu"
                            className="headerBar__controls"
                            selectedKeys={adminPortal ? ['header_admin'] : []}
                        >
                            {user ? <Menu.Item key="notification"><NotificationIcon /></Menu.Item>
                                : <Menu.Item key="notification" />}
                            {admin &&
                                <Menu.Item key="header_admin" onClick={this.handleButton} id="globalAdmin">
                                    <SettingOutlined />
                                </Menu.Item>
                            }
                            {user ? userSubMenu : <SubMenu key="header_user" />}
                        </Menu>
                    </div>
                    {user && (<Fragment>
                        <UserProfile
                            userDetails={user}
                            open={this.state.userProfileModal}
                            onClose={() => { this.handleProfileModal(false) }}
                        />
                        <NotificationProfileModal
                            userDetails={user}
                            open={this.state.notificationModal}
                            onClose={() => { this.handleNotificationModal(false) }}
                        />
                        <About
                            open={this.state.aboutModal}
                            onClose={() => { this.handleAboutModal(false) }}
                            apiVersion={apiVersion}
                        />
                        <MobileVerification
                            onClose={() => this.props.onCloseModal(false)}
                            open={this.state.mobileModal}
                            onChangeMobile={() => {
                                this.props.onCloseModal(false)
                                this.handleProfileModal(true)
                            }}
                            userId={user.user_id}
                        />
                    </Fragment>)}
                </Col>
            </Row>
        )
    }
}

HeaderBar.defaultProp = {
    showToggle: true
}

HeaderBar.propTypes = {
    showToggle: PropTypes.bool,
    breadCrumb: PropTypes.node,
    mobileModal: PropTypes.bool,
    onCloseModal: PropTypes.func,
}

export default connect(mapStateToProps, null)(HeaderBar)

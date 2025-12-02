import { Component, Fragment } from 'react'
import Logo from '../../../../images/logo.svg'
import { actions, Link } from 'mirrorx'
import PropTypes from 'prop-types'
import { AppstoreOutlined, ZoomOutOutlined } from '@ant-design/icons'
import { Divider, Layout, List, Menu } from 'antd'
import BeaconIcon from '../../../../images/beacon_icon.svg'
import SitaIcon from '@/images/sita_icon.svg'
import { checkBeaconStatus, isOnline, isSita } from '@/utility/Common'
import { globalConstants } from '@/_constants'

const { Sider } = Layout

let firstMount = true

class SideBar extends Component {

    componentDidMount() {
        firstMount = false
    }

    handleMenuClick = () => {
        this.props.isMobile && actions.common.toggleSideMenu()
    }

    render() {
        const { collapsed,isMobile, logos, beacons, selectBeacon, hoverBeacon, moreCard } = this.props
        return (
            <Sider id="nav-container" width={300} trigger={null}
                breakpoint="xl"
                collapsed={collapsed}
                collapsible
                onCollapse={ collapse => {
                    if (firstMount || !isMobile) {
                        actions.common.changeLayoutCollapsed(collapse)
                    }
                }}
                className="sideBar sideBar--rose">
                {logos && <div className="sideBar__logo">
                    <Link to="/deviceSelection"><Logo width={ collapsed ? 90 : 125} height={79}/></Link>
                    <div className='version'>{process.env.APP_VERSION}</div>
                </div>}
                <Menu className="sideBar__menu" theme="light" mode="inline" >
                    <Menu.Item key="selection">
                        <Link to="/deviceSelection" onClick={this.handleMenuClick}>
                            <AppstoreOutlined />
                            <span className="deviceSelectionTitle">Select other {globalConstants.PENDANT_GENERIC}s</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="zoomOut">
                        <a onClick={()=>selectBeacon(null)}>
                            <ZoomOutOutlined />
                            <span className="deviceSelectionTitle">Zoom out</span>
                        </a>
                    </Menu.Item>
                </Menu>
                <Divider style={{marginTop: 0, marginBottom: 12}} />
                {moreCard && <Fragment>
                    <div className="moreCard">
                        <p className="title"><a onClick={()=>actions.routing.push('/deviceSelection')}>Other devices are reporting distress</a></p>
                        <p className="desc">Go back to device selection screen to see</p>
                    </div>
                    <Divider style={{marginTop: 0, marginBottom: 12}}/>
                </Fragment>}
                <List
                    className="beaconsMapList DeviceCard"
                    itemLayout="horizontal"
                    size="small"
                    dataSource={beacons||[]}
                    renderItem={item => (
                        <List.Item className={checkBeaconStatus(item)}>
                            <List.Item.Meta
                                avatar={isSita(item)?<SitaIcon />:<BeaconIcon />}
                                title={<a
                                    onMouseOver={()=>hoverBeacon(item)}
                                    onMouseLeave={()=>hoverBeacon(null)}
                                    onClick={()=>selectBeacon(item)}
                                    aria-disabled={!item.decimal_degrees_latitude}>{item.display_name}</a>}
                                description={<div><span
                                    style={{borderWidth: isOnline(item) ? 1 : 0}}
                                    className={`deviceStatus deviceStatus-${isOnline(item)?'online':'offline'}`}>
                                    {isOnline(item) ? 'Online':'Offline'}
                                </span>{!item.decimal_degrees_latitude && <div className="deviceStatus deviceStatus-offline">
                                    Unknown Location
                                </div>}
                                </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Sider>
        )
    }
}

SideBar.defaultProps = {
    logos: true
}

SideBar.propTypes = {
    beacons: PropTypes.array,
    collapsed: PropTypes.bool,
    logos: PropTypes.bool,
    moreCard: PropTypes.bool,
    hoverBeacon: PropTypes.func,
    selectBeacon: PropTypes.func,
}

export default SideBar

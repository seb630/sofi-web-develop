import { Button, Card, Col, Divider, Dropdown, Row, Switch, Tooltip } from 'antd'
import DeviceStatus from '@/components/DeviceStatus'
import BeaconIcon from '@/images/beacon_icon.svg'
import LifeIcon from '@/images/beacon_teq_life.png'
import SitaIcon from '@/images/sita_icon.svg'
import WatchIcon from '@/images/beacon_watch_icon.png'
import HaloIcon from '@/images/beacon_teq_halo.png'
import styled from '@/scss/colours.scss'
import { formatPhoneNumberIntl } from 'react-phone-number-input'
import { generateBatteryStatus, generateBeacon4gIcon, isSita, timeFromNow, isLife, isWatch, isHalo } from '@/utility/Common'
import { globalConstants } from '@/_constants'
import { BrowserView, isMobile } from 'react-device-detect'
import { Fragment } from 'react'
import { EllipsisOutlined, PhoneOutlined } from '@ant-design/icons'
import moment from 'moment'
import LoneWorker from '@/pages/SofiBeacon/Dashboard/LoneWorker'

const BeaconStatus = (props) => {

    const { beacon, showRadius, handleShowRadius, handleFindAddress, loneWorkerEnabled } = props
    const inEmergency = beacon.currently_in_sos_mode && beacon?.currently_in_sos_mode_last_updated &&
    moment().isBefore(moment(beacon?.currently_in_sos_mode_last_updated).add(globalConstants.BEACON_BANNER_TIMEOUT, 'minute')) ||
        beacon.currently_fallen_down && beacon?.currently_fallen_down_last_updated &&
        moment().isBefore(moment(beacon?.currently_fallen_down_last_updated).add(globalConstants.BEACON_BANNER_TIMEOUT, 'minute'))

    const renderBrowserStatus = () =>{
        const signal = <Col span={isMobile?12:8}>
            <Card
                bodyStyle={{
                    background: !beacon.beacon_status || beacon.beacon_status==='OFFLINE'? styled.grey:'white'
                }}
                className="beaconPage-statusCard"
            >
                <Tooltip title={beacon.signal_strength}>
                    <div className="signalIcon">{generateBeacon4gIcon(beacon.signal_strength) }</div>
                </Tooltip>
                <div className="alignBottom text-center">
                    <b>Mobile Signal Strength</b>
                    <div className="lastSeen">Last reported: {
                        timeFromNow(beacon.signal_last_updated,globalConstants.DATETIME_TZ_FORMAT, beacon.timezone) }
                    </div>
                </div>
            </Card>
        </Col>

        const battery = <Col span={isMobile?12:8}>
            <Card bodyStyle={{
                background: beacon.battery_level<=10? styled.red: beacon.battery_level<=20 ? styled.orange: !beacon.beacon_status || beacon.beacon_status==='OFFLINE'? styled.grey:'white',
                color: beacon.battery_level<=20 ? 'white' : ''
            }} className="beaconPage-statusCard">
                <div className="batteryIcon">{
                    generateBatteryStatus(beacon.battery_level, beacon.charging)
                }</div>
                <div className="alignBottom text-center">
                    <b>Battery {`${beacon.battery_level}%`}</b>
                    <div className="lastSeen" style={{color: beacon.battery_level<=20 ? 'white' : ''}}>{
                        timeFromNow(beacon.battery_updated_at,globalConstants.DATETIME_TZ_FORMAT, beacon.timezone) }</div>
                    <b>{beacon.charging ? 'Charging' : 'Not Charging'}</b>
                    <div className="lastSeen"  style={{color: beacon.battery_level<=20 ? 'white' : ''}}>{
                        timeFromNow(beacon.charging_last_updated,globalConstants.DATETIME_TZ_FORMAT, beacon.timezone) }
                    </div>
                </div>
            </Card>
        </Col>

        const loneWorker = loneWorkerEnabled ? <Col span={isMobile?24:8}><LoneWorker /></Col> : <Col/>

        const handleMenuClick = (e) => {
            if (e.key==='hide'||e.key==='show'){
                handleShowRadius(e.key==='hide')
            } else if (e.key==='findAddress'){
                handleFindAddress(beacon)
            }
        }

        const menu = {
            onClick: handleMenuClick,
            items:[
                {
                    label: 'Show Accuracy radius on map',
                    key: 'accuracy',
                    children: [
                        {
                            label: 'Always show',
                            key: 'show'
                        },{
                            label: 'Hide',
                            key: 'hide'
                        }
                    ]
                },
                {
                    label: 'Find Address',
                    key: 'findAddress',
                },
            ]
        }

        return (<Row gutter={[12,12]} className="beaconPage-headstate">
            <Col span={isMobile ? 24: 13}>
                <Card bodyStyle={{padding:'0', minHeight: 180,}} className="beaconPage-statusCard">
                    <Row wrap={false} style={{height: 'inherit'}}>
                        <Col
                            flex={isMobile ? '75px':'100px'}
                            style={{ background: !beacon.beacon_status || beacon.beacon_status==='OFFLINE'? styled.grey : inEmergency ? styled.red : beacon.battery_level<=20? styled.orange : styled.green }}
                            className="avatarContainer"
                        >
                            {isSita(beacon)?<SitaIcon/>: 
                                isLife(beacon)? <img src={LifeIcon} style={{width: '65px'}} /> : 
                                    isWatch(beacon) ? <img src={WatchIcon} style={{width:'65px'}}/> : 
                                        isHalo(beacon) ? <img src={HaloIcon} style={{width:'65px'}}/> : <BeaconIcon />}
                        </Col>
                        <Col flex="auto" className="statusRightContainer">
                            <Row align="middle" gutter={8} wrap={false}><Col flex="65px"><DeviceStatus status={beacon?.beacon_status}/></Col>
                                <Col flex="auto"><h3 className="fontHeading hubNameStatus" >{beacon.display_name}</h3></Col>
                            </Row>
                            <Row style={{marginBottom: isMobile? 4:12}} wrap={false}>
                                <Col className="lastSeen" flex="auto">
                                    Phone Number: {beacon?.phone && formatPhoneNumberIntl(beacon.phone)}
                                </Col>
                                {isMobile && <Col flex="40px">
                                    <a href={`tel:${beacon.phone}`}>
                                        <Button icon={<PhoneOutlined/>} type="primary" size="small" shape="circle"/>
                                    </a>
                                </Col>}
                            </Row>
                            <Row className="lastSeen">Last seen by cloud <span
                                style={{color: !beacon.beacon_status || beacon.beacon_status==='OFFLINE'? styled.red : beacon.beacon_status==='WARNING'? styled.orange: styled.lightText}}>{timeFromNow(beacon.last_message_server_received_at,globalConstants.DATETIME_TZ_FORMAT, beacon.timezone) }</span>
                            </Row>
                            <Row  wrap={false} >
                                <Col className="lastSeen" flex="auto">
                                Location last updated {beacon.gps_updated_at ? timeFromNow(beacon.gps_updated_at,globalConstants.DATETIME_TZ_FORMAT, beacon.timezone) : ': Never received location data before' }
                                    {beacon?.hdop>0 && !isMobile && <div>and is accurate to within {beacon.hdop * globalConstants.HDOP_TO_METER_RATIO} metres</div>}
                                </Col>
                                {isMobile && <Col flex="40px">
                                    <Dropdown menu={menu} trigger={['hover','click']}>
                                        <Button icon={<EllipsisOutlined />}/>
                                    </Dropdown>
                                </Col>}
                            </Row>
                            <BrowserView>
                                <Row align="middle" gutter={8}>
                                    <Col className="beaconPage-infor-label">
                                    Actions: Show accuracy radius on map
                                    </Col>
                                    <Col className="beaconPage-infor-display">
                                        <Switch
                                            checked={showRadius}
                                            onChange={checked => handleShowRadius(checked)}
                                            checkedChildren="On"
                                            unCheckedChildren="Off"
                                        />
                                    </Col>
                                    <Divider type="vertical"/>
                                    <Col>
                                        <Button
                                            onClick={()=>handleFindAddress(beacon)}
                                            type="primary"
                                            style={{marginTop:'4px'}}>Find Address</Button>
                                    </Col>
                                </Row>
                            </BrowserView>
                        </Col>
                    </Row>
                </Card>
            </Col>
            <Col span={isMobile ? 24: 11}><Row gutter={isMobile? [8,8]:[12,12]} style={{height: '100%'}}>{signal}{battery}{loneWorker}</Row></Col>
        </Row>)
    }


    return (
        <Fragment>
            {renderBrowserStatus()}
        </Fragment>

    )
}

export default BeaconStatus

import { Component, Fragment } from 'react'
import { Card, Col, Row, Tooltip } from 'antd'
import './index.scss'
import PropTypes from 'prop-types'
import HubIcon from '../../images/hub_icon.svg'
import BeaconIcon from '../../images/beacon_icon.png'
import LifeIcon from '../../images/beacon_teq_life.png'
import RadarIcon from '../../images/radar_sensor_icon.png'
import WatchIcon from '../../images/beacon_watch_icon.png'
import SitaIcon from '../../images/sita_icon.svg'
import { actions } from 'mirrorx'
import { isBeacon, isHub, isOnline, isRadar, isSita, isLife, isWatch } from '@/utility/Common'

export default class DeviceCard extends Component {

    handleHubSelectClick(event, device) {
        if (isHub(device)) {
            actions.hub.selectHub(device).then(() => { actions.routing.push('/dashboard') })
        } else if (isBeacon(device)) {
            actions.sofiBeacon.selectBeacon(device).then(() => {
                actions.routing.push('/beacon/dashboard')
            })
        } else {
            actions.radar.selectRadar(device).then(() => {
                actions.routing.push('/radar/dashboard')
            })
        }
    }

    render() {
        const { device, iconClassName, textClassName, idView, degraded } = this.props
        return (
            <Card
                style={{ height: 120 }}
                className={`DeviceCard DeviceCard-${iconClassName}`}
                onClick={(event) => this.handleHubSelectClick(event, device)}>
                <Row justify="start" type="flex" gutter={8} className={`${iconClassName}`} align="bottom">
                    <Col className="deviceIconCol">
                        {isHub(device) ?
                            <HubIcon className='hub' />
                            : isBeacon(device) ?
                                isSita(device) ? <SitaIcon className={`beacon ${iconClassName}}`} /> :
                                    isLife(device) ? <img src={LifeIcon} className={`life ${iconClassName}}`} alt='life' width='36' style={{ marginBottom: '8px' }} /> : 
                                        isWatch(device) ? <img src={WatchIcon} className={`life ${iconClassName}`} alt='watch' width='36' style={{marginBottom: '8px'}}/> : <img src={BeaconIcon} className={`beacon ${iconClassName}`} alt='beacon' width='36' style={{marginBottom: '8px'}} /> :
                                <img src={RadarIcon} className='radar' alt="radar" width='40' height='40' />
                        }
                    </Col>
                    <Col className={`deviceNameCol DeviceCard-${textClassName}`}>
                        <div className="deviceTitle">
                            {device.title}
                        </div>
                        <div className="deviceDesc">
                            {device.desc}
                        </div>
                        <Tooltip placement="right" title={device.display_name} className="hubName">
                            {textClassName !== 'distress' && <div>
                                {degraded && <span className='deviceStatus deviceStatus-offline' style={{ borderWidth: 0 }}>
                                    Degraded performance
                                </span>}
                                <span className={`deviceStatus deviceStatus-${isOnline(device) ? 'online' : 'offline'}`} style={{ borderWidth: textClassName === 'good' ? 1 : 0 }}>
                                    {isOnline(device) ? 'Online' : 'Offline'}
                                </span>
                                {isRadar(device) && device?.location && <span className={`deviceStatus locationStatus-${device?.status ? device.status.toLowerCase() : 'offline'}`} style={{ borderWidth: 1 }}>{device?.location}</span>}

                            </div>}
                            <div className="deviceDisplayName">{idView ? device.mac_address || device.imei || device.id : device.display_name}</div>
                            {idView && device.phone && <Fragment><br /><div className="deviceDisplayName">{device.phone}</div></Fragment>}
                        </Tooltip>
                    </Col>
                </Row>
            </Card>

        )
    }
}

DeviceCard.propTypes = {
    device: PropTypes.object,
    iconClassName: PropTypes.string,
    textClassName: PropTypes.string,
    idView: PropTypes.bool,
}

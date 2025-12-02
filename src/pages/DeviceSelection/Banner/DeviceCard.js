import { Button, Card, Col, Row } from 'antd'
import { isBeacon, isHub, isSita } from '@/utility/Common'
import HubIcon from '@/images/hub_icon.svg'
import SitaIcon from '@/images/sita_icon.svg'
import BeaconIcon from '@/images/beacon_icon.svg'
import RadarIcon from '@/images/radar_sensor_icon.png'
import moment from 'moment'
import { actions } from 'mirrorx'
import propTypes from 'prop-types'

const SubscriptionDeviceCard = (props) => {
    const {subsRecord, dashboardOverview} = props
    const expiringMonthYear = subsRecord && moment(subsRecord.payment_card_expiry, 'M/YYYY')
    const expired = moment().isAfter(expiringMonthYear,'month')
    const isWarning = subsRecord?.subscription_status === 'ACTIVE' && !expired
    const iconClassName =  isWarning ? 'warning': 'distress'

    const findDevice = () => {
        if (subsRecord.product_type==='RADAR'){
            return dashboardOverview?.radars.find(radar=>radar.pub_id===subsRecord.pub_id)
        }else  if (subsRecord.product_type==='BEACON'){
            return dashboardOverview?.beacons.find(beacon=>beacon.pub_id===subsRecord.pub_id)
        }else return dashboardOverview?.hubs.find(hub=>hub.hub_id===subsRecord.pub_id)
    }

    const device = findDevice()

    const handleUpdateInfo = (dashboard) => {
        let destination


        if (subsRecord.product_type === 'RADAR') {
            destination = dashboard ? '/radar/dashboard':'/radar/settings/subscription'
        }else if (subsRecord.product_type === 'BEACON') {
            destination = dashboard ? '/beacon/dashboard':'/beacon/settings/subscription'
        }else {
            destination = dashboard ? '/dashboard':'/settings/subscription'
        }

        if (isHub(device)) {
            actions.hub.selectHub(device).then(()=>{actions.routing.push(destination)})
        }else if(isBeacon(device)) {
            actions.sofiBeacon.selectBeacon(device).then(()=>{
                actions.routing.push(destination)
            })
        }else {
            actions.radar.selectRadar(device).then(()=>{
                actions.routing.push(destination)
            })
        }
    }

    return (
        <Card
            className={`DeviceCard DeviceCard-${iconClassName}`}
        >
            <Row
                justify="start"
                type="flex"
                gutter={8}
                className={`deviceCardRow ${iconClassName}`}
                align="bottom"
                wrap={false}
            >
                <Col className="deviceIconCol" flex='50px'>
                    {isHub(device) ?
                        <HubIcon className='hub' style={{height: 70, width:30}}/>
                        : isBeacon(device) ? isSita(device)? <SitaIcon className={`beacon ${iconClassName}}`}/>: <BeaconIcon className={`beacon ${iconClassName}}`}/> :
                            <img src={RadarIcon} className='radar' alt="radar" width='40' height='40' />
                    }
                </Col>
                <Col className={`DeviceCard-${iconClassName}`} flex='auto'>
                    <div className="deviceTitle">
                        {device?.display_name}
                    </div>
                    <div className="deviceDesc">
                        {subsRecord?.desc}
                    </div>
                </Col>
                <Col flex='105px'>
                    <Button type='ghost' onClick={()=>handleUpdateInfo(!isWarning)}>Resolve</Button>
                </Col>
            </Row>
        </Card>
    )
}
SubscriptionDeviceCard.propTypes={
    subsRecord: propTypes.object.isRequired,
    dashboardOverview:propTypes.object
}

export default SubscriptionDeviceCard

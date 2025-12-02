import { Card, Spin, Typography } from 'antd'
import { Fragment, useEffect, useState } from 'react'
import BeaconMap from '@/pages/SofiBeacon/Dashboard/BeaconMap'
import AlarmComponent from '@/pages/SofiBeacon/Alert/Alarm'
import { actions, connect } from 'mirrorx'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import useSWR from 'swr'
import BeaconService from '@/services/Beacon'
import { formatTime } from '@/utility/Common'

const mapStateToProps = state => ({
    ...state.sofiBeacon
})

const GeofenceAlertDetailsPage = (props) => {

    const {selectedBeacon, loading, match} = props
    const [closestGPS, setClosestGPS] = useState()
    const {alarmId} = match.params
    const fetcher = (id) => BeaconService.getBeaconGeofenceHistory(id)
    const { data: alarm } = useSWR(alarmId, fetcher)
    useEffect(()=>{
        fetchGPS()
        // eslint-disable-next-line
    },[alarm])


    const fetchGPS = async () => {
        let beaconId
        if (selectedBeacon?.pub_id){
            beaconId = selectedBeacon?.pub_id
        } else if (alarm?.beacon_id) {
            await actions.sofiBeacon.selectBeaconById(alarm?.beacon_id).then(result=>{
                actions.sofiBeacon.save({anomalyDate: moment(alarm?.collect_timestamp)})
                beaconId = result.pub_id
            })
        }
        if (beaconId){
            const result = await actions.sofiBeacon.fetchBeaconAlarmGpsHistory({alarmTime: alarm?.collect_timestamp, beaconId})
            if (result?.length>0){
                let min = result.reduce((acc, i)=>(
                    calculateTimeDiff(alarm?.collect_timestamp, acc.server_received_at) >calculateTimeDiff(alarm?.collect_timestamp, i.server_received_at) ? i : acc))
                min.lat = min.decimal_degrees_latitude
                min.lng = min.decimal_degrees_longitude
                setClosestGPS(min)
            }
        }
    }

    const calculateTimeDiff = (a,b) => {
        return Math.abs(moment(a).diff(moment(b)))
    }

    const generateGpsTimeText = (gpsRecord, alarm) => {
        const gpsTime = moment(gpsRecord.server_received_at)
        const alarmTime = moment(alarm.collect_timestamp)
        if (gpsTime.isAfter(alarmTime)){
            return `Location data is ${gpsTime.from(alarmTime,true)} after the alert was raised.`
        }else {
            if (alarmTime.diff(gpsTime,'minute')>1) {
                return `Location data is ${gpsTime.to(alarmTime,true)} before the alert was raised. Location 
                data may not be accurate.`
            }else {
                return `Location data is ${gpsTime.to(alarmTime,true)} before the alert was raised.`
            }
        }

    }


    return (
        <Spin spinning={ loading }>
            <div className="beaconPage contentPage overflowHidden">
                {closestGPS && <BeaconMap
                    spot={closestGPS}
                    geofences={[JSON.parse(alarm?.geofence_config)]}
                    geofenceName={alarm?.geofence_name}
                />}
                <div className="beaconPage-alertdetail">
                    {alarm && <AlarmComponent
                        alert={alarm}
                        selectedBeacon={selectedBeacon}
                        showDetail={false}
                        extraStep
                        backButton
                    />}
                    <Card size="small" className="accurateCard">
                        {closestGPS? <Fragment>
                            <Typography.Paragraph strong>
                                    Location accurate as of {formatTime(closestGPS.server_received_at)}
                            </Typography.Paragraph>
                            <Typography.Text>
                                {generateGpsTimeText(closestGPS, alarm)}
                            </Typography.Text>
                        </Fragment>: <Typography.Text strong>No location data provided by {globalConstants.PENDANT_GENERIC} at time of alert</Typography.Text>}
                    </Card>
                </div>

            </div>
        </Spin>
    )

}

export default connect(mapStateToProps,{})(GeofenceAlertDetailsPage)

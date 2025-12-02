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
import {classifyAlarm} from '@/pages/SofiBeacon/Alert/AlarmTimeline'

const mapStateToProps = state => ({
    ...state.sofiBeacon
})

const AlertDetailsPage = (props) => {

    const {selectedBeacon, loading, match} = props
    const [closestGPS, setClosestGPS] = useState()
    const {alarmId} = match.params
    const fetcher = (id) => BeaconService.getBeaconAlarmDetail(id)
    const [alarm, setAlarm] = useState()
    let { data: originAlarm } = useSWR(alarmId, fetcher)
    useEffect(()=>{
        fetchGPS()
        // eslint-disable-next-line
    },[originAlarm])


    const fetchGPS = async () => {
        let beaconId
        if (selectedBeacon?.pub_id){
            beaconId = selectedBeacon?.pub_id
        } else if (originAlarm?.beacon_id) {
            await actions.sofiBeacon.selectBeaconById(originAlarm?.beacon_id).then(result=>{
                actions.sofiBeacon.save({anomalyDate: moment(originAlarm?.pendant_sent_at)})
                beaconId = result.pub_id
            })
        }
        if (beaconId){
            const result = await actions.sofiBeacon.fetchBeaconAlarmGpsHistory({alarmTime: originAlarm?.pendant_sent_at, beaconId})
            if (result?.length>0){
                let min = result.reduce((acc, i)=>(
                    calculateTimeDiff(originAlarm?.pendant_sent_at, acc.server_received_at) >calculateTimeDiff(originAlarm?.pendant_sent_at, i.server_received_at) ? i : acc))
                min.lat = min.decimal_degrees_latitude
                min.lng = min.decimal_degrees_longitude
                setClosestGPS(min)
            }
            if (!originAlarm?.status){
                const anomalyDate = moment(originAlarm?.pendant_sent_at)
                originAlarm && actions.sofiBeacon.fetchBeaconAlertHistory({beaconId: originAlarm.beacon_id,
                    startDate: anomalyDate.clone().startOf(globalConstants.BEACON_HISTORY_TIME_UNIT).add(globalConstants.BEACON_BANNER_TIMEOUT * -1, 'minute'),
                    endDate: anomalyDate.clone().endOf(globalConstants.BEACON_HISTORY_TIME_UNIT).add(globalConstants.BEACON_BANNER_TIMEOUT, 'minute'),
                }).then((allHistoryies)=>{
                    setAlarm(classifyAlarm(originAlarm, allHistoryies))
                })
            }else {
                setAlarm(originAlarm)
            }
        }
    }

    const calculateTimeDiff = (a,b) => {
        return Math.abs(moment(a).diff(moment(b)))
    }

    const generateGpsTimeText = (gpsRecord, alarm) => {
        const gpsTime = moment(gpsRecord.server_received_at)
        const alarmTime = moment(alarm?.pendant_sent_at)
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
                {closestGPS &&<BeaconMap
                    spot={closestGPS}
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

export default connect(mapStateToProps,{})(AlertDetailsPage)

import { Button, Card, Timeline } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import moment from 'moment'
import AlarmComponent from '@/pages/SofiBeacon/Alert/Alarm'
import { actions } from 'mirrorx'
import { globalConstants } from '@/_constants'

export const classifyAlarm = (alarm, allAlarms) => {
    const fall = alarm.fall_down
    const sos = alarm.sos_key
    const alarmsWithin30mins = allAlarms.filter(item=>item.id!==alarm.id && moment(item.pendant_sent_at).isBetween(moment(alarm.pendant_sent_at), moment(alarm.pendant_sent_at).clone().add(globalConstants.BEACON_BANNER_TIMEOUT, 'minute')))
    let status = 'INFO'
    let timeout = false
    let resolved_at
    if (fall || sos) {
        if (alarmsWithin30mins?.length>0){
            for (const item of alarmsWithin30mins){
                if (item.sos_ending){
                    status = 'RESOLVED'
                    resolved_at = item.pendant_sent_at
                    break
                }else if (item.fall_down || item.sos_key){
                    status = 'RESOLVED'
                    timeout = true
                    resolved_at = item.pendant_sent_at
                }else {
                    if (moment(alarm.pendant_sent_at).isBefore(moment().subtract(globalConstants.BEACON_BANNER_TIMEOUT),'minute')){
                        status = 'RESOLVED'
                        timeout = true
                    }else {
                        status = 'ACTION REQUIRED'
                    }
                }
            }
        }else {
            if (moment(alarm.pendant_sent_at).isBefore(moment().subtract(globalConstants.BEACON_BANNER_TIMEOUT,'minute'))){
                status = 'RESOLVED'
                timeout = true
            }else {
                status = 'ACTION REQUIRED'
            }
        }
    }
    return {...alarm, status, timeout, resolved_at}
}


const AlarmTimeline = (props) => {
    const {anomalyDate, filteredAlarms, selectedBeacon, historicalAlarms, loading} = props
    const timezone = selectedBeacon?.timezone
    timezone ? moment.tz.setDefault(timezone) : moment.tz.setDefault(moment.tz.guess())
    const handleRefresh = () => {
        actions.sofiBeacon.fetchBeaconAlertHistory({beaconId: selectedBeacon.id,
            startDate: anomalyDate.clone().startOf(globalConstants.BEACON_HISTORY_TIME_UNIT).add(globalConstants.BEACON_BANNER_TIMEOUT * -1, 'minute'),
            endDate: anomalyDate.clone().endOf(globalConstants.BEACON_HISTORY_TIME_UNIT).add(globalConstants.BEACON_BANNER_TIMEOUT, 'minute'),
        })
    }

    const classifyAlarms = (filteredAlarms, allAlarms) => {
        return filteredAlarms?.map(alarm=>classifyAlarm(alarm, allAlarms))?.sort((a,b)=>moment(a.pendant_sent_at).isAfter(b.pendant_sent_at) ? -1 :1)
    }

    return (
        <Card
            loading={loading}
            size="small"
            bordered={false}
            style={{marginTop: 16, width:'100%', background:'unset'}}
            className="beacon-card"
            title={anomalyDate.isSame(moment(),'day')? 'Today' : anomalyDate.format('DD/MM/YYYY')}
            extra={<Button
                type="primary"
                icon={<ReloadOutlined/>}
                onClick={handleRefresh}
            >Refresh Data</Button>}
        >
            <Timeline className="beacon-timeline">
                <Timeline.Item>
                    <span className="header">
                        {anomalyDate.isSame(moment(),'day')? moment().format('HH:mm a') : 'Midnight'}
                    </span>
                </Timeline.Item>
                {classifyAlarms(filteredAlarms, historicalAlarms).map(alarm=>
                    <Timeline.Item
                        color={alarm.status==='INFO' ? 'blue' : alarm.status==='RESOLVED' ? 'green' : 'red'}
                        key={alarm.id}
                        dot={<div />}>
                        <AlarmComponent alert={alarm} selectedBeacon={selectedBeacon}/>
                    </Timeline.Item>)}
                <Timeline.Item>
                    <span className="header">Midnight</span>
                </Timeline.Item>
            </Timeline>
        </Card>
    )
}

export default AlarmTimeline

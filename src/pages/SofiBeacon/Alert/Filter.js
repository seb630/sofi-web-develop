import { actions } from 'mirrorx'
import { FilterOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Col, DatePicker, Card, Button, Row, Popover, Checkbox } from 'antd'
import moment from 'moment'
import { Fragment, useEffect, useState } from 'react'
import { globalConstants } from '@/_constants'

const BeaconAlertFilter = (props) => {
    const { selectedBeacon, anomalyDate, historicalAlarms, loading } = props
    const beaconId = selectedBeacon?.id
    const date = anomalyDate
    const [fallDown, setFallDown] = useState(true)
    const [sos, setSos] = useState(true)
    const [lowBattery, setLowBattery] = useState(true)
    const [powerOn, setPowerOn] = useState(true)
    const [powerOff, setPowerOff] = useState(true)
    const [geoIn, setGeoIn] = useState(true)
    const [geoOut, setGeoOut] = useState(true)
    const [offline, setOffline] = useState(true)

    const checkFilters = () => fallDown && sos && lowBattery && powerOn && powerOff && geoIn && geoOut && offline

    // eslint-disable-next-line
    useEffect(()=>filterAlarm(),[fallDown,sos,lowBattery,powerOn,powerOff, geoIn, geoOut, historicalAlarms, offline])

    const buildFilterContent = () => {
        return <Fragment>
            <Checkbox checked={fallDown} onChange={e=>setFallDown(e.target.checked)}>Fall Events</Checkbox><br />
            <Checkbox checked={sos} onChange={e=>setSos(e.target.checked)}>SOS Events</Checkbox><br />
            <Checkbox checked={lowBattery} onChange={e=>setLowBattery(e.target.checked)}>Low Battery Events</Checkbox><br />
            <Checkbox checked={powerOn} onChange={e=>setPowerOn(e.target.checked)}>Power On Events</Checkbox><br />
            <Checkbox checked={powerOff} onChange={e=>setPowerOff(e.target.checked)}>Power Off Events</Checkbox><br />
            <Checkbox checked={geoIn} onChange={e=>setGeoIn(e.target.checked)}>Geofence In Events</Checkbox><br />
            <Checkbox checked={geoOut} onChange={e=>setGeoOut(e.target.checked)}>Geofence Out Events</Checkbox><br />
            <Checkbox checked={offline} onChange={e=>setOffline(e.target.checked)}>Offline Events</Checkbox><br />
        </Fragment>
    }

    const filterAlarm = () => {
        let filteredAlarms = []
        filteredAlarms = fallDown ? filteredAlarms.concat(historicalAlarms.filter(alarm=>alarm.fall_down && !filteredAlarms.find(filtered=>filtered.id===alarm.id))) : filteredAlarms
        filteredAlarms = sos ? filteredAlarms.concat(historicalAlarms.filter(alarm=>alarm.sos_key && !filteredAlarms.find(filtered=>filtered.id===alarm.id))) : filteredAlarms
        filteredAlarms = lowBattery ? filteredAlarms.concat(historicalAlarms.filter(alarm=>alarm.battery_low && !filteredAlarms.find(filtered=>filtered.id===alarm.id))) : filteredAlarms
        filteredAlarms = powerOn ? filteredAlarms.concat(historicalAlarms.filter(alarm=>alarm.power_on && !filteredAlarms.find(filtered=>filtered.id===alarm.id))) : filteredAlarms
        filteredAlarms = powerOff ? filteredAlarms.concat(historicalAlarms.filter(alarm=>alarm.power_off && !filteredAlarms.find(filtered=>filtered.id===alarm.id))) : filteredAlarms
        filteredAlarms = geoIn ? filteredAlarms.concat(historicalAlarms.filter(alarm=>alarm?.geofence_event_type==='GEOFENCE_IN' && !filteredAlarms.find(filtered=>filtered.id===alarm.id))) : filteredAlarms
        filteredAlarms = geoOut ? filteredAlarms.concat(historicalAlarms.filter(alarm=>alarm?.geofence_event_type==='GEOFENCE_OUT' && !filteredAlarms.find(filtered=>filtered.id===alarm.id))) : filteredAlarms
        filteredAlarms = offline ? filteredAlarms.concat(historicalAlarms.filter(alarm=>alarm.beacon_offline_alarm_type && !filteredAlarms.find(filtered=>filtered.id===alarm.id))) : filteredAlarms
        filteredAlarms = filteredAlarms.filter(alarm=> alarm.pendant_sent_at && moment(alarm.pendant_sent_at).isBetween(
            anomalyDate.clone().startOf(globalConstants.BEACON_HISTORY_TIME_UNIT),  anomalyDate.clone().endOf(globalConstants.BEACON_HISTORY_TIME_UNIT)))
        actions.sofiBeacon.save({filteredAlarms})
    }

    const filterContent = buildFilterContent()
    const filterOn = checkFilters()

    /** handle search history */
    const handleDatePickerChanged = (value) => {
        actions.sofiBeacon.save({anomalyDate: value})
        actions.sofiBeacon.fetchBeaconAlertHistory({beaconId,
            startDate: value.clone().startOf(globalConstants.BEACON_HISTORY_TIME_UNIT).add(globalConstants.BEACON_BANNER_TIMEOUT * -1, 'minute'),
            endDate: value.clone().endOf(globalConstants.BEACON_HISTORY_TIME_UNIT).add(globalConstants.BEACON_BANNER_TIMEOUT, 'minute'),
        })
    }

    /** handle moving arrow
     * @param forward
     */
    const handleMovingArrow = (forward) => {
        let date = props.anomalyDate
        date = moment(date).add(forward,globalConstants.BEACON_HISTORY_TIME_UNIT)
        actions.sofiBeacon.save({anomalyDate: date})

        actions.sofiBeacon.fetchBeaconAlertHistory({beaconId,
            startDate: date.clone().startOf(globalConstants.BEACON_HISTORY_TIME_UNIT).add(globalConstants.BEACON_BANNER_TIMEOUT * -1, 'minute'),
            endDate: date.clone().endOf(globalConstants.BEACON_HISTORY_TIME_UNIT).add(globalConstants.BEACON_BANNER_TIMEOUT * -1, 'minute'),
        })
    }

    /** disable date */
    function disabledDate(current) {
        return current && current > moment().endOf(globalConstants.BEACON_HISTORY_TIME_UNIT)
    }

    const lgFilter = (<Row gutter={{ xs: 8, sm: 12, md: 16}}>
        <Col>
            <strong> Date: </strong>
        </Col>
        <Col>
            <Button className="filter-history__arrow" onClick={()=>handleMovingArrow(-1)} type="primary" disabled={loading}>
                <LeftOutlined />
            </Button>
        </Col>
        <Col>
            <DatePicker
                className="short-input"
                placeholder="Select date"
                allowClear={false}
                value={date}
                onChange={handleDatePickerChanged}
                disabledDate={disabledDate} />
        </Col>
        <Col>
            <Button
                className="filter-history__arrow "
                disabled={date.isSameOrAfter(moment(),globalConstants.BEACON_HISTORY_TIME_UNIT)||loading}
                onClick={()=>handleMovingArrow(1)}
                type="primary"
            >
                <RightOutlined />
            </Button>
        </Col>
        <Col>
            <Popover placement="bottom" content={filterContent} trigger="click">
                <Button type={filterOn? 'default':'primary'} shape="circle" icon={<FilterOutlined />}/>
            </Popover>
        </Col>
    </Row>)

    return (
        <Card
            size="small"
            style={{marginBottom: 0, height: '100%'}}
            className="beacon-card"
            bordered={false}
            title={<span><FilterOutlined className="fallIcon" />Filters</span>}
        >
            {lgFilter}
        </Card>
    )

}

export default BeaconAlertFilter

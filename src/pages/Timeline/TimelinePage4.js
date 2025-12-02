import { createRef, Component, Fragment } from 'react'
import moment from 'moment-timezone'
import momentDurationFormatSetup from 'moment-duration-format'
import * as _ from 'lodash'
import CalendarTimeline, { TodayMarker, TimelineHeaders, SidebarHeader, DateHeader} from 'react-calendar-timeline'
import 'react-calendar-timeline/lib/Timeline.css'
import { globalConstants } from '@/_constants'
import { actions, connect } from 'mirrorx'
import { InfoCircleOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons'
import { Tooltip, Row, Col, Timeline, Slider, Button, Card, DatePicker, Spin } from 'antd'
import { getSpaceIcons, sortString } from '@/utility/Common'
import PortalLayout from '../Common/Layouts/PortalLayout'
import {isMobile} from 'react-device-detect'

const mapStateToProps = state => ({
    useHubTimeZone: state.user.useHubTimeZone,
    timezone: state.setting.settings?.preferences?.timezone,
    admin: state.user.me?.authorities.some(role=>role.includes('ADMIN')),
    reminders: state.setting.reminders || []

})

const greenMinutes = 20

const formatOptions = {
    year: {
        long: 'YYYY',
        mediumLong: 'YYYY',
        medium: 'YYYY',
        short: 'YY'
    },
    month: {
        long: 'MMMM YYYY',
        mediumLong: 'MMMM',
        medium: 'MMMM',
        short: 'MM/YY'
    },
    week: {
        long: 'w',
        mediumLong: 'w',
        medium: 'w',
        short: 'w'
    },
    day: {
        long: 'dddd, LL',
        mediumLong: 'dddd, LL',
        medium: 'dd D',
        short: 'D'
    },
    hour: {
        long: 'HH:00',
        mediumLong: 'HH:00',
        medium: 'HH:00',
        short: 'HH'
    },
    minute: {
        long: 'HH:mm',
        mediumLong: 'HH:mm',
        medium: 'HH:mm',
        short: 'mm',
    }
}

momentDurationFormatSetup(moment)

const format = 'YYYY-MM-DD HH:mm:ss'
// 24 hours, if the range of bounds is more than 72 hours (data range is 3 times wider than open range), then condensed = true; otherwise condensed = false
const threshold = 24
const GROUPS = [
    {id: 'occupancy', title: 'Occupancies', root: true, parent: null, tip: globalConstants.OCCUPANCIESTOOLTIP},
    {id: 'doorSensor', title: 'Doors', root: true, parent: null, tip: 'Door sensor'},
    {id: 'anomaly', title: 'Anomalies', root: true, parent: null, end: true, tip: globalConstants.ANOMALIESTOOLTIP},
    {id: 'message', title: 'Messages', root: true, parent: null, end: true, tip: globalConstants.MESSAGESTOOLTIP},
    {id: 'medication', title: 'Medications', root: true, parent: null, end: true, tip: globalConstants.MEDICATIONSTOOLTIP},
]
const ALL_GROUPS = _.keyBy(GROUPS, 'id')
const OPEN_GROUPS = { 'occupancy': true, 'anomaly': true, 'message': true, 'doorSensor': true }

const marks = {
    10: '10s',
    30: '30s',
    60: '1min',
    120: '2mins',
    300: '5mins',
    600: '10mins',
    900: '15mins'
}

const DEFAULT_STATE = {
    // condensed view
    view1: {
        startTime: moment().add(1, 'day').startOf('day'),
        endTime: moment().add(2, 'day').startOf('day'),
        items: [],
        allItems: {},
    },
    // detailed view
    view2: {
        startTime: moment().subtract(2, 'day').startOf('day'),
        endTime: moment().add(1, 'day').startOf('day'),
        items: [],
        allItems: {},
    },
    // common
    condensed: false,
    groups: GROUPS,
    allGroups: ALL_GROUPS,
    openGroups: OPEN_GROUPS,
    occupancy: [],
    threshold: globalConstants.TIMELINE_THRESHOLD_MIN,
    showDetail: false,
    timeLineStart: moment().endOf('hour').subtract(4, 'hour'),
    timeLineEnd: moment().endOf('hour'),
    selectedDate: null,
    selectedItem: null,
}

const itemRenderer = ({ item, itemContext, getItemProps, getResizeProps }) => {
    const { left: leftResizeProps, right: rightResizeProps } = getResizeProps()
    return (
        <div {...getItemProps(item.itemProps)}>
            {itemContext.useResizeHandle ? <div {...leftResizeProps} /> : ''}

            <div
                className="rct-item-content"
                style={{
                    height: itemContext.dimensions.height,
                    maxWidth: itemContext.width,
                    overflow: 'hidden',
                    paddingLeft: 3,
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}
                title={itemContext.title}
            >
                {itemContext.width>25 ? item.text : ''}
            </div>

            {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : ''}
        </div>
    )
}


class TimelinePage extends Component {
    constructor(props) {
        super(props)
        this.timeline = createRef()
        this.state = _.cloneDeep(DEFAULT_STATE)
    }

    reset = () => {
        let newState = _.cloneDeep(DEFAULT_STATE)
        newState.timeLineStart = moment().endOf('hour').subtract(4, 'hour')
        newState.timeLineEnd = moment().endOf('hour')
        this.setState(newState)

        actions.hub.save({
            detailedOccupancies: null,
            detailedMessage: null,
            detailedAnomalies: null,
            detailedActionState: null
        })
    }

    componentDidUpdate(prevProps) {
        if (this.props.timezone && prevProps.timezone !== this.props.timezone ){
            moment.tz.setDefault(this.props.timezone)
            this.setState()
        }
        prevProps.selectedHub !== this.props.selectedHub && this.reset()
        this.props.detailedAnomalies && prevProps.detailedAnomalies !== this.props.detailedAnomalies &&
        this.addAnomalies(this.props.detailedAnomalies)
        this.props.detailedMessage && prevProps.detailedMessage !== this.props.detailedMessage &&
        this.addMessages(this.props.detailedMessage)
        this.props.detailedOccupancies && prevProps.detailedOccupancies !== this.props.detailedOccupancies &&
        this.addOccupancies(this.props.detailedOccupancies)
        this.props.detailedMedication && prevProps.detailedMedication !== this.props.detailedMedication &&
        this.addMedications(this.props.detailedMedication)
        this.props.detailedActionState && prevProps.detailedActionState !== this.props.detailedActionState &&
        this.addDoorState(this.props.detailedActionState)
    }

    loadOccupancies = (from, to, page, condensed) => {
        const hubId = this.props.selectedHub.hub_id
        const view = this.activeView()
        const fromTime = moment(from).valueOf() || moment(view.startTime).valueOf()
        const toTime = moment(to).valueOf() || moment(view.endTime).valueOf()
        const p = page || 0
        actions.hub.getDetailedOccupancies({hubId, fromTime, toTime,
            size: globalConstants.TIMELINE_SIZE, page: p, condensed})
    }

    loadAnomalies = (from, to, page) => {
        const hubId = this.props.selectedHub.hub_id
        const view = this.activeView()
        const fromTime = from || view.startTime
        const toTime = to || view.endTime
        const p = page || 0
        actions.hub.getDetailedAnomalies({hubId, fromTime, toTime, size: globalConstants.TIMELINE_SIZE, page: p})
    }

    inforLabel = (item) => {
        return (
            <div
                style={{
                    position: 'fixed',
                    left: isMobile ? '8%' : 300,
                    bottom: 50,
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    padding: 10,
                    width: 300,
                    fontSize: 20,
                    borderRadius: 5,
                    zIndex: 85,
                    whiteSpace: 'pre-wrap'
                }}
            >
                {item.title}
            </div>
        )
    }

    loadMessages = (from, to, page) => {
        const hubId = this.props.selectedHub.hub_id
        const view = this.activeView()
        const fromTime = from || view.startTime
        const toTime = to || view.endTime
        const p = page || 0
        actions.hub.getDetailedMessage({hubId, fromTime, toTime, size: globalConstants.TIMELINE_SIZE, page: p})
    }

    loadActionState = (from, to, page) => {
        const hubId = this.props.selectedHub.hub_id
        const view = this.activeView()
        const fromTime = from || view.startTime
        const toTime = to || view.endTime
        const p = page || 0
        actions.hub.getDetailedActionState({hubId, fromTime, toTime, size: globalConstants.TIMELINE_SIZE, page: p})
    }

    loadMedications = (from, to, page) => {
        const hubId = this.props.selectedHub.hub_id
        const view = this.activeView()
        const fromTime = from || view.startTime
        const toTime = to || view.endTime
        const p = page || 0
        actions.hub.getDetailedMedication({hubId, fromTime, toTime, size: globalConstants.TIMELINE_SIZE, page: p})
    }

    // when zooming in/out, bounds change event (3 times wider in range) will always be triggered before zoom
    handleBoundsChange = (canvasTimeStart, canvasTimeEnd) => {
        let startTime = moment(canvasTimeStart)
        let endTime = moment(canvasTimeEnd)
        let hours = moment.duration(endTime.diff(startTime)).asHours()
        let condensed = hours > threshold*3
        let view = condensed ? this.state.view1 : this.state.view2

        let endTime1 = moment(view.endTime)
        let endTime2 = endTime.isAfter(endTime1) ? endTime : endTime1
        let today = moment().endOf('day')
        if (startTime.isBefore(view.startTime)) {
            startTime = startTime.subtract(3,'days')
            this.loadOccupancies(startTime, view.startTime, 0, condensed)
            this.loadAnomalies(startTime, view.startTime)
            this.loadMessages(startTime, view.startTime)
            this.loadMedications(startTime, view.startTime)
            this.loadActionState(startTime, view.startTime)
            view.startTime = startTime
        }
        if (endTime2.isAfter(view.endTime) && !endTime2.isAfter(today)) {
            this.loadOccupancies(view.endTime, endTime2, 0, condensed)
            this.loadAnomalies(view.endTime, endTime2)
            this.loadMessages(view.endTime, endTime2)
            this.loadMedications(view.endTime, endTime2)
            this.loadActionState(view.endTime, endTime2)
            view.endTime = endTime2
        }
        condensed !== this.state.condensed && this.setState({condensed:condensed,selectedDate: null})
        if (condensed) {
            view!==this.state.view1 && this.setState({ view1: view, selectedDate: null, timeLineStart: startTime, timeLineEnd:endTime, })
        } else {
            view!==this.state.view2 && this.setState({ view2: view, selectedDate: null, timeLineStart: startTime, timeLineEnd:endTime,})
        }
    }

    addTimeLineOccupancy = (start, end, occupancy) => {
        occupancy = occupancy && occupancy.filter(
            record=> moment(record.exited_at).isAfter(start) &&  moment(record.exited_at).isBefore(end)
                || moment(record.entered_at).isBefore(end) && moment(record.entered_at).isAfter(start)
        )
        this.setState({occupancy, showDetail: true})
    }

    handleThresholdChange = v => {
        this.setState({threshold: v})
    }

    handleItemSelect = itemId => {
        const {condensed, view1, view2} = this.state
        let selectedItem = condensed ? view1.items.find(item=>item.id===itemId) : view2.items.find(item=>item.id===itemId)
        this.setState({selectedItem})
    }

    handleTimeChange = (visibleTimeStart, visibleTimeEnd, updateScrollCanvas) => {
        if (this.state.showDetail || this.state.showDatePicker) {
            this.setState({
                showDetail: false,
                showDatePicker: false,
                occupancy: [],
            })
        }

        this.setState({timeLineStart: visibleTimeStart, timeLineEnd:visibleTimeEnd})
        const maxTime = moment().add(12, 'hours').valueOf()
        if (visibleTimeEnd > maxTime) {
            updateScrollCanvas(maxTime - (visibleTimeEnd - visibleTimeStart), maxTime)
        } else {
            updateScrollCanvas(visibleTimeStart, visibleTimeEnd)
        }
    }

    toggleGroup = id => {
        const { openGroups } = this.state
        this.setState({
            openGroups: {
                ...openGroups,
                [id]: !openGroups[id]
            }
        })
    }

    sortOccupancy = (groups) => {
        const others = groups?.filter(group=>!group.id.includes('occupancy'))
        let occupancies = groups?.filter(group=>group.id.includes('occupancy'))
        occupancies = occupancies?.sort((a,b)=>sortString(a,b,'id'))
        return occupancies?.concat(others)
    }

    // hide (filter) the groups that are closed, for the rest, patch their "title" and add some callbacks or padding
    newGroups = (groups, openGroups) => {
        return this.sortOccupancy(groups
            .filter(g => g.root || openGroups[g.parent])
        ).map(group => {
            return Object.assign({}, group, {
                title: group.root ? (
                    <div
                        onClick={() => this.toggleGroup(group.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        {group.end === true ? '' : (openGroups[group.id] ? '[-]' : '[+]')} {group.title}
                        <Tooltip title={group.tip}>
                            <InfoCircleOutlined className="infoIcon" />
                        </Tooltip>
                    </div>
                ) : (
                    <div>{getSpaceIcons(group.title)}{group.title}</div>
                )
            })
        })
    }

    toSnake = name => {
        return name ? name.replace(' ', '_').toLowerCase() : ''
    }

    findGroup = name => {
        const { groups } = this.state
        return _.findIndex(groups, g => g.id === name)
    }

    addGroup = group => {
        const { allGroups, groups } = this.state
        if (!allGroups[group.id]) {
            allGroups[group.id] = group
            if (group.parent) {
                groups.splice(this.findGroup(group.parent) + 1, 0, group)
            } else {
                groups.push(group)
            }
        }
    }

    activeView = () => {
        const { condensed } = this.state
        return condensed ? this.state.view1  : this.state.view2
    }

    addItem = (item, view) => {
        const { items, allItems } = view
        if (!allItems[item.id]) {
            allItems[item.id] = item
            items.push(item)
        }
    }

    addLatestOccupancy = (view) => {
        const spaceName = this.props.lastKnown.space_name
        const item = {
            id: 'occupancy_now',
            group: 'occupancy',
            type: 'occupancy',
            text: spaceName,
            start_time: moment(this.props.lastKnown.started_at),
            end_time: moment()
        }
        item.title = 'Occupancy id: occupancy_now' + '\n' + 'Room: ' + spaceName + '\n'
            + 'Enter at: ' + item.start_time.format(format) + '\n'
            + 'Exit at: ' + item.end_time.format(format) + '\n'
            + 'Stayed: ' + moment.duration(item.end_time.diff(item.start_time)).humanize()
        this.addItem(item, view)
        let sub = this.toSnake(spaceName)
        this.addItem(_.assign({}, item, {
            id: 'occupancy_' + sub + '_now',
            group: 'occupancy_' + sub,
            type: 'occupancy'}), view)
    }

    addOccupancies = (data) => {
        const rows = data || []
        const view = this.activeView()
        const spaces = _.uniq(_.map(rows, 'space_name'))
        _.forEach(spaces, space => {
            this.addGroup({id: 'occupancy_' + this.toSnake(space), title: space, root: false, parent: 'occupancy'})
        })
        this.addLatestOccupancy(view)
        const classNames = {
            'Kitchen': 'kitchen',
            'Lounge Room': 'lounge',
            'Bathroom': 'bathroom',
            'Bedroom': 'bedroom',
            'Spare Room': 'spareroom'
        }

        for (let i = 0; i < rows.length; i++) {
            let row = rows[i]
            let item = {id: 'occupancy_' + row.occupancy_period_id, group: 'occupancy', type: 'occupancy'}
            item.text = row.space_name // 'occupancy ' + row.occupancy_period_id;
            item.start_time = moment(row.entered_at)
            item.end_time = moment(row.exited_at)
            item.className = 'occupancy-' + classNames[row.space_name]
            item.title = 'Occupancy id: ' + row.occupancy_period_id + '\n'
                + 'Room: ' + row.space_name + '\n'
                + 'Enter at: ' + item.start_time.format(format) + '\n'
                + 'Exit at: ' + item.end_time.format(format) + '\n'
                + 'Stayed: ' + moment.duration(item.end_time.diff(item.start_time)).humanize()

            this.addItem(item, view)
            let sub = this.toSnake(row.space_name)
            this.addItem(_.assign({}, item, {
                id: 'occupancy_' + sub + '_' + row.occupancy_period_id,
                group: 'occupancy_' + sub,
                type: 'occupancy'}), view)
        }
        this.setState({ condensed: this.state.condensed })
    }

    addDoorState = (data) => {
        let rows = data.content || []
        const view = this.activeView()
        const devices = _.uniq(_.map(rows, 'device_name'))
        _.forEach(devices, device => {
            this.addGroup({id: 'door_' + this.toSnake(device), title: device, root: false, parent: 'doorSensor'})
        })
        rows.sort((a,b) => (a.device_id > b.device_id) ? 1 : ((b.device_id > a.device_id) ? -1 : 0))
        rows?.map((row,i)=>{
            let sub = this.toSnake(row.device_name)
            let item = {id: 'door_' +sub+ row.last_update_at, group: 'door_'+ sub, type: 'doorSensor'}
            item.text = row.device_name + ' '+ row.action_state
            item.start_time = moment(row.last_update_at)
            item.className = 'door-' + row.action_state.toLowerCase()

            if (i===0 || row.device_id !== rows[i-1].device_id){
                item.end_time = moment()
            }else{
                item.end_time = moment(rows[i-1].last_update_at)
            }
            item.title = 'Sensor Name: ' + row.device_name + '\n'
                + 'State: ' + row.action_state + '\n'
                + 'From: ' + item.start_time.format(format) + '\n'
                + 'To: ' + item.end_time.format(format) + '\n'
                + 'Stayed: ' + moment.duration(item.end_time.diff(item.start_time)).humanize()
            this.addItem(item, view)
        })
        this.setState({ condensed: this.state.condensed })
    }

    addMedications = (data) => {
        const rows = data.content || []
        const view = this.activeView()
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i]
            let item = {id: 'medication_' + row.resident_activity_id, group: 'medication', type: 'medication'}
            item.text = row.classifier
            item.start_time = moment(row.occurred_at)
            item.end_time = moment(row.occurred_at).add(1, 'minutes')
            item.title = 'Medication id: ' + row.resident_activity_id + '\n'
                + 'Classifier: ' + row.classifier + '\n'
                + 'Occurred at: ' + moment(row.occurred_at).format(format)
            item.style = {backgroundColor: this.mediColor(row)}
            this.addItem(item, view)
        }
        this.setState({ condensed: this.state.condensed })
    }

    mediColor = row => {
        const mediReminders = this.props.reminders.filter(reminder => reminder.config.reminder_type==='MEDICATION_OPTIMISTIC')
        let color
        const mediDateTime = moment(row.occurred_at)
        const mediTime = moment(mediDateTime.format('HH:mm:ss'),'HH:mm:ss')
        mediReminders.some(reminder=>{
            if (reminder.config?.timing?.recurring?.occurs?.includes(moment.weekdays(mediDateTime.isoWeekday()))){
                if (mediTime.isBetween(
                    moment(reminder.config.timing.at,'HH:mm').subtract(greenMinutes,'m'),
                    moment(reminder.config.timing.at,'HH:mm').add(greenMinutes,'m'))
                ){
                    color = 'green' // green color
                    return true
                }else if (mediTime.isBetween(
                    moment(reminder.config.timing.at,'HH:mm').subtract(1,'h'),
                    moment(reminder.config.timing.at,'HH:mm').add(1,'h'))
                ){
                    color = 'orange' //amber color
                    return true
                }
            }
        })
        return color ?  color : 'red' //return red if not found
    }

    addAnomalies = (data) => {
        const rows = data.content || []
        const view = this.activeView()
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i]
            let resolved = row.status === 'RESOLVED'
            let item = {id: 'anomaly_' + row.anomaly_id, group: 'anomaly', type: 'anomaly'}
            item.text = row.classification // 'anomaly ' + row.anomaly_id;
            item.start_time = moment(row.occurred_at)
            item.end_time = (row.resolved_at ? moment(row.resolved_at) : moment(row.occurred_at).add(20, 'minutes'))
            item.className = resolved ? 'anomaly-resolved' : 'anomaly-unresolved'
            item.title = 'Anomaly id: ' + row.anomaly_id + '\n'
                + 'Kind: ' + row.kind + '\n'
                + 'Classification: ' + row.classification + '\n'
                + 'Status: ' + row.status + '\n'
                + 'Occurred at: ' + moment(row.occurred_at).format(format) + '\n'
                + (row.resolved_at ? 'Resolved at: ' + moment(row.resolved_at).format(format) : '')
            this.addItem(item, view)
        }
        this.setState({ condensed: this.state.condensed })
    }

    addMessages = (data) => {
        const rows = data.content || []
        const view = this.activeView()
        const classNames = {
            'SPEAK': 'speak'
        }
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i]
            let item = {id: 'message_' + row.message_id, group: 'message', type: 'message'}
            item.text = row.message_type // 'message ' + row.message_id;
            item.start_time = moment(row.sent_at)
            item.end_time = moment(row.sent_at).add(30, 'seconds')
            item.className = 'message_' + classNames[row.message_type]
            item.title = 'Message id: ' + row.message_id + '\n'
                + 'Type: ' + row.message_type + '\n'
                + 'Volume: ' + row.message_volume + '\n'
                + 'Content: ' + row.content + '\n'
                + 'Sent at: ' + moment(row.sent_at).format(format)
            this.addItem(item, view)
        }
        this.setState({ condensed: this.state.condensed })
    }

    handleDetails = () => {
        if (this.state.showDetail){
            this.setState({showDetail: false})
        }else {
            this.setState({
                timeLineStart: this.timeline.current.state.visibleTimeStart,
                timeLineEnd: this.timeline.current.state.visibleTimeEnd,
            })
            this.addTimeLineOccupancy(
                this.timeline.current.state.visibleTimeStart,
                this.timeline.current.state.visibleTimeEnd,
                this.props.detailedOccupancies)
        }
    }

    onOk = () => {
        this.setState({ showDatePicker: false })
    }

    handleDatePickerChange = (date, dateString) => {
        this.setState({
            selectedDate: moment(dateString),
            timeLineStart: moment(dateString)
                .set({
                    hour: 0,
                    minute: 0,
                    second: 0
                }),
            timeLineEnd: moment(dateString)
                .set({
                    hour: 23,
                    minute: 59,
                    second: 59
                })
        })
    }

    disabledDate = current => {
        return current > moment().endOf('day')

    }


    renderDatePicker = (mobile=false) =>
        <DatePicker
            value={this.state.selectedDate}
            onChange = {(date, dateString)=>this.handleDatePickerChange(date, dateString, mobile)}
            format="YYYY-MM-DD"
            placeholder='Select Date'
            disabledDate = {this.disabledDate}
        />

    renderTimeLine = () => <div>
        {this.props.admin &&
        <Slider
            tipFormatter={value =>
                `Filter the occupancies duration less than ${value} seconds`}
            defaultValue={globalConstants.TIMELINE_THRESHOLD_MIN}
            min={0}
            max={900}
            step={10}
            marks={marks}
            onChange={v => this.handleThresholdChange(v)}
        />}
        {
            this.timeline.current && moment(this.timeline.current.state.visibleTimeEnd).diff(
                moment(this.timeline.current.state.visibleTimeStart), 'day')>0 ?
                'Please zoom in to ONE DAY to get the detailed occupancies' :

                <Timeline>
                    {this.state.occupancy.filter(
                        record => moment.duration(record.duration).asSeconds() >
                            this.state.threshold)
                        .map(record =>
                            <Timeline.Item
                                key={record.occupancy_period_id}
                                dot={getSpaceIcons(record.space_name)}
                            >
                                Entered {record.space_name
                                } at {moment(record.entered_at)
                                    .format(globalConstants.CLOCK_DT_FORMAT)
                                } stayed for {moment.duration(record.duration)
                                    .format(
                                        'd [days], h [hours], m [minutes], s [seconds]')
                                }
                            </Timeline.Item>
                        )}
                </Timeline>
        }
    </div>

    secondaryLabelFormat = ([timeStart], unit, labelWidth) => {
        let format
        if (labelWidth >= 150) {
            format = formatOptions[unit]['long']
        } else if (labelWidth >= 100) {
            format = formatOptions[unit]['mediumLong']
        } else if (labelWidth >= 50) {
            format = formatOptions[unit]['medium']
        } else {
            format = formatOptions[unit]['short']
        }
        return timeStart.format(format)
    }


    /** render page content */
    renderPageContent() {
        window.dispatchEvent(new Event('resize'))
        const { openGroups, groups } = this.state
        const view = this.activeView()
        let nGroups = this.newGroups(groups, openGroups)
        const start = this.state.timeLineStart.valueOf()
        const end = this.state.timeLineEnd.valueOf()
        return (
            <Fragment>
                <Row>
                    <Col>
                        {this.props.timezone ?
                            <CalendarTimeline
                                ref={this.timeline}
                                groups={nGroups}
                                items={view.items}
                                visibleTimeStart={start}
                                visibleTimeEnd={end}
                                fullUpdate
                                itemRenderer={itemRenderer}
                                itemsSorted
                                itemTouchSendsClick={false}
                                itemHeightRatio={0.75}
                                canMove={false}
                                canResize={false}
                                stackItems
                                minZoom={60 * 1000}   // 1 minute
                                maxZoom={3 * 86400 * 1000}  // 1 week
                                openGroups={openGroups}
                                onCanvasClick={()=>this.setState({selectedItem: null})}
                                onBoundsChange={this.handleBoundsChange}
                                onTimeChange={this.handleTimeChange}
                                onItemSelect={this.handleItemSelect}
                            >
                                <TimelineHeaders>
                                    <SidebarHeader>
                                        {({ getRootProps }) => {
                                            return <div className="rct-sidebar-header" {...getRootProps()}>Room List</div>
                                        }}
                                    </SidebarHeader>
                                    <DateHeader unit="primaryHeader"/>
                                    <DateHeader labelFormat={this.secondaryLabelFormat}/>
                                </TimelineHeaders>
                                <TodayMarker/>
                            </CalendarTimeline>
                            : <Spin />
                        }
                    </Col>
                    {this.state.selectedItem && this.inforLabel(this.state.selectedItem)}
                </Row>
                <Row style={{ marginTop: '24px' }}>
                    <Col xs={0} sm={24}>
                        <Card
                            title={
                                <div>
                                    <Button
                                        icon={this.state.showDetail? <ZoomInOutlined />: <ZoomOutOutlined />}
                                        onClick={this.handleDetails}
                                        style={{margin:'0 20px'}}
                                    >
                                        {this.state.showDetail? 'Hide Details': 'Show Details'}
                                    </Button>

                                    {this.renderDatePicker()}
                                </div>
                            }
                        >
                            {this.state.showDetail && this.renderTimeLine()}
                        </Card>
                    </Col>
                </Row>
            </Fragment>
        )
    }

    render() {
        return (
            <PortalLayout
                menu='hub'
                page="Timeline"
                contentClass="contentPage"
                content={ this.renderPageContent() }/>
        )
    }
}

export default connect(mapStateToProps, null)(TimelinePage)

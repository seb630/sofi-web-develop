import { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import momentDurationFormatSetup from 'moment-duration-format'
import * as _ from 'lodash'
import CalendarTimeline, { TodayMarker } from 'react-calendar-timeline'
import 'react-calendar-timeline/lib/Timeline.css'
import { globalConstants } from '@/_constants'
import { actions, connect } from 'mirrorx'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Col, Row, Spin, Tooltip } from 'antd'
import { getSpaceIcons } from '@/utility/Common'

const mapStateToProps = state => ({
    ...state.hub,
    useHubTimeZone: state.user.useHubTimeZone,
    timezone: state.setting.settings?.preferences?.timezone,
    admin: state.user.me?.authorities.some(role=>role.includes('ADMIN')),
})

momentDurationFormatSetup(moment)

const format = 'DD-MM-YYYY HH:mm:ss'
// 24 hours, if the range of bounds is more than 72 hours (data range is 3 times wider than open range), then condensed = true; otherwise condensed = false
const threshold = 24
const GROUPS = [
    {id: 'occupancy', title: 'Occupancies', root: true, parent: null, tip: globalConstants.OCCUPANCIESTOOLTIP},
    {id: 'anomaly', title: 'Anomalies', root: true, parent: null, end: true, tip: globalConstants.ANOMALIESTOOLTIP},
]
const ALL_GROUPS = _.keyBy(GROUPS, 'id')
const OPEN_GROUPS = { 'occupancy': true, 'anomaly': true}

const DEFAULT_STATE = {
    // condensed view
    view1: {
        startTime: moment().add(1,'day').startOf('day'),
        endTime: moment().startOf('day'),
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
    threshold: globalConstants.TIMELINE_THRESHOLD_MIN,
    timeLineStart: moment().endOf('hour').subtract(4, 'hour'),
    timeLineEnd: moment().endOf('hour'),
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
        this.setState(_.cloneDeep(DEFAULT_STATE))
        actions.hub.save({
            detailedOccupancies: null,
            detailedAnomalies: null
        })
    }

    componentDidMount () {
        this.setState(
            {
                timeLineStart: moment(this.props.anomaly.occurred_at).subtract(2, 'hour'),
                timeLineEnd: moment(this.props.anomaly.occurred_at).add(2, 'hour'),
                view1: {
                    ...this.state.view1,
                    startTime: moment(this.props.anomaly.occurred_at).subtract(2, 'day'),
                    endTime: moment(this.props.anomaly.occurred_at).add(2, 'day'),
                },
                view2: {
                    ...this.state.view2,
                    startTime: moment(this.props.anomaly.occurred_at).subtract(2, 'day'),
                    endTime: moment(this.props.anomaly.occurred_at).add(2, 'day'),
                }
            }
        )
        this.props.detailedAnomalies && this.addAnomalies(this.props.detailedAnomalies)
        this.props.detailedOccupancies && this.addOccupancies(this.props.detailedOccupancies)
    }

    componentDidUpdate(prevProps) {
        if (this.props.timezone && prevProps.timezone !== this.props.timezone ){
            moment.tz.setDefault(this.props.timezone)
            this.setState()
        }
        prevProps.selectedHub !== this.props.selectedHub && this.reset()
        this.props.detailedAnomalies && prevProps.detailedAnomalies !== this.props.detailedAnomalies &&
        this.addAnomalies(this.props.detailedAnomalies)
        this.props.detailedOccupancies && prevProps.detailedOccupancies !== this.props.detailedOccupancies &&
        this.addOccupancies(this.props.detailedOccupancies)
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
            view.startTime = startTime
        }
        if (endTime2.isAfter(view.endTime) && !endTime2.isAfter(today)) {
            this.loadOccupancies(view.endTime, endTime2, 0, condensed)
            this.loadAnomalies(view.endTime, endTime2)
            view.endTime = endTime2
        }
        condensed !== this.state.condensed && this.setState({condensed:condensed,
            timeLineStart: startTime, timeLineEnd:endTime, selectedDate: null})
        if (condensed) {
            view!==this.state.view1 && this.setState({ view1: view, selectedDate: null })
        } else {
            view!==this.state.view2 && this.setState({ view2: view, selectedDate: null})
        }
    }

    handleTimeChange = (visibleTimeStart, visibleTimeEnd, updateScrollCanvas) => {
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

    // hide (filter) the groups that are closed, for the rest, patch their "title" and add some callbacks or padding
    newGroups = (groups, openGroups) => {
        return groups
            .filter(g => g.root || openGroups[g.parent])
            .map(group => {
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

    addOccupancies = (data) => {
        const rows = data || []
        const view = this.activeView()
        const spaces = _.uniq(_.map(rows, 'space_name'))
        _.forEach(spaces, space => {
            this.addGroup({id: 'occupancy_' + this.toSnake(space), title: space, root: false, parent: 'occupancy'})
        })
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

    /** render page content */
    renderPageContent() {
        window.dispatchEvent(new Event('resize'))
        const { openGroups, groups } = this.state
        const view = this.activeView()
        let nGroups = this.newGroups(groups, openGroups)
        const start = this.state.timeLineStart.valueOf()
        const end = this.state.timeLineEnd.valueOf()
        return (
            <div>
                <Row>
                    <Col>
                        {this.props.timezone ?
                            <CalendarTimeline
                                groups={nGroups}
                                items={view.items}
                                visibleTimeStart={start}
                                visibleTimeEnd={end}
                                itemRenderer={itemRenderer}
                                itemsSorted
                                itemTouchSendsClick={false}
                                itemHeightRatio={0.75}
                                canMove={false}
                                canResize={false}
                                stackItems
                                sidebarContent={<div>Room List</div>}
                                minZoom={60 * 1000}   // 1 minute
                                maxZoom={7 * 86400 * 1000}  // 1 week
                                openGroups={openGroups}
                                onBoundsChange={this.handleBoundsChange}
                                onTimeChange={this.handleTimeChange}
                            >
                                <TodayMarker/>
                            </CalendarTimeline>
                            : <Spin />
                        }
                    </Col>
                </Row>
            </div>
        )
    }

    render() {
        return (this.renderPageContent())
    }
}

TimelinePage.propTypes= {
    anomaly: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, null)(TimelinePage)

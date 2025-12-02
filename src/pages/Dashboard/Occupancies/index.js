import { Component, Fragment } from 'react'
import { connect } from 'mirrorx'
import moment from 'moment-timezone'
import { Collapse, Timeline } from 'antd'
import { getSpaceIcons } from '@/utility/Common'

const mapStateToProps = state => ({
    lastOccupancies: state.hub.lastOccupancies,
    timezone: state.user.useHubTimeZone && state.setting.settings?.preferences?.timezone,
    lastKnown: state.hub.lastKnown,
    selectedHub: state.hub.selectedHub
})


class Occupancies extends Component{
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    renderTimeLine = () => <div>
        <Timeline className="dashboard_timeline">
            {this.props.lastKnown.space_name &&
            <Timeline.Item
                key="lastKnown"
                dot={getSpaceIcons(this.props.lastKnown.space_name)}
            >
                <Fragment>{this.props.lastKnown.space_name}: {moment(this.props.lastKnown.started_at).fromNow()
                } - Now</Fragment>
            </Timeline.Item>
            }
            {this.props.lastOccupancies && this.props.lastOccupancies.map(record => {
                return <Timeline.Item
                    key={record.occupancy_period_id}
                    dot={getSpaceIcons(record.space_name)}
                >
                    <Fragment>{record.space_name}: {moment.duration(record.duration)
                        .format(
                            'd [days], h [hours], m [minutes], s [seconds]')
                    }</Fragment>
                </Timeline.Item>
            })}
        </Timeline>
    </div>


    render(){
        const { timezone, selectedHub} = this.props

        timezone && moment.tz.setDefault(this.props.timezone)

        return(
            selectedHub && selectedHub.connectivity_state === 'ONLINE' &&
            <Collapse expandIconPosition={'end'} defaultActiveKey={'1'} className='sensorCard'>
                <Collapse.Panel key='1' header='Recent Occupancies'>
                    {this.renderTimeLine()}
                </Collapse.Panel>
            </Collapse>

        )
    }

}

export default connect(mapStateToProps, null)(Occupancies)

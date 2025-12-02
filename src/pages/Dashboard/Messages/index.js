import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { globalConstants } from '@/_constants'
import moment from 'moment-timezone'
import { Collapse, List } from 'antd'
import MessageModal from './MessageModal'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    messages: state.hub.messages,
    messagePage: state.hub.messagePage,
    timezone: state.user.useHubTimeZone && state.setting.settings?.preferences?.timezone,
    hubLocation: state.setting.settings && state.setting.settings.preferences.speaker_spaces[0],
    admin: state.user.me?.authorities.some(role=>role.includes('ADMIN')),
})

class Messages extends Component{
    constructor(props) {
        super(props)
        this.state = {
            _page: this.props.messagePage || 1,
            testModal: false,
            message: '',
            occupancyBased: false,
            expire: 60,
        }
    }

    showModal = (e) => {
        e.stopPropagation()
        this.setState({
            testModal: true,
        })
    }


    render(){
        const { timezone, selectedHub, admin, hubLocation } = this.props

        timezone && moment.tz.setDefault(this.props.timezone)
        let messages = this.props.messages && this.props.messages.content || []
        let results2 = []
        messages.map((item) => {
            const t1 =  moment(item.sent_at)
            const item2 = {
                content: item.content,
                time: t1.format(globalConstants.MESSAGE_DT_FORMAT),
                volume: item.message_volume
            }
            results2.push(item2)
        })

        const recentActivities = <List
            pagination={{
                style: {marginRight: 16, marginBottom: 24},
                current:this.state._page,
                total: this.props.messages.total_elements,
                pageSize: globalConstants.MESSAGE_PAGE_SIZE,
                hideOnSinglePage: true,
                onChange: this.processMessages
            }}
            locale={{
                emptyText: 'No messages sent in last 7 days!'
            }}
            dataSource={results2}
            renderItem={(item, i) => (
                <List.Item>
                    <div className="recent_activity" key={i}>
                        <div className="room">{item.content}</div>
                        <div className="activity">{item.time}
                            <span className="playedVolume">Volume &nbsp;{item.volume}%</span>
                        </div>
                    </div>
                </List.Item>
            )}
        />

        return(
            <Collapse expandIconPosition={'end'} defaultActiveKey={'1'} className='sensorCard'>
                <Collapse.Panel key='1' header="Recent Messages" extra={<a className="collapse-extra" onClick={this.showModal}>Send Message</a>}>
                    <MessageModal
                        selectedHub={selectedHub}
                        onCancel={()=>this.setState({testModal: false})}
                        admin={admin}
                        hubLocation={hubLocation}
                        open={this.state.testModal}
                    />
                    {recentActivities}
                </Collapse.Panel>
            </Collapse>)
    }

    processMessages = (page) => {
        actions.hub.getHubMessages({hubId: this.props.selectedHub.hub_id, page})
        if (page === 0) {
            this.setState({ _page: 1 })
        } else {
            this.setState({ _page: parseInt(page, 10) })
        }
        actions.hub.save({messagePage: page})
    }


}

export default connect(mapStateToProps, null)(Messages)

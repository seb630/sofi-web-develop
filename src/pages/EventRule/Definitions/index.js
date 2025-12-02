import { Component } from 'react'
import { NotificationOutlined } from '@ant-design/icons'
import { Card, Col, Divider, Popconfirm, Row, Table, Tooltip } from 'antd'
import PropTypes from 'prop-types'
import ExampleModal from './ExampleModal'
import '../EventRule.scss'
import RuleActions from './DefinitionAction'
import { actions } from 'mirrorx'

export default class EventRuleDefinitions extends Component {

    constructor(props) {
        super(props)
        this.state = {
            example: false,
            addRuleModal: false,
        }
    }

    generateData = (source) => {
        return source?.filter(record=>!record.invisible).map(record=>{
            const config = typeof record.config === 'object' ? record.config : JSON.parse(record?.config)
            const starts_at = config?.time_frame?.starts_at
            const ends_at = config?.time_frame?.ends_at
            const repeats = config?.time_frame?.repeats
            const times = `${starts_at} - ${ends_at}`
            const repeat_days = <div>
                <span className={repeats.includes('MONDAY') ? 'daysOn' : 'daysOff' }>Mon </span>
                <span className={repeats.includes('TUESDAY') ? 'daysOn' : 'daysOff' }>Tue </span>
                <span className={repeats.includes('WEDNESDAY') ? 'daysOn' : 'daysOff' }>Wed </span>
                <span className={repeats.includes('THURSDAY') ? 'daysOn' : 'daysOff' }>Thu </span>
                <span className={repeats.includes('FRIDAY') ? 'daysOn' : 'daysOff' }>Fri </span>
                <span className={repeats.includes('SATURDAY') ? 'daysOn' : 'daysOff' }>Sat </span>
                <span className={repeats.includes('SUNDAY') ? 'daysOn' : 'daysOff' }>Sun</span>
            </div>
            return {...record, starts_at, ends_at, repeats, times, repeat_days, config}
        })
    }

    remove = (record) => {
        const payload = {
            ...record,
            invisible: true,
            config: JSON.stringify(record.config)
        }
        delete payload.repeat_days
        actions.hub.updateEventRules({hubId: record.hub_id, payload})
    }

    render() {
        const dataSource = this.generateData(this.props.rules)
        const columns = [
            {
                title: 'Rule Name',
                dataIndex: 'rule_name',
                key: 'rule_name',

            },
            {
                title: 'Times',
                dataIndex: 'times'
            },
            {
                title: 'Repeat Days',
                dataIndex: 'repeat_days'
            },
            {
                title: 'Enabled',
                dataIndex: 'active',
                render: (text, record) => record.active ? 'Enabled' : 'Disabled'
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, record) =>
                    <div>
                        <RuleActions.UpdateRuleModal rule={record} {...this.props}/>
                        <Divider type="vertical"/>
                        <Popconfirm
                            title="Are you sure remove this rule?"
                            onConfirm={()=>this.remove(record)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <a><Tooltip title="remove this rule">Remove</Tooltip></a>
                        </Popconfirm>
                    </div>
            }
        ]

        return (
            <Row type="flex" justify="center">
                <Col xs={22} lg={16}>
                    <Card className="advanced_block">
                        <Row type="flex" justify="center" gutter={24} align="middle" >
                            <Col xs={4} md={3} xxl={2} align="center" >
                                <NotificationOutlined style={{fontSize: 60}} />
                            </Col>
                            <Col xs={20} md={21} xxl={22}>
                                <b>Event rule definitions</b> can let you know when a sensor is triggered or when a space is occupied. Simply create a new rule, let us know what
                                should trigger that rule, and we&#39;ll let you know via email or SMS when it&#39;s triggered.<br/>
                                You can use event rules to be notified if someone enters or leaves the house if a sensor is placed above the front/back doors, or if you go away
                                on holiday you can set it up so that SOFIHUB lets you know if it sees movement at home. <a onClick={()=>this.setState({example: true})}>
                                Tell me more examples</a>.
                            </Col>
                        </Row>
                        <Divider />

                        <Table
                            style={{width: '100%'}}
                            scroll={{x: true}}
                            dataSource={dataSource}
                            columns={columns}
                            rowKey="hub_event_rule_id"
                            className="eventRuleTable"
                        />

                        <Row>
                            <RuleActions.CreateRuleModal {...this.props}/>
                        </Row>
                    </Card>
                </Col>
                <ExampleModal
                    open={this.state.example}
                    onClose={()=>{ this.setState({example: false})}}
                />
            </Row>
        )
    }
}

EventRuleDefinitions.propTypes={
    rules: PropTypes.array
}

import { Col, Row, Table, } from 'antd'
import PropTypes from 'prop-types'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import RuleActions from '../Definitions/DefinitionAction'
import { sortDateTime } from '@/utility/Common'

const EventRuleLogs = (props) => {
    const dataSource = props.logs?.sort((a,b)=>sortDateTime(b.event_at,a.event_at))
    const columns = [
        {
            title: 'Date and Time',
            dataIndex: 'event_at',
            key: 'event_at',
            render: text=>moment(text).format(globalConstants.LONGDATETIME_FORMAT)

        },
        {
            title: 'Name of triggered rule',
            dataIndex: 'rule_name',
            key: 'rule_name',
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => {
                const rule = props.rules?.find(rule=>record.rule_id === rule.hub_event_rule_id)
                const config = typeof rule.config === 'object' ? rule.config : JSON.parse(rule?.config)
                rule.starts_at = config?.time_frame?.starts_at
                rule.ends_at = config?.time_frame?.ends_at
                rule.repeats = config?.time_frame?.repeats
                rule.config = config
                return <div>
                    <RuleActions.SeeRuleModal rule={rule} {...props}/>
                </div>}
        }
    ]
    return (
        <Row type="flex" justify="center">
            <Col xs={22} lg={16}>
                <Table scroll={{x: true}}
                    dataSource={dataSource}
                    columns={columns}
                    size="small"
                    rowKey="hub_event_rule_log_id"
                />
            </Col>
        </Row>
    )
}

EventRuleLogs.propTypes={
    logs: PropTypes.array,
    rules: PropTypes.array
}

export default EventRuleLogs

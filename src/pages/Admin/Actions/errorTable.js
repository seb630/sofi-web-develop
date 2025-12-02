import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { Row, Table } from 'antd'
import moment from 'moment-timezone'
import { globalConstants } from '../../../_constants'
import { sortDateTime } from '../../../utility/Common'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    loading: state.hub.loading,
    timezone: state.user.useHubTimeZone && state.setting.settings?.preferences?.timezone,
    errors: state.hub.errors || [],
})

class ErrorTable extends Component{
    constructor(props) {
        super(props)
        this.state = {
            pagination: {},
            data: [],
        }
    }

    componentDidUpdate(prevProps){
        if (prevProps.errors !== this.props.errors) {
            const pagination = { ...this.state.pagination }
            pagination.total = this.props.errors.total_elements
            this.setState({
                data: this.props.errors.content,
                pagination
            })
        }
    }

    handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination }
        pager.current = pagination.current
        this.setState({
            pagination: pager,
        })
        const order = sorter.order === 'descend' ? 'desc' : 'asc'
        const filter = filters.level && filters.level.length===1 ? filters.level[0]: null
        actions.hub.getHubErrors({
            hubId:this.props.selectedHub.hub_id,
            size: pagination.pageSize,
            page:pagination.current-1,
            filter,
            sorter: sorter.field ? sorter.field+','+order : 'occurred_at'+','+order
        })
    }

    render(){
        this.props.timezone && moment.tz.setDefault(this.props.timezone)
        const columns = [{
            title: 'Last Occurred',
            dataIndex: 'occurred_at',
            defaultSortOrder: 'descend',
            sorter: (a, b) => sortDateTime(a.occurred_at, b.occurred_at),
            render: time => moment(time).format(globalConstants.LONGDATETIME_FORMAT),
            width: '20%',
        }, {
            title: 'Level',
            dataIndex: 'level',
            filters: [
                { text: 'WARNING', value: 'WARNING' },
                { text: 'SEVERE', value: 'SEVERE' },
            ],
            onFilter: (value, record) => record.level.includes(value),
            width: '10%',
        }, {
            title: 'Source',
            dataIndex: 'source',
            width: '25%'
        }, {
            title: 'Message',
            dataIndex: 'content',
            width: '45%'
        }]

        return (
            <Row type="flex" justify="center">
                <Table scroll={{x: true}}
                    rowKey={record => record.error_id}
                    loading={this.props.loading}
                    columns={columns}
                    dataSource={this.state.data}
                    onChange={this.handleTableChange}
                    pagination={this.state.pagination}
                    expandedRowRender={record => <pre style={{ margin: 0 }}>{record.details}</pre>}
                />
            </Row>
        )
    }
}


export default connect(mapStateToProps, null) (ErrorTable)

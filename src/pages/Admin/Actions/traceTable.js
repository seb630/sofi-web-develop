import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import { Row, Table, Col, Button, message } from 'antd'
import moment from 'moment-timezone'
import { globalConstants } from '../../../_constants'
import FileSaver from 'file-saver'
import hubService from '../../../services/Hub'
import { sortDateTime } from '../../../utility/Common'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    loading: state.hub.loading,
    timezone: state.user.useHubTimeZone && state.setting.settings?.preferences?.timezone,
    traceFiles: state.hub.traceFiles || [],
})

class TraceTable extends Component{
    constructor(props) {
        super(props)
        this.state = {
            pagination: {},
            data: [],
        }
    }

    componentDidUpdate(prevProps){
        if (prevProps.traceFiles !== this.props.traceFiles) {
            const pagination = { ...this.state.pagination }
            pagination.total = this.props.traceFiles.total_elements
            this.setState({
                data: this.props.traceFiles.content,
                pagination
            })
        }
    }

    handleTableChange = (pagination) => {
        const pager = { ...this.state.pagination }
        pager.current = pagination.current
        this.setState({
            pagination: pager,
        })
        actions.hub.getHubTraceFiles({
            hubId:this.props.selectedHub.hub_id,
            size: pagination.pageSize,
            page: pagination.current-1,
        })
    }

    handleDownload = (record) => {
        hubService.eventTraceFile(record.trace_id)
            .then(file => {
                FileSaver.saveAs(file, record.filename)
            })
            .catch(error => { console.log(error)})
    }

    handleRequest = () => {
        actions.hub.hubTraceUpload(this.props.selectedHub.hub_id)
        message.success('Request sent, please refresh the page after 1 minute')
    }

    render(){
        this.props.timezone && moment.tz.setDefault(this.props.timezone)
        const columns = [{
            title: 'Filename',
            dataIndex: 'filename',
            width: '50%',
            render: (filename, record) =>
                <div onClick={()=>this.handleDownload(record)}>{filename}<DownloadOutlined /></div>
        }, {
            title: 'Uploaded At',
            dataIndex: 'uploaded_at',
            render: time => moment(time).format(globalConstants.LONGDATETIME_FORMAT),
            width: '50%',
            sorter: (a, b) => sortDateTime(a.uploaded_at, b.uploaded_at),
            defaultSortOrder: 'descend',
        }]

        return (
            <Row type="flex" justify="center">
                <Col xs={24} sm={16} md={24} lg={16}>
                    <Table scroll={{x: true}}
                        rowKey={record => record.trace_id}
                        loading={this.props.loading}
                        columns={columns}
                        dataSource={this.state.data}
                        onChange={this.handleTableChange}
                        pagination={this.state.pagination}
                        title={()=> <Button icon={<UploadOutlined />} onClick={this.handleRequest}>Request Trace Upload</Button>}
                    />
                </Col>
            </Row>
        )
    }
}


export default connect(mapStateToProps, null) (TraceTable)

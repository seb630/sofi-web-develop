import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { CloudDownloadOutlined, DownloadOutlined, RetweetOutlined, WarningOutlined } from '@ant-design/icons'
import { Button, Row, Col, message } from 'antd'
import ErrorTable from './errorTable'
import TraceTable from './traceTable'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    loading: state.hub.loading,
    timezone: state.user.useHubTimeZone && state.setting.settings?.preferences?.timezone,
    errors: state.hub.errors || [],
})

class Actions extends Component{
    constructor(props) {
        super(props)
        this.state = {
            showErrors: false,
            traceFiles: false,
            pagination: {},
            data: [],
        }
    }

    handleRestart = () => {
        actions.hub.restartHub(this.props.selectedHub.hub_id)
        message.success('Hub is restarting')
    }

    handleCheckUpdate = () => {
        actions.hub.checkForUpdate(this.props.selectedHub.hub_id)
        message.success('Update request sent')
    }

    handleError = () => {
        actions.hub.getHubErrors({hubId:this.props.selectedHub.hub_id, page:0})
        this.setState({showErrors: !this.state.showErrors, traceFiles: false})
    }

    handleTraceFiles = () => {
        actions.hub.getHubTraceFiles({hubId:this.props.selectedHub.hub_id, page:0})
        this.setState({traceFiles: !this.state.traceFiles, showErrors: false})
    }

    render(){
        return (
            <div>
                <Row gutter={24}>
                    <Col offset={2} span={5}>
                        <Button icon={<RetweetOutlined />} onClick={this.handleRestart}>Restart</Button>
                    </Col>
                    <Col span={5}>
                        <Button icon={<CloudDownloadOutlined />} onClick={this.handleCheckUpdate}>Check Update</Button>
                    </Col>
                    <Col span={5}>
                        <Button icon={<WarningOutlined />} onClick={this.handleError}>Error Logs</Button>
                    </Col>
                    <Col span={5}>
                        <Button icon={<DownloadOutlined />} onClick={this.handleTraceFiles}>Trace Files</Button>
                    </Col>
                </Row>
                {this.state.showErrors &&
                    <ErrorTable />
                }
                {this.state.traceFiles &&
                    <TraceTable />
                }
            </div>
        )
    }
}


export default connect(mapStateToProps, null) (Actions)

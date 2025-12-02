import { Component } from 'react'
import { connect } from 'mirrorx'
import { DashboardOutlined, HddOutlined, LockOutlined, UsbOutlined } from '@ant-design/icons'
import { Card, Col, List, Modal, Progress, Row, Table } from 'antd'
import PrettyBytes from '../../../utility/prettyBytes'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    hubStatus: state.hub.hubStatus
})

class Resource extends Component{
    constructor(props) {
        super(props)
        this.state = {
            showModal: false,
            title: '',
            partition: null,
        }
    }

    showBreakDown = (title, partition) => {
        this.setState({
            showModal: true,
            title,
            partition
        })
    }

    handleClose = () => {
        this.setState({
            showModal: false,
            title: '',
            partition: null
        })
    }

    getUsagePercent = (partition) => {
        if (partition) {
            const used = partition.consumed_space
            const total = partition.total_space
            return parseFloat(((used / total) * 100).toFixed(1))
        }
    }

    renderDirUsage = () => {
        if (this.state.partition) {
            const data = Object.entries(this.state.partition.directory_sizes).map(([key, val]) => {
                return {path: key, size: PrettyBytes(val * 1000)}
            })

            const columns = [{
                title: 'Path',
                dataIndex: 'path',
                width: '80%',
            }, {
                title: 'Size',
                dataIndex: 'size',
                width: '20%',
            }]
            return (
                <div>
                    <Progress percent={this.getUsagePercent(this.state.partition)}/>
                    <Table scroll={{x: true}}
                        rowKey={record => record.path}
                        columns={columns}
                        dataSource={data}
                        pagination={false}
                    />
                </div>
            )
        }else {
            return (
                <p>Unknown</p>
            )
        }
    }
    render(){
        const data = [
            {
                title: <div><DashboardOutlined />CPU</div>,
                content: this.props.hubStatus && this.props.hubStatus.cpu_usage &&
                <Progress type="dashboard" percent={this.props.hubStatus.cpu_usage}/>
            },
            {
                title: <div><HddOutlined />RAM</div>,
                content: this.props.hubStatus && this.props.hubStatus.ram_usage &&
                <Progress type="dashboard" percent={this.props.hubStatus.ram_usage}/>
            },
            {
                title: <a onClick={()=>this.showBreakDown('OS Partition',this.props.hubStatus.disk_usage.os_partition)}>
                    <UsbOutlined />OS Partition</a>,
                content: this.props.hubStatus && this.props.hubStatus.disk_usage &&
                <Progress
                    type="dashboard"
                    percent={this.getUsagePercent(this.props.hubStatus.disk_usage.os_partition)}
                />
            },
            {
                title: <a onClick={()=>this.showBreakDown('Encrypted Partition',this.props.hubStatus.disk_usage.encrypted_partition)}>
                    <LockOutlined />Encrypted Partition</a>,
                content: this.props.hubStatus && this.props.hubStatus.disk_usage &&
                <Progress
                    type="dashboard"
                    percent={this.getUsagePercent(this.props.hubStatus.disk_usage.encrypted_partition)}
                />
            },
        ]
        return (
            <Row>
                <Col offset={2} span={20}>
                    <List
                        grid={{ gutter: 16, xs: 2, xxl: 4 }}
                        dataSource={data}
                        renderItem={item => (
                            <List.Item>
                                <Card title={item.title}>{item.content}</Card>
                            </List.Item>
                        )}
                    />
                </Col>
                <Modal
                    open={this.state.showModal} onCancel={this.handleClose}
                    centered={false} title={this.state.title}  style={{height: '300px'}}
                    footer={null}
                >
                    {this.renderDirUsage()}
                </Modal>
            </Row>)
    }
}


export default connect(mapStateToProps, null) (Resource)

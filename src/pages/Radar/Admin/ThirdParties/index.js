import { Component, Fragment } from 'react'
import {actions, connect} from 'mirrorx'
import {sortString} from '@/utility/Common'
import { DeleteOutlined } from '@ant-design/icons'
import { Table, Row, Col, Card, message, Divider, Popconfirm, Tooltip } from 'antd'
import TPActions from './TPAction'
import {isMobile} from 'react-device-detect'

const mapStateToProps = state => ({
    TPs: state.radar.TPs,
    TPDestinations: state.thirdParty.TPDestinations,
    radarTPCandidates: state.radar.radarTPCandidates,
    selectedRadar: state.radar.selectedRadar,
    TPKinds: state.thirdParty.TPKinds,
    userOrgs: state.user.userOrgs?.map(userOrg=>userOrg.organization),
    isAdmin: state.user.me ? state.user.me.authorities.some(role=>role.includes('ADMIN')) : false,
})

class RadarTPAccount extends Component {
    constructor(props) {
        super(props)
        this.state = {
            listTPs: props.TPs
        }
    }

    /** component did update*/
    componentDidUpdate(prevProps) {
        prevProps.TPs !== this.props.TPs && this.setState({
            listTPs: this.props.TPs })
    }

    delete = (record) => {
        const radarId = this.props.selectedRadar.id
        actions.radar.deleteTPAccount({radarId, id: record.id}).then(()=>{
            message.success('Delete Success')
        }).catch(()=>{
            message.error('Could not delete third party integration')
        })
    }

    render() {
        const { listTPs } = this.state
        const columns = [
            {
                title: 'Integration Type',
                dataIndex: 'kind',
                key: 'kind',
                sorter: (a, b) => sortString(a,b,'kind'),
            },
            {
                title: 'Account Number',
                dataIndex: 'account_number',
                key: 'account_number',
            },
            {
                title: 'Destination Name',
                dataIndex: 'destination_name',
                key: 'destination_name',
            },
            {
                title: 'Alert Escalation Delay',
                dataIndex: 'alert_escalation_delay',
                key: 'alert_escalation_delay',
            },
            {
                title: 'Primary Endpoint',
                dataIndex: 'endpoint1',
                key: 'endpoint1',
            },
            {
                title: 'Secondary Endpoint',
                dataIndex: 'endpoint2',
                key: 'endpoint2',
            },
            {
                title: 'Action',
                dataIndex: '',
                key: 'x',
                render: (record) => <Fragment>
                    <TPActions.UpdateTPModal
                        model={record}
                        destinations={this.props.TPDestinations?.length!==0 ? this.props.TPDestinations : this.props.radarTPCandidates}
                        selectedRadar={this.props.selectedRadar}
                        kinds={this.props.TPKinds}
                    />
                    <Divider type={'vertical'}/>
                    <Popconfirm
                        title="Are you sure delete this integration?"
                        onConfirm={()=>this.delete(record)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete this integration"><DeleteOutlined /></Tooltip>
                    </Popconfirm>
                </Fragment>
            }
        ]

        const renderTable =
            <Table scroll={{x: true}} id="table-TP"  loading={listTPs === null} columns={columns}
                dataSource={listTPs} rowKey="id"  footer={()=><Row type="flex" gutter={15} align="middle">
                    <Col span={24}>
                        <TPActions.CreateTPModal
                            destinations={this.props.TPDestinations?.length!==0 ? this.props.TPDestinations : this.props.radarTPCandidates}
                            selectedRadar={this.props.selectedRadar}
                            kinds={this.props.TPKinds}
                            orgs={this.props.userOrgs}
                            admin={this.props.isAdmin}
                        />
                    </Col>
                </Row>}/>
        return (
            <Fragment>
                {isMobile ?
                    <Fragment>
                        <Row type="flex" justify="center">
                            <Col xs={24} xl={20}>
                                <h4>Third Party Integration</h4>
                            </Col>
                        </Row>
                        <Row type="flex" justify="center">
                            <Col xs={24} xl={20}>
                                {renderTable}
                            </Col>
                        </Row>
                    </Fragment>
                    : <Row type="flex" justify="center">
                        <Col xs={24} xl={20}>
                            <Card className="beacon-card" title="Third Party Integration">
                                {renderTable}
                            </Card>
                        </Col>
                    </Row>
                }
            </Fragment>
        )
    }
}

export default connect(mapStateToProps,{})(RadarTPAccount)

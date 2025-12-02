import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { sortDateTime, sortString } from '@/utility/Common'
import { DeleteOutlined } from '@ant-design/icons'
import { Col, Divider, Input, message, Popconfirm, Row, Table, Tooltip } from 'antd'
import TPActions from './TPAction'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import { isMobile } from 'react-device-detect'

const mapStateToProps = state => ({
    TPDestinations: state.thirdParty.TPDestinations,
    TPKinds: state.thirdParty.TPKinds,
    orgs: state.organisation.orgs
})

class TPTable extends Component {
    constructor(props) {
        super(props)

        this.state = {
            search: '',
            listDestinations: props.TPDestinations
        }
    }

    /** component did update*/
    componentDidUpdate(prevProps) {
        prevProps.TPDestinations !== this.props.TPDestinations && this.setState({
            listDestinations: this.props.TPDestinations })
    }

    /** handle search */
    handleSearch = (value) => {
        const { TPDestinations } = this.props
        if (value === '' ){
            this.setState ({ search:'', listDestinations: TPDestinations})
        }else{
            this.setState({ search: value,listDestinations: TPDestinations.filter(
                record => record.kind.toLowerCase().includes(value.toLowerCase()) ||
                    record.endpoint1.toLowerCase().includes(value.toLowerCase()) ||
                    record.endpoint2.toLowerCase().includes(value.toLowerCase()) ||
                    record.endpoint3.toLowerCase().includes(value.toLowerCase())
            )})
        }
    }

    delete = (record) => {
        actions.thirdParty.deleteDestination(record.destination_id).then(()=>{
            message.success('Delete Success')
        }).catch(()=>{
            message.error('Could not delete third party integration destination, there may still be hubs or beacons using this endpoint.')
        })
    }

    renderHeader = () => {
        return (<Fragment>
            <Row type="flex" gutter={15} align="middle" className="margin-bottom">
                <Col>
                    <Input.Search
                        placeholder="Search here ..."
                        onSearch={value => this.handleSearch(value)}
                        enterButton
                        autoFocus = {!isMobile}
                    />

                </Col>
            </Row>
        </Fragment>
        )
    }

    render() {
        const { listDestinations } = this.state
        const columns = [
            {
                title: 'ID',
                dataIndex: 'destination_id',
                key: 'destination_id',
                sorter: (a, b) => sortString(a,b,'destination_id'),
            },
            {
                title: 'Kind',
                dataIndex: 'kind',
                key: 'kind',
                sorter: (a, b) => sortString(a,b,'kind'),
            },
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: 'Organisational Owner',
                dataIndex: 'organization_name',
            },
            {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
            },
            {
                title: 'Primary Endpoint IP:Port',
                dataIndex: 'endpoint1',
                key: 'endpoint1',
            },
            {
                title: 'Secondary Endpoint IP:Port',
                dataIndex: 'endpoint2',
                key: 'endpoint2',
            },
            {
                title: 'Third Endpoint IP:Port',
                dataIndex: 'endpoint3',
                key: 'endpoint3',
            },
            {
                title: 'Timeout',
                dataIndex: 'timeout',
                key: 'timeout',
            },
            {
                title: 'Last Modified',
                dataIndex: 'last_modified_at',
                key: 'last_modified_at',
                defaultSortOrder: 'descend',
                sorter: (a, b) => sortDateTime(a.last_modified_at, b.last_modified_at),
                render: (text) => text && moment(text).format(globalConstants.LONGDATETIME_FORMAT)
            },
            {
                title: 'Action',
                dataIndex: '',
                key: 'x',
                render: (record) => <Fragment>
                    <TPActions.UpdateTPModal model={record} kinds={this.props.TPKinds} orgs={this.props.orgs} admin />
                    <Divider type={'vertical'}/>
                    <Popconfirm
                        title="Are you sure delete this destination?"
                        onConfirm={()=>this.delete(record)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete this destination"><DeleteOutlined /></Tooltip>
                    </Popconfirm>
                </Fragment>
            }
        ]
        return (<Fragment>
            <Table scroll={{x: true}}
                loading={listDestinations === null}
                className="margin-bottom"
                columns={columns}
                dataSource={listDestinations}
                rowKey="destination_id"
                title={this.renderHeader} />
            <Row>
                <TPActions.CreateTPModal kinds={this.props.TPKinds} orgs={this.props.orgs} admin/>
            </Row>
        </Fragment>)
    }
}

export default connect(mapStateToProps,{})(TPTable)

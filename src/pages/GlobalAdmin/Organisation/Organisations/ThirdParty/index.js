import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { hasAccess, sortDateTime, sortString } from '@/utility/Common'
import { DeleteOutlined } from '@ant-design/icons'
import { Divider, message, Popconfirm, Row, Table, Tooltip } from 'antd'
import TPActions from '../../../ThirdParties/TPAction'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import AccessDenied from '../../../../../components/AccessDeny'

const mapStateToProps = state => ({
    TPDestinations: state.organisation.orgTPs,
    TPKinds: state.thirdParty.TPKinds,
    orgs: state.organisation.orgs,
    myPrivileges: state.user.myPrivileges,
    admin: state.user.me ? state.user.me.authorities.some(role=>role.includes('ADMIN')) : false,
})

class OrgTP extends Component {
    constructor(props) {
        super(props)

        this.state = {
            search: '',
            listDestinations: props.TPDestinations
        }
    }

    componentDidMount() {
        this.fetchData()
    }

    fetchData = () =>{
        const {currentOrg, myPrivileges, admin, TPKinds, orgs} = this.props
        if (hasAccess('ORG_VIEW_THIRD_PARTY_ENDPOINT', currentOrg, myPrivileges, admin)) {
            actions.organisation.fetchOrgTPs(currentOrg.organization_id)
            !TPKinds && actions.thirdParty.fetchAllKinds()
        }
        !orgs && !currentOrg && actions.organisation.fetchAllOrgs()
    }

    /** component did update*/
    componentDidUpdate(prevProps) {
        prevProps.currentOrg!==this.props.currentOrg && this.fetchData()
        prevProps.TPDestinations !== this.props.TPDestinations && this.setState({
            listDestinations: this.props.TPDestinations })
    }

    delete = (record) => {
        const orgId = this.props.currentOrg.organization_id
        actions.organisation.deleteOrgTP({orgId, destinationId:record.destination_id}).then(()=>{
            message.success('Delete Success')
        }).catch(()=>{
            message.error('Could not delete third party integration destination, there may still be hubs or beacons using this endpoint.')
        })
    }

    render() {
        const {TPKinds, orgs, currentOrg, admin} = this.props
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
                    <AccessDenied currentOrg={currentOrg} privilege="ORG_UPDATE_THIRD_PARTY_ENDPOINT" hasModal={false}>
                        <TPActions.UpdateTPModal model={record} kinds={TPKinds} orgs={orgs}  currentOrg={currentOrg} admin={admin}/>
                    </AccessDenied>
                    <Divider type={'vertical'}/>
                    <AccessDenied currentOrg={currentOrg} privilege="ORG_DELETE_THIRD_PARTY_ENDPOINT" hasModal={false}>
                        <Popconfirm
                            title="Are you sure delete this destination?"
                            onConfirm={()=>this.delete(record)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Tooltip title="Delete this destination"><DeleteOutlined /></Tooltip>
                        </Popconfirm>
                    </AccessDenied>
                </Fragment>
            }
        ]
        return (
            <AccessDenied currentOrg={currentOrg} privilege="ORG_VIEW_THIRD_PARTY_ENDPOINT">
                <div className="contentPage">
                    <Row>
                        <Table scroll={{x: true}}
                            loading={listDestinations === null}
                            className="margin-bottom"
                            columns={columns}
                            dataSource={listDestinations}
                            rowKey="destination_id"
                        />
                    </Row>
                    <AccessDenied currentOrg={currentOrg} privilege="ORG_CREATE_THIRD_PARTY_ENDPOINT" hasModal={false}>
                        <Row>
                            <TPActions.CreateTPModal kinds={TPKinds} orgs={orgs} currentOrg={currentOrg} admin={admin}/>
                        </Row>
                    </AccessDenied>
                </div>
            </AccessDenied>)
    }
}

export default connect(mapStateToProps,{})(OrgTP)

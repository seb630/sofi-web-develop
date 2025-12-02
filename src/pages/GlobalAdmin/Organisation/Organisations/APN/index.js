import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { hasAccess, sortString } from '@/utility/Common'
import { DeleteOutlined } from '@ant-design/icons'
import { Divider, message, Popconfirm, Row, Table, Tooltip } from 'antd'
import AccessDenied from '../../../../../components/AccessDeny'
import APNActions from '../../../APNs/ApnAction'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    orgAPNs: state.organisation.orgAPNs,
    myPrivileges: state.user.myPrivileges,
    admin: state.user.me ? state.user.me.authorities.some(role=>role.includes('ADMIN')) : false,
})

class OrgAPN extends Component {
    constructor(props) {
        super(props)

        this.state = {
            search: '',
            listAPNs: props.orgAPNs
        }
    }

    componentDidMount() {
        this.fetchData()
    }

    fetchData = () =>{
        const {currentOrg, myPrivileges, admin} = this.props
        if (hasAccess('ORG_VIEW_BEACON_APN', currentOrg,myPrivileges, admin)){
            actions.organisation.fetchOrgAPNs(currentOrg.organization_id)
        }
    }

    /** component did update*/
    componentDidUpdate(prevProps) {
        prevProps.currentOrg!==this.props.currentOrg && this.fetchData()
        prevProps.orgAPNs !== this.props.orgAPNs && this.setState({
            listAPNs: this.props.orgAPNs })
    }

    delete = (record) => {
        const orgId = this.props.currentOrg.organization_id
        actions.organisation.deleteOrgAPN({orgId, apnId: record.pub_id}).then(()=>{
            message.success('Delete Success')
        }).catch(()=>{
            message.error(`Could not delete APN, there may still be ${globalConstants.PENDANT_GENERIC}s using this APN.`)
        })
    }



    render() {
        const { currentOrg, admin} = this.props
        const { listAPNs } = this.state

        const columns = [
            {
                title: 'APN Name',
                dataIndex: 'apn_name',
                key: 'apn_name',
                sorter: (a, b) => sortString(a,b,'apn_name'),
            },
            {
                title: 'APN Value',
                dataIndex: 'apn_value',
                key: 'apn_value',
            },
            {
                title: 'Archived',
                dataIndex: 'apn_archived',
                key: 'apn_archived',
                filters: [
                    {
                        text: 'Yes',
                        value: true,
                    },
                    {
                        text: 'No',
                        value: false,
                    },
                ],
                onFilter: (value, record) => `${record.apn_archived}` === `${value}` ,
                render: (value) => value ? 'Yes' : 'No'
            },
            {
                title: 'Action',
                dataIndex: '',
                key: 'x',
                render: (record) => <Fragment>
                    <AccessDenied currentOrg={currentOrg} privilege="ORG_UPDATE_BEACON_APN" hasModal={false}>
                        <APNActions.UpdateAPNModal model={record} currentOrg={currentOrg} admin={admin}/>
                    </AccessDenied>
                    <Divider type={'vertical'}/>
                    <AccessDenied currentOrg={currentOrg} privilege="ORG_DELETE_BEACON_APN" hasModal={false}>
                        <Popconfirm
                            title="Are you sure delete this APN?"
                            onConfirm={()=>this.delete(record)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Tooltip title="Delete this APN"><DeleteOutlined /></Tooltip>
                        </Popconfirm>
                    </AccessDenied>
                </Fragment>
            }
        ]
        return (
            <AccessDenied currentOrg={currentOrg} privilege="ORG_VIEW_BEACON_APN">
                <div className="contentPage">
                    <Table scroll={{x: true}}
                        loading={listAPNs === null}
                        className="margin-bottom"
                        columns={columns}
                        dataSource={listAPNs}
                        rowKey="id"
                    />
                    <AccessDenied currentOrg={currentOrg} privilege="ORG_CREATE_BEACON_APN" hasModal={false}>
                        <Row>
                            <APNActions.CreateAPNModal currentOrg={currentOrg} admin={admin}/>
                        </Row>
                    </AccessDenied>
                </div>
            </AccessDenied>)
    }
}

export default connect(mapStateToProps,{})(OrgAPN)

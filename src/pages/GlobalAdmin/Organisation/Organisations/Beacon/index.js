import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import { Badge, Button, message, Popconfirm, Space, Table, Tooltip } from 'antd'
import { hasAccess, sortString } from '@/utility/Common'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import AddBeaconOrgModal from './AddBeaconOrgModal'
import AccessDenied from '../../../../../components/AccessDeny'

const mapStateToProps = state => ({
    orgBeacons: state.organisation.orgBeacons,
    allBeacons: state.sofiBeacon.allBeacons,
    myPrivileges: state.user.myPrivileges,
    admin: state.user.me ?.authorities.some(role=>role.includes('ADMIN')),
})

class OrgBeacons extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.fetchData()
    }

    fetchData = () =>{
        const { currentOrg, allBeacons, admin, myPrivileges } = this.props
        if (hasAccess('ORG_VIEW_ORG_BEACON', currentOrg,myPrivileges, admin)){
            actions.organisation.fetchOrgBeacons(currentOrg.organization_id)
        }
        if (admin && (!allBeacons || allBeacons.length === 0)){ actions.sofiBeacon.fetchAllBeacons()}
    }

    componentDidUpdate(prevProps) {
        prevProps.currentOrg!==this.props.currentOrg && this.fetchData()
    }

    /** disassociate beacon */
    disassociate = (beacon, e) => {
        e.stopPropagation()
        let payload = {}
        payload.organization_id = this.props.currentOrg.organization_id
        payload.type = 'BEACON'
        payload.device_id_ref = beacon.pub_id

        actions.organisation.disassociateOrgDevice(payload).then(()=>{
            message.success('Organisation disassociated')
            actions.organisation.fetchOrgBeacons(this.props.currentOrg.organization_id)
        })
    }

    handleExport = () => {
        actions.organisation.selectOrg(this.props.currentOrg).then(()=>actions.routing.push('/globalAdmin/export-beacon'))
    }

    render() {
        const { orgBeacons, admin, currentOrg  } = this.props
        const columns = [
            {
                title: 'Name',
                dataIndex: 'display_name',
                key: 'display_name',
                sorter: (a, b) => sortString(a,b,'display_name'),
                render: (text, record) => admin? <a onClick= {() => {
                    actions.sofiBeacon.selectBeacon(record).then(()=>{
                        actions.common.save({adminPortal: false})
                        actions.routing.push('/beacon/dashboard')
                    })
                }
                }>
                    {text}
                </a> : text
            },
            {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
                sorter: (a, b) => sortString(a,b,'id'),
            },
            {
                title: 'Phone Number',
                dataIndex: 'phone',
                key: 'phone',
                sorter: (a, b) => sortString(a,b,'phone'),
            },
            {
                title: 'Archived',
                dataIndex: 'archived',
                key: 'archived',
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
                onFilter: (value, record) => `${record.archived}` == value ,
                render(val) {
                    return <Badge status={val ? 'success':'error'} text={val ? 'Yes': 'No'} />
                },
            },
            {
                title: 'Battery %',
                dataIndex: 'battery_level',
                render: (text) => <span> {text || 'No Data Yet'} </span>
            },
            {
                title: 'Battery Updated',
                dataIndex: 'battery_updated_at',
                render: (value) => value ? moment(value).format(globalConstants.DATETIME_FORMAT) : 'No Data Yet'
            },
            {
                title: 'Charging ?',
                dataIndex: 'charging',
                render: (value) => value ? 'Yes' : 'No'
            },
            {
                title: 'Charging Updated',
                dataIndex: 'charging_last_updated',
                render: (value) => value ? moment(value).format(globalConstants.DATETIME_FORMAT) : 'No Data Yet'
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, beacon) => (
                    <AccessDenied currentOrg={currentOrg} privilege="ORG_DELETE_ORG_BEACON" hasModal={false}>
                        <Popconfirm
                            title={`Are you sure detach this ${globalConstants.PENDANT_GENERIC}? ${currentOrg.name} will no longer be able to access and manage this ${globalConstants.PENDANT_GENERIC}.`}
                            onConfirm={(e)=>this.disassociate(beacon, e)}
                            okText="Yes"
                            cancelText="No"
                            onClick={e => {e.stopPropagation()}}
                        >
                            <a><Tooltip title="Disassociate this beacon">
                                <DeleteOutlined />
                            </Tooltip></a>
                        </Popconfirm>
                    </AccessDenied>
                ),
            }
        ]
        return (<AccessDenied currentOrg={currentOrg} privilege="ORG_VIEW_ORG_BEACON">
            <div className="contentPage">
                <Table scroll={{x: true}}
                    className="table"
                    loading={orgBeacons == null}
                    dataSource={orgBeacons}
                    columns={columns}
                    rowKey='id'
                />
                <Space style={{ marginTop: '16px'}} >
                    <AccessDenied currentOrg={currentOrg} privilege="ORG_ADD_ORG_BEACON" hasModal={false}> <AddBeaconOrgModal {...this.props} /></AccessDenied>
                    <Button size="large" icon={<SaveOutlined/>} onClick={this.handleExport}>Export Beacons</Button>
                </Space>
            </div>
        </AccessDenied>)
    }
}


export default connect(mapStateToProps)(OrgBeacons)

import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { DeleteOutlined } from '@ant-design/icons'
import { Table, Popconfirm, message, Tooltip, Badge } from 'antd'
import {hasAccess, sortDateTime, sortString} from '@/utility/Common'
import AddRadarOrgModal from './AddRadarOrgModal'
import AccessDenied from '../../../../../components/AccessDeny'
import moment from 'moment/moment'
import {globalConstants} from '@/_constants'

const mapStateToProps = state => ({
    orgRadars: state.organisation.orgRadars,
    radars: state.radar.radars,
    myPrivileges: state.user.myPrivileges,
    admin: state.user.me ?.authorities.some(role=>role.includes('ADMIN')),
})

class OrgRadars extends Component {

    componentDidMount() {
        this.fetchData()
    }

    fetchData = () =>{
        const { currentOrg, radars, admin, myPrivileges } = this.props
        if (hasAccess('ORG_VIEW_ORG_RADAR', currentOrg,myPrivileges, admin)){
            actions.organisation.fetchOrgRadars(currentOrg.organization_id)
        }
        if (admin && (!radars || radars.length === 0)){ actions.radar.fetchAllRadars()}
    }

    componentDidUpdate(prevProps) {
        prevProps.currentOrg!==this.props.currentOrg && this.fetchData()
    }

    /** disassociate beacon */
    disassociate = (radar, e) => {
        e.stopPropagation()
        let payload = {}
        payload.organization_id = this.props.currentOrg.organization_id
        payload.type = 'RADAR'
        payload.device_id_ref = radar.pub_id

        actions.organisation.disassociateOrgDevice(payload).then(()=>{
            message.success('Organisation disassociated')
            actions.organisation.fetchOrgRadars(this.props.currentOrg.organization_id)
        })
    }

    render() {
        const { orgRadars, admin, currentOrg  } = this.props
        const columns = [
            {
                title: 'Name',
                dataIndex: 'display_name',
                key: 'display_name',
                sorter: (a, b) => sortString(a,b,'display_name'),
                render: (text, record) => admin? <a onClick= {() => {
                    actions.radar.selectRadar(record).then(()=>{
                        actions.common.save({adminPortal: false})
                        actions.routing.push('/radar/dashboard')
                    })
                }
                }>
                    {text}
                </a> : text
            },
            {
                title: 'External ID',
                dataIndex: 'ext_id',
            },
            {
                title: 'Location',
                dataIndex: 'location',
            },
            {
                title: 'Status',
                dataIndex: 'status',
                filters: [
                    {
                        text: 'ONLINE',
                        value: 'ONLINE',
                    },
                    {
                        text: 'OFFLINE',
                        value: 'OFFLINE',
                    },
                ],
                onFilter: (value, record) => record.status?.includes(value),
                sorter: (a, b) => sortString(a,b,'status'),
                render(val) {
                    return <Badge status={val==='ONLINE'?'success':'error'} text={val} />
                },
            },
            {
                title: 'Version',
                dataIndex: 'fw_version',
                key: 'version',
                sorter: (a, b) => sortString(a,b,'fw_version')
            },
            {
                title: 'Last Seen At',
                dataIndex: 'last_seen_at',
                render: (value) =>  value ? moment(value).format(globalConstants.DATETIME_FORMAT) : 'No Data Yet',
                sorter: (a, b) => sortDateTime(a.last_seen_at,b.last_seen_at),
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, beacon) => (
                    <AccessDenied currentOrg={currentOrg} privilege="ORG_DELETE_ORG_RADAR" hasModal={false}>
                        <Popconfirm
                            title={`Are you sure detach this radar sensor? ${currentOrg.name} will no longer be able to access and manage this radar sensor.`}
                            onConfirm={(e)=>this.disassociate(beacon, e)}
                            okText="Yes"
                            cancelText="No"
                            onClick={e => {e.stopPropagation()}}
                        >
                            <a><Tooltip title="Disassociate this radar">
                                <DeleteOutlined />
                            </Tooltip></a>
                        </Popconfirm>
                    </AccessDenied>
                ),
            }
        ]
        return (<AccessDenied currentOrg={currentOrg} privilege="ORG_VIEW_ORG_RADAR">
            <div className="contentPage">
                <Table
                    scroll={{x: true}}
                    className="table"
                    loading={orgRadars == null}
                    dataSource={orgRadars}
                    columns={columns}
                    rowKey='id'
                />
                <AccessDenied currentOrg={currentOrg} privilege="ORG_ADD_ORG_RADAR" hasModal={false}> <AddRadarOrgModal {...this.props} /></AccessDenied>
            </div>
        </AccessDenied>)
    }
}


export default connect(mapStateToProps)(OrgRadars)

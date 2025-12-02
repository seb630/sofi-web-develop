import { Component, createRef } from 'react'
import { actions, connect } from 'mirrorx'
import { DeleteOutlined } from '@ant-design/icons'
import { message, Popconfirm, Table, Tooltip, Typography } from 'antd'
import { hasAccess, sortDateTime, sortString } from '@/utility/Common'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import AddHubOrgModal from './AddHubOrgModal'
import AccessDenied from '../../../../../components/AccessDeny'

const mapStateToProps = state => ({
    orgHubs: state.organisation.orgHubs,
    allHubs: state.hub.hubs,
    myPrivileges: state.user.myPrivileges,
    admin: state.user.me ?.authorities.some(role=>role.includes('ADMIN')),
})

class UserHubs extends Component{
    constructor(props) {
        super(props)
        this.recaptchaRef = createRef()
    }

    componentDidMount() {
        this.fetchData()
    }

    fetchData = () =>{
        const {currentOrg, myPrivileges, admin, allHubs} = this.props
        if (hasAccess('ORG_VIEW_ORG_HUB', currentOrg,myPrivileges, admin)) {
            actions.organisation.fetchOrgHubs(currentOrg.organization_id)
        }
        if (admin && (!allHubs || allHubs.length === 0)){ actions.hub.getHubs()}
    }

    componentDidUpdate(prevProps) {
        prevProps.currentOrg!==this.props.currentOrg && this.fetchData()
    }



    disassociate = (hub, e) => {
        e.stopPropagation()
        let payload = {}
        payload.organization_id = this.props.currentOrg.organization_id
        payload.type = 'HUB'
        payload.device_id_ref = hub.hub_id

        actions.organisation.disassociateOrgDevice(payload).then(()=>{
            message.success('Organisation disassociated')
            actions.organisation.fetchOrgHubs(this.props.currentOrg.organization_id)
        })
    }

    render(){
        const {admin, orgHubs, currentOrg} = this.props
        const dataSource = orgHubs
        const columns = [
            {
                title: 'Name',
                dataIndex: 'display_name',
                key: 'display_name',
                sorter: (a, b) => sortString(a,b,'display_name'),
                render: (text, record) => admin ? <a
                    onClick={ () => {
                        actions.hub.selectHub(record)
                        actions.common.save({adminPortal: false})
                        actions.routing.push('/dashboard')
                    }}>
                    {text}
                </a> : text
            },
            {
                title: 'ID',
                dataIndex: 'hub_id',
                key: 'hub_id',
                sorter: (a, b) => sortString(a,b,'hub_id'),
                render: (text) => <Typography.Text style={{width:120}} ellipsis={{tooltip: text}}>{text}</Typography.Text>
            },
            {
                title: 'MAC Address',
                dataIndex: 'mac_address',
                key: 'mac_address',
                sorter: (a, b) => sortString(a,b,'mac_address'),

            },
            {
                title: 'Connectivity',
                dataIndex: 'connectivity_state',
                key: 'connectivity_state',
            },
            {
                title: 'Last Message',
                dataIndex: 'last_heartbeat_at',
                key: 'last',
                sorter: (a, b) => sortDateTime(a.last_heartbeat_at, b.last_heartbeat_at),
                render: (text) => text && moment(text)
                    .format(globalConstants.LONGDATETIME_FORMAT)
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, hub) => (
                    <AccessDenied currentOrg={currentOrg} privilege="ORG_DELETE_ORG_HUB" hasModal={false}>
                        <Popconfirm
                            title={`Are you sure detach this ${globalConstants.HUB_GENERIC}? ${currentOrg.name} will no longer be able to access and manage this ${globalConstants.HUB_GENERIC}.`}
                            onConfirm={(e)=>this.disassociate(hub, e)}
                            okText="Yes"
                            cancelText="No"
                            onClick={e => {e.stopPropagation()}}
                        >
                            <a><Tooltip title={`Disassociate this ${globalConstants.HUB_GENERIC}`}>
                                <DeleteOutlined />
                            </Tooltip></a>

                        </Popconfirm>
                    </AccessDenied>
                ),
            },
        ]
        return (
            <AccessDenied currentOrg={currentOrg} privilege="ORG_VIEW_ORG_HUB">
                <div className="contentPage">
                    <Table scroll={{x: true}} className="table"
                        dataSource={dataSource}
                        columns={columns}
                        rowKey="hub_id"
                    />
                    <AccessDenied currentOrg={currentOrg} privilege="ORG_ADD_ORG_HUB" hasModal={false}><AddHubOrgModal {...this.props} /></AccessDenied>
                </div>
            </AccessDenied>)
    }
}


export default connect(mapStateToProps, null) (UserHubs)

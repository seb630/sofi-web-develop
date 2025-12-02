import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { DeleteOutlined } from '@ant-design/icons'
import { Divider, message, Popconfirm, Row, Table, Tooltip, Typography } from 'antd'
import { sortString } from '@/utility/Common'
import AccessDenied from '@/components/AccessDeny'
import PolicyAction from './PolicyAction'

const mapStateToProps = state => ({
    orgRoles: state.permission.orgRoles,
    predefinedRoles: state.permission.predefinedRoles,
    orgProfiles: state.permission.orgProfiles,
    predefinedProfiles: state.permission.predefinedProfiles,
    inheritingRoles: state.permission.inheritingRoles,
    roleProfiles: state.permission.roleProfiles,
    roleDependants: state.permission.roleDependants,
})

class OrgPolicies extends Component{
    constructor(props) {
        super(props)
    }

    delete = (role, e) => {
        e.stopPropagation()
        let payload = {}
        payload.organization_id = this.props.currentOrg.organization_id
        payload.security_role_id = role.security_role_id

        actions.permission.deleteRole(payload).then(()=>{
            message.success('Policy deleted')
        })
    }

    generateData = (orgRoles, predefinedRoles) => {
        const customised = orgRoles?.map(role=>({...role, source: 'customised'})) || []
        const predefined = predefinedRoles?.map(role=>({...role, source: 'predefined'})) || []
        return [...customised, ...predefined].filter(role=>role.type==='DATA')
    }

    dutyRoles = (orgRoles, predefinedRoles) => {
        const customised = orgRoles?.map(role=>({...role, source: 'customised'})) || []
        const predefined = predefinedRoles?.map(role=>({...role, source: 'predefined'})) || []
        return [...customised, ...predefined].filter(role=>role.type!=='DATA')
    }

    render(){
        const {orgRoles, predefinedRoles, currentOrg, orgProfiles, predefinedProfiles} = this.props
        const dataSource = this.generateData(orgRoles, predefinedRoles)
        const dutyRoles = this.dutyRoles(orgRoles, predefinedRoles)
        const profiles = this.dutyRoles(orgProfiles, predefinedProfiles)
        const columns = [
            {
                title: 'Name',
                dataIndex: 'name',
                sorter: (a, b) => sortString(a,b,'name')
            },
            {
                title: 'Description',
                dataIndex: 'description',
            },
            {
                title: 'Source',
                dataIndex: 'source',
            },
            {
                title: 'Action',
                render: (text, role) => (
                    role.source === 'predefined' ? <Typography.Text disabled>None</Typography.Text> : <Fragment>
                        <AccessDenied currentOrg={currentOrg} privilege="ORG_UPDATE_ROLE" hasModal={false}>
                            <PolicyAction.UpdatePolicyModal {...this.props} profiles={profiles} roles={dutyRoles} model={role}/>
                        </AccessDenied>
                        <Divider type="vertical"/>
                        <AccessDenied currentOrg={currentOrg} privilege="ORG_DELETE_ROLE" hasModal={false}>
                            <Popconfirm
                                title='Are you sure delete this policy?'
                                onConfirm={(e)=>this.delete(role, e)}
                                okText="Yes"
                                cancelText="No"
                                onClick={e => {e.stopPropagation()}}
                            >
                                <a><Tooltip title="Delete this policy">
                                    <DeleteOutlined />
                                </Tooltip></a>
                            </Popconfirm>
                        </AccessDenied>
                    </Fragment>

                ),
            },
        ]
        return (
            <AccessDenied currentOrg={currentOrg} privilege="ORG_VIEW_ROLE">
                <div className="contentPage">
                    <Row>
                        <Table scroll={{x: true}} className="table"
                            dataSource={dataSource}
                            columns={columns}
                            rowKey="security_role_id"
                        />
                    </Row>
                    <AccessDenied currentOrg={currentOrg} privilege="ORG_CREATE_ROLE" hasModal={false}>
                        <Row>
                            <PolicyAction.CreatePolicyModal {...this.props} profiles={profiles} roles={dutyRoles}/>
                        </Row>
                    </AccessDenied>
                </div>
            </AccessDenied>)
    }
}


export default connect(mapStateToProps, null) (OrgPolicies)

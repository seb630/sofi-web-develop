import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { DeleteOutlined } from '@ant-design/icons'
import { Divider, message, Popconfirm, Row, Table, Tooltip, Typography } from 'antd'
import { sortString } from '@/utility/Common'
import AccessDenied from '@/components/AccessDeny'
import RoleAction from './RoleAction'

const mapStateToProps = state => ({
    orgRoles: state.permission.orgRoles,
    predefinedRoles: state.permission.predefinedRoles,
    privileges: state.permission.privileges,
    inheritingRoles: state.permission.inheritingRoles,
    rolePrivileges: state.permission.rolePrivileges,
    roleDependants: state.permission.roleDependants,
})

class OrgRoles extends Component{
    constructor(props) {
        super(props)
    }

    delete = (role, e) => {
        e.stopPropagation()
        let payload = {}
        payload.organization_id = this.props.currentOrg.organization_id
        payload.security_role_id = role.security_role_id

        actions.permission.deleteRole(payload).then(()=>{
            message.success('Role deleted')
        })
    }

    generateData = (orgRoles, predefinedRoles) => {
        const customised = orgRoles?.map(role=>({...role, source: 'customised'})) || []
        const predefined = predefinedRoles?.map(role=>({...role, source: 'predefined'})) || []
        return [...customised, ...predefined].filter(role=>role.type!=='DATA')
    }

    render(){
        const {orgRoles, predefinedRoles, currentOrg, privileges} = this.props
        const dataSource = this.generateData(orgRoles, predefinedRoles)
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
                            <RoleAction.UpdateRoleModal {...this.props} roles={dataSource} model={role} privileges={privileges}/>
                        </AccessDenied>
                        <Divider type="vertical"/>
                        <AccessDenied currentOrg={currentOrg} privilege="ORG_DELETE_ROLE" hasModal={false}>
                            <Popconfirm
                                title='Are you sure delete this role?'
                                onConfirm={(e)=>this.delete(role, e)}
                                okText="Yes"
                                cancelText="No"
                                onClick={e => {e.stopPropagation()}}
                            >
                                <a><Tooltip title="Delete this role">
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
                    <Table scroll={{x: true}} className="table"
                        dataSource={dataSource}
                        columns={columns}
                        rowKey="security_role_id"
                    />
                    <AccessDenied currentOrg={currentOrg} privilege="ORG_CREATE_ROLE" hasModal={false}>
                        <Row>
                            <RoleAction.CreateRoleModal {...this.props} roles={dataSource} privileges={privileges}/>
                        </Row>
                    </AccessDenied>
                </div>
            </AccessDenied>)
    }
}


export default connect(mapStateToProps, null) (OrgRoles)

import { Component, Fragment } from 'react'
import { actions } from 'mirrorx'
import { DeleteOutlined } from '@ant-design/icons'
import { Row, Table, Popconfirm, message, Tooltip, Divider, Typography } from 'antd'
import { sortString } from '@/utility/Common'
import ProfileAction from './ProfileAction'
import AccessDenied from '../../../../../../components/AccessDeny'

class OrgProfiles extends Component{
    constructor(props) {
        super(props)
    }

    delete = (role, e) => {
        e.stopPropagation()
        let payload = {}
        payload.organization_id = this.props.currentOrg.organization_id
        payload.security_data_profile_id = role.security_data_profile_id
        actions.permission.deleteProfile(payload).then(()=>{
            message.success('Profile deleted')
        })
    }

    generateData = (orgProfiles, predefinedProfiles) => {
        const customised = orgProfiles?.map(profile=>({...profile, source: 'customised'})) || []
        const predefined = predefinedProfiles?.map(profile=>({...profile, source: 'predefined'})) || []
        return [...customised, ...predefined]
    }

    render(){
        const {orgProfiles, predefinedProfiles, currentOrg} = this.props
        const dataSource = this.generateData(orgProfiles, predefinedProfiles)
        const columns = [
            {
                title: 'Name',
                dataIndex: 'name',
                sorter: (a, b) => sortString(a,b,'name')
            },
            {
                title: 'Type',
                dataIndex: 'type',
            },
            {
                title: 'Source',
                dataIndex: 'source',
            },
            {
                title: 'Action',
                render: (text, profile) => (
                    profile.source === 'predefined' ? <Typography.Text disabled>None</Typography.Text> : <Fragment>
                        <AccessDenied currentOrg={currentOrg} privilege="ORG_UPDATE_DATA_PROFILE" hasModal={false}>
                            <ProfileAction.UpdateProfileModal {...this.props} model={profile}/>
                        </AccessDenied>
                        <Divider type="vertical"/>
                        <AccessDenied currentOrg={currentOrg} privilege="ORG_DELETE_DATA_PROFILE" hasModal={false}>
                            <Popconfirm
                                title='Are you sure delete this profile?'
                                onConfirm={(e)=>this.delete(profile, e)}
                                okText="Yes"
                                cancelText="No"
                                onClick={e => {e.stopPropagation()}}
                            >
                                <a><Tooltip title="Delete this profile">
                                    <DeleteOutlined />
                                </Tooltip></a>
                            </Popconfirm>
                        </AccessDenied>
                    </Fragment>

                ),
            },
        ]
        return (
            <AccessDenied currentOrg={currentOrg} privilege="ORG_VIEW_DATA_PROFILE" >
                <div className="contentPage">
                    <Table scroll={{x: true}} className="table"
                        dataSource={dataSource}
                        columns={columns}
                        rowKey="security_data_profile_id"
                    />
                    <AccessDenied currentOrg={currentOrg} privilege="ORG_CREATE_DATA_PROFILE" hasModal={false}>
                        <Row>
                            <ProfileAction.CreateProfileModal {...this.props}/>
                        </Row>
                    </AccessDenied>
                </div>
            </AccessDenied>)
    }
}

export default OrgProfiles

import { Component } from 'react'
import { Tabs  } from 'antd'
import Intro from './Intro'
import {actions, connect} from 'mirrorx'
import OrgRoles from './Role'
import Privileges from './Privilege'
import OrgProfiles from './Profile'
import OrgPolicies from './Policy'

const mapStateToProps = state => ({
    privileges: state.permission.privileges,
    users: state.organisation.orgUsers,
    userGroups: state.organisation.orgUserGroups,
    devices: [...(state.organisation.orgHubs || []),...(state.organisation.orgRadars || []), ...(state.organisation.orgBeacons||[])],
    orgDevices: state.organisation.orgDevices,
    deviceGroups: state.organisation.orgDeviceGroups,
    orgProfiles: state.permission.orgProfiles,
    predefinedProfiles: state.permission.predefinedProfiles,
    profileDependants: state.permission.profileDependants
})

class Permissions extends Component{
    constructor(props) {
        super(props)
        this.state = {
            activeKey: 'intro'
        }
    }

    componentDidMount() {
        this.fetchData()
    }

    fetchData = () =>{
        actions.organisation.fetchOrgDevices(this.props.currentOrg.organization_id)
        actions.permission.fetchOrgRoles(this.props.currentOrg.organization_id)
        actions.permission.fetchPredefinedRoles()
        actions.permission.fetchPrivileges()
        actions.permission.fetchOrgProfiles(this.props.currentOrg.organization_id)
        actions.permission.fetchPredefinedProfiles()
    }

    componentDidUpdate(prevProps) {
        prevProps.currentOrg!==this.props.currentOrg && this.fetchData()
    }

    onTabChanged = (key) => {
        this.setState({activeKey: key})
    }

    render(){
        return (
            <Tabs activeKey={this.state.activeKey} onChange={this.onTabChanged} style={{padding: '0 30px'}}>
                <Tabs.TabPane tab="Intro" key="intro">
                    <Intro {...this.props} onTabChanged={this.onTabChanged}/>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Policies" key="policies">
                    <OrgPolicies {...this.props}/>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Duty Roles" key="roles">
                    <OrgRoles {...this.props}/>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Privileges" key="privileges">
                    <Privileges {...this.props} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Security Data Profiles" key="profiles">
                    <OrgProfiles {...this.props}/>
                </Tabs.TabPane>
            </Tabs>
        )
    }
}

export default connect(mapStateToProps, null) (Permissions)

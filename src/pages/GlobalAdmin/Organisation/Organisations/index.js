import { Component } from 'react'
import { connect } from 'mirrorx'
import { Tabs } from 'antd'
import Profile from './Profile'
import OrgHubs from './Hub'
import OrgRadars from './Radar'
import OrgBeacons from './Beacon'
import Action from './Action'
import OrgContacts from './Contact'
import OrgUsers from './User'
import OrgDeviceGroups from './DeviceGroup'
import OrgUserGroups from './UserGroup'
import OrgTP from './ThirdParty'
import Permissions from './Permission'
import OrgAPN from './APN'
import { titleCase } from 'change-case'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    allOrgs: state.organisation.orgs
})

class Organisation extends Component{
    constructor(props) {
        super(props)
        this.state = {
            org: null,
        }
    }

    componentDidMount() {
        const { allOrgs , match } = this.props
        this.setState({
            org: allOrgs && allOrgs.find(org=>org.organization_id == match.params.orgId)
        })
    }

    componentDidUpdate(prevProps) {
        const { allOrgs , match } = this.props
        prevProps.allOrgs !== allOrgs && this.setState({
            org: allOrgs && allOrgs.find(org=>org.organization_id == match.params.orgId)
        })
    }

    render(){
        return (
            <div style={{ margin: '-30px' }}>
                <Tabs>
                    <Tabs.TabPane tab="Profile" key="Profile">
                        {this.state.org && <Profile currentOrg={this.state.org}/>}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Contacts" key="Contacts">
                        {this.state.org && <OrgContacts currentOrg={this.state.org}/>}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Users" key="Users">
                        {this.state.org && <OrgUsers currentOrg={this.state.org}/>}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={`${titleCase(globalConstants.HUB_GENERIC)}s`} key="H">
                        {this.state.org && <OrgHubs currentOrg={this.state.org}/>}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={`${titleCase(globalConstants.PENDANT_GENERIC)}s`} key="B">
                        {this.state.org && <OrgBeacons currentOrg={this.state.org}/>}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={`${titleCase(globalConstants.RADAR_GENERIC)}s`} key="R">
                        {this.state.org && <OrgRadars currentOrg={this.state.org}/>}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Permissions & Roles" key="Permissions">
                        {this.state.org && <Permissions currentOrg={this.state.org}/>}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Device Groups" key="DG">
                        {this.state.org && <OrgDeviceGroups currentOrg={this.state.org}/>}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="User Groups" key="UG">
                        {this.state.org && <OrgUserGroups currentOrg={this.state.org}/>}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="APNs" key="APN">
                        {this.state.org && <OrgAPN currentOrg={this.state.org} />}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Third Party Endpoints" key="TP">
                        {this.state.org && <OrgTP currentOrg={this.state.org} />}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Danger Zone" key="Delete">
                        {this.state.org && <Action currentOrg={this.state.org}/>}
                    </Tabs.TabPane>
                </Tabs>
            </div>
        )
    }
}


export default connect(mapStateToProps, null) (Organisation)

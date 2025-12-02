import { Component } from 'react'
import { connect } from 'mirrorx'
import { Tabs } from 'antd'
import Profile from './Profile'
import UserHubs from './Hub'
import UserBeacons from './Beacon'
import UserRadars from './Radar'
import Options from './Options'
import UserOrgs from './Org'
import { titleCase } from 'change-case'
import { globalConstants } from '@/_constants'
import UserNotifications from '@/pages/GlobalAdmin/Users/User/Notifications'

const mapStateToProps = state => ({
    allUsers: state.user.allUsers,
    me: state.user.me
})

class User extends Component{
    constructor(props) {
        super(props)
        this.state = {
            user: null,
        }
    }

    componentDidMount() {
        const { allUsers , match } = this.props
        this.setState({
            user: allUsers?.find(user=>user.user_id == match.params.userId)
        })
    }

    componentDidUpdate(prevProps)
    {
        const { allUsers , match } = this.props
        prevProps.allUsers !== allUsers && this.setState({
            user: allUsers?.find(user=>user.user_id == match.params.userId)
        })
    }

    render(){
        return (
            <div style={{ margin: '-30px' }}>
                <Tabs>
                    <Tabs.TabPane tab="Profile" key="1">
                        {this.state.user && <Profile currentUser={this.state.user}/>}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Notifications" key="notifications">
                        {this.state.user && <UserNotifications currentUser={this.state.user} me={this.props.me}/>}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Organisations" key="2">
                        {this.state.user && <UserOrgs currentUser={this.state.user}/>}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={`${titleCase(globalConstants.HUB_GENERIC)}s`} key="3">
                        {this.state.user && <UserHubs currentUser={this.state.user}/>}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={`${titleCase(globalConstants.PENDANT_GENERIC)}s`} key="4">
                        {this.state.user && <UserBeacons currentUser={this.state.user}/>}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={`${titleCase(globalConstants.RADAR_GENERIC)}s`} key="5">
                        {this.state.user && <UserRadars currentUser={this.state.user}/>}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Options" key="6">
                        {this.state.user && <Options currentUser={this.state.user}/>}
                    </Tabs.TabPane>
                </Tabs>
            </div>
        )
    }
}


export default connect(mapStateToProps, null) (User)

import { Component } from 'react'
import {Route, Redirect, actions, connect} from 'mirrorx'
import PortalLayout from '../Common/Layouts/PortalLayout'
import { Tabs, Layout } from  'antd'
import OtherNotifications from './Others'
import EventRuleLogs from './Logs'
import EventRuleDefinitions from './Definitions'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    me: state.user.me,
    logs: state.hub.eventRuleLogs,
    rules: state.hub.eventRules,
    carers: state.hub.hubUsers,
    spaces: state.hub.hubSpaces,
    devices: state.hub.hubDevices,
})

class SettingsPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeKey: props.location.pathname.split('/').length>2 ? props.location.pathname.split('/').pop() : 'definition'
        }
    }

    componentDidUpdate (prevProps) {
        prevProps.location!==this.props.location && this.setState({
            activeKey: this.props.location.pathname.split('/').length>2 ? this.props.location.pathname.split('/').pop() : 'definition'
        })
    }

    onTabChanged = (key) => {
        actions.routing.push('/rules/' + key)
        this.setState({activeKey: key})
    }
    /** render page content */
    renderPageContent() {
        return (
            <Layout>
                <Tabs activeKey={this.state.activeKey} onChange={this.onTabChanged}>
                    <Tabs.TabPane tab="Event Rule Definitions" key="definition">
                        <Route exact path="/rules/definition" component={()=><EventRuleDefinitions {...this.props} />}/>
                    </Tabs.TabPane>

                    <Tabs.TabPane tab="Event History" key="history">
                        <Route exact path="/rules/history" component={()=><EventRuleLogs {...this.props}/>}/>
                    </Tabs.TabPane>

                    <Tabs.TabPane tab="Other Notifications" key="other">
                        <Route exact path="/rules/other" component={()=><OtherNotifications />}/>
                    </Tabs.TabPane>

                </Tabs>
                <Route
                    exact
                    path="/rules"
                    render={() => (<Redirect exact to='/rules/definition' />)}
                /></Layout>

        )
    }

    render() {
        return (
            <PortalLayout
                menu='hub'
                page="Event Rules"
                content={this.renderPageContent()} />
        )
    }
}

export default connect(mapStateToProps, null) (SettingsPage)


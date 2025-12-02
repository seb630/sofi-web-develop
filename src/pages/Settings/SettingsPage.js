import { Component } from 'react'
import { actions, connect, Redirect, Route } from 'mirrorx'
import Personal from './Personal'
import Routine from './Routine'
import Advance from './Advance'
import HubBeacon from './Beacon'
import Notification from './Notification'
import PortalLayout from '../Common/Layouts/PortalLayout'
import { Layout, Tabs } from 'antd'
import Carer from './Carer'
import Sensor from './Sensor'
import Anomaly from './Anomaly'
import Holiday from './Holiday'
import Wifi from './Wifi'
import HubPayment from './Payment'
import { globalConstants } from '@/_constants'
import { titleCase } from 'change-case'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    me: state.user.me,
})

class SettingsPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeKey: props.location.pathname.split('/').length>2 ? props.location.pathname.split('/').pop() : 'personal'
        }
    }

    componentDidUpdate (prevProps) {
        prevProps.location!==this.props.location && this.setState({
            activeKey: this.props.location.pathname.split('/').length>2 ? this.props.location.pathname.split('/').pop() : 'personal'
        })
    }

    onTabChanged = (key) => {
        actions.routing.push('/settings/' + key)
        this.setState({activeKey: key})
    }
    /** render page content */
    renderPageContent() {
        return (
            <Layout>
                <Tabs activeKey={this.state.activeKey} onChange={this.onTabChanged}>
                    <Tabs.TabPane tab="Personal" key="personal">
                        <Route exact path="/settings/personal" component={()=><Personal />}/>
                    </Tabs.TabPane>

                    <Tabs.TabPane tab="Routine" key="routine">
                        <Route exact path="/settings/routine" component={()=><Routine />}/>
                    </Tabs.TabPane>

                    <Tabs.TabPane tab="Anomaly Detection" key="anomaly">
                        <Route exact path="/settings/anomaly" component={()=><Anomaly onKeyChange={this.onTabChanged}/>}/>
                    </Tabs.TabPane>

                    <Tabs.TabPane tab="Subscription" key="subscription">
                        <Route exact path="/settings/subscription" component={()=> <HubPayment />}/>
                    </Tabs.TabPane>

                    <Tabs.TabPane tab="Advanced" key="advanced">
                        <Route exact path="/settings/advanced" component={()=> <Advance/>}/>
                    </Tabs.TabPane>

                    <Tabs.TabPane tab="Sensors & Spaces" key="sensor">
                        <Route exact path="/settings/sensor" component={()=><Sensor />}/>
                    </Tabs.TabPane>

                    <Tabs.TabPane tab="Notification" key="notification">
                        <Route exact path="/settings/notification" component={()=> <Notification />}/>
                    </Tabs.TabPane>

                    <Tabs.TabPane tab={titleCase(globalConstants.PENDANT_GENERIC)} key="beacon">
                        <Route exact path="/settings/beacon" component={()=> <HubBeacon />}/>
                    </Tabs.TabPane>

                    <Tabs.TabPane tab="Carers" key="carer">
                        <Route exact path="/settings/carer" component={()=> this.props.selectedHub && <Carer />}/>
                    </Tabs.TabPane>

                    <Tabs.TabPane tab="Holiday" key="holiday">
                        <Route exact path="/settings/holiday" component={()=> <Holiday />}/>
                    </Tabs.TabPane>

                    <Tabs.TabPane tab="Wifi" key="wifi">
                        <Route exact path="/settings/wifi" component={()=> <Wifi />}/>
                    </Tabs.TabPane>

                </Tabs>
                <Route
                    exact
                    path="/settings"
                    render={() => (<Redirect exact to='/settings/personal' />)}
                /></Layout>

        )
    }

    render() {
        return (
            <PortalLayout
                menu='hub'
                page="Settings"
                content={this.renderPageContent()} />
        )
    }
}

export default connect(mapStateToProps, null) (SettingsPage)


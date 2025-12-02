import { Component } from 'react'
import PortalLayout from '../Common/Layouts/PortalLayout'
import Feature from './Feature'
import HubUser from './HubUser'
import Detail from './Detail'
import Actions from './Actions'
import Resource from './Resource'
import Routine from './Routine'
import PreventAccess from '../../components/PreventAccess'
import {actions, connect, Redirect, Route} from 'mirrorx'
import {Tabs} from 'antd'
import TPAccount from './ThirdParties'
import Anomaly from './Anomaly'
import Billing from './Billing'
import HubOrgs from './Organisation'

const mapStateToProps = state => ({
    isAdmin: state.user.me ? state.user.me.authorities.some(role=>role.includes('ADMIN')) : false,
    hubOrgs: state.hub.hubOrgs,
    selectedHub: state.hub.selectedHub
})

class AdminPage extends Component {

    constructor(props) {
        super(props)
        this.state = {
            activeKey: props.location.pathname.split('/').length>2 ? props.location.pathname.split('/').pop() : 'detail'
        }
    }

    componentDidUpdate (prevProps) {
        prevProps.location!==this.props.location && this.setState({
            activeKey: this.props.location.pathname.split('/').length>2 ? this.props.location.pathname.split('/').pop() : 'detail'
        })
    }
    onTabChanged = (key) => {
        actions.routing.push('/admin/' + key)
        this.setState({activeKey: key})
    }

    /** render page content */
    renderPageContent() {
        const { isAdmin, hubOrgs, } = this.props
        return (
            <PreventAccess allowAccess={isAdmin || hubOrgs.length>0}>
                <Tabs activeKey={this.state.activeKey} onChange={this.onTabChanged}>
                    {isAdmin && <Tabs.TabPane tab="Detail" key="detail">
                        <Route exact path="/admin/detail" component={()=> <Detail/>}/>
                    </Tabs.TabPane>}

                    {isAdmin && <Tabs.TabPane tab="Anomaly Settings" key="anomaly">
                        <Route exact path="/admin/anomaly" component={()=> this.props.anomalyPreferences && this.props.featureFlags &&
                        <Anomaly
                            anomalyPreferences={this.props.anomalyPreferences}
                            featureFlags={this.props.featureFlags}
                        />
                        }/>
                    </Tabs.TabPane>}

                    {isAdmin && <Tabs.TabPane tab="Features" key="features">
                        <Route exact path="/admin/features" component={()=>this.props.featureFlags &&
                            <Feature
                                featureFlags={this.props.featureFlags}
                            />}/>
                    </Tabs.TabPane>}

                    {isAdmin && <Tabs.TabPane tab="Hub Users" key="users">
                        <Route exact path="/admin/users" component={()=> <HubUser />}/>
                    </Tabs.TabPane>}

                    {isAdmin && <Tabs.TabPane tab="Organisations" key="orgs">
                        <Route exact path="/admin/orgs" component={()=> <HubOrgs />}/>
                    </Tabs.TabPane>}

                    {isAdmin && <Tabs.TabPane tab="Actions" key="actions">
                        <Route exact path="/admin/actions" component={()=><Actions />}/>
                    </Tabs.TabPane>}

                    {isAdmin && <Tabs.TabPane tab="Resource Usage" key="resource">
                        <Route exact path="/admin/resource" component={()=> <Resource />}/>
                    </Tabs.TabPane>}

                    {isAdmin && <Tabs.TabPane tab="Routine Recommendation" key="routine">
                        <Route exact path="/admin/routine" component={()=> <Routine />}/>
                    </Tabs.TabPane>}

                    {isAdmin && <Tabs.TabPane tab="Billing" key="billing">
                        <Route exact path="/admin/billing" component={()=> <Billing {...this.props}/>}/>
                    </Tabs.TabPane>}

                    <Tabs.TabPane tab="Third Party Integration" key="tpi">
                        <Route exact path="/admin/tpi" component={()=> <TPAccount />}/>
                    </Tabs.TabPane>
                </Tabs>
                <Route
                    exact
                    path="/admin"
                    render={() => (<Redirect exact to='/admin/detail' />)}
                />
            </PreventAccess>
        )
    }

    render() {
        return(
            <PortalLayout
                menu='hub'
                page="Admin"
                content={ this.renderPageContent() }
            />
        )
    }
}

export default connect(mapStateToProps, null) (AdminPage)


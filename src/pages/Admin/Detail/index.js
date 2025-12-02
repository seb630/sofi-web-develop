import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { Button, Card, Col, Input, List, Row, Switch, Typography } from 'antd'
import { DisableCard } from './DisableDevice'
import { EditOutlined, SaveOutlined } from '@ant-design/icons'
import { SIMStatusCard } from '@/pages/Admin/Detail/SIM'

const {Paragraph} = Typography

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    hubStatus: state.hub.hubStatus,
    disabledProduct: state.billing.disabledProduct,
    subscription: state.billing.subscription,
    stripeEnabled: state.common.stripeEnabled,
    hubOrgs: state.hub.hubOrgs,
    hubUsers: state.hub.hubUsers,
    providers: state.SIM.providers,
    carriers: state.SIM.carriers,
    iccids: state.SIM.iccids,
    productActivation: state.SIM.productActivation,
    activeDeactivation: state.SIM.activeDeactivation,
    isAdmin: state.user.me?.authorities.some(role=>role.includes('ADMIN')),
})

class Detail extends Component{
    constructor(props) {
        super(props)
        this.state = {
            edit: false,
            displayName: props.selectedHub?.display_name,
            oobe: props.selectedHub ? props.selectedHub.oobe_state ==='NONE' : false,
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.selectedHub !== this.props.selectedHub &&
        this.setState({displayName: this.props.selectedHub.display_name})
    }

    handleButton = () => {
        if (this.state.edit) {
            this.setState({edit: false})
            let hub = this.props.selectedHub
            hub.display_name = this.state.displayName
            actions.hub.updateHub(hub)
        }else{
            this.setState({edit:true})
        }
    }

    handleOOBE = () => {
        let payload = {
            hub_id : this.props.selectedHub.hub_id,
            action: this.state.oobe ? 'claim' : 'reset'
        }
        actions.hub.updateHubOOBE(payload).then(()=> this.setState({oobe: !this.state.oobe}))
    }

    render(){
        const data = [
            {
                title: <div>
                    Hub Name
                    <Button
                        size="small"
                        type="primary"
                        icon={ this.state.edit ? <SaveOutlined /> : <EditOutlined/>}
                        style={{marginLeft:'20px'}}
                        onClick={this.handleButton}
                        disabled={this.state.edit && this.state.displayName.length<1}
                    >
                        {this.state.edit ? 'Save' : 'Edit' }
                    </Button>
                </div>,
                content: this.state.edit ?
                    <Input
                        value={this.state.displayName}
                        onChange={e=>this.setState({displayName:e.target.value})}
                    />
                    :
                    this.props.selectedHub?.display_name,
                copyable: true
            },
            {
                title: 'MAC Address',
                content: this.props.selectedHub?.mac_address,
                copyable: true
            },
            {
                title: 'Setup State',
                content: this.props.selectedHub?.setup_state,
                copyable: false
            },
            {
                title: 'APP Version',
                content: this.props.selectedHub?.hub_app_release_tag || 'Unknown',
                copyable: false
            },
            {
                title: 'Updater Version',
                content: this.props.selectedHub?.hub_updater_release_tag || 'Unknown',
                copyable: false
            },
            {
                title: 'JDK Version',
                content: this.props.hubStatus && this.props.hubStatus.jdk_version || 'Unknown',
                copyable: false
            },
            {
                title: 'Hub ID',
                content: this.props.selectedHub?.hub_id,
                copyable: true
            },
            {
                title: <Row type="flex" justify="space-between" >
                    <Col span={18}>OOBE</Col>
                    <Col span={6}><div className="toggle_switch">
                        <Switch
                            checked={this.state.oobe}
                            onChange={this.handleOOBE}
                        />
                    </div></Col>
                </Row>,
                content: 'Out of box experience. Determines whether or not the welcome wizard is shown',
                copyable: false
            },
        ]
        return (
            <Fragment>
                <Row>
                    <Col offset={2} span={20}>
                        <List
                            grid={{ gutter: 16, xs: 1, sm: 2, md: 1, lg: 2, xl: 3, xxl: 3 }}
                            dataSource={data}
                            renderItem={item => (
                                <List.Item>
                                    <Card title={item.title}><Paragraph copyable={item.copyable}>{item.content}</Paragraph></Card>
                                </List.Item>
                            )}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col offset={2} span={20}>
                        <SIMStatusCard
                            selectedDevice={this.props.selectedHub}
                            {...this.props}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col offset={2} span={20}>
                        <DisableCard
                            selectedDevice={this.props.selectedHub}
                            disableStatus={this.props.disabledProduct}
                            subscription={this.props.subscription}
                            stripeEnabled={this.props.stripeEnabled}
                            orgs={this.props.hubOrgs}
                            hubUsers={this.props.hubUsers}
                        />
                    </Col>
                </Row>
            </Fragment>
        )
    }
}


export default connect(mapStateToProps, null) (Detail)

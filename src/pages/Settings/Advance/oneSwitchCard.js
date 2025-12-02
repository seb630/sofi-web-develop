import { Component } from 'react'
import { actions } from 'mirrorx'
import { Card, Col, Modal, Row, Switch } from 'antd'
import PropTypes from 'prop-types'
import { globalConstants } from '@/_constants'

export default class OneSwitchCard extends Component{
    constructor(props) {
        super(props)
        this.state = {
            checked:
                props.flip ? props.featureFlags[this.props.feature] !== 'ENABLED' : props.featureFlags[this.props.feature] === 'ENABLED',
        }
    }

    handleSwitchClick = () => {
        const {selectedHub, warning, feature, flip} = this.props
        const hubId = selectedHub.hub_id
        const featureBody = {}
        featureBody[feature] =flip ? this.state.checked ? 'ENABLED' : 'DISABLED' : this.state.checked ? 'DISABLED' : 'ENABLED'
        if (feature==='notify_carer_on_anomaly'){
            this.state.checked ?
                this.handleTurnOffNotifyCarer(()=>{
                    this.setState({checked: !this.state.checked})
                    this.turnOffEverything()
                }):
                this.handleTurnOnNotifyCarer(()=>{
                    this.setState({checked: !this.state.checked})
                    actions.setting.saveFeatureFlags({hubId, featureFlags: featureBody})
                })
        }else if (warning) {
            Modal.confirm({
                title: 'Are you sure?',
                content: 'Are you sure you want to turn on notify resident without turning on notify carer? The hub will not be able to ' +
                    `contact carers when you set the ${globalConstants.HUB_SOFIHUB} up this way. Additionally the hub will most likely mislead the user of the ${globalConstants.HUB_SOFIHUB} ` +
                    `into believing help is on the way when carers are required in order to do that. Carers and the ${globalConstants.HUB_SOFIHUB} user should ` +
                    'really be changing these options themselves. Are you sure you want to turn on notify resident without turning ' +
                    'on notify carer?',
                okText: 'Yes',
                cancelText: 'No',
                onOk: ()=>{
                    this.setState({checked: !this.state.checked})
                    actions.setting.saveFeatureFlags({hubId, featureFlags: featureBody})
                }
            })
        }else {
            this.setState({checked: !this.state.checked})
            actions.setting.saveFeatureFlags({hubId, featureFlags: featureBody})
        }

    }

    turnOffEverything = () => {
        const hubId = this.props.selectedHub.hub_id
        const anomalyBody = {
            long_bathroom: 'DISABLED',
            night_wandering: 'DISABLED',
            not_gone_to_bed: 'DISABLED',
            not_woken_up: 'DISABLED'
        }
        const featureBody = {
            notify_carer_on_anomaly: 'DISABLED',
            notify_resident_on_anomaly: 'DISABLED',
        }
        actions.setting.saveAnomalyPreferences({hubId, anomalyPreferences: anomalyBody})
        actions.setting.saveFeatureFlags({hubId, featureFlags: featureBody})
    }

    handleTurnOnNotifyCarer = (onOk) => {
        this.props.carers.length === 0 ? Modal.warning(
            {
                content: `This ${globalConstants.HUB_SOFIHUB} does not have any carers associated with it, this feature cannot be turned on without 
                any carers.`,
                okText: 'OK'
            }) :
            Modal.confirm({
                okText: 'Yes',
                cancelText: 'No',
                onOk:  onOk,
                content: <div>
                    You&#39;re about to turn on notify the carer for this {globalConstants.HUB_SOFIHUB}. This means that all carers will be notified
                    when an anomaly is detected, including the following carers:
                    <ul>
                        {this.props.carers.slice(0,5).map(carer=>(<li key={carer.user_id}>{carer.first_name} {carer.last_name}</li>))}
                        {this.props.carers.length>5 && <li>And all other carers</li>}
                    </ul>
                    Carers for this {globalConstants.HUB_SOFIHUB} should really control this feature themselves.
                    Are you sure you want to notify all carers on anomaly?
                </div>
            })
    }

    handleTurnOffNotifyCarer = (onOk) => {
        Modal.confirm({
            okText: 'Yes',
            cancelText: 'No',
            onOk: onOk,
            content: <div>
                You&#39;ve opting to turn off notifying all carers as well as disabling anomaly detection. This means the {globalConstants.HUB_SOFIHUB}
                will not be looking for anomalies and no carers will be notified, this will impact all carers for
                this {globalConstants.HUB_SOFIHUB} including:
                <ul>
                    {this.props.carers.slice(0,5).map(carer=>(<li key={carer.user_id}>{carer.first_name} {carer.last_name}</li>))}
                    {this.props.carers.length>5 && <li>And all other carers</li>}
                </ul>
                This setting should really be controlled by carers. Are you sure you want to turn off notify all carers on anomaly
                and disable anomaly detection?
            </div>
        })
    }

    renderTitle = (titleProp) => <Row type="flex" justify="space-between" >
        <Col span={18}>{titleProp}</Col>
        <Col span={6}><div className="toggle_switch">
            <Switch
                checked={this.state.checked}
                onChange={this.handleSwitchClick}
            />
        </div></Col>
    </Row>

    render(){
        return (
            <Card className="advanced_block" title={this.renderTitle(this.props.featureTitle)}>
                <div >{this.props.featureDescription}</div>
            </Card>
        )
    }
}

OneSwitchCard.defaultProps = {
    flip: false,
    warning: false,
}

OneSwitchCard.propTypes = {
    selectedHub: PropTypes.object,
    featureFlags: PropTypes.object,
    feature: PropTypes.string,
    featureDescription: PropTypes.node,
    featureTitle: PropTypes.string,
    flip: PropTypes.bool,
    warning: PropTypes.bool,
    carers: PropTypes.array
}



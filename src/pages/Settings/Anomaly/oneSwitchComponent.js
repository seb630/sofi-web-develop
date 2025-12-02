import { Component, Fragment } from 'react'
import { actions } from 'mirrorx'
import { Col, Modal, Row, Switch } from 'antd'
import PropTypes from 'prop-types'
import { globalConstants } from '@/_constants'

export default class oneSwitchComponent extends Component{
    constructor(props) {
        super(props)
        this.state = {
            checked: props.type==='feature' ?
                props.featureFlags[this.props.feature] === 'ENABLED':
                props.anomalyPreferences[this.props.feature] === 'ENABLED',
        }
    }

    componentDidUpdate (prevProps) {
        prevProps.featureFlags !== this.props.featureFlags && this.props.type==='feature' &&
        this.setState({checked: this.props.featureFlags[this.props.feature] === 'ENABLED'})

        prevProps.anomalyPreferences !== this.props.anomalyPreferences && this.props.type==='anomaly' &&
        this.setState({checked: this.props.anomalyPreferences[this.props.feature] === 'ENABLED'})
    }

    handleSwitchClick = () => {
        const hubId = this.props.selectedHub.hub_id
        const feature = this.props.type==='feature'
        if (feature) {
            const featureBody = {}
            featureBody[this.props.feature] = !this.state.checked ? 'ENABLED' : 'DISABLED'
            if (this.props.feature==='notify_carer_on_anomaly'){
                this.state.checked ?
                    this.handleTurnOffNotifyCarer(()=>{
                        this.setState({checked: !this.state.checked})
                        this.turnOffEverything()
                    }):
                    this.handleTurnOnNotifyCarer(()=>{
                        this.setState({checked: !this.state.checked})
                        actions.setting.saveFeatureFlags({hubId, featureFlags: featureBody})
                    })
            }else{
                this.setState({checked: !this.state.checked})
                actions.setting.saveFeatureFlags({hubId, featureFlags: featureBody})
            }
        }else{
            const featureBody = this.props.anomalyPreferences
            featureBody[this.props.feature] = !this.state.checked ? 'ENABLED' : 'DISABLED'
            this.setState({checked: !this.state.checked})
            actions.setting.saveAnomalyPreferences({hubId, anomalyPreferences: featureBody})
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
                content: `You don't have any carers linked to your ${globalConstants.HUB_SOFIHUB}. This feature cannot be enabled without carers. 
                You can invite new carers via the "Carers" tab on the settings page.`,
                okText: 'OK'
            }) :
            Modal.confirm({
                okText: 'Yes',
                cancelText: 'No',
                onOk:  onOk,
                content: <div>
                    You&#39;ve opted to turn on notify all carers when your chosen anomalies are detected. This means the following cares
                    will be notified:
                    <ul>
                        {this.props.carers.slice(0,5).map(carer=>(<li key={carer.user_id}>{carer.first_name} {carer.last_name}</li>))}
                        {this.props.carers.length>5 && <li>And all other carers</li>}
                    </ul>
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
                You&#39;ve opting to turn off notifying all carers as well as disabling anomaly detection. This means the {globalConstants.HUB_SOFIHUB} will
                not be looking for anomalies and no carers will be notified, this will impact all carers for this {globalConstants.HUB_SOFIHUB} including:
                <ul>
                    {this.props.carers.slice(0,5).map(carer=>(<li key={carer.user_id}>{carer.first_name} {carer.last_name}</li>))}
                    {this.props.carers.length>5 && <li>And all other carers</li>}
                </ul>
                Are you sure you want to turn off notify all carers on anomaly and disable anomaly detection?
            </div>
        })
    }

    render(){
        return (
            <Fragment>
                <Row>
                    <Col span={18}>
                        <div className="title">{this.props.featureTitle}</div>
                    </Col>
                    <Col span={6}>
                        <div className="toggle_switch">
                            <Switch
                                disabled={this.props.disabled}
                                checked={this.state.checked}
                                onChange={this.handleSwitchClick}
                            />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div className="desc">{this.props.featureDescription}</div>
                    </Col>
                </Row>
            </Fragment>
        )
    }
}

oneSwitchComponent.defaultProps = {
    disabled: false
}

oneSwitchComponent.propTypes = {
    type: PropTypes.oneOf(['feature','anomaly']),
    disabled: PropTypes.bool,
    selectedHub: PropTypes.object,
    anomalyPreferences: PropTypes.object,
    featureFlags: PropTypes.object,
    feature: PropTypes.string,
    featureDescription: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    featureTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    carers: PropTypes.array
}



import { Component, Fragment } from 'react'
import { actions } from 'mirrorx'
import { Switch, Row, Col } from 'antd'
import PropTypes from 'prop-types'

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
            this.setState({checked: !this.state.checked})
            actions.setting.saveFeatureFlags({hubId, featureFlags: featureBody})
        }else{
            const featureBody = this.props.anomalyPreferences
            featureBody[this.props.feature] = !this.state.checked ? 'ENABLED' : 'DISABLED'
            this.setState({checked: !this.state.checked})
            actions.setting.saveAnomalyPreferences({hubId, anomalyPreferences: featureBody})
        }
    }

    render(){
        return (
            <Fragment>
                <Row type="flex" gutter={16}>
                    <Col span={4}>
                        <div className="toggle_switch">
                            <Switch
                                checked={this.state.checked}
                                onChange={this.handleSwitchClick}
                            />
                        </div>
                    </Col>
                    <Col span={20}>
                        <div className="title">{this.props.featureTitle}</div>
                        <div>{this.props.featureDescription}</div>
                    </Col>
                </Row>
            </Fragment>
        )
    }
}

oneSwitchComponent.propTypes = {
    type: PropTypes.oneOf(['feature','anomaly']),
    selectedHub: PropTypes.object,
    anomalyPreferences: PropTypes.object,
    featureFlags: PropTypes.object,
    feature: PropTypes.string,
    featureDescription: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    featureTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
}



import { Component } from 'react'
import { actions } from 'mirrorx'
import { Switch, Card, Row, Col } from 'antd'
import PropTypes from 'prop-types'

export default class OneSwitchCard extends Component{
    constructor(props) {
        super(props)
        this.state = {
            checked: this.props.anomalyPreferences[this.props.feature] === 'ENABLED',
        }
    }

    handleSwitchClick = () => {
        const hubId = this.props.selectedHub.hub_id
        const featureBody = this.props.anomalyPreferences
        featureBody[this.props.feature] = !this.state.checked ? 'ENABLED' : 'DISABLED'
        this.setState({checked: !this.state.checked})
        actions.setting.saveAnomalyPreferences({hubId, anomalyPreferences: featureBody})
    }

    render(){
        return (
            <Card className="advanced_block" title={this.props.featureTitle}>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    <Col span={14}>
                        <div className="desc">{this.props.featureDescription}</div>
                    </Col>
                    <Col span={10}>
                        <div className="toggle_switch">
                            <Switch
                                checked={this.state.checked}
                                onChange={this.handleSwitchClick}
                            />
                        </div>
                    </Col>
                </Row>
            </Card>
        )
    }
}

OneSwitchCard.propTypes = {
    selectedHub: PropTypes.object,
    anomalyPreferences: PropTypes.object,
    feature: PropTypes.string,
    featureDescription: PropTypes.string || PropTypes.node,
    featureTitle: PropTypes.string
}



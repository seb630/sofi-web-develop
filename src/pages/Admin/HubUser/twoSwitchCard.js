import { Component } from 'react'
import { actions } from 'mirrorx'
import { Card, Col, Row, Switch } from 'antd'
import PropTypes from 'prop-types'

export default class TwoSwitchCard extends Component{
    constructor(props) {
        super(props)
        this.state = {
            sms: this.props.hubUser['sms_'+this.props.feature] === 'ENABLED',
            email: this.props.hubUser['email_'+this.props.feature] === 'ENABLED',
        }
    }

    handleSwitchClick(event, type) {
        const {hubId, feature, userId} = this.props
        const hubUserBody = {hub_id: hubId, user_id: userId}
        hubUserBody[type+'_'+feature] = !this.state[type] ? 'ENABLED' : 'DISABLED'
        this.setState({[type]: !this.state[type]})
        actions.user.updateHubUser(hubUserBody).then(()=>actions.hub.getHubUsers(hubId))
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
                            <p className="alert_type">Via SMS</p>
                            <Switch
                                checked={this.state.sms}
                                onChange={(event) => this.handleSwitchClick(event, 'sms')}
                            />
                        </div>
                        <div className="toggle_switch">
                            <p className="alert_type">Via Email</p>
                            <Switch
                                checked={this.state.email}
                                onChange={(event) => this.handleSwitchClick(event, 'email')}
                            />
                        </div>
                    </Col>
                </Row>
            </Card>
        )
    }
}

TwoSwitchCard.propTypes = {
    hubId: PropTypes.string.isRequired,
    userId: PropTypes.number.isRequired,
    hubUser: PropTypes.object,
    feature: PropTypes.string,
    featureTitle: PropTypes.string
}



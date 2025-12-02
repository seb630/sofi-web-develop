import { Component } from 'react'
import { actions } from 'mirrorx'
import { Card, Checkbox, Modal, Switch } from 'antd'
import PropTypes from 'prop-types'

export default class TwoSwitchCard extends Component{
    constructor(props) {
        super(props)
        this.state = {
            sms: props.selectedHub && props.selectedHub['sms_'+ props.feature] === 'ENABLED',
            email: props.selectedHub && props.selectedHub['email_'+ props.feature] === 'ENABLED',
            noAccess: !props.selectedHub
        }
    }

    componentDidUpdate (prevProps) {
        if (prevProps.selectedHub !== this.props.selectedHub){
            this.setState({
                sms: this.props.selectedHub && this.props.selectedHub['sms_'+ this.props.feature] === 'ENABLED',
                email: this.props.selectedHub && this.props.selectedHub['email_'+ this.props.feature] === 'ENABLED',
                noAccess: !this.props.selectedHub
            })
        }
    }

    handleSwitchClick = () => {
        const {selectedHub, feature, userId} = this.props
        const hubId = selectedHub.hub_id
        const hubUserBody = {hub_id: hubId, user_id: userId}
        hubUserBody['email_'+feature] = !this.state.email ? 'ENABLED' : 'DISABLED'
        if (this.state.email && this.state.sms){
            hubUserBody['sms_'+feature] = 'DISABLED'
            this.setState({sms: false})
            Modal.info({
                content: 'By turning off this notification you will also turn off the SMS notification too.',
                okText: 'Okay'
            })
        }
        this.setState({email: !this.state.email})
        actions.user.updateHubUser(hubUserBody).then(()=>actions.hub.getHubUsers(hubId))
    }

    handleSMSClick = () => {
        const {selectedHub, feature, userId} = this.props
        const hubId = selectedHub.hub_id
        const hubUserBody = {hub_id: hubId, user_id: userId}
        hubUserBody['sms_'+feature] = !this.state.sms ? 'ENABLED' : 'DISABLED'
        this.setState({sms: !this.state.sms})
        actions.user.updateHubUser(hubUserBody).then(()=>actions.hub.getHubUsers(hubId))
    }

    render(){
        const {featureTitle, featureDescription} = this.props
        const {noAccess, email, sms} = this.state
        return (
            <Card className="advanced_block" title={featureTitle} extra={<Switch
                disabled={noAccess}
                checked={email}
                checkedChildren="Email Enabled"
                unCheckedChildren="Email Disabled"
                onChange={this.handleSwitchClick}
            />}>
                <div className="margin-bottom">{featureDescription}</div>
                <div>
                    <Checkbox
                        checked={sms}
                        disabled={noAccess || !email}
                        onChange={this.handleSMSClick}
                    >Send me an SMS too</Checkbox>
                </div>
            </Card>
        )
    }
}

TwoSwitchCard.propTypes = {
    userID: PropTypes.number,
    selectedHub: PropTypes.object,
    feature: PropTypes.string,
    featureDescription: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    featureTitle: PropTypes.string
}



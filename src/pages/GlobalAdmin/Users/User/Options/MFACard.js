import { Component } from 'react'
import {actions} from 'mirrorx'
import { Card, Row, Col, Switch, Button, message } from 'antd'
import PropTypes from 'prop-types'

class MFACard extends Component {

    constructor(props) {
        super(props)
        this.state = {
            checked: props.currentUser?.mfa_enabled,
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.currentUser !== this.props.currentUser && this.setState({
            checked: this.props.currentUser?.mfa_enabled,
        })
    }

    renderTitle = () => <Row type="flex" justify="space-between" >
        <Col span={18} className="dangerTitle">Enable MFA</Col>
        <Col span={6}><div className="toggle_switch">
            <Switch
                checked={this.state.checked}
                onChange={this.handleSwitchClick}
            />
        </div></Col>
    </Row>

    handleSwitchClick = (enable) =>{
        const userId = this.props.currentUser.user_id
        const payload = {
            ...this.props.currentUser,
            mfa_enabled: enable
        }

        actions.user.updateMe({userId,payload }).then(()=>
            this.setState({checked: enable})
        )

    }

    handleReset = () => {
        const userId = this.props.currentUser.user_id

        actions.user.resetMFA(userId).then(()=>{
            message.success('MFA Reset success!')
            actions.user.me()
        })
    }

    render() {
        const currentUser = this.props.currentUser
        return (
            <Card className="advanced_block" title={this.renderTitle()}>
                <div>
                    <p>MFA is currently {currentUser?.mfa_enabled? 'enabled':'disabled'} on this account. It also {currentUser?.mfa_code_verified ? 'has been' : 'has not yet been'} set up by the user.
                    </p>
                    <Row wrap={false}>
                        <Col flex="auto">
                            <p>
                                If this user is having difficulties with MFA, you can reset it for them and they can set it up with a new authenticator. {
                                    !this.state.checked && <b>(You must first enable MFA for this user!)</b>
                                }
                            </p>
                        </Col>
                        <Col flex="100px">
                            <Button danger onClick={this.handleReset} disabled={!this.state.checked}>Reset MFA</Button>
                        </Col>
                    </Row>
                </div>
            </Card>
        )
    }
}

MFACard.propTypes={
    currentUser: PropTypes.object.isRequired
}

export default MFACard

import { Component, Fragment } from 'react'
import {actions} from 'mirrorx'
import {Card, Row, Col, Switch, Modal} from 'antd'
import PropTypes from 'prop-types'

class PromoteCard extends Component {

    constructor(props) {
        super(props)
        this.state = {
            checked: props.currentUser.authorities.some(role=>role.includes('ADMIN')),
            confirmationModal: false
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.currentUser !== this.props.currentUser && this.setState({
            checked: this.props.currentUser.authorities.some(role=>role.includes('ADMIN')),

        })
    }

    handleSwitchClick = () => {
        this.setState({confirmationModal: true})
    }

    renderTitle = () => <Row type="flex" justify="space-between" >
        <Col span={18} className="dangerTitle">Admin Privileges</Col>
        <Col span={6}><div className="toggle_switch">
            <Switch
                checked={this.state.checked}
                onChange={this.handleSwitchClick}
            />
        </div></Col>
    </Row>

    handleSubmit = (grant) =>{
        const payload = {name: 'ROLE_ADMIN'}
        const userId = this.props.currentUser.user_id
        grant ? actions.user.addUserRoles({userId,payload }).then(()=>
            this.setState({checked: grant, confirmationModal: false})
        ) :
            actions.user.removeUserRoles({userId, payload}).then(()=>
                this.setState({checked: grant, confirmationModal: false})
            )

    }

    render() {
        const grant = !this.state.checked
        return (<Fragment>
            <Card className="advanced_block" title={this.renderTitle()}>
                <div>
                    <p>If you allow admin privileges on this account, they will be able to see all users and their devices, they will also
                        be able to see private information captured by devices as well as private contact information for users. They will
                        also be able to change settings on devices.
                    </p>
                    <p>
                        This option is not recommended if this person is not a SOFIHUB staff member, or if this person is not part of an
                        organisation that &quot;owns&quot; this whole environment.
                    </p>
                </div>
            </Card>
            <Modal
                okText={grant ? 'Grant Admin Privileges' : 'Revoke Admin Privileges'}
                open={this.state.confirmationModal} onCancel={()=>this.setState({confirmationModal: false})}
                onOk={()=>this.handleSubmit(grant)}
                okButtonProps={{type: grant ? 'danger' : 'primary'}}
                cancelButtonProps={{type: grant ? 'primary' : 'default'}}
                title="Are you sure?"  style={{height: '500px'}}
            >
                {grant ?
                    <div>
                        <p>Turning on admin privileges will allow this user to view everything including sensitive personal information
                            and change anything across all devices. This should be reserved for SOFIHUB staff and other users under
                            special circumstances.</p>
                        <p>Are you sure you wish to grant admin privileges to this user?</p>
                    </div>
                    :<div>
                        <p>Turning off admin privileges will restrict what this user can see and do (they will only be able to see
                            devices which they are a carer for). If this is a SOFIHUB staff member or a special user they may no
                            longer be able to perform their duties without this level of privileges.</p>
                        <p>Are you sure you wish to revoke admin privileges to this user?</p>
                    </div>

                }
            </Modal>
        </Fragment>
        )
    }
}

PromoteCard.propTypes={
    currentUser: PropTypes.object.isRequired
}

export default PromoteCard

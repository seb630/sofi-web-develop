import { Component, Fragment } from 'react'
import { actions } from 'mirrorx'
import PropTypes from 'prop-types'
import { Modal, Progress } from 'antd'
import { CheckCircleOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons'

function LoadingStatus (props) {
    let { status, title, key } = props
    return (
        <div className="loadingStatus" key={key}>
            {status==='success'? <CheckCircleOutlined className={`loadingStatusIcon ${status}`}/> :
                status==='active'? <LoadingOutlined className={`loadingStatusIcon ${status}`}/> :
                    <ExclamationCircleOutlined className={`loadingStatusIcon ${status}`}/>
            }{ title }
        </div>
    )
}

class DisableNotificationModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            users: [],
            processed: 0
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.open && this.props.hubUsers && this.props.open) {
            if (this.props.hubUsers) {
                const { hubUsers, hubId } = this.props
                this.setState({
                    users: hubUsers.map(hubUser => ({ email: hubUser.email, status: 'active' })),
                })
                hubUsers.map(user => {
                    const hubUserBody = {
                        hub_id: hubId,
                        user_id: user.user_id,

                        email_hub_low_battery: 'DISABLED',
                        email_hub_offline: 'DISABLED',
                        email_hub_power: 'DISABLED',
                        email_sensor_low_battery: 'DISABLED',
                        email_sensor_offline: 'DISABLED',
                        sms_hub_low_battery: 'DISABLED',
                        sms_hub_offline: 'DISABLED',
                        sms_hub_power: 'DISABLED',
                        sms_sensor_low_battery: 'DISABLED',
                        sms_sensor_offline: 'DISABLED',
                    }
                    actions.user.updateHubUser(hubUserBody).then(() => {
                        this.setState({ users: this.state.users.map(newUser=>(newUser.email===user.email ?{
                            ...newUser,
                            status: 'success'
                        } : newUser)), processed: this.state.processed+1 })
                    }).catch(() =>  {
                        this.setState({ users: this.state.users.map(newUser=>(newUser.email===user.email ?{
                            ...newUser,
                            status: 'error'
                        } : newUser)), processed: this.state.processed+1 })
                    })
                })
            }
        }
    }

    close = () =>{
        const {onCancel} = this.props
        this.setState({
            users: [],
            processed:0
        })
        onCancel()
    }

    render() {
        const { open, onCancel, width } = this.props
        const { processed, users} = this.state
        this.state.users.length>0 && Object.values(this.state.users).every(user=>user.status==='success') && window.setTimeout(()=>this.close(),5000)
        return (<Fragment>
            <Modal
                width={width}
                onCancel={onCancel}
                open={open}
                footer={null}
                destroyOnClose
            >
                <div className="text-center margin-bottom">
                    <Progress
                        type="circle"
                        percent={
                            users.length ===0 ? 0 : Math.round(processed / users.length * 100)
                        }
                    />
                </div>
                <div className="text-center">Carers found: {users.length}</div>
                <div className="text-center margin-bottom">Carers processed: {processed}/{users.length}</div>

                <div className="text-center">Disable SMS/Email Preferences for:</div>
                <div>
                    {users.map(user=><LoadingStatus key={user.user_id} title={user.email} status={user.status}/>)}
                </div>
            </Modal>
        </Fragment>)
    }
}

DisableNotificationModal.defaultProps = {
    width: 320
}

DisableNotificationModal.propTypes = {
    width: PropTypes.number,
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    hubUsers: PropTypes.array
}

export default DisableNotificationModal

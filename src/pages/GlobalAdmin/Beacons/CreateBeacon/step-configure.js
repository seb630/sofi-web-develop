import { Component, Fragment } from 'react'
import { actions } from 'mirrorx'
import PropTypes from 'prop-types'
import { Modal, Progress } from 'antd'
import { CheckCircleOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { globalConstants } from '@/_constants'
import { format4Api } from '@/utility/Locale'
import moment from 'moment'

function LoadingStatus (props) {
    let { status, title } = props
    return (
        <div className="loadingStatus">
            {status==='success'? <CheckCircleOutlined className={`loadingStatusIcon ${status}`}/> :
                status==='active'? <LoadingOutlined className={`loadingStatusIcon ${status}`}/> :
                    <ExclamationCircleOutlined className={`loadingStatusIcon ${status}`}/>
            }{ title }
        </div>
    )
}

class CreateBeaconConfigure extends Component {
    constructor(props) {
        super(props)
        this.state = {
            creation: 'success',
            oobe: 'active',
            apn: 'active',
            subscription: 'active',
            org: 'active'
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.context !== this.props.context && this.props.context.newBeacon) {
            const {newBeacon, values} = this.props.context
            const beaconId = newBeacon?.pub_id
            let oobePayload = {
                beacon_id: newBeacon.pub_id,
                action: values.oobe_state
            }
            let beaconPayload = {...newBeacon}

            if (values.organisation){
                let orgPayload = {}
                orgPayload.type='BEACON'
                orgPayload.organization_id = values.organisation
                orgPayload.device_id = newBeacon.id
                orgPayload.mac_or_imei = newBeacon.imei
                actions.organisation.associateOrgDevice(orgPayload)
                    .then(() => {
                        this.setState({org: 'success'})
                    }).catch(() => this.setState({org: 'error'}))
            }else {
                this.setState({org: 'success'})
            }

            beaconPayload.apn_id = values.apn

            beaconId && actions.sofiBeacon.saveBeaconInfor(beaconPayload)
                .then(() => {
                    this.setState({apn: 'success'})
                }).catch(() => this.setState({apn: 'error'}))

            beaconId && actions.sofiBeacon.updateBeaconOOBE(oobePayload)
                .then(() => {
                    this.setState({oobe: 'success'})
                }).catch(() => this.setState({oobe: 'error'}))

            if (beaconId) {
                const payload = {
                    ...values,
                }
                if (values.subscription_status === 'CONTRACT' || values.subscription_status === 'LOAN_PERIOD' || values.subscription_status === 'GRACE_PERIOD'){
                    if (values.subscription_status === 'CONTRACT'){
                        payload.contract_end_date = values.contract === 'custom' ? (values.condition === 'NONE' ? format4Api(values.customDate) : format4Api(moment().add(values.days,'days'))) : format4Api(moment().add(values.contract,'month'))
                    }else if  (values.subscription_status === 'LOAN_PERIOD') {
                        payload.loan_period_end_date = values.contract === 'custom' ? format4Api(values.customDate) : format4Api(moment().add(values.contract,'month'))
                    }else if  (values.subscription_status === 'GRACE_PERIOD') {
                        payload.grace_period_end_date = values.contract === 'custom' ? format4Api(values.customDate) : format4Api(moment().add(values.contract,'month'))
                    }
                }
                actions.billing.updateSubscription({ productId: beaconId, payload }).then(() => {
                    this.setState({subscription: 'success'})
                }).catch(() => this.setState({subscription: 'error'}))
            }
        }

    }

    close = () =>{
        const {context, onCancel} = this.props
        const {gotoAdmin} = context
        this.setState({
            creation: 'success',
            oobe: 'active',
            apn: 'active',
            subscription: 'active',
            org: 'active',
        })
        if (gotoAdmin){
            onCancel()
            actions.routing.push('/beacon/admin')
            actions.common.save({
                adminPortal: false
            })
        }else{
            onCancel()
        }
    }

    render() {
        const { open, onCancel, width } = this.props
        const { creation, oobe, apn, subscription, org } = this.state
        Object.values(this.state).every(state=>state==='success') && window.setTimeout(()=>this.close(),2000)
        return (<Fragment>
            <Modal
                width={width}
                onCancel={onCancel}
                open={open}
                title={`Creating ${globalConstants.PENDANT_GENERIC}...`}
                footer={null}
                destroyOnClose
            >
                <div className="text-center margin-bottom">
                    <Progress
                        type="circle"
                        percent={
                            Object.values(this.state).filter(state=>state==='success').length*25
                        }
                    />
                </div>
                <div>
                    <LoadingStatus title={`${globalConstants.PENDANT_GENERIC} Creation`} status={creation}/>
                    <LoadingStatus title='OOBE Setting' status={oobe}/>
                    <LoadingStatus title='APN Setting' status={apn}/>
                    <LoadingStatus title='Billing Subscription Setting' status={subscription}/>
                    <LoadingStatus title='Organisation Setting' status={org}/>
                </div>
            </Modal>
        </Fragment>)
    }
}

CreateBeaconConfigure.defaultProps = {
    width: 320
}

CreateBeaconConfigure.propTypes = {
    width: PropTypes.number,
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    context: PropTypes.object.isRequired
}

export default CreateBeaconConfigure

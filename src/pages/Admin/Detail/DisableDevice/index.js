import { Component, Fragment, useState } from 'react'
import { EditOutlined } from '@ant-design/icons'
import { Form } from '@ant-design/compatible'
import { Button, Card, Col, Divider, Input, message, Modal, Row, Switch, Typography } from 'antd'
import { actions } from 'mirrorx'
import { globalConstants } from '@/_constants'
import PropTypes from 'prop-types'
import styles from '../../../../scss/colours.scss'
import DisableNotificationModal from '@/pages/Admin/Detail/DisableDevice/DisableNotificationModal'
import {isBeacon, isRadar} from '@/utility/Common'

export const DisableCard = (props) => {
    const [edit, setEdit] = useState(false)
    const [notificationModal, setNotificationModal] = useState(false)
    const {disableStatus, hubUsers} = props
    const renderStatus = (disabled) => <p className="disableStatusTitle">
        Customer access to this device is:  {disabled ? <span className="disabled">Disabled</span> : <span className="enabled">Enabled</span>}
    </p>

    const renderTitle = () => <div>
        Disable customer access to this device
        <Button
            size="small"
            type="primary"
            icon={<EditOutlined />}
            style={{marginLeft:'20px'}}
            onClick={()=>setEdit(true)}
        >Edit</Button>
    </div>

    const DisableModal = Form.create()(DisableFormModal)

    return <Card
        title={renderTitle()}>
        {renderStatus(disableStatus?.is_disabled)}
        <p>
            If the device is disabled the customer will not be able to access the device and a message will appear on screen. They must contact support to remedy the situation.
            The back end will continue to record all data sent from device and once the situation is remedied the customer will be able to access everything as before including
            any recorded data in the meantime.
        </p>
        <DisableModal
            open = {edit}
            onCancel = {()=>setEdit(false)}
            selectedDevice={props.selectedDevice}
            subscription = {props.subscription}
            orgs = {props.orgs}
            disableStatus={props.disableStatus}
            stripeEnabled={props.stripeEnabled}
            openNotificationModal={()=>setNotificationModal(true)}
        />
        <DisableNotificationModal
            hubId={props.selectedDevice?.hub_id}
            onCancel={()=>setNotificationModal(false)}
            hubUsers={hubUsers}
            open={notificationModal}/>
    </Card>
}

DisableCard.propTypes={
    selectedDevice: PropTypes.object,
    disableStatus: PropTypes.object,
    stripeEnabled: PropTypes.bool,
    subscription: PropTypes.object,
    orgs: PropTypes.array,
}

class DisableFormModal extends Component {

    setStatus = (status) => {
        let {selectedDevice, subscription, orgs} = this.props
        subscription.subscription_status = status
        const productId = selectedDevice.pub_id ? selectedDevice.pub_id : selectedDevice.hub_id

        Modal.confirm({
            title: 'Are you sure you want to change the subscription status?',
            content: 'Changing the subscription status will cancel any active subscription currently being used.',
            okText: 'Yes',
            onOk: ()=>{
                if (orgs?.length>0){
                    Modal.confirm({
                        title: 'WARNING!',
                        content: 'This device is part of an organisation. Self service credit card payments may not be appropriate for this organisation.',
                        okText: 'Proceed Anyway',
                        okType: 'danger',
                        onOk() {
                            actions.billing.updateSubscription({productId,payload:subscription}).then(()=>{
                                message.success('Subscription status updated')
                            })
                                .catch((e)=>message.error(e.message))
                        },
                    })
                }else{
                    actions.billing.updateSubscription({productId,payload:subscription}).then(()=>{
                        message.success('Subscription status updated')
                    })
                }
            }
        })
    }

    cancelSubscription = () => {
        let {selectedDevice} = this.props
        const productId = selectedDevice.pub_id ? selectedDevice.pub_id : selectedDevice.hub_id

        Modal.confirm({
            title: 'Are you sure you want to cancel the subscription?',
            content: 'Are you sure you wish to cancel the subscription?',
            okText: 'Yes',
            onOk() {
                actions.billing.cancelSubscription({productId, refresh:false}).then(
                    ()=>{
                        message.success('The subscription has been cancelled')
                    })
                    .catch((e)=>message.error(e.message))
            },
        })
    }


    lockDevice = (status) => {
        let {selectedDevice} = this.props
        if (selectedDevice.pub_id) {
            selectedDevice.locked = status
            selectedDevice.notRefresh = true
            actions.sofiBeacon.saveBeaconInfor(selectedDevice).then(()=>{
                message.success('Lock status updated')
            })
        }else {
            const payload = {
                user_request_linking: status? 'DISABLED' :'ENABLED',
                notRefresh: true
            }
            actions.setting.saveFeatureFlags({hubId:selectedDevice.hub_id, featureFlags: payload}).then(()=>{
                message.success('Lock status updated')
            })
        }
    }

     removeNotifications = () => {
         this.props.openNotificationModal()
     }

     render() {
         const {form, disableStatus, open, onCancel, selectedDevice,subscription,stripeEnabled} = this.props
         const {getFieldDecorator, getFieldValue} = form
         const formItemLayout = {
             labelCol: { xs: 24, sm: 12 },
             wrapperCol: { xs: 24, sm: 12 },
         }
         const productType = isBeacon(selectedDevice) ? 'BEACON': isRadar(selectedDevice)? 'RADAR': 'HUB'
         const handleSave = () =>{
             form.validateFieldsAndScroll(async (err, values) => {
                 if (!err) {
                     try {
                         let payload = {...values}
                         payload.product_id = selectedDevice.pub_id ? selectedDevice.pub_id : selectedDevice.hub_id
                         payload.product_type = productType
                         disableStatus ? await actions.billing.updateDisableStatus(payload):
                             await actions.billing.postDisableStatus(payload)
                         message.success( 'Disable Status Updated')
                         onCancel()
                     } catch (err) {
                         err.global_errors?.length>0 ? err.global_errors.map(item => {
                             message.error(`${item.message}`)
                         }) : message.error(globalConstants.SERVER_ERROR_MESSAGE)
                     }
                 }
             })
         }
         return (
             <Modal
                 width={700}
                 open={open}
                 title="Disable this device"
                 okText="Save"
                 onCancel={onCancel}
                 onOk={handleSave}>

                 <Form layout="horizontal" {...formItemLayout}>
                     <Form.Item label="Disable this device?" colon={false}>
                         {
                             getFieldDecorator('is_disabled', {
                                 valuePropName: 'checked',
                                 initialValue: disableStatus?.is_disabled
                             })(
                                 <Switch
                                     size="default"
                                     checkedChildren="Disabled"
                                     unCheckedChildren="Enabled"
                                 />
                             )
                         }
                     </Form.Item>
                     <Form.Item label="Disabled reason">
                         {
                             getFieldDecorator('reason', {
                                 initialValue: disableStatus?.reason
                             })(
                                 <Input maxLength={globalConstants.INPUT_MAX_LENGTH} width={200}/>
                             )
                         }
                     </Form.Item>
                     <Form.Item label="Support company name">
                         {
                             getFieldDecorator('support_name', {
                                 initialValue: disableStatus?.support_name
                             })(
                                 <Input maxLength={globalConstants.INPUT_MAX_LENGTH} width={200}/>
                             )
                         }
                     </Form.Item>
                     <Form.Item label="Support phone number">
                         {
                             getFieldDecorator('phone', {
                                 initialValue: disableStatus?.phone
                             })(
                                 <Input maxLength={globalConstants.INPUT_MAX_LENGTH} width={200}/>
                             )
                         }
                     </Form.Item>
                     {getFieldValue('is_disabled') && <Fragment>
                         <p>Preview:</p>
                         <p>You cannot access {selectedDevice.display_name}, because it has been disabled. <br/> The reason it has been disabled is: {getFieldValue('reason')}<br/>
                            You can resolve this by contacting {getFieldValue('support_name')} on {getFieldValue('phone')}
                         </p>
                     </Fragment>
                     }
                     <Divider />
                     <Typography.Title level={5}>Next Steps:</Typography.Title>

                     {!getFieldValue('is_disabled') ?
                         <Fragment>
                             <Row gutter={[12,12]}>
                                 <Col xs={24} lg={12}>
                                     <Typography.Text strong>Current subscription status:</Typography.Text>
                                 </Col>
                                 <Col xs={24} lg={12}>
                                     <Typography.Text strong>{subscription?.subscription_status || 'Null'}</Typography.Text>
                                 </Col>
                             </Row>

                             <Row gutter={[12,12]} justify='space-between' className={!stripeEnabled && 'disabled'}>
                                 <Col xs={24} lg={14}>
                                     <div>
                                         <Typography.Text strong>Set subscription state to &quot;Null&quot;:</Typography.Text>
                                     </div>
                                     <div>
                                         <Typography.Text type="secondary">Forces user to input credit card next time they visit portal.</Typography.Text>
                                     </div>
                                 </Col>
                                 <Col xs={24} lg={10}>
                                     <Button type="primary" onClick={()=>this.setStatus('NULL')} className="floatRight">Set to NULL</Button>
                                 </Col>
                             </Row>
                             {!stripeEnabled && <div style={{color: styles.red}}>*Unavailable as Stripe subscription system is disabled in this environment</div>}
                             <Row gutter={[12,12]} justify='space-between'>
                                 <Col xs={24} lg={14}>
                                     <div>
                                         <Typography.Text strong>Unlock the device:</Typography.Text>
                                     </div>
                                     <div>
                                         <Typography.Text type="secondary">Allow user to claim this device in the future.</Typography.Text>
                                     </div>
                                 </Col>
                                 <Col xs={24} lg={10}>
                                     <Button type="primary" onClick={()=>this.lockDevice(false)} className="floatRight">Unlock Device</Button>
                                 </Col>
                             </Row>
                         </Fragment>:
                         <ol>
                             <Row gutter={[12,12]} justify='space-between'>
                                 <Col xs={24} lg={14}>
                                     <li>
                                         <Typography.Text strong>Lock the device:</Typography.Text>
                                     </li>
                                     <div>
                                         <Typography.Text type="secondary">Prevent users from claiming this device in the future.</Typography.Text>
                                     </div>
                                 </Col>
                                 <Col xs={24} lg={10}>
                                     <Button type="primary" onClick={()=>this.lockDevice(true)} className="floatRight">Lock Device</Button>
                                 </Col>
                             </Row>
                             <Divider/>
                             <Row>
                                 <Col xs={24} lg={14}>
                                     <div>
                                         <Typography.Title level={5} type="danger">Danger Zone!</Typography.Title>
                                     </div>
                                     <div>
                                         <Typography.Text type="danger">Only use options below if this device is being disabled PERMANENTLY</Typography.Text>
                                     </div>
                                 </Col>
                             </Row>

                             {productType==='HUB'&&<Row gutter={[12,12]} justify='space-between'>
                                 <Col xs={24} lg={14}>
                                     <li>
                                         <Typography.Text strong>Remove all SMS and email notification preferences</Typography.Text>
                                     </li>
                                     <div>
                                         <Typography.Text type="secondary">This will stop the customer from receiving SMS and email notifications.
                                            Sending SMS and Emails is not free. Only remove preferences if you&#39;re disabling this device PERMANENTLY.</Typography.Text>
                                     </div>
                                 </Col>
                                 <Col xs={24} lg={10}>
                                     <Button type="primary" onClick={this.removeNotifications} className="floatRight">Remove Notifications</Button>
                                 </Col>
                             </Row>}

                             {subscription?.subscription_status === 'ACTIVE' &&<Fragment>
                                 <Row gutter={[12,12]}>
                                     <Col xs={24} lg={12}>
                                         <li><Typography.Text strong>Current subscription status:</Typography.Text></li>
                                     </Col>
                                     <Col xs={24} lg={12}>
                                         <Typography.Text strong>{subscription?.subscription_status || 'Null'}</Typography.Text>
                                     </Col>
                                 </Row>

                                 <Row gutter={[12,12]} justify='space-between'>
                                     <Col xs={24} lg={14}>
                                         <div>
                                             <Typography.Text strong>Cancel subscription:</Typography.Text>
                                         </div>
                                         <div>
                                             <Typography.Text type="secondary">Only cancel the subscription if you&#39;re disabling this device PERMANENTLY.</Typography.Text>
                                         </div>
                                     </Col>
                                     <Col xs={24} lg={10}>
                                         <Button type="primary" onClick={()=>this.cancelSubscription()} className="floatRight">Cancel subscription</Button>
                                     </Col>
                                 </Row> </Fragment>}
                             <Row gutter={[12,12]} justify='space-between' className={!stripeEnabled && 'disabled'}>
                                 <Col xs={24} lg={14}>
                                     <li>
                                         <Typography.Text strong>Set subscription state to &quot;Manual&quot;:</Typography.Text>
                                     </li>
                                     <div>
                                         <Typography.Text type="secondary">Only set to manual if you&#39;re disabling this device PERMANENTLY.</Typography.Text>
                                     </div>
                                 </Col>
                                 <Col xs={24} lg={10}>
                                     <Button type="primary" onClick={()=>this.setStatus('MANUAL')} className="floatRight">Set to Manual</Button>
                                 </Col>
                             </Row>
                             {!stripeEnabled && <div style={{color: styles.red}}>*Unavailable as Stripe subscription system is disabled in this environment</div>}

                         </ol>

                     }
                 </Form>
             </Modal>
         )
     }
}


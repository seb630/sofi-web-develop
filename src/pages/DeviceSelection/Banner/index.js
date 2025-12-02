import { Button, Col, List, Modal, Row } from 'antd'
import { DollarOutlined } from '@ant-design/icons'
import moment from 'moment'
import { isBeacon, isHub, showProductName } from '@/utility/Common'
import { actions } from 'mirrorx'
import { Fragment, useState } from 'react'
import SubscriptionDeviceCard from '@/pages/DeviceSelection/Banner/DeviceCard'

export const ExpiringSoonBanner = (props) => {
    const { subsRecords, dashboardOverview } = props
    const [multipleIssueModal, setMultipleIssueModal] = useState(false)
    if (subsRecords?.length===1){
        const subsRecord = subsRecords[0]
        const expiringMonthYear = subsRecord && moment(subsRecord.payment_card_expiry, 'M/YYYY')
        const expired = moment().isAfter(expiringMonthYear,'month')

        const findDevice = () => {
            if (subsRecord.product_type==='RADAR'){
                return dashboardOverview?.radars.find(radar=>radar.pub_id===subsRecord.pub_id)
            }else  if (subsRecord.product_type==='BEACON'){
                return dashboardOverview?.beacons.find(beacon=>beacon.pub_id===subsRecord.pub_id)
            }else return dashboardOverview?.hubs.find(hub=>hub.hub_id===subsRecord.pub_id)
        }

        const handleUpdateInfo = (dashboard) => {
            let destination
            const device = findDevice()

            if (subsRecord.product_type === 'RADAR') {
                destination = dashboard ? '/radar/dashboard':'/radar/settings/subscription'
            }else if (subsRecord.product_type === 'BEACON') {
                destination = dashboard ? '/beacon/dashboard':'/beacon/settings/subscription'
            }else {
                destination = dashboard ? '/dashboard':'/settings/subscription'
            }

            if (isHub(device)) {
                actions.hub.selectHub(device).then(()=>{actions.routing.push(destination)})
            }else if(isBeacon(device)) {
                actions.sofiBeacon.selectBeacon(device).then(()=>{
                    actions.routing.push(destination)
                })
            }else {
                actions.radar.selectRadar(device).then(()=>{
                    actions.routing.push(destination)
                })
            }
        }

        if (subsRecord.subscription_status === 'ACTIVE' && !expired) {
            return (
                <div className="dashboard_alert">
                    <div className="warning_alert alerts">
                        <Row type="flex" wrap={false}>
                            <Col flex="72px">
                                <DollarOutlined />
                            </Col>
                            <Col flex="auto">
                                <div className="title">Your payment method is about to expire!</div>
                                <div>The payment method for the {showProductName(subsRecord?.product_type)}: &quot;{
                                    subsRecord?.display_name}&quot; is about to expire. Click <a onClick={handleUpdateInfo}>here</a> to update payment information.
                                </div>
                                <Button
                                    onClick={handleUpdateInfo}
                                    type="ghost"
                                >Update Payment Information</Button>
                            </Col>
                        </Row>

                    </div>
                </div>
            )
        }else return (
            <div className="dashboard_alert">
                <div className="urgent_alert alerts">
                    <Row type="flex" wrap={false}>
                        <Col flex="72px">
                            <DollarOutlined />
                        </Col>
                        <Col flex="auto">
                            {!subsRecord?.subscription ? <Fragment>
                                <div className="title">We&#39;re missing a payment method!</div>
                                <div>A payment method has not been provided for the {showProductName(subsRecord?.product_type)}: &quot;{
                                    subsRecord?.display_name}&quot;. Click <a onClick={()=>handleUpdateInfo(true)}>here</a> to add payment details
                                </div>
                                <Button onClick={()=>handleUpdateInfo(true)} type="ghost">Add Payment Details</Button>
                            </Fragment>
                                :<Fragment>
                                    <div className="title">A payment has been missed!</div>
                                    <div>A subscription payment was missed for the {showProductName(subsRecord?.product_type)}: &quot;{
                                        subsRecord?.display_name}&quot;. You need to provide new payment details in
                                        order to restart your subscription. Your device may be terminated if you take
                                        no action. Click <a onClick={()=>handleUpdateInfo(true)}>here</a> to provide new details.
                                    </div>
                                    <Button onClick={()=>handleUpdateInfo(true)} type="ghost">Add Payment Details</Button>
                                </Fragment>
                            }
                        </Col>
                    </Row>

                </div>
            </div>
        )

    }else if (subsRecords?.length>1){
        const isWarning = subsRecords?.every(subsRecord=> {
            const expiringMonthYear = subsRecord && moment(subsRecord.payment_card_expiry, 'M/YYYY')
            const expired = moment().isAfter(expiringMonthYear,'month')
            return subsRecord.subscription_status === 'ACTIVE' && !expired
        })
        const bannerStyle = isWarning ?'warning_alert' : 'urgent_alert'

        const sortRecords = (records) => {
            let sorted = []
            sorted = sorted.concat(records.filter(record=>!record.subscription_status).map(record=>({...record,
                desc: <div>We&#39;re missing a payment method! New payment details needed.</div>
            })))

            sorted = sorted.concat(records.filter(record=>record.subscription_status === 'INCOMPLETE_EXPIRED').map(record=>({...record,
                desc: <div>A payment was missed! New payment details needed.</div>
            })))

            sorted = sorted.concat(records.filter(record=>record.subscription_status === 'INCOMPLETE').map(record=>({...record,
                desc: <div>A payment was missed! Please make sure enough funds are available, or provide new payment method.</div>
            })))

            sorted = sorted.concat(records.filter(record=>record.subscription_status === 'ACTIVE').map(record=>({...record,
                desc: <div>Your payment method is expiring soon, new payment details needed.</div>
            })))

            return sorted
        }

        return (
            <Fragment>
                <div className="dashboard_alert">
                    <div className={`${bannerStyle} alerts`}>
                        <Row type="flex" wrap={false}>
                            <Col flex="72px">
                                <DollarOutlined />
                            </Col>
                            <Col flex="auto">
                                <Fragment>
                                    <div className="title">There are subscription problems with multiple devices!</div>
                                    <div>Click <a onClick={()=>setMultipleIssueModal(true)}>here</a> to see devices with issues.
                                    </div>
                                    <Button onClick={()=>setMultipleIssueModal(true)} type="ghost">Review Devices</Button>
                                </Fragment>
                            </Col>
                        </Row>
                    </div>
                </div>
                <Modal
                    open={multipleIssueModal}
                    onCancel={()=>setMultipleIssueModal(false)}
                    footer={null}
                    title='There are subscription problems with multiple devices'
                    width={600}
                >
                    <List
                        dataSource={sortRecords(subsRecords)}
                        renderItem={item =>
                            <List.Item>
                                <SubscriptionDeviceCard dashboardOverview={dashboardOverview} subsRecord={item}/>
                            </List.Item>}
                    />
                </Modal>
            </Fragment>
        )

    }else return (<div/>)


}

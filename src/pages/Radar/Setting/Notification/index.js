import { useEffect, useState } from 'react'
import { Button, Card, Col, Modal, Row } from 'antd'
import { connect } from 'mirrorx'
import { globalConstants } from '@/_constants'
import NotificationTable from '@/components/NotificationTable'

const mapStateToProps = state => ({
    selectedRadar: state.radar.selectedRadar,
    radarUsers: state.radar.radarUsers,
    me: state.user.me,
    notifications: state.radar.radarNotifications.length>0 ? state.radar.radarNotifications[0]?.product_user_notifications : []
})

const RadarNotification = (props) => {
    const {selectedRadar, radarUsers, me, notifications} = props
    const noAccess = !radarUsers || !radarUsers.find(user => user.flat_user?.user_id === me?.user_id)
    const [modal, setModal] = useState(false)
    const [modalFlag, setModalFlag] = useState(false)
    useEffect(()=>{
        const isAdmin = me?.authorities.some(role=>role.includes('ADMIN'))
        if (isAdmin && !modalFlag && !modal && noAccess){
            setModal(true)
            setModalFlag(true)
        }
        // eslint-disable-next-line
    },[radarUsers])

    const renderTitle = () => {
        return <div className="advanced_block">
            <div>
                Notification Preferences
            </div>
            <span className="desc break-space">
                Get notified when something happens on the {globalConstants.RADAR_HOBA}. Please note these notification settings apply
                to only you, if another carer would like to be notified about these settings, they must login and change
                these settings themselves.
            </span>
        </div>
    }

    return selectedRadar && me &&
        <Row type="flex" justify="center">
            <Col xs={22} xl={16}>
                <Card title={renderTitle()} className="notificationCard">
                    <NotificationTable
                        productId={selectedRadar.id}
                        me={me}
                        notifications={notifications}
                        noAccess={noAccess}
                    />
                </Card>
                <Modal
                    title='Hold on there admin user!'
                    open={modal}
                    onCancel={()=>setModal(false)}
                    footer={[
                        <Button key="understand" type="primary" onClick={()=>setModal(false)}>
                            I understand
                        </Button>]}
                >
                    <div>
                        You are an admin user, and you can see this {globalConstants.RADAR_HOBA}, but you are not a carer for this {globalConstants.RADAR_HOBA}.
                        Changing any settings on this page will not have any effect until you assign yourself
                        as a carer for this {globalConstants.RADAR_HOBA}.
                    </div>
                </Modal>
            </Col>
        </Row>

}

export default connect(mapStateToProps)(RadarNotification)

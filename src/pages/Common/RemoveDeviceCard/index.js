import { Button, Card, message, Modal, Row } from 'antd'
import { actions, connect } from 'mirrorx'
import { globalConstants } from '@/_constants'
import { storeDeviceData } from '@/utility/Storage'


const mapStateToProps = state => ({
    me: state.user.me,
    selectedHub: state.hub.selectedHub,
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    selectedRadar: state.radar.selectedRadar,
})

const RemoveDeviceCard = (props) => {
    const {me, product, selectedHub, selectedBeacon, selectedRadar } = props
    const productId = product==='beacon'? selectedBeacon?.pub_id: product==='radar'? selectedRadar?.pub_id: selectedHub?.hub_id
    const productIntId = selectedRadar?.id
    const removeDevice = async() => {
        if (product==='beacon'){
            const beacon = selectedBeacon
            await actions.sofiBeacon.disassociateBeaconUser({ userId: me.user_id , beaconId: beacon.id, beaconPubId: beacon.pub_id }).then(()=>{
                storeDeviceData('selectedBeacon', null)
                actions.sofiBeacon.fetchBeaconByUser()
                actions.routing.push('/deviceSelection')
            }).catch((e)=>message.error(e.message))
        }else if (product==='radar'){
            const payload = {
                user_id: me.user_id,
                product_id: selectedRadar.id
            }
            actions.radar.disassociateRadar(payload).then(()=>{
                storeDeviceData('selectedRadar', '')
                actions.radar.fetchAllRadars()
                actions.routing.push('/deviceSelection')
            }).catch((e)=>message.error(e.message))
        } else {
            const payload = {
                user_id: me.user_id,
                hub_id: selectedHub.hub_id
            }
            actions.user.disassociateHub(payload).then(()=>{
                storeDeviceData('hubId', '')
                actions.hub.getHubs()
                actions.routing.push('/deviceSelection')
            }).catch((e)=>message.error(e.message))
        }
    }

    const handleModal = () => {
        let requests = []

        requests.push(actions.billing.fetchSubscription(productId))
        requests.push(product==='hub' ? actions.hub.getHubUsers(productId) :  product==='beacon'?  actions.sofiBeacon.fetchBeaconUsers(productId) : product==='radar' && actions.radar.fetchRadarUsers(productIntId))
        return Promise.all(requests).then(result=>{
            const isSubscriptionUser = result[0]?.email === me?.email
            const isOnlyCarer = result[1].length === 1 && result[1][0].email === me?.email
            if (isSubscriptionUser) {
                Modal.warn({
                    title: 'We cannot remove this device from your account',
                    content: <>
                        <p>
                            You are currently the owner of the subscription for this device. We cannot remove the owner of the subscription.
                        </p>
                        <p>
                            Your must first transfer the subscription to a different carer before you can remove yourself as a carer.
                        </p>
                        <div>
                            Product: {product==='beacon'? globalConstants.BEACON_SOFIHUB: product==='radar'? globalConstants.RADAR_HOBA: globalConstants.HUB_SOFIHUB}
                        </div>
                        <div>
                            Display Name: {product==='beacon'? selectedBeacon?.display_name: product==='radar'? selectedRadar?.display_name: selectedHub?.display_name}
                        </div>
                        <div>
                            {product==='beacon'? 'IMEI':'MAC'}: {product==='beacon'? selectedBeacon?.imei: product==='radar'? selectedRadar.ext_id: selectedHub?.hub_mac_address}
                        </div>
                    </>,
                    okText: 'Okay',
                    okType: 'primary'
                })
            }else {
                Modal.confirm({
                    title: 'Are you sure you wish to remove this device from your account?',
                    content: <>
                        {isOnlyCarer ? <>
                            <p>
                                You are the only carer for this device! If you remove yourself no one will be able to change settings on the device.
                            </p>
                            <p>
                                By removing yourself from the device we will automatically unlock it, allowing anyone to claim it again in the future.
                            </p>
                        </> : <>
                            <p>
                                You may not be able to claim this device again after removing the device from you account
                            </p>
                        </>}
                        <div>
                            Product: {product==='beacon'? globalConstants.BEACON_SOFIHUB: product==='radar'? globalConstants.RADAR_HOBA: globalConstants.HUB_SOFIHUB}
                        </div>
                        <div>
                            Display Name: {product==='beacon'? selectedBeacon?.display_name: product==='radar'? selectedRadar?.display_name: selectedHub?.display_name}
                        </div>
                        <div>
                            {product==='beacon'? 'IMEI':'MAC'}: {product==='beacon'? selectedBeacon?.imei: product==='radar'? selectedRadar.ext_id: selectedHub?.hub_mac_address}
                        </div>
                    </>,
                    okText: 'Remove',
                    okType: 'danger',
                    cancelButtonProps: {type: 'primary'},
                    onOk: removeDevice
                })}
        })

    }

    return (
        <Card title='Remove device from account' style={{marginTop: 20}}>
            <Row>
                Added this device to your account in error? Or no longer want this device associated with your account? You can remove your device here.
            </Row>
            <Row justify="end">
                <Button danger onClick={handleModal}>
                    Remove Device From Account
                </Button>
            </Row>
        </Card>

    )
}

export default connect(mapStateToProps,null)(RemoveDeviceCard)

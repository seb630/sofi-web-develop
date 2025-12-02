import {Card, Space} from 'antd'
import BeaconAPNField from '@/pages/SofiBeacon/Admin/Detail/BeaconAPNField'
import ResendCloudAddressField from '@/pages/SofiBeacon/Admin/Detail/ResendCloudAddressField'
import WaitField from '@/pages/SofiBeacon/Admin/Detail/WaitField'
import SendDefaultSettingsField from '@/pages/SofiBeacon/Admin/Detail/SendDefaultSettingsField'

const ResendDefaultConfig = (props) => {
    const {isAdmin, allAPNs, selectedBeacon, beaconAPN} = props

    const nonArchivedAPNs = allAPNs ? allAPNs.filter(x => !x.apn_archived) : []
    const selectedAPN = selectedBeacon && allAPNs?.find(x => x.id === selectedBeacon.apn_id)

    return(
        <Card title="Resend Default Configuration" className="beacon-card">
            <Space direction="vertical">
                <BeaconAPNField
                    selectedBeacon={selectedBeacon}
                    apns={isAdmin ? selectedAPN && selectedAPN.apn_archived ?
                        [selectedAPN,...nonArchivedAPNs] : nonArchivedAPNs : beaconAPN}
                />
                <ResendCloudAddressField selectedBeacon={selectedBeacon}/>
                <WaitField selectedBeacon={selectedBeacon}/>
                <SendDefaultSettingsField selectedBeacon={selectedBeacon}/>
            </Space>
        </Card>
    )
}

export default ResendDefaultConfig

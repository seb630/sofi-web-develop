import { Card } from 'antd'
import { AlertOutlined} from '@ant-design/icons'
import {Link} from 'mirrorx'


const EmergencyContacts = (props) => {
    const {selectedBeaconEmergencyContacts} = props
    return (
        <Card
            size="small"
            style={{marginBottom: 0, height: '100%'}}
            className="beacon-card"
            title={<span><AlertOutlined className="fallIcon" />Emergency Contacts</span>}
            extra={<Link to={'/beacon/settings/general'} style={{marginLeft: 12}}>Change</Link>}
        >
            {selectedBeaconEmergencyContacts?.length>0 ? <div>
                {`${selectedBeaconEmergencyContacts.length} contact${selectedBeaconEmergencyContacts.length>1 ? 's':''}`} set, make sure their details are up to date.
            </div> : <div>You need to set up some emergency contacts now!</div>}
        </Card>
    )
}

export default EmergencyContacts

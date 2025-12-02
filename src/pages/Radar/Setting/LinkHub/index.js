import { Card } from 'antd'
import LinkHubModal from '@/pages/Radar/Setting/LinkHub/LinkHubModal'
import { globalConstants } from '@/_constants'

const LinkRadarToHub = (props) => {

    return (
        <Card title={`Link to ${globalConstants.HUB_SOFIHUB}`}>
            <p>This is where you can link your {globalConstants.RADAR_HOBA} to your {globalConstants.HUB_SOFIHUB} and allocate it to a space.</p>
            <LinkHubModal {...props}/>
        </Card>
    )
}

export default LinkRadarToHub

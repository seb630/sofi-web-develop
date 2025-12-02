import { Button, Col, Row } from 'antd'
import geofence from '../../../../images/geofence__banner.webp'
import { globalConstants } from '@/_constants'
import { isLife, isWatch } from '@/utility/Common'

const geofenceStep = (selectedBeacon, next, prev) => {
    const title = 'Geofencing'
    const name =  isLife(selectedBeacon) ? globalConstants.LIFE_SOFIHUB : 
        isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB
    const content =
        <div className="wizardContent">
            <p>The {name} also offers geofencing.</p>
            <p>A geo fence is a virtual area that you draw on a map, it looks a little like the example below, if the {
                selectedBeacon && selectedBeacon.first_name} enters that area or leaves that area you can be notified.</p>
            <div style={{ width: '100%', height: '220px' }}>
                <img src={geofence} alt="Paris" className="geofenceImg" />
            </div>
            <p>If this is something that interests you, you can add a geo fence after you&#39;ve finished set up by heading over to the
                geofence menu.</p>
            <p>Please note only carers can get notified of geo fence data, not emergency contacts.</p>
        </div>
    const action = <Row><Col span={24}><Button onClick={prev}>Previous</Button>
        <Button
            type="primary"
            onClick={next}
            className="floatRight">Next</Button></Col>
    </Row>

    return { title, content, action }
}

export default geofenceStep

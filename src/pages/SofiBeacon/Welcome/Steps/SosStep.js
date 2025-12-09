import { Button, Col, Row } from 'antd'
import BeaconIcon from '../../../../images/beacon_icon.svg'
import LifeIcon from '@/images/beacon_teq_life.png'
import WatchIcon from '../../../../images/beacon_watch_icon.png'
import HaloIcon from '@/images/beacon_teq_halo.png'
import { globalConstants } from '@/_constants'
import { isLife, isWatch, isHalo } from '@/utility/Common'

const sosStep = (selectedBeacon, next, prev) =>{
    const title = 'SOS button'
    const name =  isLife(selectedBeacon) ? globalConstants.LIFE_SOFIHUB : 
        isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : 
            isHalo(selectedBeacon) ? 'Halo' : globalConstants.BEACON_SOFIHUB
    const content = <div className="wizardContent">
        <p>You may have noticed there is an SOS button on the front of the {name}.</p>
        {isLife(selectedBeacon) ? <img src={LifeIcon} style={{height: '250px'}} /> :
            isWatch(selectedBeacon) ? <img src={WatchIcon} style={{ height: '200px'}} /> : 
                isHalo(selectedBeacon) ? <img src={HaloIcon} style={{height: '250px'}} /> :
                    <BeaconIcon className="productImg biggerImg"/>}
        <p>When {selectedBeacon?.first_name} needs assistance, they need to press and hold the SOS button. Shortly
            afterwards the beacon will call the emergency contacts. Before you use your beacon we need to know who
            whose emergency contacts are! Let&#39;s add some emergency contacts!</p>
    </div>
    const action = <Row><Col span={24}><Button style={{ marginLeft: 8 }} onClick={prev}>
        Previous
    </Button>
    <Button
        type="primary"
        onClick={next}
        className="floatRight">Next</Button></Col>
    </Row>

    return {title,content, action}
}

export default sosStep

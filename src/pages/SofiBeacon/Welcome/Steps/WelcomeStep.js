import { Button } from 'antd'
import BeaconIcon from '../../../../images/beacon_icon.svg'
import { globalConstants } from '@/_constants'
import { isLife, isWatch } from '@/utility/Common'
import LifeIcon from '../../../../images/beacon_teq_life.png'
import WatchIcon from '../../../../images/beacon_watch_icon.png'

const welcomeStep = (next, selectedBeacon) => {
    const title = 'Welcome'
    const name = isLife(selectedBeacon) ? globalConstants.LIFE_SOFIHUB : 
        isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH: globalConstants.BEACON_SOFIHUB
    const content = <div className="wizardContent">
        <h4>Thanks for buying your {name}!</h4>
        {/* <BeaconIcon className="productImg"/> */}
        {
            isLife(selectedBeacon) ? 
                <img src={LifeIcon} style={{ height: '250px' }} /> : 
                isWatch(selectedBeacon) ? <img src={WatchIcon} style={{ height: '200px'}}/> :
                    <BeaconIcon className="productImg" />
        }
        <p>You&#39;re almost there, we need you to <u>turn on your {name} now</u>, and also we need just a few more details from
            you in order to finish setting up the {name}.</p>
    </div>
    const action = <Button type="primary" onClick={next} className="floatRight">Let&#39;s go!</Button>
    return { title, content, action }
}

export default welcomeStep

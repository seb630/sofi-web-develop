import { Component } from 'react'
import DownTime from '../../../_constants/downtime'
import moment from 'moment'
import {Result, Carousel} from 'antd'
import {globalConstants} from '@/_constants'
import maintain1 from '../../../images/maintenance1.webp'
import maintain2 from '../../../images/maintenance2.webp'

export default class DownTimeTest extends Component {

    render () {
        const latestDownTime = DownTime[DownTime.length - 1]
        const icon =
            <div style={{width:310, margin: 'auto'}}>
                <Carousel autoplay dots={false} lazyLoad style={{textAlign: 'center'}} effect="fade">
                    <div className='justify-content-center' >
                        <img src={maintain1} width={310}/>
                    </div>
                    <div>
                        <img src={maintain2} width={310} />
                    </div>
                </Carousel>
            </div>
        return (
            <div>
                <Result
                    icon={icon}
                    title={latestDownTime.title}
                    subTitle={
                        <div>{latestDownTime.blockPortalAccessPageBody} from {moment(latestDownTime.outageDateTimeStart)
                            .format(globalConstants.LONGDATETIME_FORMAT)} to {moment(latestDownTime.outageDateTimeEnd)
                            .format(globalConstants.LONGDATETIME_FORMAT)}</div>
                    }
                />
            </div>
        )

    }
}

import { Component } from 'react'
import DownTime from '../../../_constants/downtime'
import moment from 'moment'
import { Result, Carousel, Button } from 'antd'
import {globalConstants} from '@/_constants'
import maintain1 from '../../../images/maintenance1.webp'
import maintain2 from '../../../images/maintenance2.webp'
import {formatTemplateToString} from '@/utility/Common'
import {actions} from 'mirrorx'


export default class DownTimePage extends Component {

    constructor(props){
        super(props)
        this.state = {time: moment()}
    }

    timer = () => {
        this.setState({
            time: moment()
        })
    }

    componentDidMount() {
        this.intervalId = setInterval(this.timer, 10000)
    }

    componentWillUnmount(){
        clearInterval(this.intervalId)
    }

    render () {
        const {time} = this.state
        const latestDownTime = DownTime[DownTime.length - 1]
        const start = moment(latestDownTime.outageDateTimeStart).format(globalConstants.LONGDATETIME_FORMAT)
        const end = moment(latestDownTime.outageDateTimeEnd).format(globalConstants.LONGDATETIME_FORMAT)
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
        return moment(latestDownTime.outageDateTimeStart).isBefore(time) && moment(latestDownTime.outageDateTimeEnd).isAfter(time) ?
            <div>
                <Result
                    icon={icon}
                    title={latestDownTime.blockPortalAccessPageTitle}
                    subTitle={<div>{formatTemplateToString(latestDownTime.blockPortalAccessPageBody, {start, end})}</div>}
                    extra={<Button type="primary" onClick={()=>actions.routing.push('/maintenance')}>More Details</Button>}
                />
            </div>
            :window.location.href='/deviceSelection'
    }
}

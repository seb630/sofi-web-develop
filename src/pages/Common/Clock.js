import { Component } from 'react'
import moment from 'moment-timezone'
import { globalConstants } from '@/_constants'

export default class Clock extends Component {
    constructor(props){
        super(props)
        this.state = {time: moment()}
    }

    timer() {
        this.setState({
            time: moment()
        })
    }
    componentDidMount() {
        moment.tz.setDefault(this.props.timezone)

        this.intervalId = setInterval(this.timer.bind(this), 1000)
    }
    componentWillUnmount(){
        clearInterval(this.intervalId)
    }
    render() {
        const {timezone, online, product} = this.props
        return(
            timezone ?
                <div>
                    {online &&
                    <p className="lastSeen">
                        Current {product} time: {this.state.time.tz(this.props.timezone).format(globalConstants.CLOCK_DT_FORMAT)}
                    </p>
                    }
                </div>
                :
                <div>
                    {online &&
                    <p className="lastSeen">Current {product} time: {this.state.time.tz(moment.tz.guess()).format(globalConstants.CLOCK_DT_FORMAT)}</p>}
                </div>

        )
    }
}

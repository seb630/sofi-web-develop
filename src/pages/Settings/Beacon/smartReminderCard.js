import { Component } from 'react'
import { Card } from 'antd'
import PropTypes from 'prop-types'
import { globalConstants } from '@/_constants'

class SmartReminderCard extends Component {
    render() {
        const { beacons } = this.props
        return (<Card className="beacon-card" title="Smart Reminders">
            <p>These settings if on, and if your {globalConstants.BEACON_SOFIHUB} is linked to a {globalConstants.HUB_SOFIHUB}, may result in your {globalConstants.HUB_SOFIHUB} speaking to you.</p>
            <p>The following {globalConstants.BEACON_SOFIHUB}s have at least one smart reminders switched on, to switch off a reminder select it from the list and switch of desired reminder.</p>
            <ul id="list-smartreminders" style={{ marginLeft: '20px'}} className="list-unstyled">
                {
                    beacons && beacons.map((x,key) => {
                        return (<li key={key}> {x.display_name} </li>)
                    })
                }
            </ul>
        </Card>)
    }
}

SmartReminderCard.propTypes = {
    beacons: PropTypes.arrayOf(PropTypes.shape({
        display_name: PropTypes.string
    }))
}

export default SmartReminderCard

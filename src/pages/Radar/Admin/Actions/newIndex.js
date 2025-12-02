import RadarActionCard from '@/pages/Radar/Admin/Actions/RadarActionCard'
import { Fragment } from 'react'
import CommandHistoryCard from '@/pages/Radar/Admin/Actions/CommandHistoryCard'

const RadarActions = (props) => {

    return (
        <Fragment>
            <RadarActionCard {...props}/>
            {/*<CommandHistoryCard  {...props}/>*/}
        </Fragment>
    )
}

export default RadarActions

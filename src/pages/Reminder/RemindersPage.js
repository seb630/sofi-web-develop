import { Component } from 'react'
import Reminders from './Reminders'
import { connect } from 'mirrorx'
import PortalLayout from '../Common/Layouts/PortalLayout'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    speaker_spaces: state.setting.settings && state.setting.settings.preferences.speaker_spaces[0] || ''
})


class RemindersPage extends Component {

    /** render page content */
    renderPageContent() {
        return ( <div className="contentPage">
            {
                this.props.reminders && this.props.selectedHub &&
                <Reminders
                    reminders={this.props.reminders}
                    speaker_spaces={this.props.speaker_spaces}
                    hubId={this.props.selectedHub.hub_id}/>
            }
        </div>)
    }

    render() {
        return (
            <PortalLayout
                menu='hub'
                page="Reminders"
                content={this.renderPageContent()} />
        )
    }
}

export default connect(mapStateToProps, null)(RemindersPage)

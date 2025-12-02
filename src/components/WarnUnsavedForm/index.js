import { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { withRouter, Prompt } from 'mirrorx'

function warnAboutUnsavedForm(WrappedComponent) {
    class WarnAboutUnsavedChanges extends Component {
        static propTypes = {
            isDirty: PropTypes.bool,
            leaveMessage: PropTypes.string.isRequired
        }

        static defaultProps = {
            leaveMessage: 'You made changes, but you have not saved them yet, are you sure you wish to change pages?'
        }

        componentDidUpdate() {
            this._promptUnsavedChange(this.props.isDirty, this.props.leaveMessage)
        }

        componentWillUnmount() {
            window.onbeforeunload = null
        }

        _promptUnsavedChange(isUnsaved = false, leaveMessage) {
            window.onbeforeunload = isUnsaved && (() => leaveMessage)
        }

        render() {
            return (
                <Fragment>
                    <WrappedComponent {...this.props} />
                    <Prompt
                        when={this.props.isDirty}
                        message={this.props.leaveMessage}
                    />
                </Fragment>
            )
        }
    }

    return withRouter(WarnAboutUnsavedChanges)
}

export default warnAboutUnsavedForm

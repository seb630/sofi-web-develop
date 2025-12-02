import { Component } from 'react'
import { Button, Popconfirm } from 'antd'
import PropTypes from 'prop-types'
import { globalConstants } from '@/_constants'

export default class OfflineFooter extends Component {
    constructor(props){
        super(props)
        this.state = {
            open: false,
        }
    }

    handleOpenChange = (open) => {
        if (!open) {
            this.setState({ open })
            return
        }
        // Determining condition before show the popconfirm.
        if (this.props.onlineStatus) {
            this.props.handleOk() // next step
        } else {
            this.setState({ open }) // show the popconfirm
        }
    }

    render() {
        return(
            [
                <Button key="back" onClick={this.props.handleCancel}>Cancel</Button>,
                <Popconfirm
                    okText="Yes"
                    cancelText="No"
                    key="submit"
                    title={<div><p>The {globalConstants.HUB_SOFIHUB} is currently offline.</p>
                        <p>Would you like to queue your request to</p>
                        <p>take place when the {globalConstants.HUB_SOFIHUB} become active</p></div>}
                    open={this.state.open}
                    onOpenChange={this.handleOpenChange}
                    onCancel={this.props.handleCancel}
                    onConfirm={this.props.handleOk}
                >
                    <Button type="primary">
                        Send to {globalConstants.HUB_GENERIC}
                    </Button>
                </Popconfirm>
            ]
        )
    }
}

OfflineFooter.propTypes={
    handleCancel: PropTypes.func,
    handleOk: PropTypes.func,
    onlineStatus: PropTypes.bool,

}

import { Component, Fragment } from 'react'
import { Button, message, Modal, Select, Spin } from 'antd'
import { actions } from 'mirrorx'
import PropTypes from 'prop-types'
import { globalConstants } from '@/_constants'
import { isWatch } from '@/utility/Common'

class LinkHubModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            submitting: false,
            open: false,
            selectedHub: null,
        }
    }

    /** handle Open */
    handleOpen = () => {
        this.setState({
            open: true
        })
    }

    /** handle Cancel */
    handleCancel = () => {
        this.setState({
            open: false,
            selectedHub: null,
        })
    }

    /** handle Link Hub */
    handleLinkHub = async () => {
        try {
            const { selectedBeacon, onAfterSaved } = this.props
            const { selectedHub } = this.state
            this.setState({
                submitting: true
            })

            if(selectedHub) {
                await actions.sofiBeacon.linkBeacon({ beaconId: selectedBeacon.pub_id, hubId: selectedHub})
                    .then(()=>{
                        actions.sofiBeacon.fetchBeaconByUser()
                    })
                await actions.sofiBeacon.fetchLinkedHub(selectedBeacon.pub_id)
                selectedBeacon.hub_id = selectedHub
                actions.sofiBeacon.selectBeacon(selectedBeacon)
                this.handleCancel()
                onAfterSaved && onAfterSaved()
            }
        } catch (err) {
            err.global_errors && err.global_errors.map((msg) => {
                message.error(msg)
            })
        } finally {
            this.setState({
                submitting: false
            })
        }
    }

    /** handle Select Item */
    handleSelectItem = (item) => {
        this.setState({ selectedHub: item })
    }

    /** handle change hub */
    handleChangeHub = () => {
        Modal.confirm({
            title: `Are you sure you wish to change the ${globalConstants.HUB_SOFIHUB} linked to this ${globalConstants.BEACON_SOFIHUB} ?`,
            content: `If you change the ${globalConstants.HUB_SOFIHUB} you will no longer receive the smart reminders on the old ${globalConstants.HUB_SOFIHUB} if turned on.`,
            okText:'Change',
            onOk: this.handleOpen
        })
    }

    render() {
        const { hubs, selectedBeacon } = this.props
        const { open, submitting, selectedHub } = this.state
        const options = hubs.map(hub=><Select.Option value={hub.hub_id} key={hub.hub_id}>{hub.display_name}</Select.Option>)

        return (<Fragment>
            {
                selectedBeacon.hub_id
                    ? hubs.find(hub=>hub.hub_id===selectedBeacon.hub_id) ? <Button id='btn-linkHub' type="primary" onClick={this.handleChangeHub}>Change linked {globalConstants.HUB_SOFIHUB}</Button>
                        : null
                    : <Button id='btn-linkHub' type="primary" onClick={this.handleOpen}>Link with {globalConstants.HUB_SOFIHUB}</Button>
            }
            <Modal
                onCancel={this.handleCancel}
                open={open}
                onOk={this.handleLinkHub}
                okText="Link"
                okButtonProps={{disabled: !selectedHub}}
            >
                <Spin spinning={submitting}>
                    <label>Which {globalConstants.HUB_SOFIHUB} do you want to link with this {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB} ?</label>
                    <Select
                        style={{width: 300}}
                        showSearch
                        filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                        size="large"
                        value={selectedHub}
                        onChange={v=>this.handleSelectItem(v)}
                        placeholder={`Please select a ${globalConstants.HUB_SOFIHUB}...`}
                    >
                        {options}
                    </Select>
                </Spin>
            </Modal>
        </Fragment>)
    }
}

LinkHubModal.propTypes = {
    selectedBeacon: PropTypes.shape({
        hub_id: PropTypes.string,
        id: PropTypes.string
    }).isRequired,
    hubs: PropTypes.arrayOf(PropTypes.shape({
        hub_id: PropTypes.string,
        display_name: PropTypes.string
    })).isRequired,
    onAfterSaved: PropTypes.func
}

export default LinkHubModal

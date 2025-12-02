import { Component, createRef, Fragment } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button, message, Modal, Select } from 'antd'
import { actions } from 'mirrorx'
import ReCAPTCHA from 'react-google-recaptcha'
import { globalConstants } from '@/_constants'
import PropTypes from 'prop-types'
import Mask from 'react-text-mask'
import { titleCase } from 'change-case'

export default class AddHubOrgModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            open: false,
            hub: [],
            macAddress: '',
        }
        this.recaptchaRef = createRef()
    }

    handleClose = () => {
        this.setState({ open: false,hub: [], macAddress:'' })
        this.props.onClose && this.props.onClose()
    }

    handleOpen = () => {
        this.setState({open: true})
    }

    handleSave = async() => {
        this.props.admin ? this.handleAdminSave() : this.recaptchaRef.current.execute()
    }

    handleHubChange = (value) => {
        value.length<=10 ? this.setState({hub: value}) : message.error(`Select up to 10 ${globalConstants.HUB_GENERIC}s at a time`)
    }

    handleAdminSave = async () => {
        const { currentOrg, allHubs } = this.props
        const promises = []
        this.state.hub.map(macAddress=>{
            const selectedHub = allHubs.find(hub=>hub.mac_address===macAddress)
            let payload = {}
            payload.type='HUB'
            payload.organization_id = currentOrg.organization_id
            payload.device_id = selectedHub.hub_id
            payload.mac_or_imei = selectedHub.mac_address
            promises.push(actions.organisation.associateOrgDevice(payload))
        })

        await Promise.all(promises)
        message.success(`The ${globalConstants.HUB_GENERIC}s have been added.`)
        actions.organisation.fetchOrgHubs(currentOrg.organization_id)
        this.setState({ open: false, hub: []})
    }

    captchaSuccess = (captcha) => {
        const { currentOrg, groupId } = this.props
        let payload = {captcha}
        payload.type='HUB'
        payload.organization_id = currentOrg.organization_id
        payload.mac_or_imei = this.state.macAddress
        actions.organisation.associateOrgDevice(payload).then((result)=>{
            if (groupId) {
                payload = {
                    ...result,
                    organization_device_group_id: groupId,
                    organization_id: currentOrg.organization_id
                }
                const orgId =  currentOrg.organization_id
                actions.organisation.addDeviceGroupDevice({orgId, payload}).then(()=>{
                    message.success(`The ${globalConstants.HUB_GENERIC} has been added to organisation and group`)
                    actions.organisation.fetchOrgHubs(currentOrg.organization_id)
                    actions.organisation.fetchAllDeviceGroupDevices(currentOrg.organization_id)
                    this.setState({ open: false, macAddress:''})
                })
            }else{
                message.success(`The ${globalConstants.HUB_GENERIC} has been added to organisation`)
                actions.organisation.fetchOrgHubs(currentOrg.organization_id)
                this.setState({ visbile: false, macAddress:''})
            }

        },(error) => {
            this.recaptchaRef.current.reset()
            message.error(error.message, 10)})
    }

    buildHubOptions = () => {
        const candidates = this.props.allHubs && this.props.allHubs.filter(
            hub=> !this.props.orgHubs?.find(x=>x.hub_id===hub.hub_id)
        )
        return candidates && candidates.map(hub => (
            <Select.Option key={hub.mac_address} value={hub.mac_address}>{hub.display_name}</Select.Option>
        ))
    }

    filterOption = (inputValue, option) => {
        return option.props.value.toLowerCase().includes(inputValue.toLowerCase()) || option.children.toLowerCase().includes(inputValue.toLowerCase())
    }

    render() {
        const {admin} = this.props
        const hubOptions = this.buildHubOptions()
        return (
            <Fragment>
                <Button style={{ marginTop: '16px'}} type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleOpen}>Add Hub</Button>
                <Modal
                    destroyOnClose
                    okText="Save"
                    open={this.state.open} onCancel={this.handleClose}
                    onOk={this.handleSave}
                    centered={false} title={`Add ${titleCase(globalConstants.HUB_GENERIC)}`}  style={{height: '500px'}}
                >
                    {admin ? <div style={{display:'grid'}}>
                        <label>{titleCase(globalConstants.HUB_GENERIC)} Name:</label>
                        <Select
                            autoFocus
                            showSearch
                            mode="multiple"
                            filterOption={this.filterOption}
                            size="large"
                            onChange={this.handleHubChange}
                            placeholder={`Please select up to 10 ${globalConstants.HUB_GENERIC}s...`}
                            value={this.state.hub}
                        >
                            {hubOptions}
                        </Select>
                    </div>:
                        <div style={{display:'grid'}}>
                            <label>Hub MAC Address:</label>
                            <Mask
                                autoFocus
                                name="mac"
                                style={{marginBottom:'24px'}}
                                placeholder="12:34:56:78:90:AB"
                                className="ant-input ant-input-lg"
                                pipe={ (value) => ({value: value.toUpperCase()})}
                                mask={[/[0-9A-Fa-fa-f]/, /[0-9A-Fa-f]/, ':',/[0-9A-Fa-f]/, /[0-9A-Fa-f]/, ':',/[0-9A-Fa-f]/, /[0-9A-Fa-f]/, ':',
                                    /[0-9A-Fa-f]/, /[0-9A-Fa-f]/, ':',/[0-9A-Fa-f]/, /[0-9A-Fa-f]/, ':',/[0-9A-Fa-f]/, /[0-9A-Fa-f]/]}
                                render={(ref, props) => (
                                    <input ref={ref} {...props} />
                                )}
                                value={this.state.macAddress}
                                onChange={v=>this.setState({macAddress: v.target.value})}
                            />
                            <ReCAPTCHA
                                ref={this.recaptchaRef}
                                size='invisible'
                                badge='inline'
                                sitekey={globalConstants.RECAPTCHA_KEY}
                                onChange={this.captchaSuccess}
                            />
                        </div>
                    }
                </Modal>
            </Fragment>
        )
    }
}

AddHubOrgModal.propTypes ={
    open: PropTypes.bool,
    onClose: PropTypes.func,
    currentOrg: PropTypes.object,
    admin: PropTypes.bool,
    allHubs: PropTypes.array,
    orgHubs: PropTypes.array,
    groupId: PropTypes.number,
}

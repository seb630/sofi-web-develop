import { Component, createRef, Fragment } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Input, message, Modal, Select } from 'antd'
import { actions } from 'mirrorx'
import ReCAPTCHA from 'react-google-recaptcha'
import { globalConstants } from '@/_constants'
import PropTypes from 'prop-types'
import { titleCase } from 'change-case'

export default class AddBeaconModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            open: props.open,
            beacon: [],
            imei : ''
        }
        this.recaptchaRef = createRef()
    }

    handleClose = () => {
        this.setState({ open: false,beacon: [], imei : '' })
        this.props.onClose && this.props.onClose()
    }

    handleOpen = () => {
        this.setState({ open: true })
    }

    handleChange = (value) => {
        value.length<=10 ? this.setState({beacon: value}) : message.error(`Select up to 10 ${globalConstants.PENDANT_GENERIC}s at a time`)
    }

    handleSave = async() => {
        this.props.admin ? await this.handleAdminSave() : this.recaptchaRef.current.execute()
    }

    handleAdminSave = async() => {
        const { currentOrg, allBeacons } = this.props

        const promises = []
        this.state.beacon.map(imei=>{
            const selectedBeacon = allBeacons.find(beacon=>beacon.imei===imei)
            let payload = {}
            payload.type='BEACON'
            payload.organization_id = currentOrg.organization_id
            payload.device_id = selectedBeacon.id
            payload.mac_or_imei = selectedBeacon.imei
            promises.push(actions.organisation.associateOrgDevice(payload))
        })

        await Promise.all(promises)
        message.success(`The ${globalConstants.PENDANT_GENERIC}s have been added.`)
        actions.organisation.fetchOrgBeacons(currentOrg.organization_id)
        this.setState({ open: false, beacon: [], imei: ''})
    }

    captchaSuccess = (captcha) => {
        const { currentOrg, groupId } = this.props
        let payload = {captcha}
        payload.type='BEACON'
        payload.organization_id = currentOrg.organization_id
        payload.mac_or_imei = this.state.imei
        actions.organisation.associateOrgDevice(payload).then((result)=>{
            if (groupId) {
                payload = {
                    ...result,
                    organization_device_group_id: groupId,
                    organization_id: currentOrg.organization_id
                }
                const orgId =  currentOrg.organization_id
                actions.organisation.addDeviceGroupDevice({orgId, payload}).then(()=>{
                    message.success(`The ${globalConstants.PENDANT_GENERIC} has been added to organisation and group`)
                    actions.organisation.fetchOrgBeacons(currentOrg.organization_id)
                    actions.organisation.fetchAllDeviceGroupDevices(currentOrg.organization_id)
                    this.setState({ open: false, imei:''})
                })
            }else{
                message.success(`The ${globalConstants.PENDANT_GENERIC} has been added to organisation`)
                actions.organisation.fetchOrgBeacons(currentOrg.organization_id)
                this.setState({ open: false, imei:''})
            }

        },(error) => {
            this.recaptchaRef.current.reset()
            message.error(error.message, 10)})
    }


    buildOptions = () => {
        const { allBeacons , orgBeacons } = this.props
        const candidates = allBeacons && orgBeacons && allBeacons.filter(
            beacon => !orgBeacons.find( x => x.id === beacon.id)
        )
        return candidates && candidates.map(beacon => (
            <Select.Option
                key={beacon.id}
                value={beacon.imei}
                phone={beacon.phone}
                imei={beacon.imei}
            >{beacon.display_name}</Select.Option>
        ))
    }

    filterOption = (inputValue, option) => {
        return option.props.imei.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.children.toLowerCase().includes(inputValue.toLowerCase())||
            option.props.phone.toLowerCase().includes(inputValue.toLowerCase())
    }

    render() {
        const {admin} = this.props
        const options = this.buildOptions()
        return (
            <Fragment>
                <Button type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleOpen}>Add Beacon</Button>
                <Modal
                    destroyOnClose
                    okText="Save"
                    open={this.state.open} onCancel={this.handleClose}
                    onOk={this.handleSave}
                    centered={false} title={`Add ${titleCase(globalConstants.PENDANT_GENERIC)}`}  style={{height: '300px'}}
                >
                    {admin ? <div style={{display: 'grid'}}>
                        <label>{titleCase(globalConstants.PENDANT_GENERIC)} Name</label>
                        <Select
                            showSearch
                            mode="multiple"
                            filterOption={this.filterOption}
                            size="large"
                            value={this.state.beacon}
                            onChange={this.handleChange}
                            placeholder={`Please select up to 10 ${globalConstants.PENDANT_GENERIC}s...`}
                        >
                            {options}
                        </Select>
                    </div> :
                        <div style={{display:'grid'}}>
                            <label>Beacon IMEI number:</label>
                            <Input
                                placeholder="IMEI number"
                                style={{marginBottom:'24px'}}
                                value={this.state.imei}
                                onChange={v=>this.setState({imei: v.target.value})}
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

AddBeaconModal.propTypes ={
    open: PropTypes.bool,
    onClose: PropTypes.func,
    currentOrg: PropTypes.object,
    type: PropTypes.oneOf(['user','device']),
    admin: PropTypes.bool,
    allBeacons: PropTypes.array,
    orgBeacons: PropTypes.array,
    groupId: PropTypes.number,
}

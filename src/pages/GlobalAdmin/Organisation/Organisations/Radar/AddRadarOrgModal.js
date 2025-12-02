import { Component, createRef, Fragment } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import {Button, Input, message, Modal, Select} from 'antd'
import { actions } from 'mirrorx'
import ReCAPTCHA from 'react-google-recaptcha'
import { globalConstants } from '@/_constants'
import PropTypes from 'prop-types'
import { titleCase } from 'change-case'

export default class AddRadarModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            open: props.open,
            radar: [],
            ext_id : ''
        }
        this.recaptchaRef = createRef()
    }

    handleClose = () => {
        this.setState({ open: false,radar: [], ext_id : '' })
        this.props.onClose && this.props.onClose()
    }

    handleOpen = () => {
        this.setState({ open: true })
    }

    handleChange = (value) => {
        value.length<=10 ? this.setState({radar: value}) :  message.error(`Select up to 10 ${globalConstants.RADAR_GENERIC}s at a time`)
    }

    handleSave = async() => {
        this.props.admin ? this.handleAdminSave() : this.recaptchaRef.current.execute()
    }

    handleAdminSave = async() => {
        const { currentOrg, radars } = this.props

        const promises = []
        this.state.radar.map(ext_id=>{
            const selectedRadar = radars.find(radar=>radar.ext_id===ext_id)
            let payload = {}
            payload.type='RADAR'
            payload.organization_id = currentOrg.organization_id
            payload.device_id = selectedRadar.id
            payload.mac_or_imei = selectedRadar.ext_id
            promises.push(actions.organisation.associateOrgDevice(payload))
        })

        await Promise.all(promises)
        message.success(`The ${globalConstants.RADAR_GENERIC}s have been added.`)
        actions.organisation.fetchOrgRadars(currentOrg.organization_id)
        this.setState({ open: false, radar: [], ext_id: ''})
    }

    captchaSuccess = (captcha) => {
        const { currentOrg, groupId } = this.props
        let payload = {captcha}
        payload.type='RADAR'
        payload.organization_id = currentOrg.organization_id
        payload.mac_or_imei = this.state.ext_id
        actions.organisation.associateOrgDevice(payload).then((result)=>{
            if (groupId) {
                payload = {
                    ...result,
                    organization_device_group_id: groupId,
                    organization_id: currentOrg.organization_id
                }
                const orgId =  currentOrg.organization_id
                actions.organisation.addDeviceGroupDevice({orgId, payload}).then(()=>{
                    message.success(`The ${globalConstants.RADAR_GENERIC} has been added to organisation and group`)
                    actions.organisation.fetchOrgRadars(currentOrg.organization_id)
                    actions.organisation.fetchAllDeviceGroupDevices(currentOrg.organization_id)
                    this.setState({ open: false, ext_id:''})
                })
            }else{
                message.success(`The ${globalConstants.RADAR_GENERIC} has been added to organisation`)
                actions.organisation.fetchOrgRadars(currentOrg.organization_id)
                this.setState({ open: false, ext_id:''})
            }

        },(error) => {
            this.recaptchaRef.current.reset()
            message.error(error.message, 10)})
    }


    buildOptions = () => {
        const { radars , orgRadars } = this.props
        const candidates = orgRadars && radars?.filter(
            radar => !orgRadars.find( x => x.id === radar.id)
        )
        return candidates?.filter(radar=>radar?.ext_id)?.map(radar => (
            {
                value: radar.ext_id,
                label: radar.display_name
            }
        ))
    }

    filterOption = (inputValue, option) => {
        return option.props.value.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.children.toLowerCase().includes(inputValue.toLowerCase())
    }

    render() {
        const {admin} = this.props
        const options = this.buildOptions()
        return (
            <Fragment>
                <Button style={{ marginTop: '16px'}} type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleOpen}>Add Radar</Button>
                <Modal
                    destroyOnClose
                    okText="Save"
                    open={this.state.open} onCancel={this.handleClose}
                    onOk={this.handleSave}
                    centered={false} title={`Add ${titleCase(globalConstants.RADAR_GENERIC)}`}  style={{height: '400px'}}
                >
                    {admin ? <div style={{display: 'grid'}}>
                        <label>{titleCase(globalConstants.RADAR_GENERIC)} Name:</label>
                        <Select
                            showSearch
                            mode="multiple"
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            size="large"
                            value={this.state.radar}
                            onChange={this.handleChange}
                            options={options}
                            placeholder={`Please select up to 10 ${globalConstants.RADAR_GENERIC}s...`}
                        />
                    </div> :
                        <div style={{display:'grid'}}>
                            <label>Radar External ID:</label>
                            <Input
                                placeholder="ext_id"
                                style={{marginBottom:'24px'}}
                                value={this.state.ext_id}
                                onChange={v=>this.setState({ext_id: v.target.value})}
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

AddRadarModal.propTypes ={
    open: PropTypes.bool,
    onClose: PropTypes.func,
    currentOrg: PropTypes.object,
    type: PropTypes.oneOf(['user','device']),
    admin: PropTypes.bool,
    radars: PropTypes.array,
    orgRadars: PropTypes.array,
    groupId: PropTypes.number,
}

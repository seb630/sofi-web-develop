import { Component } from 'react'
import { actions } from 'mirrorx'
import { globalConstants } from '@/_constants'
import { requiredField } from '@/utility/Validation'
import { Button, Card, Col, Input, message, Popconfirm, Row, Select } from 'antd'
import { settings } from '../Initial'
import { buildCountryOptions, buildTimezoneOptions, getCountryCode, getTimeZone } from '@/utility/Countries'
import warnAboutUnsavedForm from '../../../components/WarnUnsavedForm'

class ResidentDetailsCard extends Component{
    constructor(props) {
        super(props)
        this.state = {
            firstName: this.props.settings?.resident_profile?.first_name || '',
            lastName: this.props.settings?.resident_profile?.last_name || '',
            country: this.props.settings?.location?.country || '',
            postcode: this.props.settings?.location?.postcode || '',
            region: this.props.settings?.location?.region || '',
            city: this.props.settings?.location?.city || '',
            timezone: this.props.settings?.preferences?.timezone || '',
            hubLocation: this.props.settings?.preferences?.speaker_spaces[0] || '',
        }
    }

    componentDidUpdate(prevProps){
        prevProps.settings !== this.props.settings && this.props.settings &&
        this.setState({
            firstName: this.props.settings.resident_profile.first_name,
            lastName: this.props.settings.resident_profile.last_name,
            country: this.props.settings.location.country,
            postcode: this.props.settings.location.postcode,
            region: this.props.settings.location.region,
            city: this.props.settings.location.city,
            timezone: this.props.settings.preferences?.timezone,
            hubLocation: this.props.settings.preferences.speaker_spaces[0]
        })
    }

    handleClearMsg() {
        this.setState({ updatePersonalMessage: '' })
    }

    validateFieldValue() {
        let error = requiredField(this.state.firstName) || requiredField(this.state.lastName)
        if (error) {
            this.setState({ updatePersonalMessage: globalConstants.REQUIRED_RNAME })
            return error
        }
        error = requiredField(this.state.hubLocation)
        if (error) {
            this.setState({ updatePersonalMessage: globalConstants.REQUIRED_HUBLOCATION })
            return error
        }
        return false
    }

    initialise = () => {
        const hubId = this.props.selectedHub.hub_id
        actions.setting.saveSettings({hubId, settings}).then(() => {
            this.setState({ updatePersonalMessage: globalConstants.UPDATE_SUCCESS })
        }, (error) => {
            this.setState({ updatePersonalMessage: globalConstants.WENT_WRONG + ' ' + error})
        })
    }

    handleSaveClick() {
        let newSettings = this.props.settings
        if (this.validateFieldValue()) return
        const hubId = this.props.selectedHub.hub_id

        newSettings.resident_profile.first_name = this.state.firstName
        newSettings.resident_profile.last_name = this.state.lastName
        newSettings.location.country = this.state.country
        newSettings.location.region = this.state.region
        newSettings.location.city = this.state.city
        newSettings.location.postcode = this.state.postcode
        newSettings.preferences.speaker_spaces[0] = this.state.hubLocation
        newSettings.preferences.timezone = this.state.timezone
        actions.setting.saveSettings({hubId, settings: newSettings}).then(() => {
            message.success(globalConstants.UPDATE_SUCCESS)
            this.props.onSave()
        }, (error) => {
            message.error(globalConstants.WENT_WRONG + ' ' + error)
        })
    }

    handleTimeZoneChange(value) {
        this.props.onFormChange()
        this.setState({timezone: value, country: getCountryCode(value)})
    }

    handleCountryChange(value) {
        this.props.onFormChange()
        this.setState({country: value, timezone: getTimeZone(value)})
    }

    handleFieldChange = (value, field) =>{
        this.props.onFormChange()
        this.setState({[field]: value})
    }
    render(){
        const timezones = buildTimezoneOptions()
        const countryOptions = buildCountryOptions()

        return (
            !this.props.settings ?
                <Card
                    title={`It looks like you've got a brand new ${globalConstants.HUB_SOFIHUB}!`}
                    bordered={false} style={{width: 400}}
                >
                    <Popconfirm
                        title="Are you sure you want to initialise settings?
                    It will overwrite ALL current settings"
                        onConfirm={this.initialise} okText="Yes" cancelText="No">
                        <Button type='primary' size='large'>Get start</Button>
                    </Popconfirm>
                </Card>
                :
                <Card title="Resident Details">
                    <form className="personalSettingsDetails">
                        <div className="form-group">
                            <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}}>
                                <Col md={12}>
                                    <label>Residents First Name</label>
                                    <Input
                                        size="large"
                                        type="text" placeholder="First Name"
                                        onFocus={(event) => this.handleClearMsg(event)}
                                        onChange={e => this.handleFieldChange(e.target.value,'firstName')}
                                        value={this.state.firstName}
                                    />
                                </Col>
                                <Col md={12}>
                                    <label>Residents Last Name</label>
                                    <Input
                                        size="large"
                                        type="text" placeholder="Last Name"
                                        onFocus={(event) => this.handleClearMsg(event)}
                                        onChange={e => this.handleFieldChange(e.target.value,'lastName')}
                                        value={this.state.lastName}
                                    />
                                </Col>
                            </Row>

                            <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}}>
                                <Col md={12}>
                                    <label>Time Zone</label>
                                    <Select
                                        showSearch
                                        filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                        size="large"
                                        value={this.state.timezone}
                                        onChange={value => this.handleTimeZoneChange(value)}
                                        onFocus={(event) => this.handleClearMsg(event)}>{timezones}
                                    </Select>
                                </Col>
                                <Col md={12}>
                                    <label>Country</label>
                                    <Select
                                        key="countrySelect"
                                        optionFilterProp="title"
                                        showSearch
                                        size="large"
                                        value={this.state.country}
                                        onChange={value => this.handleCountryChange(value)}
                                        onFocus={(event) => this.handleClearMsg(event)}>{countryOptions}
                                    </Select>
                                </Col>
                            </Row>

                            <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}}>
                                <Col md={12}>
                                    <label>Region</label>
                                    <Input
                                        size="large"
                                        type="text" placeholder="Region"
                                        onFocus={(event) => this.handleClearMsg(event)}
                                        onChange={e => this.handleFieldChange(e.target.value,'region')}
                                        value={this.state.region}
                                    />
                                </Col>
                                <Col md={12}>
                                    <label>City</label>
                                    <Input
                                        size="large"
                                        type="text" placeholder="City"
                                        onFocus={(event) => this.handleClearMsg(event)}
                                        onChange={e => this.handleFieldChange(e.target.value,'city')}
                                        value={this.state.city}
                                    />
                                </Col>
                            </Row>

                            <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}}>
                                <Col md={12}>
                                    <label>Post Code</label>
                                    <Input
                                        size="large"
                                        type="text" placeholder="Post Code"
                                        onFocus={(event) => this.handleClearMsg(event)}
                                        onChange={e => this.handleFieldChange(e.target.value,'postcode')}
                                        value={this.state.postcode}
                                    />
                                </Col>
                                <Col md={12}>
                                    <label>Which room is the {globalConstants.HUB_SOFIHUB} located?</label>
                                    <Select
                                        size="large"
                                        value={this.state.hubLocation}
                                        onChange={e => this.handleFieldChange(e,'hubLocation')}
                                        onFocus={(event) => this.handleClearMsg(event)}>
                                        <Select.Option value="">Select a room</Select.Option>
                                        <Select.Option value="Kitchen">Kitchen</Select.Option>
                                        <Select.Option value="Lounge Room">Lounge Room</Select.Option>
                                        <Select.Option value="Bedroom">Bedroom</Select.Option>
                                        <Select.Option value="Bathroom">Bathroom</Select.Option>
                                        <Select.Option value="Spare Room">Spare Room</Select.Option>
                                    </Select>
                                </Col>
                            </Row>
                        </div>
                        <div className='d-flex justify-content-end'>
                            <Button type="primary" size="large" onClick={() => this.handleSaveClick()}>Save</Button>
                        </div>
                    </form>
                </Card>

        )
    }
}

export default warnAboutUnsavedForm(ResidentDetailsCard)

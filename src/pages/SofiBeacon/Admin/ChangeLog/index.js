import { Card, Col, Collapse, Descriptions, Row, Select, Switch, Table } from 'antd'
import { Component } from 'react'
import { connect } from 'mirrorx'
import moment from 'moment-timezone'
import { retrieveJSONData, storeJSONData } from '@/utility/Storage'
import commonService from '@/services/Common'
import { globalConstants } from '@/_constants'
import { titleCase } from 'change-case'

const mapStateToProps = state => ({
    changeLogs: state.sofiBeacon.beaconEmergencyContactChangeLogs,
    selectedBeacon: state.sofiBeacon.selectedBeacon
})

class BeaconChangeLogs extends Component{

    constructor(props) {
        super(props)
        this.state = {
            timezone: retrieveJSONData('changeLogTimezone')|| 'local',
            collapseKey: [],
            changeLogDetail: null,
        }
    }

    generatePanel = (logs, timezone) => {
        const {selectedBeacon} = this.props
        const {changeLogDetail, collapseKey} = this.state
        const tz = timezone==='utc' ? 'UTC' : timezone === 'local' ? moment.tz.guess() : selectedBeacon?.timezone

        return <Collapse
            accordion
            activeKey={collapseKey}
            onChange={this.collapseClicked}
            expandIconPosition="end"
        >
            {logs.map((record)=> {
                const submitTime = moment(record.updated_at)
                return (
                    <Collapse.Panel
                        key={record.id}
                        header={`${submitTime.tz(tz).format('DD-MM-YYYY HH:mm:ss (z)')} - Emergency Contact Change`}
                    >
                        {changeLogDetail && this.renderChangeLogDetail(record, changeLogDetail)}
                    </Collapse.Panel>
                )})}
        </Collapse>
    }

    renderChangeLogDetail = (record, beaconECLogDetails) => {
        const appliedTime = record.applied_at ? moment(record.applied_at) : null
        const submitTime = moment(record.updated_at)
        const {selectedBeacon} = this.props
        const columns = [
            {
                title: 'Contact Name',
                dataIndex: 'name',
                key: 'name',
            }, {
                title: 'Phone Number',
                dataIndex: 'number',
                key: 'number',
            }, {
                title: 'On SOS or fall down',
                children: [{
                    title: 'Call Phone',
                    dataIndex: 'accept_phone',
                    valuePropName: 'checked',
                    render: (text, item) => <Switch checkedChildren="On" unCheckedChildren="Off" checked={item.accept_phone} disabled/>

                },
                {
                    title: 'Send SMS',
                    dataIndex: 'accept_sms',
                    valuePropName: 'checked',
                    render: (text, item) => <Switch checkedChildren="On" unCheckedChildren="Off" checked={item.accept_sms} disabled/>
                }]
            },{
            }, {
                title: 'Contact Name',
                dataIndex: 'name',
                key: 'name',
            },
        ]

        return ( <div style={{padding:12}}>
            <Descriptions
                column={1}
                size="small"
                labelStyle={{fontWeight: 'bolder'}}
            >
                <Descriptions.Item label="Emergency contact change submitted via portal on">
                    {submitTime.tz('UTC').format('DD-MM-YYYY HH:mm:ss (z)')}
                    <br />
                    {submitTime.tz(moment.tz.guess()).format('DD-MM-YYYY HH:mm:ss (z)')} - your time zone
                    <br />
                    {submitTime.tz(selectedBeacon?.timezone).format('DD-MM-YYYY HH:mm:ss (z)')} - pendant time zone
                </Descriptions.Item>
                <Descriptions.Item label="Emergency contact change accepted by pendant">
                    {appliedTime?.tz('UTC')?.format('DD-MM-YYYY HH:mm:ss (z)') || 'NONE'}
                    <br />
                    {appliedTime?.tz(moment.tz.guess())?.format('DD-MM-YYYY HH:mm:ss (z)')|| 'NONE'} - your time zone
                    <br />
                    {appliedTime?.tz(selectedBeacon?.timezone)?.format('DD-MM-YYYY HH:mm:ss (z)')|| 'NONE'} - pendant time zone
                </Descriptions.Item>
                <Descriptions.Item label="Emergency contact changes submitted by">{
                `${beaconECLogDetails?.updated_by?.first_name} ${
                    beaconECLogDetails?.updated_by?.last_name
                } (${beaconECLogDetails?.updated_by?.email})`
                } </Descriptions.Item>
            </Descriptions>
            <Row gutter={[12,12]}>
                <Col span={{ xs:24,lg:12 }}>
                    <Table
                        columns={columns}
                        dataSource={beaconECLogDetails?.new_contacts}
                        size="small"
                        pagination={false}
                        title={()=><span className="ant-descriptions-item-label" style={{fontWeight: 'bolder'}}>New emergency contacts</span>}
                        rowKey='index'
                    />
                </Col>
                <Col span={{ xs:24,lg:12 }}>
                    <Table
                        columns={columns}
                        dataSource={beaconECLogDetails?.old_contacts}
                        size="small"
                        pagination={false}
                        title={()=><span className="ant-descriptions-item-label" style={{fontWeight: 'bolder'}}>Old emergency contacts</span>}
                        rowKey='index'
                    />
                </Col>
            </Row></div>
        )
    }

    handleSelectTimezone = (value) => {
        this.setState({timezone: value})
        storeJSONData('changeLogTimezone', value, true)
    }


    collapseClicked = async (key) => {
        this.setState({
            collapseKey: key,
            changeLogDetail: null,
        })
        const result = await commonService.getBECChanges(key)
        this.setState({changeLogDetail: result})
    }

    render () {
        const {changeLogs} = this.props
        const {timezone} = this.state
        return(
            <div className="contentPage">
                <Card title="History Log" extra={`${changeLogs?.length} Results`} className="historyLogCard">
                    <Row className="margin-bottom">
                        <Col span={{xs:24, lg:8}}>
                            <label>Timestamps in:</label>
                            <Select
                                style={{ width: 220 }}
                                className="marginLR"
                                value={timezone}
                                onChange={this.handleSelectTimezone}
                            >
                                <Select.Option key="utc" value="utc">
                                    UTC
                                </Select.Option>
                                <Select.Option key="local" value="local">
                                    Your Time Zone
                                </Select.Option>
                                <Select.Option key="beacon" value="beacon">
                                    {titleCase(globalConstants.PENDANT_GENERIC)} Time Zone
                                </Select.Option>
                            </Select>
                        </Col>
                    </Row>
                    <Row>
                        {changeLogs && this.generatePanel(changeLogs, timezone)}
                    </Row>
                </Card>
            </div>
        )
    }
}

export default connect(mapStateToProps, null)(BeaconChangeLogs)

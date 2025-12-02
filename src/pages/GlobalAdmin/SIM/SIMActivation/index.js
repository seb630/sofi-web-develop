import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { sortString } from '@/utility/Common'
import { DeleteOutlined } from '@ant-design/icons'
import { Form } from '@ant-design/compatible'
import { Button, Card, Col, Collapse, Divider, Input, message, Modal, Row, Table } from 'antd'
import SIMActions from './SIMAction'
import { isMobile } from 'react-device-detect'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import colours from '@/scss/colours.scss'
import DeactivateModal from './DeactivateModal'
import DeactivateReportModal from './DeactivateReportModal'
import BulkDeactivateModal from './BulkDeactivateModal'

const mapStateToProps = state => ({
    SIMActivations: state.SIM.SIMActivations,
    providers: state.SIM.providers,
    carriers: state.SIM.carriers,
    iccids: state.SIM.iccids,
    deactivationSuggestion: state.SIM.deactivationSuggestion,
})

class SIMActivationTable extends Component {
    constructor(props) {
        super(props)

        this.state = {
            search: '',
            selectedRowKeys: [],
            listActivations: props.SIMActivations,
            deactivateModal: false,
            bulkDeactivateModal: false,
            reportModal: false,
            simRecord: null,
            loading: false,
            selectedIccids: null,
        }
    }

    /** component did update*/
    componentDidUpdate(prevProps) {
        prevProps.SIMActivations !== this.props.SIMActivations && this.setState({
            listActivations: this.props.SIMActivations })
    }

    /** handle search */
    handleSearch = (value) => {
        const { SIMActivations } = this.props
        if (value === '' ){
            this.setState ({ search:'', listActivations: SIMActivations})
        }else{
            this.setState({ search: value,listActivations: SIMActivations.filter(
                record => record.iccid_full?.toLowerCase().includes(value.toLowerCase()) ||
                    record.product_mac_or_imei?.toLowerCase().includes(value.toLowerCase()) ||
                    record.msisdn_full?.toLowerCase().includes(value.toLowerCase())
            )})
        }
    }

    showActivateConfirmation = (record) => {
        Modal.confirm({
            title: 'Are you sure to activate?',
            onOk: ()=>this.handleActivate(record)
        })
    }

    handleActivate = (record) => {
        this.setState({loading: true})
        actions.SIM.activateSIM({id: record.id, notify: false}).then((result)=>{
            result && !result.errors && message.success('Activate requested, Please wait up to 30 minutes')
            result?.errors?.includes('already been activated') && message.success('The SIM has already been activated')
        }).catch(()=>{
            message.error('Activation failed, Please contact admin.')
        }).finally(()=>this.setState({loading: false}))
    }

    handleDeactivate = (record) => {
        this.setState({deactivateModal: true, simRecord: record})
    }

    handleBulkDeactivate = () => {
        const selectedKeys = this.state.selectedRowKeys
        const selectedIccids = this.props.SIMActivations.filter(record=>selectedKeys.includes(record.id)).map(record=>record.iccid_full)
        this.setState({bulkDeactivateModal: true, selectedIccids})
    }

    handleGenerateReport = () => {
        this.setState({reportModal: true})
    }

    handleSync = (record) =>{
        this.setState({loading: true})
        actions.SIM.refreshActivation(record.id).then(()=>{
            message.success('Sync success!')
        }).catch(()=>{
            message.error('Sync failed, Please contact admin.')
        }).finally(()=>this.setState({loading: false}))
    }

    delete = (record) => {
        Modal.confirm({
            onOk: ()=>actions.SIM.deleteActivation(record.id).then(()=>{
                message.success('Delete Success')
            }).catch(()=>{
                message.error('Could not delete SIM activation record, there may still be hubs or beacons using this record.')
            }),
            okText: 'OK',
            title: 'Are you sure you wish to remove SIM?',
            content: 'Deleting this SIM only deletes the database record in The SOFIHUB Cloud, it does not ' +
                'deactivate or remove the SIM from the SIM card provider. If you delete the record in the SOFIHUB ' +
                'Cloud you can still access the SIM and perform actions via the SIM providers portal. Are you sure ' +
                'you want to delete this SIM card from the SOFIHUB cloud database?'
        })
    }

    renderHeader = () => {
        return (<Fragment>
            <Row type="flex" gutter={15} align="middle" className="margin-bottom">
                <Col>
                    <Input.Search
                        placeholder="Search here ..."
                        onSearch={value => this.handleSearch(value)}
                        enterButton
                        autoFocus = {!isMobile}
                    />

                </Col>
            </Row>
        </Fragment>
        )
    }

    onSelectChange = selectedRowKeys => {
        this.setState({ selectedRowKeys })
    }

    render() {
        const { listActivations, simRecord, deactivateModal, reportModal, loading, selectedRowKeys, bulkDeactivateModal, selectedIccids } = this.state
        const {providers, carriers, iccids, deactivationSuggestion} = this.props
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        }
        const hasSelected = selectedRowKeys.length > 0

        const columns = [
            {
                title: 'Full ICCID',
                dataIndex: 'iccid_full',
                key: 'iccid_full',
                defaultSortOrder: 'ascend',
                sorter: (a, b) => sortString(a,b,'iccid_full'),
            },
            {
                title: 'IMEI or MAC address',
                dataIndex: 'product_mac_or_imei',
                key: 'product_mac_or_imei',
            },
            {
                title: 'Mobile number',
                dataIndex: 'msisdn_full',
                key: 'msisdn_full',
            },
            {
                title: 'Product Type',
                dataIndex: 'product_type',
            },
            {
                title: 'SIM Carrier',
                dataIndex: 'sim_carrier',
            },
            {
                title: 'SIM status',
                dataIndex: 'sim_status',
            },
            {
                title: 'SIM EXT status',
                dataIndex: 'sim_ext_status',
            },
            {
                title: 'Request Type',
                dataIndex: 'request_type',
            },
            {
                title: 'Request status',
                dataIndex: 'request_status',
            },
            {
                title: 'Last Updated',
                dataIndex: 'last_updated_at',
                render: (value) => value ? moment(value).format(globalConstants.DATETIME_FORMAT) : 'No Data Yet'
            },
            {
                title: 'Error',
                dataIndex: 'errors',
            },
            {
                title: 'Action',
                key: 'action',
                render: (text,record) => <div>
                    <SIMActions.UpdateSIMModal model={record} providers={providers} carriers={carriers} iccids={iccids}/>
                    <Divider type={'vertical'}/>
                    {record?.request_status === 'PENDING' ? '': record?.sim_status!=='ACTIVE' ?
                        <Fragment><a onClick={()=>this.showActivateConfirmation(record)}>Activate</a><Divider type={'vertical'}/></Fragment> :
                        <Fragment><a onClick={()=>this.handleDeactivate(record)}>Deactivate</a><Divider type={'vertical'}/></Fragment>}
                    <a onClick={()=>this.handleSync(record)}>Sync</a>
                    <Divider type={'vertical'}/>
                    <DeleteOutlined onClick={()=>this.delete(record)} />
                </div>
            }
        ]

        const deactivateColumns = [
            {
                title: 'Full ICCID',
                dataIndex: 'iccid_full',
                key: 'iccid_full',
                sorter: (a, b) => sortString(a,b,'iccid_full'),
            },
            {
                title: 'IMEI or MAC address',
                dataIndex: 'product_mac_or_imei',
                key: 'product_mac_or_imei',
            },
            {
                title: 'Mobile number',
                dataIndex: 'msisdn_full',
                key: 'msisdn_full',
            },
            {
                title: 'Product Type',
                dataIndex: 'product_type',
            },
            {
                title: 'SIM Carrier',
                dataIndex: 'sim_carrier',
            },
            {
                title: 'SIM status',
                dataIndex: 'sim_status',
            },
            {
                title: 'SIM EXT status',
                dataIndex: 'sim_ext_status',
            },
            {
                title: 'Request Type',
                dataIndex: 'request_type',
            },
            {
                title: 'Request status',
                dataIndex: 'request_status',
            },
            {
                title: 'Last Updated',
                dataIndex: 'last_updated_at',
                render: (value) => value ? moment(value).format(globalConstants.DATETIME_FORMAT) : 'No Data Yet'
            },
            {
                title: 'Error',
                dataIndex: 'errors',
            }]
        return (<Fragment>
            <Table scroll={{x: true}}
                loading={listActivations === null || loading}
                className="margin-bottom"
                columns={columns}
                dataSource={listActivations}
                rowKey="id"
                title={this.renderHeader} />
            <Row>
                <SIMActions.CreateSIMModal providers={providers} carriers={carriers} iccids={iccids}/>
            </Row>
            <Divider />
            <Collapse>
                <Collapse.Panel header={<span style={{color: colours.red}}>Danger Zone</span>} key={0} >
                    <Card title="De-Activation SIM Report" extra={
                        <Button danger onClick={this.handleGenerateReport}>Generate De-Activation SIM Report</Button>
                    }>
                        <p>
                            Generating this report will allow you to act on it and de-activate SIMs in bulk. DANGER!
                            All devices that have their SIM&#39;s de-activated will stop being able to access the
                            cloud, internet, and telephone services. Critical functions such as SOS, Fall detection,
                            and Anomalies will stop working!
                        </p>

                        {deactivationSuggestion?.length>0 && <Fragment>
                            <Table scroll={{x: true}}
                                rowSelection={rowSelection}
                                loading={loading}
                                className="margin-bottom"
                                columns={deactivateColumns}
                                dataSource={deactivationSuggestion}
                                rowKey="id"
                                footer={()=> <div>
                                    <Button danger onClick={this.handleBulkDeactivate} disabled={!hasSelected} loading={loading}>
                                        Bulk Deactivate
                                    </Button>
                                    <span style={{ marginLeft: 8 }}>
                                        {hasSelected ? `Selected ${selectedRowKeys.length} records` : ''}
                                    </span>
                                </div>}
                            />

                        </Fragment>
                        }
                    </Card>
                </Collapse.Panel>
            </Collapse>
            <DeactivateModal
                open={deactivateModal}
                record={simRecord}
                carriers={this.props.carriers}
                onCancel={()=>this.setState({deactivateModal: false, simRecord: null})}
            />
            <BulkDeactivateModal
                open={bulkDeactivateModal}
                record={selectedIccids}
                onCancel={()=>this.setState({bulkDeactivateModal: false, selectedIccids: null})}
            />
            <DeactivateReportModal
                open={reportModal}
                onCancel={()=>this.setState({reportModal: false})}
            />
        </Fragment>)
    }
}

export default connect(mapStateToProps,{})(Form.create({})(SIMActivationTable))

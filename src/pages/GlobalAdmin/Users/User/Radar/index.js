import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Badge, Button, Col, Input, message, Modal, Popconfirm, Row, Select, Table, Tooltip } from 'antd'
import { sortString } from '@/utility/Common'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import PropTypes from 'prop-types'
import { isMobile } from 'react-device-detect'
import EditNotification from '../../../../Radar/Admin/Users/Modal'

const mapStateToProps = state => ({
    allUsers: state.user.allUsers,
    radars: state.user.userRadars,
    allRadars: state.radar.radars
})

class UserRadars extends Component{
    constructor(props) {
        super(props)
        this.state = {
            modal: false,
            radars: props.radars,
            search: '',
            radar: [],
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.radars !== this.props.radars && this.setState({ radars: this.props.radars })
    }

    componentDidMount() {
        actions.user.getUserRadars(this.props.currentUser.user_id)
        this.props.allRadars?.length === 0 && actions.radar.fetchAllRadars()
    }

    handleClose = () => {
        this.setState({ modal: false,radar: [] })
    }

    handleOpen = () => {
        this.setState({modal: true})
    }

    handleSearch = (value) => {
        const { radars } = this.props
        if (value===''){
            this.setState ({radars})
        }else{
            this.setState({radars: radars.filter(
                record=> record.product.display_name.toLowerCase().includes(value.toLowerCase()) ||
                        record.product.id.toLowerCase().includes(value.toLowerCase()) ||
                        record.product.mac_address.toLowerCase().includes(value.toLowerCase())
            )})
        }
    }

    disassociate = (radar, e) => {
        e.stopPropagation()
        const payload = {
            user_id: this.props.currentUser.user_id,
            product_id: radar.id
        }
        actions.radar.disassociateRadar(payload).then(()=>{
            actions.user.getUserRadars(this.props.currentUser.user_id)
        })
    }

    renderHeader = () =>
        <Input.Search
            placeholder="Search here ..."
            onSearch={value => this.handleSearch(value)}
            style={{ width: 200 }}
            enterButton
            autoFocus = {!isMobile}
        />

    handleSave = async() => {
        const promises = []
        this.state.radar.map(radar=>{
            const payload = {
                user_id: this.props.currentUser.user_id,
                product_id: radar
            }
            promises.push(actions.radar.associateRadarUser(payload))
        })

        Promise.all(promises).then(()=>{
            actions.user.getUserRadars(this.props.currentUser.user_id)
            message.success('The radars have been added, Please refresh the page')
            this.setState({ modal: false, radars: []})
        })

    }

    handleRadarChange = (value) => {
        value.length<=10 ? this.setState({radar: value}) : message.error('Select up to 10 radars at a time')
    }



    render(){
        const dataSource = this.state.radars || this.props.radars
        const radarOptions = this.props.allRadars?.filter(
            radar => !this.props.radars?.find(x=>x.id===radar.id))?.map(
            radar => (
                <Select.Option key={radar.id} value={radar.id}>{radar.display_name}</Select.Option>
            ))

        const columns = [
            {
                title: 'Name',
                dataIndex: ['product','display_name'],
                key: 'display_name',
                sorter: (a, b) => sortString(a.product,b.product,'display_name'),
                render: (text, record) =>
                    <a
                        onClick={ () => {
                            actions.radar.selectRadar(record.product).then(()=>{
                                actions.common.save({adminPortal: false})
                                actions.routing.push('/radar/dashboard')
                            })}}>
                        {text}
                    </a>
            },
            {
                title: 'ID',
                dataIndex: ['product','id'],
                sorter: (a, b) => sortString(a.product,b.product,'id'),
            },
            {
                title: 'External ID',
                dataIndex: ['product','ext_id'],
                sorter: (a, b) => sortString(a.product,b.product,'ext_id'),

            },
            {
                title: 'Location',
                dataIndex: ['product','location'],
            },
            {
                title: 'Status',
                dataIndex: ['product','status'],
                render(val) {
                    return <Badge status={val==='ONLINE'?'success':'error'} text={val} />
                },
            },
            {
                title: 'Last Seen At',
                dataIndex: ['product','last_seen_at'],
                render: (value) =>  value ? moment(value).format(globalConstants.DATETIME_FORMAT) : 'No Data Yet'
            },
            {
                title: 'Notifications',
                key: 'notification',
                render: (text, radar) => (
                    <EditNotification
                        radarUser = {radar}
                        userId={this.props.currentUser.user_id}
                        radarId={radar.product.id}
                    />
                )
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, radar) => (
                    <Popconfirm
                        title="Are you sure disassociate this radar?"
                        onConfirm={(e)=>this.disassociate(radar.product, e)}
                        okText="Yes"
                        cancelText="No"
                        onClick={e => {e.stopPropagation()}}
                    >
                        <a><Tooltip title="Disassociate this radar">
                            <DeleteOutlined />
                        </Tooltip></a>

                    </Popconfirm>
                ),
            },
        ]
        return (
            <div className="contentPage">
                <Row>
                    <Col span={24}>
                        <Table
                            scroll={{x: true}}
                            className="table"
                            dataSource={dataSource}
                            columns={columns}
                            rowKey={record => record.product.id}
                            title={this.renderHeader}
                        />
                    </Col>
                </Row>
                <Row>
                    <Button
                        style={{ marginTop: '16px'}} type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleOpen}>
                            Add Radar
                    </Button>
                </Row>
                <Modal
                    destroyOnClose
                    okText="Save"
                    open={this.state.modal} onCancel={this.handleClose}
                    onOk={this.handleSave}
                    centered={false} title="Add Radar"  style={{height: '300px'}}
                >
                    <div style={{display:'grid'}}>
                        <label>Radar Name</label>
                        <Select
                            showSearch
                            mode="multiple"
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            size="large"
                            onChange={this.handleRadarChange}
                            placeholder="Please select up to 10 radars..."
                            value={this.state.radar}
                        >
                            {radarOptions}
                        </Select>
                    </div>
                </Modal>
            </div>
        )
    }
}

UserRadars.propTypes={
    currentUser: PropTypes.object.isRequired,
}


export default connect(mapStateToProps, null) (UserRadars)

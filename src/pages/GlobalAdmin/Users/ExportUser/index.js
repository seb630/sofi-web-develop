import { useEffect, useState } from 'react'
import { actions, connect } from 'mirrorx'
import { Button, Col, Input, message, Row, Space, Table } from 'antd'
import { sortDateTime, sortString } from '@/utility/Common'
import UserService from '@/services/User'
import UserFilters from './UserFilters'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import FileSaver from 'file-saver'

const mapStateToProps = state => ({
    allUsers: state.user.allUsers,
    mfa_enabled: state.user.me?.mfa_enabled
})

const initialUsers = [
    {
        carer_id: 1,
        email: 'test@sofihub.com',
        first_name: 'first',
        last_name: 'test',
        phone: '+61422222222',
        device_type: 'Beacon',
        display_name: 'first beacon',
        mac_or_imei: '123456789012345',
        beacon_phone: '+61412222222'
    },
    {
        carer_id: 2,
        email: 'test2@sofihub.com',
        first_name: 'first2',
        last_name: 'test2',
        phone: '+61421222222',
        device_type: 'Beacon',
        display_name: 'first beacon2',
        mac_or_imei: '123456739012345',
        beacon_phone: '+61412222223'
    }
]
const ExportUsers = (props) => {

    const {allUsers, mfa_enabled} = props
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState(initialUsers)
    const [providers, setProviders] = useState([])
    const [enableExport, setEnableExport] = useState(false)
    const [showMfa, setShowMfa] = useState(false)
    const [mfa, setMfa] = useState()
    const [searchParams, setSearchParams] = useState({})

    const handleSubmitExport = () => {
        const payload = {
            mfa_code: mfa,
            search_param: searchParams
        }
        UserService.postFilteredUserDevicesExport(payload).then(file => {
            FileSaver.saveAs(file, 'ExportData.xlsx')
            setMfa()
            setShowMfa(false)
        }).catch(() => message.error('You are unauthorized to access this functionality'))
    }

    const fetchUsers = (payload={}) => {
        setLoading(true)
        UserService.getFilteredUserDevices(payload).then(result=>{
            const newResult = addUniqueKey(result)
            setUsers(newResult)
        }).finally(()=>setLoading(false))
    }

    // eslint-disable-next-line
    useEffect(()=>initialize(),[])

    const initialize = () => {
        fetchUsers()
        UserService.getExportUserDevicesEnabled().then(result=>setEnableExport(result))
        actions.SIM.fetchProviders().then(result=>setProviders(result))
    }

    const addUniqueKey = (records) => records.map(record=>({...record, key: `${record.username}${record.device_mac_or_imei}`}))

    const handleReset = () => fetchUsers()

    const handleExport = () => {
        mfa_enabled ? setShowMfa(true) : message.error('You must have MFA enabled to access this feature')
    }

    const columns = [
        {
            title: 'User',
            children: [
                {
                    title: 'ID',
                    dataIndex: 'user_id',
                    sorter: (a, b) => sortString(a,b,'user_id'),
                    defaultSortOrder: 'asc'
                },
                {
                    title: 'Email',
                    dataIndex: 'username',
                    sorter: (a, b) => sortString(a,b,'username'),
                    render: (text, record) => <a onClick= {() => {
                        actions.routing.push(`/globalAdmin/user/${record.user_id}`)
                    }
                    }>{text}</a>
                },
                {
                    title: 'First Name',
                    dataIndex: 'user_first_name',
                    sorter: (a, b) => sortString(a,b,'user_first_name'),
                },
                {
                    title: 'Last Name',
                    dataIndex: 'user_last_name',
                    sorter: (a, b) => sortString(a,b,'user_last_name'),
                },
                {
                    title: 'Mobile',
                    dataIndex: 'user_mobile',
                },
            ]
        },

        {
            title: 'Device',
            children: [
                {
                    title: 'Type',
                    dataIndex: 'device_type',
                    sorter: (a, b) => sortString(a,b,'device_type'),

                },
                {
                    title: 'Display Name',
                    dataIndex: 'display_name',
                    sorter: (a, b) => sortString(a,b,'display_name'),
                },
                {
                    title: 'Status',
                    dataIndex: 'device_status',
                    sorter: (a, b) => sortString(a,b,'device_status'),
                },
                {
                    title: 'First Name',
                    dataIndex: 'device_first_name',
                    sorter: (a, b) => sortString(a,b,'device_first_name'),
                },
                {
                    title: 'Last Name',
                    dataIndex: 'device_last_name',
                    sorter: (a, b) => sortString(a,b,'device_last_name'),
                },
                {
                    title: 'MAC / IMEI',
                    dataIndex: 'device_mac_or_imei',
                    sorter: (a, b) => sortString(a,b,'device_mac_or_imei'),
                },
                {
                    title: 'Phone Number',
                    dataIndex: 'device_phone_number',
                    sorter: (a, b) => sortString(a,b,'device_phone_number'),
                },

                {
                    title: 'Server Last Received',
                    dataIndex: 'last_seen_by_cloud',
                    render: (value) => value ? moment(value).format(globalConstants.DATETIME_FORMAT) : 'No Data Yet',
                    sorter: (a, b) => sortDateTime(a.last_seen_by_cloud,b.last_seen_by_cloud),
                }
            ]
        },
    ]

    providers?.length>0 && columns.push({title: 'SIM',children:[
        {
            title: 'Status',
            dataIndex: 'sim_status',
        },
        {
            title: 'Ext Status',
            dataIndex: 'sim_ext_status',
        },
        {
            title: 'Provider',
            dataIndex: 'sim_provider',
        },
        {
            title: 'Carrier',
            dataIndex: 'sim_carrier',
        },
    ]})

    const tableTitle = () => <Row gutter={[20,20]} justify="space-between"><Col>{allUsers?.length} users total (displaying only {users?.length} based on filters)</Col>
        <Col><a onClick={handleReset}>Reset</a></Col>
    </Row>

    const tableFooter = () => <UserFilters filter={fetchUsers} providers={providers} setSearchParams={setSearchParams}/>

    return (
        <Space direction="vertical">
            <Table
                scroll={{x: 'max-content'}}
                bordered
                columns={columns}
                loading={loading}
                dataSource={users}
                rowKey="key"
                title={tableTitle}
                footer={tableFooter}
                pagination={{position: ['topLeft']}}
            />
            {enableExport && <Button type="primary" onClick={handleExport}>
                Export
            </Button>}
            {showMfa && <Space><span>Please input your MFA code:</span><Input value={mfa} onChange={e=>setMfa(e.target.value)} style={{width: 100}}/> <Button onClick={handleSubmitExport} disabled={!mfa}>Submit</Button></Space>}
        </Space>)

}


export default connect(mapStateToProps, null) (ExportUsers)

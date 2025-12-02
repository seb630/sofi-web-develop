import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import Icon, { DeleteOutlined, EditOutlined, FolderOpenOutlined, PlusOutlined, SearchOutlined, } from '@ant-design/icons'
import { Breadcrumb, Button, Card, Col, Input, List, message, Popconfirm, Row, Table, Tooltip, } from 'antd'
import { hasAccess, sortString } from '@/utility/Common'
import SearchDraggableTree from '../../../../../components/SearchDraggableTree'
import DeviceGroupModal from './DeviceGroupModal'
import DeleteModal from './DeleteModal'
import { titleCase } from 'change-case'
import AddLeafModal from './AddLeafModal'
import BeaconIcon from '../../../../../images/beacon_icon.svg'
import HubIcon from '../../../../../images/hub_icon.svg'
import AddExternalLeafModal from './AddExternalLeafModal'
import AccessDenied from '../../../../../components/AccessDeny'
import { globalConstants } from '@/_constants'

const {Search} = Input

const mapStateToProps = state => ({
    deviceGroups: state.organisation.orgDeviceGroups,
    deviceGroupDevices: state.organisation.orgDeviceGroupDevices,
    allDeviceGroupDevices: state.organisation.allDeviceGroupDevices,
    orgHubs: state.organisation.orgHubs,
    orgBeacons: state.organisation.orgBeacons,
    orgRadars: state.organisation.orgRadars,
    myPrivileges: state.user.myPrivileges,
    admin: state.user.me ?.authorities.some(role=>role.includes('ADMIN')),
})

class OrgDeviceGroups extends Component{
    constructor(props) {
        super(props)
        this.state = {
            groupModal: false,
            deleteModal: false,
            addLeafModal: false,
            addExternalLeafModal: false,
            deviceGroups: props.deviceGroups,
            selectedGroup: null,
            edit: false,
            searchValue: null,
            expandedKeys: null,
        }
    }

    componentDidMount() {
        this.fetchData()
    }

    fetchData = () =>{
        const {currentOrg, myPrivileges, admin, orgHubs, orgBeacons, orgRadars} = this.props
        if (hasAccess('ORG_VIEW_ORG_DEVICE_GROUP', currentOrg,myPrivileges, admin)) {
            actions.organisation.fetchOrgDeviceGroups(currentOrg.organization_id)
            actions.organisation.fetchAllDeviceGroupDevices(currentOrg.organization_id)
            !orgHubs && actions.organisation.fetchOrgHubs(currentOrg.organization_id)
            !orgBeacons && actions.organisation.fetchOrgBeacons(currentOrg.organization_id)
            !orgRadars && actions.organisation.fetchOrgRadars(currentOrg.organization_id)
        }

    }

    componentDidUpdate(prevProps) {
        prevProps.currentOrg!==this.props.currentOrg && this.fetchData()
        prevProps.deviceGroups !== this.props.deviceGroups && this.setState({deviceGroups: this.props.deviceGroups})
    }

    handleAddGroupClose = () => {
        this.setState({groupModal: false})
    }

    handleAddGroupOpen = (edit) => {
        this.setState({groupModal: true, edit:edit})
    }

    handleAddLeafClose = () => {
        this.setState({addLeafModal: false})
    }

    handleAddLeafOpen = () => {
        this.setState({addLeafModal: true})
    }

    handleAddExternalLeafClose = () => {
        this.setState({addExternalLeafModal: false})
    }

    handleAddExternalLeafOpen = () => {
        this.setState({addExternalLeafModal: true})
    }

    handleDeleteGroupOpen = () => {
        this.setState({deleteModal: true})
    }

    handleDeleteGroupClose = () => {
        this.setState({deleteModal: false})
    }

    handleDeleteGroup = () => {
        const {currentOrg} = this.props
        const {selectedGroup} = this.state
        const payload = {
            orgId: currentOrg.organization_id,
            device_group_id: selectedGroup.organization_device_group_id
        }
        return actions.organisation.deleteDeviceGroup(payload)
    }

    onSelect = (selectedKeys) =>{
        const isGroup = selectedKeys[0].indexOf('device')<0
        const {currentOrg, deviceGroups} = this.props
        const selectedGroup = deviceGroups.find(group=>group.organization_device_group_id==selectedKeys[0])
        this.setState({selectedGroup: selectedGroup, searchValue: null, expandedKeys: selectedKeys})
        isGroup && actions.organisation.fetchOrgDeviceGroupDevices({orgId: currentOrg.organization_id, device_group_id: selectedKeys[0]})
    }

    flatToTree = (items, id = null, link = 'parent_id') => items
        ?.filter(item => item && item[link] === id)
        ?.map(item =>
        {return({ ...item, title: item.name, key: item.organization_device_group_id ?
            item.organization_device_group_id.toString() : `device-${item.organization_device_group_device_id}`,
        children:  item.organization_device_group_id && this.flatToTree(items, item.organization_device_group_id )})})


    buildCandicatesDevices = () => {
        const {orgHubs, orgBeacons, orgRadars} = this.props
        return orgHubs?.concat(orgBeacons, orgRadars)
    }

    disassociate = (device, e) => {
        e.stopPropagation()
        let orgId = this.props.currentOrg.organization_id
        let payload = {
            ...device,
            organization_id: this.props.currentOrg.organization_id,
        }
        actions.organisation.deleteDeviceGroupDevice({orgId, payload}).then(()=>{
            message.success('Device disassociated from group')
        })
    }

    buildSearchResult = (groups,items,searchValue) => {
        const itemResult = items?.filter(item=>item.device_display_name?.toLowerCase().indexOf(searchValue?.toLowerCase())>-1 && item.organization_device_group_id)
        const groupResult = groups?.filter(group=>group.name?.toLowerCase().indexOf(searchValue?.toLowerCase())>-1)
        const groupList = groupResult?.map(group=>{
            const parents = this.findParent(groups,group.organization_device_group_id, 'organization_device_group_id').reverse()
            const result = {}
            result.avatar = <FolderOpenOutlined style={{fontSize:40}} />
            result.title = <a onClick={()=>this.onSelect(
                parents.reverse().map(item=>item.id.toString())
            )}>{parents.pop().name}</a>
            result.description = <Breadcrumb separator= ">" >
                {parents.map((parent,i)=><Breadcrumb.Item key={i}>{parent.name}</Breadcrumb.Item>)}
            </Breadcrumb>
            return result
        })

        const itemList = itemResult?.map(item=>{
            const parents = this.findParent(groups, item.organization_device_group_id, 'organization_device_group_id').reverse()
            const result = {}
            result.avatar = item.device_type==='BEACON' ?  <Icon component={BeaconIcon} style={{fontSize:40}}/> :
                <Icon component={HubIcon} style={{fontSize:40}}/>
            result.title = <a onClick={()=>this.onSelect(
                parents.reverse().map(item=>item.id.toString())
            )}>{item.device_display_name}</a>
            result.description = <Breadcrumb separator= ">" >
                {parents.map((parent,i)=><Breadcrumb.Item key={i}>{parent.name}</Breadcrumb.Item>)}
            </Breadcrumb>
            return result
        })

        return groupList?.concat(itemList)
    }

    findParent = (groups, id, link, ) =>{
        const parent = groups.find(item=>item[link]===id)
        if (parent?.parent_id){
            return [{id: parent[link], name: parent.name}].concat(this.findParent(groups, parent.parent_id, link))
        }else {
            return [{id: parent[link], name: parent.name}]
        }
    }

    render(){
        const { groupModal, selectedGroup, edit, deleteModal, addLeafModal, searchValue, expandedKeys, addExternalLeafModal } = this.state
        const {deviceGroups, currentOrg, deviceGroupDevices, allDeviceGroupDevices } = this.props
        const treeData = this.flatToTree(deviceGroups)
        const candicatesDevices = this.buildCandicatesDevices()
        const searchResult = this.buildSearchResult(deviceGroups,allDeviceGroupDevices, searchValue)
        const columns = [
            {
                title: 'Device ID',
                dataIndex: 'device_id_ref',
                key: 'device_id_ref',
            },
            {
                title: 'Device Name',
                dataIndex: 'device_display_name',
                key: 'device_display_name',
                sorter: (a, b) => sortString(a,b,'device_display_name'),
            },
            {
                title: 'Device Type',
                dataIndex: 'device_type',
                key: 'device_type',
                filters: [
                    {
                        text: titleCase(globalConstants.PENDANT_GENERIC),
                        value: 'BEACON',
                    },
                    {
                        text: titleCase(globalConstants.HUB_GENERIC),
                        value: 'HUB',
                    },
                    {
                        text: titleCase(globalConstants.RADAR_GENERIC),
                        value: 'RADAR',
                    },
                ],
            },
            {
                title: 'MAC or IMEI',
                dataIndex: 'device_mac_or_imei',
                key: 'device_mac_or_imei',
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, device) => (
                    <AccessDenied currentOrg={currentOrg} privilege="ORG_DELETE_ORG_DEVICE_FROM_GROUP" hasModal={false}>
                        <Popconfirm
                            title="Are you sure disassociate this device?"
                            onConfirm={(e)=>this.disassociate(device, e)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <a><Tooltip title="Disassociate this device">
                                <DeleteOutlined />
                            </Tooltip></a>
                        </Popconfirm>
                    </AccessDenied>

                ),
            },
        ]
        return (
            <AccessDenied currentOrg={currentOrg} privilege="ORG_VIEW_ORG_DEVICE_GROUP">
                <div className="contentPage" >
                    <Card size="small" className="margin-bottom">
                        <Row gutter={16} type="flex">
                            <Col style={{fontWeight: 700}}>Search for device or group:</Col>
                            <Col><Search style={{ marginBottom: 8, width:200}} placeholder="Search"
                                onChange={e=>this.setState({
                                    searchValue: e.target.value,
                                    selectedGroup: null
                                })} value={searchValue}/>
                            </Col>
                        </Row>
                    </Card>
                    <Row gutter={10}>
                        <Col xs={24} lg={10} xl={8}>
                            <Card size="small">
                                <Row gutter={[16,16]} type="flex" className="margin-bottom">
                                    <AccessDenied currentOrg={currentOrg} privilege="ORG_CREATE_ORG_DEVICE_GROUP" hasModal={false}>
                                        <Col><Button type="primary" icon={<PlusOutlined />} onClick={()=>this.handleAddGroupOpen(false)}>Add Device Group</Button></Col>
                                    </AccessDenied>
                                    {selectedGroup && <Fragment>
                                        <AccessDenied currentOrg={currentOrg} privilege="ORG_UPDATE_ORG_DEVICE_GROUP" hasModal={false}>
                                            <Col><Button icon={<EditOutlined />} onClick={()=>this.handleAddGroupOpen(true)}>Edit</Button></Col>
                                        </AccessDenied>
                                        <AccessDenied currentOrg={currentOrg} privilege="ORG_DELETE_ORG_DEVICE_GROUP" hasModal={false}>
                                            <Col><Button danger icon={<DeleteOutlined />} onClick={this.handleDeleteGroupOpen}>Delete</Button></Col>
                                        </AccessDenied>
                                    </Fragment>
                                    }
                                </Row>
                                {deviceGroups?.length>0 ? <SearchDraggableTree
                                    treeData={treeData}
                                    type="device"
                                    onSelect={this.onSelect}
                                    expandedKeys={expandedKeys}
                                    currentOrg={currentOrg}
                                    updateElement={actions.organisation.updateDeviceGroupDevice}
                                    updateGroup={actions.organisation.updateDeviceGroup}
                                /> : <div className="margin-bottom">There are no groups yet.</div>}
                            </Card>
                        </Col>
                        <Col  xs={24} lg={13} xl={16}>
                            {searchValue && <Card size="small" title={<div><SearchOutlined />Search Results: &quot;{searchValue}&quot;</div>}>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={searchResult}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={item.avatar}
                                                title={item.title}
                                                description={item.description}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>}
                            {selectedGroup &&  <Card size="small">
                                <AccessDenied currentOrg={currentOrg} privilege="ORG_VIEW_ORG_DEVICE_IN_GROUP" hasModal={false}>
                                    <Table scroll={{x: true}}
                                        title={()=><div>Devices in group: {selectedGroup.name}</div>}
                                        className="table margin-bottom"
                                        loading={ deviceGroupDevices == null}
                                        dataSource={deviceGroupDevices}
                                        columns={columns}
                                        rowKey="organization_device_group_device_id"
                                    />
                                    <Row gutter={[16,16]} type="flex">
                                        <AccessDenied currentOrg={currentOrg} privilege="ORG_ADD_ORG_DEVICE_TO_GROUP" hasModal={false}>
                                            <Col><Button icon={<PlusOutlined />} onClick={this.handleAddLeafOpen}>Add Device from Organisation</Button></Col>
                                        </AccessDenied>
                                        <Col><Button icon={<PlusOutlined />} onClick={this.handleAddExternalLeafOpen}>Add Device not in Organisation</Button></Col>
                                    </Row>
                                </AccessDenied>
                            </Card>}
                        </Col>
                        <DeviceGroupModal
                            open={groupModal}
                            onClose={this.handleAddGroupClose}
                            type="device"
                            currentOrg={currentOrg}
                            selectedGroup={selectedGroup}
                            edit={edit}
                        />
                        <DeleteModal
                            open={deleteModal}
                            onClose={this.handleDeleteGroupClose}
                            onDelete={this.handleDeleteGroup}
                            selectedGroup={selectedGroup}
                            selectedGroupDevices = {deviceGroupDevices}
                            deviceGroups = {deviceGroups}
                        />
                        <AddLeafModal
                            open={addLeafModal}
                            onClose={this.handleAddLeafClose}
                            type="device"
                            currentOrg={currentOrg}
                            selectedGroup={selectedGroup}
                            selectedGroupDevices={deviceGroupDevices}
                            candidates={candicatesDevices}
                        />
                        <AddExternalLeafModal
                            open={addExternalLeafModal}
                            onClose={this.handleAddExternalLeafClose}
                            currentOrg={currentOrg}
                            selectedGroup={selectedGroup}
                        />
                    </Row>
                </div>
            </AccessDenied>
        )
    }
}


export default connect(mapStateToProps, null) (OrgDeviceGroups)

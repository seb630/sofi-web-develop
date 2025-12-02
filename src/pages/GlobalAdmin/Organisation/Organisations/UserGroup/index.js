import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { DeleteOutlined, EditOutlined, FolderOpenOutlined, PlusOutlined, SearchOutlined, UserOutlined, } from '@ant-design/icons'
import { Breadcrumb, Button, Card, Col, Input, List, message, Popconfirm, Row, Table, Tabs, Tooltip } from 'antd'
import SearchDraggableTree from '../../../../../components/SearchDraggableTree'
import UserGroupModal from '../DeviceGroup/DeviceGroupModal'
import DeleteModal from './DeleteModal'
import AddLeafModal from '../DeviceGroup/AddLeafModal'
import { TableTransfer } from '@/components/TreeTransfer'
import AccessDenied from '../../../../../components/AccessDeny'
import { hasAccess } from '@/utility/Common'

const {Search} = Input

const mapStateToProps = state => ({
    userGroups: state.organisation.orgUserGroups,
    admin: state.user.me?.authorities.some(role => role.includes('ADMIN')),
    userGroupUsers: state.organisation.orgUserGroupUsers,
    allUserGroupUsers: state.organisation.allUserGroupUsers,
    orgUsers: state.organisation.orgUsers,
    orgRoles: state.permission.orgRoles,
    orgUserGroupRoles: state.organisation.orgUserGroupRoles,
    predefinedRoles: state.permission.predefinedRoles,
    myPrivileges: state.user.myPrivileges,
})

class OrgUserGroups extends Component{
    constructor(props) {
        super(props)
        this.state = {
            groupModal: false,
            deleteModal: false,
            addLeafModal: false,
            userGroups: props.userGroups,
            selectedGroup: null,
            edit: false,
            searchValue: null,
            expandedKeys: null,
            targetKeys: [],
            sourceKeys: [],
            dirty: false
        }
    }

    componentDidMount() {
        this.fetchData()
    }

    fetchData = () =>{
        const {currentOrg, myPrivileges, admin, orgUsers, orgRoles, predefinedRoles} = this.props
        if (hasAccess('ORG_VIEW_ORG_USER_GROUP', currentOrg,myPrivileges, admin)) {
            actions.organisation.fetchOrgUserGroups(currentOrg.organization_id)
            actions.organisation.fetchAllUserGroupUsers(currentOrg.organization_id)
            !orgUsers && actions.organisation.fetchOrgUsers(currentOrg.organization_id)
            !orgRoles && actions.permission.fetchOrgRoles(currentOrg.organization_id)
            !predefinedRoles && actions.permission.fetchPredefinedRoles()
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.currentOrg!==this.props.currentOrg && this.fetchData()
        prevProps.userGroups !== this.props.userGroups && this.setState({userGroups: this.props.userGroups})
        if (prevProps.orgUserGroupRoles !== this.props.orgUserGroupRoles) {
            const source = this.props.orgUserGroupRoles.map(role=>role.security_role_id)
            const allRoles = this.generateAllRoles(this.props.orgRoles, this.props.predefinedRoles)
            this.setState({
                sourceKeys: source,
                targetKeys: allRoles?.filter(role=>!source.includes(role.security_role_id)).map(role=>role.security_role_id)
            })
        }
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
            user_group_id: selectedGroup.organization_user_group_id
        }
        return actions.organisation.deleteUserGroup(payload)
    }

    onSelect = (selectedKeys) =>{
        const isGroup = selectedKeys[0].indexOf('user')<0
        const {currentOrg, userGroups} = this.props
        const selectedGroup = userGroups.find(group=>group.organization_user_group_id==selectedKeys[0])
        this.setState({selectedGroup: selectedGroup, searchValue: null, expandedKeys: selectedKeys})
        isGroup && actions.organisation.fetchOrgUserGroupUsers({orgId: currentOrg.organization_id, user_group_id: selectedKeys[0]})
        isGroup && actions.organisation.fetchOrgUserGroupRoles(selectedKeys[0])
    }

    flatToTree = (items, id = null, link = 'parent_id') => items
        ?.filter(item => item && item[link] === id)
        ?.map(item =>
        {return({ ...item, title: item.name, key: item.organization_user_group_id ?
            item.organization_user_group_id.toString() : `user-${item.organization_user_group_user_id}`,
        children:  item.organization_user_group_id && this.flatToTree(items, item.organization_user_group_id )})})

    disassociate = (user, e) => {
        e.stopPropagation()
        let orgId = this.props.currentOrg.organization_id
        let payload = {
            ...user,
            organization_id: this.props.currentOrg.organization_id,
            organization_user_group_id: user.organization_user_group.organization_user_group_id
        }
        actions.organisation.deleteUserGroupUser({orgId, payload}).then(()=>{
            message.success('User disassociated from group')
        })
    }

    buildSearchResult = (groups,items,searchValue) => {
        const itemResult = items?.filter(item => item.organization_user_group_user_id &&
            (item.organization_user_resp_dto?.first_name?.toLowerCase().indexOf(searchValue?.toLowerCase()) > -1 ||
                item.organization_user_resp_dto?.last_name?.toLowerCase().indexOf(searchValue?.toLowerCase()) > -1 ||
                item.organization_user_resp_dto?.email?.toLowerCase().indexOf(searchValue?.toLowerCase()) > -1
            )
        )
        const groupResult = groups?.filter(group => group.name?.toLowerCase().indexOf(searchValue?.toLowerCase()) > -1)
        const groupList = groupResult?.map(group => {
            const parents = this.findParent(groups, group.organization_user_group_id, 'organization_user_group_id').reverse()
            const result = {}
            result.avatar = <FolderOpenOutlined style={{fontSize: 40}} />
            result.title = <a onClick={() => this.onSelect(
                parents.reverse().map(item => item.id.toString())
            )}>{parents.pop().name}</a>
            result.description = <Breadcrumb separator=">">
                {parents.map((parent, i) => <Breadcrumb.Item key={i}>{parent.name}</Breadcrumb.Item>)}
            </Breadcrumb>
            return result
        })

        const itemList = itemResult?.map(item=>{
            const parents = this.findParent(groups, item.organization_user_group?.organization_user_group_id, 'organization_user_group_id').reverse()
            const result = {}
            result.avatar = <UserOutlined style={{fontSize: 40}} />
            result.title = <a onClick={() => this.onSelect(
                parents.reverse().map(item => item.id.toString())
            )}>{item.organization_user_resp_dto?.first_name} {item.organization_user_resp_dto?.last_name}</a>
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

    generateAllRoles = (orgRoles, predefinedRoles) => {
        const customised = orgRoles?.map(role=>({...role, source: 'customised'})) || []
        const predefined = predefinedRoles?.map(role=>({...role, source: 'predefined'})) || []
        return [...customised, ...predefined].filter(role=>role.type==='DATA')
    }

    filterOption = (inputValue, option) => {
        return option.name.toLowerCase().includes(inputValue.toLowerCase())
    }

    handleChange = (nextTargetKeys) => {
        const allRoles = this.generateAllRoles(this.props.orgRoles, this.props.predefinedRoles)
        this.setState({
            dirty: true,
            targetKeys: nextTargetKeys,
            sourceKeys: allRoles.filter(role=>!nextTargetKeys.includes(role.security_role_id)).map(role=>role.security_role_id)
        })
    }

    save = () => {
        const {targetKeys, sourceKeys, selectedGroup} = this.state
        const {orgUserGroupRoles, orgRoles} = this.props
        const originSourceKeys = orgUserGroupRoles.map(role=>role.security_role_id)
        const originTargetKeys = orgRoles.filter(role=>!originSourceKeys.includes(role.security_role_id)).map(role=>role.security_role_id)
        const remove_role_list = targetKeys.filter(key=>!originTargetKeys.includes(key))
        const payload = {
            security_role_ids: remove_role_list,
            org_user_group_id: selectedGroup.organization_user_group_id,
        }
        let promises = []
        remove_role_list.length>0 &&  promises.push(actions.permission.deleteRolesFromUserGroup (payload))
        const add_role_list = sourceKeys.filter(key=>!originSourceKeys.includes(key))
        const addPayload = {
            security_role_ids: add_role_list,
            org_user_group_id: selectedGroup.organization_user_group_id,
        }
        add_role_list.length>0 && promises.push(actions.permission.addRolesToUserGroup(addPayload))
        Promise.all(promises).then(()=> {
            this.setState({dirty: false})
            message.success('Submitted')
        }).catch((error)=>{
            message.error(error.response.data.message)
        })
    }

    render(){
        const {groupModal, selectedGroup, edit, deleteModal, addLeafModal, searchValue, expandedKeys, dirty} = this.state
        const {userGroups, currentOrg, userGroupUsers, allUserGroupUsers, orgUsers, orgRoles, predefinedRoles} = this.props
        const treeData = this.flatToTree(userGroups)
        const candicatesUsers = orgUsers
        const searchResult = this.buildSearchResult(userGroups, allUserGroupUsers, searchValue)
        const columns = [
            {
                title: 'First Name',
                dataIndex: ['organization_user_resp_dto','first_name'],
            },
            {
                title: 'Last Name',
                dataIndex: ['organization_user_resp_dto','last_name'],
            },
            {
                title: 'Email',
                dataIndex: ['organization_user_resp_dto','email'],
            },
            {
                title: 'Phone',
                dataIndex: ['organization_user_resp_dto','mobile'],
            },

            {
                title: 'Action',
                key: 'action',
                render: (text, user) => (
                    <AccessDenied currentOrg={currentOrg} privilege="ORG_DELETE_ORG_USER_FROM_GROUP" hasModal={false}>

                        <Popconfirm
                            title="Are you sure disassociate this user?"
                            onConfirm={(e)=>this.disassociate(user, e)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <a><Tooltip title="Disassociate this user">
                                <DeleteOutlined />
                            </Tooltip></a>
                        </Popconfirm>
                    </AccessDenied>

                ),
            },
        ]

        const roleTransferTableColumns = [
            {
                dataIndex: 'name',
                title: 'Role name',
                ellipsis: true
            },
        ]

        const allRoles = this.generateAllRoles(orgRoles, predefinedRoles)

        let dataSource = allRoles?.map(role=>({...role, key: role.security_role_id}))

        return (
            <AccessDenied currentOrg={currentOrg} privilege="ORG_VIEW_ORG_USER_GROUP">
                <div className="contentPage" >
                    <Card size="small" className="margin-bottom">
                        <Row gutter={16} type="flex">
                            <Col style={{fontWeight: 700}}>Search for user or group:</Col>
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
                                    <AccessDenied currentOrg={currentOrg} privilege="ORG_CREATE_ORG_USER_GROUP" hasModal={false}>
                                        <Col><Button type="primary" icon={<PlusOutlined />} onClick={()=>this.handleAddGroupOpen(false)}>Add User Group</Button></Col>
                                    </AccessDenied>
                                    {selectedGroup && <Fragment>
                                        <AccessDenied currentOrg={currentOrg} privilege="ORG_UPDATE_ORG_USER_GROUP" hasModal={false}>
                                            <Col><Button icon={<EditOutlined />} onClick={()=>this.handleAddGroupOpen(true)}>Edit</Button></Col>
                                        </AccessDenied>
                                        <AccessDenied currentOrg={currentOrg} privilege="ORG_DELETE_ORG_USER_GROUP" hasModal={false}>
                                            <Col><Button danger icon={<DeleteOutlined />} onClick={this.handleDeleteGroupOpen}>Delete</Button></Col>
                                        </AccessDenied>
                                    </Fragment>
                                    }
                                </Row>
                                {userGroups?.length>0 ? <SearchDraggableTree
                                    treeData={treeData}
                                    type="user"
                                    onSelect={this.onSelect}
                                    expandedKeys={expandedKeys}
                                    currentOrg={currentOrg}
                                    updateElement={actions.organisation.updateUserGroupUser}
                                    updateGroup={actions.organisation.updateUserGroup}
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
                            {selectedGroup &&  <Card size="small" title={<div>Users group: {selectedGroup.name}</div>}>
                                <AccessDenied currentOrg={currentOrg} privilege="ORG_VIEW_ORG_USER_IN_GROUP" hasModal={false}>
                                    <Tabs>
                                        <Tabs.TabPane tab="User" key="user">
                                            <Table scroll={{x: true}}
                                                className="table margin-bottom"
                                                loading={ userGroupUsers == null}
                                                dataSource={userGroupUsers}
                                                columns={columns}
                                                rowKey="organization_user_group_user_id"
                                            />
                                            <AccessDenied currentOrg={currentOrg} privilege="ORG_ADD_ORG_USER_TO_GROUP" hasModal={false}>
                                                <Row gutter={[16,16]} type="flex">
                                                    <Col><Button icon={<PlusOutlined />} onClick={this.handleAddLeafOpen}>Add User from Organisation</Button></Col>
                                                </Row>
                                            </AccessDenied>
                                        </Tabs.TabPane>
                                        <Tabs.TabPane tab="Policies" key="Policies">
                                            <p>The following policies are allocated to all users who are part of this user group: <b>{selectedGroup.name}</b></p>
                                            <p>You can add or remove policies from this group on this screen by ticking the policy you with to allocate or remove, and press
                                                the corresponding button, and save.</p>
                                            <TableTransfer
                                                dataSource={dataSource}
                                                showSearch
                                                targetKeys={this.state.targetKeys}
                                                onChange={this.handleChange}
                                                className="margin-bottom"
                                                filterOption={this.filterOption}
                                                operations={['Remove policy', 'Add policy']}
                                                titles={['Policies assigned', 'Policies not assigned']}
                                                locale={{ itemUnit: 'policy', itemsUnit: 'policies'}}
                                                leftColumns={roleTransferTableColumns}
                                                rightColumns={roleTransferTableColumns}
                                            />
                                            <Row>
                                                <Button type="primary" onClick={this.save} disabled={!dirty}>Save</Button>
                                            </Row>
                                        </Tabs.TabPane>
                                    </Tabs>
                                </AccessDenied>

                            </Card>}
                        </Col>
                        <UserGroupModal
                            open={groupModal}
                            onClose={this.handleAddGroupClose}
                            type="user"
                            currentOrg={currentOrg}
                            selectedGroup={selectedGroup}
                            edit={edit}
                        />
                        <DeleteModal
                            open={deleteModal}
                            onClose={this.handleDeleteGroupClose}
                            onDelete={this.handleDeleteGroup}
                            selectedGroup={selectedGroup}
                            selectedGroupUsers = {userGroupUsers}
                            userGroups = {userGroups}
                        />
                        <AddLeafModal
                            open={addLeafModal}
                            onClose={this.handleAddLeafClose}
                            type="user"
                            currentOrg={currentOrg}
                            selectedGroup={selectedGroup}
                            selectedGroupUsers={userGroupUsers}
                            candidates={candicatesUsers}
                        />
                    </Row>
                </div>
            </AccessDenied>
        )
    }
}


export default connect(mapStateToProps, null) (OrgUserGroups)

import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { message, Modal } from 'antd'
import { TableTransfer } from '@/components/TreeTransfer'
import PropTypes from 'prop-types'

const mapStateToProps = state => ({
    orgRoles: state.permission.orgRoles,
    orgUserRoles: state.organisation.orgUserRoles,
    predefinedRoles: state.permission.predefinedRoles,
})

class RoleModal extends Component{
    constructor(props) {
        super(props)
        this.state = {
            targetKeys: [],
            sourceKeys: [],
        }
    }

    componentDidMount() {
        !this.props.orgRoles && actions.permission.fetchOrgRoles(this.props.orgUser.organization_id)
        !this.props.predefinedRoles && actions.permission.fetchPredefinedRoles()
    }

    componentDidUpdate(prevProps){
        if (prevProps !== this.props ) {
            const source = this.props.orgUserRoles?.map(role=>role.security_role_id) || []
            const allRoles = this.generateAllRoles(this.props.orgRoles, this.props.predefinedRoles)
            this.setState({
                sourceKeys: source,
                targetKeys: allRoles?.filter(role=>!source.includes(role.security_role_id)).map(role=>role.security_role_id)
            })
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
            targetKeys: nextTargetKeys,
            sourceKeys: allRoles.filter(role=>!nextTargetKeys.includes(role.security_role_id)).map(role=>role.security_role_id)
        })
    }

    handleSave = () => {
        const {targetKeys, sourceKeys} = this.state
        const {orgUser, orgUserRoles, orgRoles, onCancel, predefinedRoles} = this.props
        const allRoles = this.generateAllRoles(orgRoles, predefinedRoles)
        const originSourceKeys = orgUserRoles.map(role=>role.security_role_id)
        const originTargetKeys = allRoles.filter(role=>!originSourceKeys.includes(role.security_role_id)).map(role=>role.security_role_id)
        const remove_role_list = targetKeys.filter(key=>!originTargetKeys.includes(key))
        const payload = {
            security_role_ids: remove_role_list,
            org_user_id: orgUser.organization_user_id,
        }
        let promises = []
        remove_role_list.length>0 && promises.push(actions.permission.deleteRolesFromUser (payload))
        const add_role_list = sourceKeys.filter(key=>!originSourceKeys.includes(key))
        const addPayload = {
            security_role_ids: add_role_list,
            org_user_id: orgUser.organization_user_id,
        }
        add_role_list.length>0 && promises.push(actions.permission.addRolesToUser(addPayload))
        Promise.all(promises).then(()=> {
            message.success('Submitted')
            onCancel()
        }).catch((error)=>{
            message.error(error.response.data.message)
        })
    }

    render(){
        const {orgRoles, open, onCancel, orgUser, predefinedRoles} = this.props
        const allRoles = this.generateAllRoles(orgRoles, predefinedRoles)
        let dataSource = allRoles?.map(role=>({...role, key: role.security_role_id}))

        const tableColumns = [
            {
                dataIndex: 'name',
                title: 'Policy name',
                ellipsis: true
            },
        ]

        return (
            <Modal
                width={1000}
                destroyOnClose
                okText="Save"
                open={open} onCancel={onCancel}
                onOk={this.handleSave}
                centered={false}
                title={`Policies assigned to ${orgUser?.username} (${orgUser?.first_name} ${orgUser?.last_name})`}
            >
                <p>This user is part of one or more user groups which gives them access to following policies:</p>
                <p>If the user should not have access to one or more of the above policies, please review the user groups
                that this user is part of (via the &quot;User Group&quot; tab).</p>
                <p>You can also allocate policies directly to this user below (however this is not recommended).</p>
                <p>Tick the policy you with to assign or remove from the user and press the corresponding button, and save.</p>
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
                    leftColumns={tableColumns}
                    rightColumns={tableColumns}
                />
            </Modal>
        )
    }
}

RoleModal.propTypes={
    orgUser: PropTypes.object,
    onCancel: PropTypes.func,
    open: PropTypes.bool,
}


export default connect(mapStateToProps, null) (RoleModal)

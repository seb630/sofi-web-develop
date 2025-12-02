import { getData , saveData } from '@/utility/AxiosCalls'

function getSecurityRolesByOrg(orgId) {
    const url = `orgs/${orgId}/security-roles`
    return getData(url)
}

function getSecurityRolesByOrgUser(orgUserId) {
    const url = `org-users/${orgUserId}/security-roles`
    return getData(url)
}

function getSecurityRolesByOrgUserGroup(orgUserGroupId) {
    const url = `org-user-groups/${orgUserGroupId}/security-roles`
    return getData(url)
}

function postSecurityRole(payload) {
    const url = 'security-roles'
    return saveData(url, payload, 'POST')
}

function putSecurityRole(payload) {
    const url = `security-roles/${payload.security_role_id}`
    return saveData(url, payload, 'PUT')
}

function deleteSecurityRole(securityRoleId) {
    const url = `security-roles/${securityRoleId}`
    return saveData(url, {}, 'DELETE')
}

function getInheritedByRoles(securityRoleId) {
    const url = `security-roles/${securityRoleId}/inherited-by-roles`
    return getData(url)
}

function getInheritingToRoles(securityRoleId) {
    const url = `security-roles/${securityRoleId}/inheriting-to-roles`
    return getData(url)
}

function getPredefinedRoles() {
    const url = 'security-roles/system-predefined'
    return getData(url)
}

function getRoleProfiles(roleId) {
    const url = `security-roles/${roleId}/security-data-profiles`
    return getData(url)
}

function putRoleProfiles(payload) {
    const url = `security-roles/${payload.security_role_id}/security-data-profiles`
    return saveData(url, payload.security_data_profile_ids, 'PUT')
}

function deleteRoleProfiles(payload) {
    const url = `security-roles/${payload.security_role_id}/security-data-profiles`
    return saveData(url, payload.security_data_profile_ids, 'DELETE')
}

function putRolePrivileges(payload) {
    const url = `security-roles/${payload.security_role_id}/security-privileges`
    return saveData(url, payload.privilege_ids, 'PUT')
}

function deleteRolePrivileges(payload) {
    const url = `security-roles/${payload.security_role_id}/security-privileges`
    return saveData(url, payload.privilege_ids, 'DELETE')
}

function putInheritingToRoles(payload) {
    const url = `security-roles/${payload.security_role_id}/inheriting-to-roles`
    return saveData(url, payload.security_role_ids, 'PUT')
}

function deleteInheritingToRoles(payload) {
    const url = `security-roles/${payload.security_role_id}/inheriting-to-roles`
    return saveData(url, payload.security_role_ids, 'DELETE')
}

function getRolePrivileges(roleId) {
    const url = `security-roles/${roleId}/security-privileges`
    return getData(url)
}

function getPrivileges() {
    const url = 'security-privileges'
    return getData(url)
}

function putPrivilege(payload) {
    const url = `security-privileges/${payload.security_privilege_id}`
    return saveData(url, payload, 'PUT')
}

function getPrivilegesByUser(userId) {
    const url = `users/${userId}/security-privileges`
    return getData(url)
}

function getSecurityProfilesByOrg(orgId) {
    const url = `orgs/${orgId}/security-data-profiles`
    return getData(url)
}

function postSecurityProfile(payload) {
    const url = 'security-data-profiles'
    return saveData(url, payload, 'POST')
}

function putSecurityProfile(payload) {
    const url = `security-data-profiles/${payload.security_data_profile_id}`
    return saveData(url, payload, 'PUT')
}

function deleteSecurityProfile(security_data_profile_id) {
    const url = `security-data-profiles/${security_data_profile_id}`
    return saveData(url, null, 'DELETE')
}

function getPredefinedProfiles() {
    const url = 'security-data-profiles/predefined'
    return getData(url)
}

function putRolesToOrgUsers(payload) {
    const url = `security-roles/${payload.security_role_id}/org-users`
    return saveData(url, payload, 'PUT')
}

function deleteRolesToOrgUsers(payload) {
    const url = `security-roles/${payload.security_role_id}/org-users`
    return saveData(url, payload, 'DELETE')
}

function putOrgUserToRoles(payload) {
    const url = `org-users/${payload.org_user_id}/security-roles`
    return saveData(url, payload.security_role_ids, 'PUT')
}

function deleteOrgUserToRoles(payload) {
    const url = `org-users/${payload.org_user_id}/security-roles`
    return saveData(url, payload.security_role_ids, 'DELETE')
}

function putOrgUserGroupToRoles(payload) {
    const url = `org-user-groups/${payload.org_user_group_id}/security-roles`
    return saveData(url, payload.security_role_ids, 'PUT')
}

function deleteOrgUserGroupToRoles(payload) {
    const url = `org-user-groups/${payload.org_user_group_id}/security-roles`
    return saveData(url, payload.security_role_ids, 'DELETE')
}

function getMyPermission() {
    const url = 'me/security-privileges'
    return getData(url)
}

function copySecurityRole(payload) {
    const url = `security-roles/${payload.security_role_id}/copy?targetOrganizationId=${payload.target_organization_id}`
    return saveData(url, payload, 'POST')
}

function getRoleDependants(roleId) {
    const url = `security-roles/${roleId}/dependants`
    return getData(url)
}

function getProfileDependants(profileId) {
    const url = `security-data-profiles/${profileId}/security-roles`
    return getData(url)
}


export default {
    getSecurityRolesByOrg,
    getSecurityRolesByOrgUser,
    getSecurityRolesByOrgUserGroup,
    postSecurityRole,
    putSecurityRole,
    deleteSecurityRole,
    getInheritedByRoles,
    getInheritingToRoles,
    putInheritingToRoles,
    deleteInheritingToRoles,
    getPredefinedRoles,
    getRoleProfiles,
    getRolePrivileges,
    getPrivileges,
    putPrivilege,
    getPrivilegesByUser,
    getSecurityProfilesByOrg,
    postSecurityProfile,
    putSecurityProfile,
    deleteSecurityProfile,
    getPredefinedProfiles,
    putRolesToOrgUsers,
    deleteRolesToOrgUsers,
    putOrgUserToRoles,
    deleteOrgUserToRoles,
    putOrgUserGroupToRoles,
    deleteOrgUserGroupToRoles,
    getMyPermission,
    copySecurityRole,
    putRoleProfiles,
    putRolePrivileges,
    deleteRolePrivileges,
    deleteRoleProfiles,
    getRoleDependants,
    getProfileDependants
}

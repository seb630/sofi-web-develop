import { actions } from 'mirrorx'
import PermissionService from '../services/Permission'

export default {
    name: 'permission',
    initialState: {
        orgRoles: null,
        inheritedRoles: null,
        inheritingRoles: null,
        predefinedRoles: null,
        roleProfiles: null,
        rolePrivileges: null,
        privileges: null,
        predefinedProfiles: null,
        orgProfiles: null,
        roleDependants: null,
        profileDependants: null,
    },
    reducers: {
    },
    effects: {
        getS(data, getState) {
            return getState()
        },

        async fetchOrgRoles(orgId){
            try{
                const orgRoles = await PermissionService.getSecurityRolesByOrg(orgId)
                actions.permission.save({
                    orgRoles
                })
            } catch (err) {
                actions.permission.save({
                    orgRoles: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async createRole(payload) {
            try{
                return  PermissionService.postSecurityRole(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateRole(payload) {
            try{
                return PermissionService.putSecurityRole(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async deleteRole(payload) {
            await PermissionService.deleteSecurityRole(payload.security_role_id).then((data) => {
                actions.permission.fetchOrgRoles(payload.organization_id)
                return data
            })
        },

        async fetchInheritedRoles(roleId){
            try{
                const roles = await PermissionService.getInheritedByRoles(roleId)
                actions.permission.save({
                    inheritedRoles: roles
                })
            } catch (err) {
                actions.permission.save({
                    inheritedRoles: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchInheritingRoles(roleId){
            try{
                const roles = await PermissionService.getInheritingToRoles(roleId)
                actions.permission.save({
                    inheritingRoles: roles
                })
            } catch (err) {
                actions.permission.save({
                    inheritingRoles: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchPredefinedRoles(){
            try{
                const roles = await PermissionService.getPredefinedRoles()
                actions.permission.save({
                    predefinedRoles: roles
                })
            } catch (err) {
                actions.permission.save({
                    predefinedRoles: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchPrivileges(){
            try{
                const privileges = await PermissionService.getPrivileges()
                actions.permission.save({
                    privileges
                })
            } catch (err) {
                actions.permission.save({
                    privileges: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async updatePrivilege(payload) {
            await PermissionService.putPrivilege(payload).then((data) => {
                actions.permission.fetchPrivileges()
                return data
            })
        },

        async fetchRoleProfiles(roleId){
            try{
                const roles = await PermissionService.getRoleProfiles(roleId)
                actions.permission.save({
                    roleProfiles: roles
                })
            } catch (err) {
                actions.permission.save({
                    roleProfiles: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchRolePrivileges(roleId){
            try{
                const roles = await PermissionService.getRolePrivileges(roleId)
                actions.permission.save({
                    rolePrivileges: roles
                })
            } catch (err) {
                actions.permission.save({
                    rolePrivileges: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchOrgProfiles(orgId){
            try{
                const orgProfiles = await PermissionService.getSecurityProfilesByOrg(orgId)
                actions.permission.save({
                    orgProfiles
                })
            } catch (err) {
                actions.permission.save({
                    orgProfiles: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async createProfile(payload) {
            await PermissionService.postSecurityProfile(payload).then((data) => {
                actions.permission.fetchOrgProfiles(payload.organization_id)
                return data
            })
        },

        async updateProfile(payload) {
            await PermissionService.putSecurityProfile(payload).then((data) => {
                actions.permission.fetchOrgProfiles(payload.organization_id)
                return data
            })
        },

        async deleteProfile(payload) {
            await PermissionService.deleteSecurityProfile(payload.security_data_profile_id).then((data) => {
                actions.permission.fetchOrgProfiles(payload.organization_id)
                return data
            })
        },

        async fetchPredefinedProfiles(){
            try{
                const profiles = await PermissionService.getPredefinedProfiles()
                actions.permission.save({
                    predefinedProfiles: profiles
                })
            } catch (err) {
                actions.permission.save({
                    predefinedProfiles: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async addRolesToUser(payload) {
            await PermissionService.putOrgUserToRoles(payload).then((data) => {
                actions.organisation.fetchOrgUserRoles(payload.org_user_id)
                return data
            })
        },

        async deleteRolesFromUser(payload) {
            await PermissionService.deleteOrgUserToRoles(payload).then((data) => {
                actions.organisation.fetchOrgUserRoles(payload.org_user_id)
                return data
            })
        },

        async addRolesToUserGroup(payload) {
            await PermissionService.putOrgUserGroupToRoles(payload).then((data) => {
                actions.organisation.fetchOrgUserGroupRoles(payload.org_user_group_id)
                return data
            })
        },

        async deleteRolesFromUserGroup(payload) {
            await PermissionService.deleteOrgUserGroupToRoles(payload).then((data) => {
                actions.organisation.fetchOrgUserGroupRoles(payload.org_user_group_id)
                return data
            })
        },

        async addProfilesToPolicy(payload) {
            try{
                await PermissionService.putRoleProfiles(payload).then((data) => {
                    actions.permission.fetchRoleProfiles(payload.security_role_id)
                    return data
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async removeProfilesFromPolicy(payload) {
            try{
                await PermissionService.deleteRoleProfiles(payload).then((data) => {
                    actions.permission.fetchRoleProfiles(payload.security_role_id)
                    return data
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async addDutyRolesToPolicy(payload) {
            try{
                await PermissionService.putInheritingToRoles(payload).then((data) => {
                    return data
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async removeDutyRolesFromPolicy(payload) {
            try{
                await PermissionService.deleteInheritingToRoles(payload).then((data) => {
                    return data
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async addPrivilegesToRole(payload) {
            try {
                await PermissionService.putRolePrivileges(payload).then((data) => {
                    return data
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async removePrivilegesFromRole(payload) {
            try{
                await PermissionService.deleteRolePrivileges(payload).then((data) => {
                    return data
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchRoleDependants(roleId){
            try{
                const roleDependants = await PermissionService.getRoleDependants(roleId)
                actions.permission.save({
                    roleDependants
                })
            } catch (err) {
                actions.permission.save({
                    roleDependants: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchProfileDependants(profileId){
            try{
                const profileDependants = await PermissionService.getProfileDependants(profileId)
                actions.permission.save({
                    profileDependants
                })
            } catch (err) {
                actions.permission.save({
                    profileDependants: []
                })
                return Promise.reject(err.response.data)
            }
        },

    }
}

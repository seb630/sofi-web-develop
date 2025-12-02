import OrgService from '../services/Organisation'
import {actions} from 'mirrorx'
import {storeDeviceData} from '@/utility/Storage'
import PermissionService from '../services/Permission'
import {formatRadar} from '@/utility/Common'

export default {
    name: 'organisation',
    initialState: {
        selectedOrg: null,
        orgs: null,
        orgHubs: null,
        orgBeacons: null,
        orgRadars: null,
        orgUsers: null,
        orgTPs: null,
        orgAPNs: null,
        orgDevices:null,
        contacts: null,
        orgInvitation: null,
        orgContactType: null,
        orgDeviceGroups: null,
        orgDeviceGroupDevices: null,
        orgUserGroups: null,
        orgUserGroupUsers: null,
        orgUserGroupRoles: null,
        orgUserRoles: null,
        allUserGroupUsers: null,
        allDeviceGroupDevices: null,
    },
    reducers: {
    },
    effects: {
        getS(data, getState){
            return getState()
        },
        async selectOrg (org) {
            actions.organisation.save({
                selectedOrg: org,
            })
            org && storeDeviceData('orgId', org.organization_id)
        },

        async fetchAllOrgs () {
            try {
                const data = await OrgService.getOrgs()
                actions.organisation.save({
                    orgs: data
                })
            } catch(err) {
                actions.organisation.save({
                    orgs: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async createOrg (payload) {
            try {
                return await OrgService.postOrg(payload).then(()=>{
                    actions.organisation.fetchAllOrgs()
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateOrg ({orgId, payload}) {
            try {
                return await OrgService.updateOrg(orgId,payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async deleteOrg (id) {
            try {
                return await OrgService.deleteOrg(id).then(()=>{
                    actions.organisation.fetchAllOrgs()
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchOrgBeacons(orgId){
            try{
                let allResults = []
                let newPage = 0
                let result = {}
                do {
                    result = await OrgService.fetchBeaconByOrg(orgId, newPage,100)
                    allResults = allResults.concat(result.content)
                    newPage++
                } while (!result.last)
                actions.organisation.save({
                    orgBeacons: allResults,
                })} catch (err) {
                actions.organisation.save({
                    orgBeacons: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchOrgRadars(orgId){
            try{
                let allResults = []
                let newPage = 0
                let result = {}
                do {
                    result = await OrgService.fetchRadarByOrg(orgId, newPage,100)
                    allResults = allResults.concat(result.content)
                    newPage++
                } while (!result.last)
                allResults = allResults.map(radar=>formatRadar(radar))
                actions.organisation.save({
                    orgRadars: allResults,
                })} catch (err) {
                actions.organisation.save({
                    orgRadars: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchOrgHubs(orgId){
            try{
                let allResults = []
                let newPage = 0
                let result = {}
                do {
                    result = await OrgService.fetchHubByOrg(orgId, newPage,100)
                    allResults = allResults.concat(result.content)
                    newPage++
                } while (!result.last)
                actions.organisation.save({
                    orgHubs: allResults,
                })} catch (err) {
                actions.organisation.save({
                    orgHubs: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchOrgUsers(orgId){
            try{
                const orgUsers = await OrgService.fetchUserByOrg(orgId)
                actions.organisation.save({
                    orgUsers: orgUsers
                })
            } catch (err) {
                actions.organisation.save({
                    orgUsers: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async associateOrgUser (payload) {
            try {
                return await OrgService.postOrgUser(payload).then(()=>{
                    actions.organisation.fetchOrgUsers(payload.organization_id)
                    actions.user.getUserOrgs(payload.user_id)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async disassociateOrgUser (payload) {
            try {
                return await OrgService.deleteOrgUser(payload).then(()=>{
                    actions.organisation.fetchOrgUsers(payload.organization_id)
                    actions.user.getUserOrgs(payload.user_id)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async associateOrgDevice (payload) {
            try {
                return await OrgService.postOrgDevice(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async disassociateOrgDevice (payload) {
            try {
                return await OrgService.deleteOrgDevice(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async inviteOrgUser(payload) {
            try {
                return await OrgService.postOrgUserInvite(payload).then(()=>{
                    actions.organisation.fetchInvitationByOrg(payload.organization_id)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async acceptInvite({inviteId, userId}) {
            try {
                return await OrgService.postOrgUserInviteAccept(inviteId).then(()=>{
                    actions.user.getInvitationByInvitee(userId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async declineOrgInvite({inviteId, userId, orgId}) {
            try {
                return await OrgService.deleteOrgUserInvite(inviteId).then(()=>{
                    if (orgId){
                        actions.organisation.fetchInvitationByOrg(orgId)
                    }else if (userId === 'admin') {
                        actions.user.getAllInvitation()
                    }else{
                        actions.user.getInvitationByInvitee(userId)
                    }
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchInvitationByOrg(orgId){
            try{
                const orgInv = await OrgService.getAllOrgInvitation(orgId)
                actions.organisation.save({
                    orgInvitation: orgInv
                })
            } catch (err) {
                actions.organisation.save({
                    orgInvitation: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchOrgContacts(orgId){
            try{
                const contacts = await OrgService.fetchContactByOrg(orgId)
                actions.organisation.save({
                    contacts: contacts
                })
            } catch (err) {
                actions.organisation.save({
                    contacts: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async createContact ({orgId, payload}) {
            try {
                return await OrgService.postContact(orgId, payload).then(()=>{
                    actions.organisation.fetchOrgContacts(orgId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateContact ({orgId, payload}) {
            try {
                return await OrgService.updateContact(orgId,payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async deleteContact ({orgId, contactId}) {
            try {
                return await OrgService.deleteContact(orgId, contactId).then(()=>{
                    actions.organisation.fetchOrgContacts(orgId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchContactTypes () {
            try {
                const data = await OrgService.getOrgContactType()
                actions.organisation.save({
                    orgContactType: data
                })
            } catch(err) {
                actions.organisation.save({
                    orgContactType: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchOrgDeviceGroups(orgId){
            try{
                const deviceGroups = await OrgService.getOrgDeviceGroup(orgId)
                actions.organisation.save({
                    orgDeviceGroups: deviceGroups
                })
                return deviceGroups
            } catch (err) {
                actions.organisation.save({
                    orgDeviceGroups: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async createDeviceGroup ({orgId, payload}) {
            try {
                return await OrgService.postOrgDeviceGroup(orgId, payload).then(()=>{
                    actions.organisation.fetchOrgDeviceGroups(orgId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateDeviceGroup ({orgId, payload}) {
            try {
                return await OrgService.updateOrgDeviceGroup(orgId,payload).then(()=>{
                    actions.organisation.fetchOrgDeviceGroups(orgId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async deleteDeviceGroup ({orgId, device_group_id}) {
            try {
                return await OrgService.deleteOrgDeviceGroup(orgId, device_group_id).then(()=>{
                    actions.organisation.fetchOrgDeviceGroups(orgId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchAllDeviceGroupDevices(orgId){
            try{
                const allDeviceGroupDevices = await OrgService.getAllDeviceGroupDevices(orgId)
                actions.organisation.save({
                    allDeviceGroupDevices: allDeviceGroupDevices
                })
            } catch (err) {
                actions.organisation.save({
                    allDeviceGroupDevices: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchOrgDeviceGroupDevices({orgId, device_group_id}){
            try{
                const orgDeviceGroupDevices = await OrgService.getOrgDeviceGroupDevices(orgId,device_group_id)
                actions.organisation.save({
                    orgDeviceGroupDevices: orgDeviceGroupDevices
                })
            } catch (err) {
                actions.organisation.save({
                    orgDeviceGroupDevices: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async addDeviceGroupDevice ({orgId, payload}) {
            try {
                return await OrgService.postOrgDeviceGroupDevices(orgId, payload).then(()=>{
                    actions.organisation.fetchOrgDeviceGroupDevices({orgId, device_group_id: payload.organization_device_group_id})
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateDeviceGroupDevice ({orgId, payload}) {
            try {
                return await OrgService.updateOrgDeviceGroupDevices(orgId,payload).then(()=>{
                    // actions.organisation.fetchOrgDeviceGroupDevices({orgId, device_group_id: payload.organization_device_group_id})
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async deleteDeviceGroupDevice ({orgId, payload}) {
            try {
                return await OrgService.deleteOrgDeviceGroupDevices(orgId,payload).then(()=>{
                    actions.organisation.fetchOrgDeviceGroupDevices({orgId, device_group_id: payload.organization_device_group_id})
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchOrgUserGroups(orgId){
            try{
                const userGroups = await OrgService.getOrgUserGroup(orgId)
                actions.organisation.save({
                    orgUserGroups: userGroups
                })
            } catch (err) {
                actions.organisation.save({
                    orgUserGroups: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async createUserGroup ({orgId, payload}) {
            try {
                return await OrgService.postOrgUserGroup(orgId, payload).then(()=>{
                    actions.organisation.fetchOrgUserGroups(orgId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateUserGroup ({orgId, payload}) {
            try {
                return await OrgService.updateOrgUserGroup(orgId,payload).then(()=>{
                    actions.organisation.fetchOrgUserGroups(orgId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async deleteUserGroup ({orgId, user_group_id}) {
            try {
                return await OrgService.deleteOrgUserGroup(orgId, user_group_id).then(()=>{
                    actions.organisation.fetchOrgUserGroups(orgId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchAllUserGroupUsers(orgId){
            try{
                const allUserGroupUsers = await OrgService.getAllUserGroupUsers(orgId)
                actions.organisation.save({
                    allUserGroupUsers: allUserGroupUsers
                })
            } catch (err) {
                actions.organisation.save({
                    allUserGroupUsers: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchOrgUserGroupUsers({orgId, user_group_id}){
            try{
                const orgUserGroupUsers = await OrgService.getOrgUserGroupUsers(orgId,user_group_id)
                actions.organisation.save({
                    orgUserGroupUsers: orgUserGroupUsers
                })
            } catch (err) {
                actions.organisation.save({
                    orgUserGroupUsers: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async addUserGroupUser ({orgId, payload}) {
            try {
                return await OrgService.postOrgUserGroupUsers(orgId, payload).then(()=>{
                    actions.organisation.fetchOrgUserGroupUsers({orgId, user_group_id: payload.organization_user_group_id})
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateUserGroupUser ({orgId, payload}) {
            try {
                return await OrgService.updateOrgUserGroupUsers(orgId,payload).then(()=>{
                    // actions.organisation.fetchOrgUserGroupUsers({orgId, user_group_id: payload.organization_user_group_id})
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async deleteUserGroupUser ({orgId, payload}) {
            try {
                return await OrgService.deleteOrgUserGroupUsers(orgId,payload).then(()=>{
                    actions.organisation.fetchOrgUserGroupUsers({orgId, user_group_id: payload.organization_user_group_id})
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchOrgTPs(orgId){
            try{
                const tps = await OrgService.fetchTPByOrg(orgId)
                actions.organisation.save({
                    orgTPs: tps
                })
            } catch (err) {
                actions.organisation.save({
                    orgTPs: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async createOrgTP ({orgId, payload}) {
            try {
                return await OrgService.postTP(orgId, payload).then(()=>{
                    actions.organisation.fetchOrgTPs(orgId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateOrgTP ({orgId, payload, destinationId}) {
            try {
                return await OrgService.updateTP(orgId,destinationId, payload, )
                    .then(()=>{
                        actions.organisation.fetchOrgTPs(orgId)
                    })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async deleteOrgTP ({orgId, destinationId}) {
            try {
                return await OrgService.deleteTP(orgId, destinationId).then(()=>{
                    actions.organisation.fetchOrgTPs(orgId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchOrgUserRoles(orgUserId){
            try{
                const orgUserRoles = await PermissionService.getSecurityRolesByOrgUser(orgUserId)
                actions.organisation.save({
                    orgUserRoles
                })
            } catch (err) {
                actions.organisation.save({
                    orgUserRoles: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchOrgUserGroupRoles(orgUserGroupId){
            try{
                const orgUserGroupRoles = await PermissionService.getSecurityRolesByOrgUserGroup(orgUserGroupId)
                actions.organisation.save({
                    orgUserGroupRoles
                })
            } catch (err) {
                actions.organisation.save({
                    orgUserGroupRoles: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchOrgAPNs(orgId){
            try{
                const orgAPNs = await OrgService.fetchAPNByOrg(orgId)
                actions.organisation.save({
                    orgAPNs
                })
            } catch (err) {
                actions.organisation.save({
                    orgAPNs: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async createOrgAPN ({orgId, payload}) {
            try {
                return await OrgService.postAPN(orgId, payload).then(()=>{
                    actions.organisation.fetchOrgAPNs(orgId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateOrgAPN ({orgId, payload, apnId}) {
            try {
                return await OrgService.updateAPN(orgId,apnId, payload, )
                    .then(()=>{
                        actions.organisation.fetchOrgAPNs(orgId)
                    })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async deleteOrgAPN ({orgId, apnId}) {
            try {
                return await OrgService.deleteAPN(orgId, apnId).then(()=>{
                    actions.organisation.fetchOrgAPNs(orgId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchOrgDevices(orgId){
            try{
                const orgDevices = await OrgService.getOrgDevices(orgId)
                actions.organisation.save({
                    orgDevices
                })
            } catch (err) {
                actions.organisation.save({
                    orgDevices: []
                })
                return Promise.reject(err.response.data)
            }
        },
    }
}

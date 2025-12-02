import { actions } from 'mirrorx'
import _ from 'lodash'
import orgService from '../services/Organisation'
import userService from '../services/User'
import { Modal } from 'antd'
import PermissionService from '../services/Permission'
import {formatRadar} from '@/utility/Common'

export default {
    name: 'user',
    initialState: {
        me: null,
        myPrivileges: null,
        useHubTimeZone: true,
        allUsers: null,
        loading: false,
        userHubs: [],
        userBeacons: null,
        userRadars: null,
        userOrgs: null,
        receivedInvitation: {hubs:[], beacons: [], radars: []},
        receivedOrgInvitation: null,
        sentInvitation: [],
        allInvitation: [],
        allBeaconInvitation: [],
        allRadarInvitation: [],
        hubInvitation: [],
        beaconInvitation: [],
        radarInvitation: [],
        dashboardOverview: {hubs:[], beacons: [], radars: []},
        userPrivileges: null,
        loneWorkerMonitors: null,
    },
    reducers: {
        setLoading(state,loading) {
            return { ...state, loading }
        }
    },
    effects: {
        getS(data, getState) {
            return getState()
        },
        async me() {
            actions.user.setLoading(true)
            try {
                actions.common.fetchStripeEnabled()
                actions.common.fetchLoneWorkerEnabled()
                const result = await userService.getMe()
                actions.user.save({
                    me: result,
                })
                const myPrivileges = await PermissionService.getMyPermission()
                actions.user.save({
                    myPrivileges,
                    loading: false
                })
            } catch(err) {
                // hide loading , should display error
                actions.user.setLoading(false)
            }
        },
        async dashboardOverview() {
            actions.user.setLoading(true)
            try {
                const result = await userService.getDashboardOverview()
                actions.user.save({
                    dashboardOverview: {
                        hubs: result.hubs,
                        beacons: result.beacons,
                        radars: result.radars?.map(radar=>formatRadar(radar))
                    },
                    loading: false
                })
                if (result?.hubs.length===0 && result?.beacons.length===0 && result?.radars.length===0) {
                    actions.routing.push('/nodevice')
                }
            } catch(err) {
                // hide loading , should display error
                actions.user.setLoading(false)
            }
        },
        async getAllUsers() {
            const result = await userService.allUserData()
            actions.user.save({
                allUsers: result
            })
        },
        async getUserHubs(userId) {
            const result = await userService.getUserHubs(userId)
            actions.user.save({
                userHubs: result
            })
        },

        async getUserRadars(userId) {
            const result = await userService.getUserRadars(userId)
            actions.user.save({
                userRadars: result
            })
        },

        async updateMe({ userId, payload }) {
            try {
                await userService.postUser(userId, payload).then((data) => {
                    actions.user.me()
                    return data
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updatePassword({ userId, payload }) {
            await userService.changePassword(userId, payload).then((data) => {
                return data
            })
        },

        async associateHub({hubId, payload, newHub}) {
            return await userService.postHubUsers(payload).then((result) => {
                if (newHub) {
                    return result
                }else{
                    hubId && actions.hub.getHubUsers(hubId)
                    actions.user.getUserHubs(payload.user_id)
                }
            })
        },
        async disassociateHub(payload) {
            await userService.deleteHubUsers(payload).then(() => {
                actions.hub.getHubUsers(payload.hub_id)
                actions.user.getUserHubs(payload.user_id)
            }).catch((err)=> {
                err.response.data.status === 400 && Modal.error({
                    title: 'You cannot delete this carer',
                    content: (
                        <div>
                            You cannot delete this carer - they are currently responsible for paying the subscription fees.
                            In order to remove this carer you or another carer take over paying the subscription fee - you can do this by
                            changing
                            the card payment details to your credit or debit card.
                        </div>
                    ),
                    okText: 'Okay'
                })
            })
        },
        async createUser(payload) {
            await userService.createUser(payload).then((data) => {
                actions.user.getAllUsers()
                return data
            })
        },
        async registration(payload) {
            try {
                await userService.registration(payload).then((data) => {
                    return data
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },
        async forgot(payload) {
            try {
                await userService.forgot(payload).then((data) => {
                    return data
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },
        async resetPassword(payload) {
            try {
                await userService.reset(payload).then((data) => {
                    return data
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },
        async resendVerifyEmail(payload) {
            try {
                await userService.resendVerifyEmail(payload).then((data) => {
                    return data
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },
        async updateUser({ userId, payload }) {
            await userService.postUser(userId, payload).then((data) => {
                actions.user.getAllUsers()
                return data
            })
        },
        async logoutUser(){
            try{
                await userService.logout().then((data) => {
                    return data
                })
            } catch(err){
                return Promise.reject(err.response.data)
            }
        },
        async updateHubUser(hubUser) {
            try{
                return await userService.patchHubUser(hubUser)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateRadarUser(radarUser) {
            try{
                return await userService.patchRadarUser(radarUser)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async deleteUser(userId) {
            try{
                await userService.deleteUser(userId).then(() => {
                    actions.user.getAllUsers()
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        /** fetch user beacons for admin view */
        async fetchUserBeacons({ userId,headStates }){
            try{
                const userBeacons = await userService.getUserBeacons(userId)
                actions.user.save({
                    userBeacons: userBeacons.map(item => {
                        return _.extend({}, item ,headStates[item.beacon_id])
                    })
                })
            } catch (err) {
                actions.user.save({
                    userBeacons: []
                })
                return Promise.reject(err.response.data)
            }
        },

        /** assign beacon to user */
        async associateBeacon({ beacon_id, user_id }) {
            try {
                await userService.postBeaconUser({beacon_id, user_id }).then(() => {
                    actions.sofiBeacon.fetchBeaconByUser()
                    actions.sofiBeacon.fetchAllBeacons()
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        /** disassociate beacon from user */
        async disassociateBeacon({ beacon_id, user_id }) {
            await userService.deleteBeaconUser({beacon_id, user_id }).then(() => {
                actions.sofiBeacon.fetchBeaconByUser({ userId: user_id })
            }).catch((err)=> {
                err.response.data.status === 400 && Modal.error({
                    title: 'You cannot delete this carer',
                    content: (
                        <div>
                            You cannot delete this carer - they are currently responsible for paying the subscription fees.
                            In order to remove this carer you or another carer take over paying the subscription fee - you can do this by
                            changing
                            the card payment details to your credit or debit card.
                        </div>
                    ),
                    okText: 'Okay'
                })
            })
        },

        async verifyEmail(token) {
            try {
                return await userService.verifyEmail(token)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async verifyMobile({userId, token}) {
            try {
                await userService.verifyMobile(userId, token).then(()=>{
                    actions.user.me()
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async resendVerifyMobile(userId) {
            try {
                return await userService.resendVerifyMobile(userId)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async rollbackNewEmail(userId) {
            try {
                return await userService.rollbackNewEmail(userId)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async sendLinkingRequest(payload) {
            try {
                return await userService.postRequestLinking(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async inviteCarer(payload) {
            try {
                return await userService.inviteCarer(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async inviteBeaconCarer(payload) {
            try {
                return await userService.inviteBeaconCarer(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async inviteRadarCarer(payload) {
            try {
                return await userService.inviteRadarCarer(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async acceptInvite({inviteId, userId}) {
            try {
                return await userService.acceptInviteCarer(inviteId).then(()=>{
                    actions.user.getInvitationByInvitee(userId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async acceptBeaconInvite({inviteId, userId}) {
            try {
                return await userService.acceptInviteBeaconCarer(inviteId).then(()=>{
                    actions.user.getInvitationByInvitee(userId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async acceptRadarInvite({inviteId, userId}) {
            try {
                return await userService.acceptInviteRadarCarer(inviteId).then(()=>{
                    actions.user.getInvitationByInvitee(userId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async declineInvite({inviteId, userId, hubId}) {
            try {
                return await userService.deleteInviteCarer(inviteId).then(()=>{
                    if (hubId){
                        actions.user.getInvitationByHub(hubId)
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

        async declineBeaconInvite({inviteId, userId, beaconId}) {
            try {
                return await userService.deleteInviteBeaconCarer(inviteId).then(()=>{
                    if (beaconId){
                        actions.user.getInvitationByBeacon(beaconId)
                    }else if (userId === 'admin') {
                        actions.user.getAllBeaconInvitation()
                    }else{
                        actions.user.getInvitationByInvitee(userId)
                    }
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },


        async declineRadarInvite({inviteId, userId, radarId}) {
            try {
                return await userService.deleteInviteRadarCarer(inviteId).then(()=>{
                    if (radarId){
                        actions.user.getInvitationByRadar(radarId)
                    }else if (userId === 'admin') {
                        actions.user.getAllRadarInvitation()
                    }else{
                        actions.user.getInvitationByInvitee(userId)
                    }
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async getInvitationByInvitee(userId) {
            const result = await userService.getInvitationByInvitee(userId)
            actions.user.save({
                receivedInvitation: result
            })
        },

        async getOrgInvitationByInvitee(userId) {
            const result = await orgService.getOrgInvitationByInvitee(userId)
            actions.user.save({
                receivedOrgInvitation: result
            })
        },

        async getInvitationByInviter(userId) {
            const result = await userService.getInvitationByInviter(userId)
            actions.user.save({
                sentInvitation: result
            })
        },

        async getInvitationByHub(hubId) {
            const result = await userService.getInvitationByHub(hubId)
            actions.user.save({
                hubInvitation: result
            })
        },

        async getInvitationByBeacon(beaconId) {
            const result = await userService.getInvitationByBeacon(beaconId)
            actions.user.save({
                beaconInvitation: result
            })
        },

        async getInvitationByRadar(radarId) {
            const result = await userService.getInvitationByRadar(radarId)
            actions.user.save({
                radarInvitation: result
            })
        },

        async getAllInvitation() {
            let allResults = []
            let newPage = 0
            let result = {}
            do {
                result = await userService.getAllInvitation(newPage,500)
                allResults = allResults.concat(result.content)
                newPage++
            } while (!result.last)
            actions.user.save({
                allInvitation: result.content
            })
        },

        async getAllBeaconInvitation() {
            let allResults = []
            let newPage = 0
            let result = {}
            do {
                result = await userService.getAllBeaconInvitation(newPage,500)
                allResults = allResults.concat(result.content)
                newPage++
            } while (!result.last)
            actions.user.save({
                allBeaconInvitation: result.content
            })
        },

        async getAllRadarInvitation() {
            let allResults = []
            let newPage = 0
            let result = {}
            do {
                result = await userService.getAllRadarInvitation(newPage,500)
                allResults = allResults.concat(result.content)
                newPage++
            } while (!result.last)
            actions.user.save({
                allRadarInvitation: result.content
            })
        },

        async addUserRoles({userId, payload}) {
            try {
                return await userService.updateUserRole(userId,payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async removeUserRoles({userId, payload}) {
            try {
                return await userService.deleteUserRole(userId,payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async getUserOrgs(userId) {
            const result = await userService.getUserOrgs(userId)
            actions.user.save({
                userOrgs: result
            })
        },

        async getUserPrivileges(userId){
            try{
                const privileges = await PermissionService.getPrivilegesByUser(userId)
                actions.user.save({
                    userPrivileges: privileges
                })
            } catch (err) {
                actions.user.save({
                    userPrivileges: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async startLoneWorkerMonitor(payload) {
            try {
                return await userService.postLoneWorker(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async getLoneWorkerMonitors(userId) {
            const result = await userService.getLoneWorkerMonitors(userId)
            actions.user.save({
                loneWorkerMonitors: result
            })
        },

        async extendLoneWorkerMonitor(payload) {
            try {
                return await userService.patchExtendLoneWorker(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async dismissLoneWorkerMonitor(payload) {
            try {
                return await userService.patchDismissLoneWorker(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async resolveLoneWorkerMonitor(payload) {
            try {
                return await userService.patchResolveLoneWorker(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async verifyMfaCode(payload) {
            try {
                const result = await userService.patchVerifyMfa(payload)
                return result ? Promise.resolve() : Promise.reject()
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async resetMFA(userId) {
            try {
                return await userService.patchResetMfa(userId)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

    }
}

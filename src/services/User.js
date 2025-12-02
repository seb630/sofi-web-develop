import { getData, saveData } from '@/utility/AxiosCalls'
import axios from 'axios'

function getMe() {
    const url = 'me'
    return getData(url)
}

function postUser(userId, payload) {
    const url = `users/${userId}`
    return saveData(url, payload, 'PUT')
}

function verifyEmail(token) {
    const url = `users/email-verification?token=${token}`
    return getData(url, null, false)
}

function resendVerifyEmail(payload) {
    const url = 'users/resend-email-verification'
    return saveData(url, payload, 'POST', false)
}

function deleteUser(userId) {
    const url = `users/${userId}/destroy`
    return saveData(url, null, 'DELETE')
}

function postHubUsers(payload) {
    const url = 'hub-users'
    return saveData(url, payload, 'POST')
}

function deleteHubUsers(payload) {
    const url = 'hub-users'
    return saveData(url, payload, 'DELETE')
}

function createUser(payload) {
    const url = 'users'
    return saveData(url, payload, 'POST')
}

function registration(payload) {
    const url = 'users/registrations'
    return saveData(url, payload, 'POST', false)
}

function forgot(payload) {
    const url = 'users/forgot'
    return saveData(url, payload, 'POST', false)
}

function reset(payload) {
    const url = 'users/reset'
    return saveData(url, payload, 'POST', false)
}

function logout(){
    const url = 'logout'
    return saveData(url, {}, 'POST', true)
}

function changePassword(userId, payload) {
    const url = `users/${userId}/change-password`
    return saveData(url, payload, 'PUT')
}

function allUserData() {
    const url = 'users'
    return getData(url)
}

function getUserHubs(userId) {
    const url = `hub-users/search/user-id?user-id=${userId}`
    return getData(url)
}

function getUserBeacons(userId) {
    const url = `users/${userId}/beacons`
    return getData(url)
}

function getUserRadars(userId) {
    const url = `users/${userId}/products`
    return getData(url)
}

function getUserOrgs(userId) {
    const url = `users/${userId}/orgs`
    return getData(url)
}

function postBeaconUser(payload) {
    const url = 'beacon-users'
    return saveData(url, payload, 'POST')
}

function deleteBeaconUser(payload) {
    const url = 'beacon-users'
    return saveData(url, payload, 'DELETE')
}

function patchHubUser(payload) {
    const url = 'hub-users'
    return saveData(url, payload, 'PATCH')
}

function patchRadarUser(payload) {
    const url = 'product-users'
    return saveData(url, payload, 'PATCH')
}

function resendVerifyMobile(userId) {
    const url = `users/${userId}/send-phone-code`
    return saveData(url, null, 'PUT')
}

function verifyMobile(userId, token) {
    const url = `users/${userId}/phone-verification?phoneCode=${token}`
    return getData(url)
}

function postRequestLinking(payload) {
    const url = 'hub-users/request-linking'
    return saveData(url, payload, 'POST')
}

function inviteCarer(payload) {
    const url = 'hub-carer-invitations'
    return saveData(url, payload, 'POST')
}

function inviteBeaconCarer(payload) {
    const url = 'beacon-carer-invitations'
    return saveData(url, payload, 'POST')
}

function inviteRadarCarer(payload) {
    const url = 'product-carer-invitations'
    return saveData(url, payload, 'POST')
}

function acceptInviteCarer(hub_carer_invitation_id) {
    const url = `hub-carer-invitations/${hub_carer_invitation_id}`
    return saveData(url, {}, 'POST')
}

function acceptInviteBeaconCarer(beacon_carer_invitation_id) {
    const url = `beacon-carer-invitations/${beacon_carer_invitation_id}`
    return saveData(url, {}, 'POST')
}

function acceptInviteRadarCarer(radar_carer_invitation_id) {
    const url = `product-carer-invitations/${radar_carer_invitation_id}`
    return saveData(url, {}, 'POST')
}

function deleteInviteCarer(hub_carer_invitation_id) {
    const url = `hub-carer-invitations/${hub_carer_invitation_id}`
    return saveData(url, null, 'DELETE')
}

function deleteInviteBeaconCarer(beacon_carer_invitation_id) {
    const url = `beacon-carer-invitations/${beacon_carer_invitation_id}`
    return saveData(url, null, 'DELETE')
}

function deleteInviteRadarCarer(radar_carer_invitation_id) {
    const url = `product-carer-invitations/${radar_carer_invitation_id}`
    return saveData(url, null, 'DELETE')
}

function getAllInvitation(page, size) {
    const url = `hub-carer-invitations?size=${size}&page=${page}`
    return getData(url)
}

function getAllBeaconInvitation(page, size) {
    const url = `beacon-carer-invitations?size=${size}&page=${page}`
    return getData(url)
}

function getAllRadarInvitation(page, size) {
    const url = `product-carer-invitations?size=${size}&page=${page}`
    return getData(url)
}

function getInvitationByInvitee(userId) {
    const url = `invitations/invitee/${userId}`
    return getData(url)
}

function getInvitationByInviter(userId) {
    const url = `hub-carer-invitations/inviter/${userId}`
    return getData(url)
}

function getInvitationByHub(hubId) {
    const url = `hub-carer-invitations/hub/${hubId}`
    return getData(url)
}

function getInvitationByBeacon(beaconId) {
    const url = `beacon-carer-invitations/beacon/${beaconId}`
    return getData(url)
}

function getInvitationByRadar(radarId) {
    const url = `product-carer-invitations/product/${radarId}`
    return getData(url)
}

function rollbackNewEmail(userId) {
    const url = `users/${userId}/rollback-new-email`
    return saveData(url, null, 'PUT')
}

function getCountry () {
    const url = 'https://ip2c.org/s'
    return axios({
        method: 'GET',
        url: url,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
}

function updateUserRole(userId, payload) {
    const url = `users/${userId}/roles`
    return saveData(url, payload, 'POST')
}

function deleteUserRole(userId, payload) {
    const url = `users/${userId}/roles`
    return saveData(url, payload, 'DELETE')
}

function getDashboardOverview() {
    const url = 'dashboard-overview'
    return getData(url)
}

function postMassEmail(payload) {
    const url = 'mass-emails/'
    return saveData(url, payload, 'POST')
}

function previewMassEmail(payload) {
    const url = 'mass-emails/preview'
    return saveData(url, payload, 'POST')
}

function postLoneWorker(payload) {
    const url = `users/${payload.userId}/monitors-start`
    return saveData(url,payload,'POST')
}

function getLoneWorkerMonitors(userId) {
    if (userId == null) return null
    
    const url = `users/${userId}/monitors`
    return getData(url)
}

function patchExtendLoneWorker(payload) {
    const url = `users/${payload.userId}/monitors-extend/${payload.id}`
    return saveData(url,payload,'PATCH')
}

function patchDismissLoneWorker(payload) {
    const url = `users/${payload.userId}/monitors-dismiss/${payload.id}`
    return saveData(url,payload,'PATCH')
}

function patchResolveLoneWorker(payload) {
    const url = `users/${payload.userId}/monitors-resolve/${payload.id}`
    return saveData(url,payload,'PATCH')
}

function getLoneWorkerConfig() {
    const url = 'config/user-monitor'
    return getData(url)
}

function patchVerifyMfa(payload) {
    const url = 'users/verify-mfa-code'
    return saveData(url,payload,'PATCH')
}

function patchResetMfa(userId) {
    const url = `users/reset-mfa-code/${userId}`
    return saveData(url, {},'PATCH')
}

function getFilteredUserDevices(payload) {
    const url = 'product-status-monitor/user-devices'
    return saveData(url,payload,'POST')
}

function postFilteredUserDevicesExport(payload) {
    const url = 'product-status-monitor/user-devices/export'
    return saveData(url,payload,'POST', true, true)
}

function getExportUserDevicesEnabled() {
    const url = 'product-status-monitor/user-devices/data-export-enabled'
    return getData(url)
}

export default {
    getInvitationByBeacon,
    getAllBeaconInvitation,
    deleteInviteBeaconCarer,
    acceptInviteBeaconCarer,
    inviteBeaconCarer,
    inviteCarer,
    acceptInviteCarer,
    deleteInviteCarer,
    getInvitationByInvitee,
    getInvitationByInviter,
    getInvitationByHub,
    getAllInvitation,
    forgot,
    reset,
    logout,
    getMe,
    postUser,
    deleteUser,
    postHubUsers,
    deleteHubUsers,
    createUser,
    changePassword,
    allUserData,
    getUserHubs,
    getUserRadars,
    postBeaconUser,
    deleteBeaconUser,
    patchHubUser,
    registration,
    verifyEmail,
    resendVerifyEmail,
    verifyMobile,
    resendVerifyMobile,
    postRequestLinking,
    rollbackNewEmail,
    getCountry,
    getUserBeacons,
    updateUserRole,
    deleteUserRole,
    getUserOrgs,
    getDashboardOverview,
    postMassEmail,
    previewMassEmail,
    getInvitationByRadar,
    getAllRadarInvitation,
    inviteRadarCarer,
    deleteInviteRadarCarer,
    acceptInviteRadarCarer,
    patchRadarUser,
    postLoneWorker,
    patchExtendLoneWorker,
    patchDismissLoneWorker,
    patchResolveLoneWorker,
    getLoneWorkerMonitors,
    getLoneWorkerConfig,
    patchVerifyMfa,
    patchResetMfa,
    getFilteredUserDevices,
    postFilteredUserDevicesExport,
    getExportUserDevicesEnabled
}

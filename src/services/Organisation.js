import { getData , saveData } from '@/utility/AxiosCalls'

function getOrgs() {
    const url = 'orgs'
    return getData(url)
}

function postOrg(payload) {
    const url = 'orgs'
    return saveData(url, payload, 'POST')
}

function updateOrg(id, payload) {
    const url = `orgs/${id}`
    return saveData(url, payload, 'PUT')
}

function deleteOrg(id) {
    const url = `orgs/${id}`
    return saveData(url, null, 'DELETE')
}

function fetchHubByOrg(orgId, page, size, ) {
    const url = `orgs/${orgId}/hubs?size=${size}&page=${page}`
    return getData(url)
}

function fetchBeaconByOrg(orgId, page, size, ) {
    const url = `orgs/${orgId}/beacons?size=${size}&page=${page}`
    return getData(url)
}

function fetchRadarByOrg(orgId, page, size, ) {
    const url = `orgs/${orgId}/radars?size=${size}&page=${page}`
    return getData(url)
}

function fetchUserByOrg(orgId) {
    const url = `orgs/${orgId}/users`
    return getData(url)
}

function postOrgUser(payload) {
    const url = 'org-users'
    return saveData(url, payload, 'POST')
}

function deleteOrgUser(payload) {
    const url = 'org-users'
    return saveData(url, payload, 'DELETE')
}

function postOrgUserInvite(payload) {
    const url = 'org-user-invitations'
    return saveData(url, payload, 'POST')
}

function postOrgUserInviteAccept(invitationId) {
    const url = `org-user-invitations/${invitationId}`
    return saveData(url, null, 'POST')
}

function deleteOrgUserInvite(invitationId) {
    const url = `org-user-invitations/${invitationId}`
    return saveData(url, null, 'DELETE')
}

function getAllOrgInvitation(orgId) {
    const url = `org-user-invitations/organization/${orgId}`
    return getData(url)
}

function getOrgInvitationByInvitee(userId) {
    const url = `org-user-invitations/invitee/${userId}`
    return getData(url)
}

function fetchContactByOrg(orgId) {
    const url = `orgs/${orgId}/contacts`
    return getData(url)
}

function postContact(orgId, payload) {
    const url = `orgs/${orgId}/contacts`
    return saveData(url, payload, 'POST')
}

function updateContact(orgId, payload) {
    const url = `orgs/${orgId}/contacts/${payload.contact_id}`
    return saveData(url, payload, 'PUT')
}

function deleteContact(orgId, contactId) {
    const url = `orgs/${orgId}/contacts/${contactId}`
    return saveData(url, null, 'DELETE')
}

function getOrgContactType() {
    const url = 'enum/OrgContactType'
    return getData(url)
}

function postOrgDevice(payload) {
    const url = 'org-devices/link'
    return saveData(url, payload, 'POST')
}

function deleteOrgDevice(payload) {
    const url = 'org-devices'
    return saveData(url, payload, 'DELETE')
}

function getOrgDeviceGroup(orgId) {
    const url = `orgs/${orgId}/device-groups`
    return getData(url)
}

function postOrgDeviceGroup(orgId, payload) {
    const url = `orgs/${orgId}/device-groups`
    return saveData(url, payload, 'POST')
}

function updateOrgDeviceGroup(orgId, payload) {
    const url = `orgs/${orgId}/device-groups/${payload.organization_device_group_id}`
    return saveData(url, payload, 'PUT')
}

function deleteOrgDeviceGroup(orgId, organization_device_group_id) {
    const url = `orgs/${orgId}/device-groups/${organization_device_group_id}`
    return saveData(url, null, 'DELETE')
}

function getAllDeviceGroupDevices(orgId) {
    const url = `orgs/${orgId}/device-groups/devices`
    return getData(url)
}

function getOrgDeviceGroupDevices(orgId, organization_device_group_id) {
    const url = `orgs/${orgId}/device-groups/${organization_device_group_id}/devices`
    return getData(url)
}

function postOrgDeviceGroupDevices(orgId, payload) {
    const url = `orgs/${orgId}/device-groups/${payload.organization_device_group_id}/devices`
    return saveData(url, payload, 'POST')
}

function updateOrgDeviceGroupDevices(orgId, payload) {
    const url = `orgs/${orgId}/device-groups/${payload.organization_device_group_id}/devices/${payload.organization_device_group_device_id}`
    return saveData(url, payload, 'PUT')
}

function deleteOrgDeviceGroupDevices(orgId, payload) {
    const url = `orgs/${orgId}/device-groups/${payload.organization_device_group_id}/devices/${payload.organization_device_group_device_id}`
    return saveData(url, null, 'DELETE')
}

function getOrgUserGroup(orgId) {
    const url = `orgs/${orgId}/user-groups`
    return getData(url)
}

function postOrgUserGroup(orgId, payload) {
    const url = `orgs/${orgId}/user-groups`
    return saveData(url, payload, 'POST')
}

function updateOrgUserGroup(orgId, payload) {
    const url = `orgs/${orgId}/user-groups/${payload.organization_user_group_id}`
    return saveData(url, payload, 'PUT')
}

function deleteOrgUserGroup(orgId, organization_user_group_id) {
    const url = `orgs/${orgId}/user-groups/${organization_user_group_id}`
    return saveData(url, null, 'DELETE')
}

function getAllUserGroupUsers(orgId) {
    const url = `orgs/${orgId}/user-groups/users`
    return getData(url)
}

function getOrgUserGroupUsers(orgId, organization_user_group_id) {
    const url = `orgs/${orgId}/user-groups/${organization_user_group_id}/users`
    return getData(url)
}

function postOrgUserGroupUsers(orgId, payload) {
    const url = `orgs/${orgId}/user-groups/${payload.organization_user_group_id}/users`
    return saveData(url, payload, 'POST')
}

function updateOrgUserGroupUsers(orgId, payload) {
    const url = `orgs/${orgId}/user-groups/${payload.organization_user_group_id}/users/${payload.organization_user_group_user_id}`
    return saveData(url, payload, 'PUT')
}

function deleteOrgUserGroupUsers(orgId, payload) {
    const url = `orgs/${orgId}/user-groups/${payload.organization_user_group_id}/users/${payload.organization_user_group_user_id}`
    return saveData(url, null, 'DELETE')
}

function fetchTPByOrg(orgId) {
    const url = `orgs/${orgId}/tp-destinations`
    return getData(url)
}

function postTP(orgId, payload) {
    const url = `orgs/${orgId}/tp-destinations`
    return saveData(url, payload, 'POST')
}

function updateTP(orgId,destinationId, payload) {
    const url = `orgs/${orgId}/tp-destinations/${destinationId}`
    return saveData(url, payload, 'PUT')
}

function deleteTP(orgId, destinationId) {
    const url = `orgs/${orgId}/tp-destinations/${destinationId}`
    return saveData(url, null, 'DELETE')
}

function fetchTPCandidates(type, deviceId) {
    const url = `orgs/tp-destinations?deviceType=${type}&forDeviceId=${deviceId}`
    return getData(url)
}

function fetchAPNByOrg(orgId) {
    const url = `orgs/${orgId}/beacon-apn`
    return getData(url)
}

function postAPN(orgId, payload) {
    const url = `orgs/${orgId}/beacon-apn`
    return saveData(url, payload, 'POST')
}

function updateAPN(orgId,apnId, payload) {
    const url = `orgs/${orgId}/beacon-apn/${apnId}`
    return saveData(url, payload, 'PUT')
}

function deleteAPN(orgId, apnId) {
    const url = `orgs/${orgId}/beacon-apn/${apnId}`
    return saveData(url, null, 'DELETE')
}

function getOrgDevices(orgId) {
    const url = `org-devices?organizationId=${orgId}`
    return getData(url)
}

export default {
    getOrgs,
    postOrg,
    updateOrg,
    deleteOrg,
    fetchBeaconByOrg,
    fetchHubByOrg,
    fetchRadarByOrg,
    fetchContactByOrg,
    postContact,
    updateContact,
    deleteContact,
    getOrgContactType,
    fetchUserByOrg,
    postOrgUser,
    deleteOrgUser,
    getAllOrgInvitation,
    getOrgInvitationByInvitee,
    postOrgUserInvite,
    postOrgUserInviteAccept,
    deleteOrgUserInvite,
    postOrgDevice,
    deleteOrgDevice,
    getOrgDeviceGroup,
    postOrgDeviceGroup,
    updateOrgDeviceGroup,
    deleteOrgDeviceGroup,
    getOrgDeviceGroupDevices,
    postOrgDeviceGroupDevices,
    updateOrgDeviceGroupDevices,
    deleteOrgDeviceGroupDevices,
    getAllDeviceGroupDevices,
    getOrgUserGroup,
    postOrgUserGroup,
    updateOrgUserGroup,
    deleteOrgUserGroup,
    getOrgUserGroupUsers,
    postOrgUserGroupUsers,
    updateOrgUserGroupUsers,
    deleteOrgUserGroupUsers,
    getAllUserGroupUsers,
    fetchTPByOrg,
    postTP,
    updateTP,
    deleteTP,
    fetchTPCandidates,
    fetchAPNByOrg,
    postAPN,
    updateAPN,
    deleteAPN,
    getOrgDevices
}

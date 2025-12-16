import { actions } from 'mirrorx'
import { retrieveJSONData, storeJSONData } from '@/utility/Storage'
import beaconService from '../services/Beacon'
import TPService from '../services/ThirdParty'
import commonService from '../services/Common'
import moment from 'moment'
import _ from 'lodash'
import { Modal } from 'antd'
import orgService from '../services/Organisation'
import { globalConstants } from '@/_constants'

export default {
    name: 'sofiBeacon',
    initialState: {
        allBeacons: null,
        selectedBeacon: null,
        headStates: null,
        beacons: [],
        beaconFeatures: null,
        powerOptions: null,
        beaconOrgs: [],
        beaconAlert: null,
        beaconLastSeens:{},
        selectedBeaconHeadState: null,
        selectedBeaconEmergencyContacts: null,
        selectedBeaconUsers: null,
        latestRawData: null,
        latestGSM: null,
        historicalGps: [],
        historicalFilter: {
            startDate: moment().hour(0).minute(0).second(0).toDate(),
            endDate: new Date()
        },
        linkedHub: null,
        loading: false,
        TPs: null,
        TPCount: 0,
        beaconTPCandidates: null,
        beaconModels : null,
        geofence: null,
        settings: null,
        beaconHeadstates: null,
        groupBeacons: null,
        BeaconEmergencySearchResults: null,
        settingsCommand: null,
        anomalyDate: moment(),
        historicalAlarms: [],
        filteredAlarms: [],
        alarmGps: null,
        beaconEmergencyContactChangeLogs: null,
        bulkUploadList: null,
        batchUpdateList: null,
        settingsLoading: false
    },
    reducers: {
        setBeacons(state, beacons) {
            return { ...state, beacons}
        },

        setLoading(state,loading) {
            return { ...state, loading }
        },

        setSettingsLoading(state,loading) {
            return { ...state, loading }
        },

        setBeaconLastSeen(state, { beaconId , lastSeen }) {
            const record = {}
            record[beaconId] = lastSeen
            return { ...state, beaconLastSeens: _.extend(state.beaconLastSeens,record) }
        }
    },
    effects: {
        getS(data, getState){
            return getState()
        },

        /** select beacon */
        async selectBeacon (beacon) {
            let beaconData = await beaconService.getBeacon(beacon.pub_id)
            actions.sofiBeacon.save({
                selectedBeacon: {
                    ...beacon,
                    ...beaconData
                }
            })
            moment.tz.setDefault(beaconData?.timezone)
            beacon && storeJSONData('selectedBeacon', beacon.pub_id, false)
        },

        async selectBeaconById (beaconId) {
            let beaconData = await beaconService.getBeaconById(beaconId)
            actions.sofiBeacon.save({
                selectedBeacon: {
                    beaconData
                }
            })
            beaconData && storeJSONData('selectedBeacon', beaconData.pub_id, false)
            return beaconData
        },

        async selectBeacons (beacons) {
            const beaconIds = beacons.map(beacon=>beacon.pub_id)
            beacons?.length>0 && storeJSONData('selectedBeacons', beaconIds, false)
            await actions.sofiBeacon.fetchBeaconHeadstates(beaconIds)
            actions.sofiBeacon.save({
                groupBeacons:  beacons
            })
        },

        /*** fetch User Beacons */
        // async fetchBeaconByUser() {
        //     actions.sofiBeacon.setLoading(true)
        //     let beacons = await beaconService.fetchBeacon()
        //     actions.sofiBeacon.save({
        //         beacons
        //     })
        //     const storedBeacon = beacons?.find(item => item.pub_id === retrieveJSONData('selectedBeacon'))
        //     storedBeacon && (await actions.sofiBeacon.selectBeacon(storedBeacon))
        //     actions.sofiBeacon.setLoading(false)
        //     return beacons
        // },

        async fetchBeaconByUser() {
            actions.sofiBeacon.setLoading(true)
            try {
                let beacons = await beaconService.fetchBeacon()
                
                // Correct way to call the save action
                actions.sofiBeacon.setBeacons({beacons})
                
                const storedBeacon = beacons?.find(item => item.pub_id === retrieveJSONData('selectedBeacon'))
                if (storedBeacon) {
                    await actions.sofiBeacon.selectBeacon(storedBeacon)
                }
                return beacons
            } catch (error) {
                console.error('Failed to fetch beacons:', error)
                throw error
            } finally {
                actions.sofiBeacon.setLoading(false)
            }
        },

        /*** fetch beacon head state*/
        async fetchBeaconHeadState(beaconId) {
            if (beaconId) {
                try {
                    actions.sofiBeacon.setLoading(true)
                    const oldHeadState = actions.sofiBeacon.getS().sofiBeacon.selectedBeaconHeadState
                    let selectedBeaconHeadState = await beaconService.fetchBeaconHeadState(beaconId)
                    let selectedBeacon = actions.sofiBeacon.getS().sofiBeacon.selectedBeacon
                    if (oldHeadState?.decimal_degrees_latitude === selectedBeaconHeadState.decimal_degrees_latitude &&
                        oldHeadState?.decimal_degrees_longitude === selectedBeaconHeadState.decimal_degrees_longitude){
                        selectedBeaconHeadState.address = oldHeadState?.address
                    }
                    if (selectedBeaconHeadState.beacon_status !== selectedBeacon.beacon_status) {
                        selectedBeacon.beacon_status = selectedBeaconHeadState.beacon_status
                        actions.sofiBeacon.selectBeacon(selectedBeacon)
                    }
                    actions.sofiBeacon.save({
                        selectedBeaconHeadState
                    })
                } catch (err) {
                    actions.sofiBeacon.save({
                        selectedBeaconHeadState: null
                    })
                } finally {
                    actions.sofiBeacon.setLoading(false)
                }
            }
        },

        /** fetch Beacon Emergency contacts*/
        async fetchBeaconEmergencyContacts(beaconId) {
            try {
                actions.sofiBeacon.setLoading(true)
                await beaconService.fetchBeaconEmergencyContacts(beaconId).then(result=>{
                    actions.sofiBeacon.save({
                        selectedBeaconEmergencyContacts: result
                    })
                })
            } catch (err) {
                actions.sofiBeacon.save({
                    selectedBeaconEmergencyContacts: []
                })
                return Promise.reject(err.response?.data)
            } finally {
                actions.sofiBeacon.setLoading(false)
            }
        },

        /** fetch all beacons */
        async fetchAllBeacons(){
            try {
                actions.sofiBeacon.setLoading(true)

                const results = await Promise.all([beaconService.fetchAllBeacons({
                    fetchArchived: true,
                    fetchNonArchived: true
                }),beaconService.fetchAllBeaconHeadState({
                    fetchArchived: true,
                    fetchNonArchived: true
                })])
                const allBeacons = results[0]
                const allHeadStates = results[1]

                const headStates = allHeadStates.reduce((prev,curr) => {
                    prev[curr.beacon_id] = curr
                    return prev
                },{})

                actions.sofiBeacon.save({
                    allBeacons: allBeacons.map(item => {
                        return _.extend({}, item ,headStates[item.id])
                    }).reverse(),
                    headStates
                })

            } catch (err) {
                actions.sofiBeacon.save({
                    allBeacons: []
                })
                return Promise.reject(err.response?.data)
            } finally {
                actions.sofiBeacon.setLoading(false)
            }
        },

        /** fetch Beacon Gps history */
        async fetchBeaconGpsHistory (params) {
            const { startDate, endDate , beaconId } = params
            try {
                actions.sofiBeacon.setLoading(true)
                let data = await beaconService.fetchBeaconHistoricalLocation({
                    beaconId,
                    'field': 'pendant_sent_at',
                    'start-date': moment(startDate).utc().format() || moment().hour(0).minute(0).second(0).utc().format(),
                    'end-date': moment(endDate).utc().format() || moment().utc().format(),
                    'sort': 'pendant_sent_at,asc'
                }).catch (err=> {
                    actions.sofiBeacon.save({
                        historicalGps: [],
                    })
                    return Promise.reject(err.response)
                })

                actions.sofiBeacon.save({
                    historicalGps: data.content,
                    historicalFilter: {
                        startDate,
                        endDate
                    }
                })
            } catch (err) {
                actions.sofiBeacon.save({
                    historicalGps: [],
                })
                return Promise.reject(err.response)
            } finally {
                actions.sofiBeacon.setLoading(false)
            }
        },

        /** save beacon infor */
        async saveBeaconInfor(infor) {
            try {
                await beaconService.saveBeaconInfor(infor)
                !infor.notRefresh && actions.sofiBeacon.selectBeacon(infor)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        /** save beacon emergencies contacts */
        async saveBeaconEmergencyContacts (contacts) {
            try{
                const result = await beaconService.saveEmergencyContacts(contacts)
                actions.sofiBeacon.save({
                    selectedBeaconEmergencyContacts: result?.contacts
                })
                return result
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        /** create beacon */
        async createBeacon (payload) {
            try {
                return await beaconService.createBeacon(payload)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        /** SMS APN */
        async smsAPN ({ beaconId , apnId }) {
            try {
                return await beaconService.smsAPN({ beaconId , apnId })
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        /** SMS Server Address */
        async smsServerAddress({ beaconId }) {
            try {
                return await beaconService.smsServerAddress({ beaconId })
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        /** SMS AGPS */
        async smsAGPS({ beaconId }) {
            try {
                return await beaconService.smsAGPS({ beaconId })
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        /** link beacon */
        async linkBeacon ({ beaconId , hubId }) {
            try {
                return await beaconService.associateBeaconToHub({beaconId , hubId })
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        /** dislink beacon */
        async dislinkBeacon ({ beaconId }) {
            try {
                return await beaconService.unassociateBeaconFromHub({beaconId }).then(()=>{
                    actions.sofiBeacon.fetchBeaconByUser()
                })
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        /** fetch linked hub */
        async fetchLinkedHub(beaconId) {
            try {
                const data = await beaconService.getBeaconLinkedHub( beaconId )
                actions.sofiBeacon.save({
                    linkedHub: data
                })

            } catch (err) {
                actions.sofiBeacon.save({
                    linkedHub: {}
                })
                return Promise.reject(err.response && err.response?.data)
            }
        },

        /** add Beacon User */
        async associateBeaconUser({ userId , beaconId }) {
            try {
                return await beaconService.linkBeaconUser({ userId , beaconId  })
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        /** disassociate Beacon User */
        async disassociateBeaconUser({ userId , beaconId, beaconPubId }) {
            await beaconService.unlinkBeaconUser({ userId , beaconId  })
                .then(() => {
                    actions.sofiBeacon.fetchBeaconUsers(beaconPubId)
                }).catch((err)=> {
                    err.response?.data.status === 400 && Modal.error({
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
                    return Promise.reject(err.response?.data)
                })

        },

        /** fetch Beacon Users */
        async fetchBeaconUsers(beaconId) {
            try {
                const data = await beaconService.fetchBeaconUsers(beaconId)
                actions.sofiBeacon.save({
                    selectedBeaconUsers: data
                })
                return data
            } catch (err) {
                actions.sofiBeacon.save({
                    selectedBeaconUsers: []
                })
                return Promise.reject(err.response?.data)
            }
        },

        async fetchBeaconRawHistory (params) {
            const { startDate, endDate , beaconId } = params
            try {
                actions.sofiBeacon.setLoading(true)
                let data = await beaconService.fetchBeaconRawData({
                    beaconId,
                    'start-date': startDate? moment(startDate).utc().format() : moment().subtract(4, 'hour').utc().format(),
                    'end-date': endDate? moment(endDate).utc().format() : moment().utc().format(),
                    'sort': 'server_received_at,desc'
                })
                actions.sofiBeacon.save({
                    latestRawData: data.content[0],
                })
            } catch (err) {
                actions.sofiBeacon.save({
                    latestRawData: '',
                })
                return Promise.reject(err.response)
            } finally {
                actions.sofiBeacon.setLoading(false)
            }
        },

        async requestLinkingBeacon(payload) {
            try {
                return await beaconService.requestLinkingBeacon(payload)
            } catch (err) {
                const error = err.response?.data || {}
                error.status = err.response?.status
                return Promise.reject(error)
            }
        },

        async getBeaconAlert(beaconId) {
            try {
                const data = await beaconService.fetchBeaconAlert(beaconId)
                actions.sofiBeacon.save({
                    beaconAlert: data
                })
            } catch (err) {
                actions.sofiBeacon.save({
                    beaconAlert: []
                })
                return Promise.reject(err.response?.data)
            }
        },

        async updateBeaconAlert(payload) {
            try {
                return await beaconService.updateBeaconAlert(payload).then(()=>{
                    actions.sofiBeacon.getBeaconAlert(payload.beacon_pub_id)
                })
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async deleteBeaconAlert({beaconId, type}) {
            try {
                return await beaconService.deleteBeaconAlert(beaconId, type).then(()=>{
                    actions.sofiBeacon.getBeaconAlert(beaconId)
                })
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async getTPAccounts(beaconId) {
            try {
                const data = await TPService.getBeaconTPs(beaconId)
                actions.sofiBeacon.save({
                    TPs: data
                })
            } catch(err) {
                actions.sofiBeacon.save({
                    TPs: []
                })
                return Promise.reject(err.response?.data)
            }
        },

        async createTPAccount ({beaconId, payload}) {
            try {
                return await TPService.postBeaconTP(beaconId,payload)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async updateTPAccount ({beaconId, id, payload}) {
            try {
                return await TPService.updateBeaconTP(beaconId,id,payload)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async deleteTPAccount ({beaconId, id}) {
            try {
                return await TPService.deleteBeaconTP(beaconId, id).then(()=>{
                    actions.sofiBeacon.getTPAccounts(beaconId)
                })
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async getBeaconTPCandidates(beaconId) {
            try {
                const data = await orgService.fetchTPCandidates('BEACON',beaconId)
                actions.sofiBeacon.save({
                    beaconTPCandidates: data
                })
            } catch(err) {
                actions.sofiBeacon.save({
                    beaconTPCandidates: []
                })
                return Promise.reject(err.response?.data)
            }
        },

        async getBeaconModels(){
            const result = await beaconService.getBeaconModels()
            actions.sofiBeacon.save({
                beaconModels: result
            })
        },

        async getBeaconGeofence(beaconId) {
            try {
                const data = await beaconService.getBeaconGeofence(beaconId)
                const settings = await beaconService.getBeaconSettings(beaconId)
                actions.sofiBeacon.save({
                    geofence: data,
                    settings: settings
                })
            } catch(err) {
                actions.sofiBeacon.save({
                    geofence: [],
                    settings: {}
                })
                return Promise.reject(err.response?.data)
            }
        },

        async createBeaconGeofence (payload) {
            try {
                return await beaconService.postBeaconGeofence(payload)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async updateBeaconGeofence (payload) {
            try {
                return await beaconService.putBeaconGeofence(payload)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async deleteBeaconGeofence ({beaconId, geofenceId}) {
            try {
                return await beaconService.deleteBeaconGeofence(geofenceId).then(()=>{
                    actions.sofiBeacon.getBeaconGeofence(beaconId)
                })
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async updateBeaconFall (payload) {
            try {
                return await beaconService.putBeaconFall(payload)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async clearCommandQueue (beaconId) {
            try {
                return await beaconService.deleteBeaconCommandQueue(beaconId)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async getBeaconSettings(beaconId) {
            try {
                actions.sofiBeacon.setSettingsLoading(true)
                const data = await beaconService.getBeaconSettings(beaconId)
                actions.sofiBeacon.save({
                    settings: data
                })
            } catch(err) {
                actions.sofiBeacon.save({
                    settings: {}
                })
            } finally {
                actions.sofiBeacon.setSettingsLoading(false)
            }
        },

        async getBeaconPowerOptions(beaconId) {
            try {
                const data = await beaconService.getBeaconPowerOptions(beaconId)
                actions.sofiBeacon.save({
                    powerOptions: data
                })
            } catch(err) {
                actions.sofiBeacon.save({
                    powerOptions: {}
                })
            }
        },

        async getBeaconFeatures() {
            try {
                const data = await beaconService.getBeaconFeatures()
                actions.sofiBeacon.save({
                    beaconFeatures: data
                })
            } catch(err) {
                actions.sofiBeacon.save({
                    beaconFeatures: {}
                })
            }
        },

        async postSMSSettings (payload) {
            try {
                return await beaconService.postSMSSettings(payload)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async postTCPSettings (payload) {
            try {
                return await beaconService.postTCPSettings(payload)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async postURLSettings (beaconId) {
            try {
                return await beaconService.postURLSettings(beaconId)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async updateBeaconOOBE (payload) {
            try {
                return await beaconService.putBeaconOOBE(payload)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async getBeaconOrgs(beaconId){
            const result = await beaconService.getBeaconOrgs(beaconId)
            actions.sofiBeacon.save({
                beaconOrgs: result
            })
        },

        async fetchBeaconHeadstates(beaconIds) {
            let requests = []
            beaconIds?.map(beaconId=>{
                requests.push(beaconService.fetchBeaconHeadState(beaconId))
            })
            if (requests.length > 0) {
                return Promise.allSettled(requests).then((results) => {
                    actions.sofiBeacon.save({
                        beaconHeadstates: results?.filter(result=>result.status==='fulfilled')?.map(result=>result.value)
                    })
                })
            }
        },

        async createMassBeacons (payload) {
            try {
                return await beaconService.postMassBeacons(payload)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async fetchEmergencyContactsByNumber({number, name}) {
            let result = await beaconService.getEmergencyContactsByNumber(number,name)
            result = result.map((item,i)=>({...item, key: i}))
            actions.sofiBeacon.save({
                BeaconEmergencySearchResults: result
            })
            return result
        },

        async UpdateBulkEmergencyContacts (payload) {
            try {
                return await beaconService.patchEmergencyContactsBulk(payload)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async UpdateBeaconPrefix ({beaconId, payload}) {
            try {
                return await beaconService.postSMSPrefix(beaconId,payload)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async getSettingsCommand(beaconId){
            const result = await beaconService.getBeaconDeviceSettings(beaconId)
            actions.sofiBeacon.save({
                settingsCommand: result
            })
        },

        async fetchBeaconAlertHistory (params) {
            const { startDate, endDate , beaconId } = params
            try {
                actions.sofiBeacon.setLoading(true)
                let data = await beaconService.getBeaconHistoricalAlarms({
                    beaconId,
                    'start-date': moment(startDate).utc().format() || moment().hour(0).minute(0).second(0).utc().format(),
                    'end-date': moment(endDate).utc().format() || moment().utc().format(),
                })
                actions.sofiBeacon.save({
                    historicalAlarms: data,
                })
                return data
            } catch (err) {
                actions.sofiBeacon.save({
                    historicalAlarms: [],
                })
                return Promise.reject(err.response)
            } finally {
                actions.sofiBeacon.setLoading(false)
            }
        },

        /** fetch Beacon Gps history */
        async fetchBeaconAlarmGpsHistory (params) {
            const { alarmTime, beaconId } = params
            try {
                actions.sofiBeacon.setLoading(true)
                let data = await beaconService.fetchBeaconHistoricalLocation({
                    beaconId,
                    'field': 'pendant_sent_at',
                    'start-date': moment(alarmTime).clone().subtract(10,'minute').format(),
                    'end-date': moment(alarmTime).clone().add(10,'minute').format(),
                    'sort': 'pendant_sent_at,asc'
                })
                actions.sofiBeacon.save({
                    alarmGps: data.content,
                })
                return data.content
            } catch (err) {
                actions.sofiBeacon.save({
                    alarmGps: [],
                })
                return Promise.reject(err.response)
            } finally {
                actions.sofiBeacon.setLoading(false)
            }
        },

        async fetchBeaconECChangeLogs (beaconId) {
            try {
                actions.sofiBeacon.setLoading(true)
                let data = await commonService.getBeaconEmergencyContactChangeLogs({
                    'ref-id': beaconId,
                    'type-value': globalConstants.CHANGE_LOG_BEACON_EC
                })
                actions.sofiBeacon.save({
                    beaconEmergencyContactChangeLogs: data.content,
                })
                return data.content
            } catch (err) {
                actions.sofiBeacon.save({
                    beaconEmergencyContactChangeLogs: [],
                })
                return Promise.reject(err.response)
            } finally {
                actions.sofiBeacon.setLoading(false)
            }
        },

        async saveBeaconPhoneSwitches (payload) {
            try{
                return await beaconService.postPhoneSwitches(payload.beacon_id,payload)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async bulkUploadBeacons (payload) {
            try{
                return await beaconService.postBulkUpload(payload)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async fetchBulkUploadBeaconList () {
            try{
                const data = await beaconService.getBulkUploadList('B')
                actions.sofiBeacon.save({
                    bulkUploadList: data,
                })
                return data
            } catch (err) {
                actions.sofiBeacon.save({
                    bulkUploadList: {},
                })
                return Promise.reject(err.response)
            }
        },

        async applyBulkUpload (id) {
            try{
                return await beaconService.putBulkUpload(id)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async fetchBatchUpdateList () {
            try{
                const data = await beaconService.getBatchUpdates()
                actions.sofiBeacon.save({
                    batchUpdateList: data,
                })
                return data
            } catch (err) {
                actions.sofiBeacon.save({
                    batchUpdateList: {},
                })
                return Promise.reject(err.response)
            }
        },

        async applyBatchUpdate (payload) {
            try{
                return await beaconService.postBatchUpdate(payload)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async applyBatchEC (payload) {
            try{
                return await beaconService.postBatchEC(payload)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async applyBatchWM (payload) {
            try{
                return await beaconService.postBatchWM(payload)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },

        async getTPCount(beaconId) {
            try{
                const data = await beaconService.getTPCount(beaconId)
                actions.sofiBeacon.save({
                    TPCount: data,
                })
                return data
            } catch (err) {
                actions.sofiBeacon.save({
                    TPCount: 0,
                })
                return Promise.reject(err.response)
            }
        },

        async sendDefaultSettings(beaconId) {
            try{
                return await beaconService.postDefaultSettings(beaconId)
            } catch (err) {
                return Promise.reject(err.response?.data)
            }
        },
    }
}

import {actions} from 'mirrorx'
import moment from 'moment'
import hubService from '../services/Hub'
import beaconService from '../services/Beacon'
import {retrieveJSONData, storeDeviceData} from '@/utility/Storage'
import {globalConstants} from '@/_constants'
import TPService from '../services/ThirdParty'
import orgService from '../services/Organisation'
import radarService from '@/services/Radar'

export default {
    name: 'hub',
    initialState: {
        hubs: [],
        hubUsers: [],
        hubOrgs: [],
        sensors: [],
        hubStatus: {},
        hubDevices: null,
        hubNewDevices: [],
        hubSpaces: [],
        messages: {},
        errors: null,
        traceFiles: null,
        messagePage: 1,
        detailedMessage: null,
        detailedAnomalies: null,
        detailedMedication: null,
        detailedOccupancies: null,
        detailedActionState: null,
        anomalies: null,
        unResolvedAnomalies: null,
        lastKnown: {},
        selectedHub: null,
        selectedHubBeacons: [],
        totalHubBeacons: 0,
        selectedAnomaly: null,
        anomalyMonth: moment(),
        medication: [],
        activities: null,
        activitiesDetailed: false,
        loading: false,
        instructionDetail: {},
        TPs: null,
        hubTPCandidates: [],
        lastOccupancies: null,
        network: null,
        hubBeaconHeadstates: null,
        eventRules: null,
        eventRuleLogs: null,
        deviceIntervalConfig: null,
        hubRadars: null,
        hubRadarUsers: null,
    },
    reducers: {
        setLoading(state,loading) {
            return {...state, loading}
        }
    },
    effects: {
        getS(data, getState){
            return getState()
        },
        async selectHub (hub) {
            let hubData = await hubService.getHub(hub.hub_id)
            actions.hub.save({
                selectedHub: {
                    ...hub,
                    ...hubData
                },
            })
            hub && storeDeviceData('hubId', hub.hub_id)
        },

        selectAnomaly (anomaly) {
            actions.hub.save({
                selectedAnomaly: anomaly
            })
        },

        async getSofiDevices(){
            let beacons = await actions.sofiBeacon.fetchBeaconByUser()
            let hubs = await actions.hub.getHubs()
            let radars = await actions.radar.fetchAllRadars()
            return {beacons, hubs, radars}
        },

        async getHubs(){
            let allResults = []
            let newPage = 0
            let result = {}
            do {
                result = await hubService.hubsData(newPage,500)
                allResults = allResults.concat(result?.content)
                newPage++
            } while (!result?.last)
            actions.hub.save({
                hubs: allResults,
            })
            if (allResults.length>0){
                const storedHub = allResults.find(item => item.hub_id === retrieveJSONData('hubId'))
                storedHub && await actions.hub.selectHub(storedHub)
            }
            return allResults
        },

        async getSensors(hubId){
            const result = await hubService.sensorData(hubId)
            actions.hub.save({
                sensors: result
            })
        },
        async getHubUsers(hubId){
            const result = await hubService.hubUserData(hubId)
            actions.hub.save({
                hubUsers: result
            })
            return result
        },
        async getHubOrgs(hubId){
            const result = await hubService.getHubOrgs(hubId)
            actions.hub.save({
                hubOrgs: result
            })
        },
        async getHubStatus(hubId){
            const result = await hubService.hubStatus(hubId)
            actions.hub.save({
                hubStatus: result
            })
        },
        async getHubInstruction({hubId, instructionId}){
            const result = await hubService.getInstruction(hubId, instructionId)
            actions.hub.save({
                instructionDetail: result
            })
        },
        async getHubSpaces(hubId){
            const result = await hubService.hubSpaces(hubId)
            actions.hub.save({
                hubSpaces: result
            })
        },
        async addHubSpace({hubId, space}){
            await hubService.postHubSpace(hubId, space).then((result)=> {
                actions.hub.getHubSpaces(hubId)
                return result
            })
        },
        async updateHubSpace({hubId, space}){
            await hubService.putHubSpace(hubId, space).then(()=>
                actions.hub.getHubSpaces(hubId)
            )
        },
        async getHubDevices(hubId){
            const result = await hubService.hubDevices(hubId)
            actions.hub.save({
                hubDevices: result
            })
        },
        async getHubRadars(hubId){
            const result = await hubService.getHubRadars(hubId)
            actions.hub.save({
                hubRadars: result
            })
        },
        async getHubNewDevices(hubId){
            const result = await hubService.hubNewDevices(hubId)
            actions.hub.save({
                hubNewDevices: result
            })
        },
        async addHubDevice({hubId, device}){
            await hubService.postHubDevices(hubId, device).then((result)=> {
                actions.hub.getHubDevices(hubId)
                return result
            }
            )
        },
        async updateHubDevice({hubId, device}){
            await hubService.putHubDevice(hubId, device).then(()=>
                actions.hub.getHubDevices(hubId)
            )
        },
        async getHubMessages({hubId, page}){
            const result = await hubService.hubMessages(hubId, page)
            actions.hub.save({
                messages: result
            })
        },
        async getHubErrors({hubId, size=10, page, filter = null, sorter = 'occurred_at,desc'}){
            const result = await hubService.hubErrors(hubId, size, page, filter, sorter)
            actions.hub.save({
                errors: result
            })
        },
        async getHubTraceFiles({hubId, size=10, page}){
            const result = await hubService.hubTraces(hubId, size, page)
            actions.hub.save({
                traceFiles: result
            })
        },
        async getHubAnomalies({hubId, page = 0}){
            let result = await hubService.hubAnomalies(hubId, page)
            if (page>0){
                result.content = actions.hub.getS().hub.anomalies.content.concat(result.content)
            }
            actions.hub.save({
                anomalies: result.content
            })
        },
        async getHubLastKnown(hubId){
            const result = await hubService.hubLastKnown(hubId)
            actions.hub.save({
                lastKnown: result
            })
        },
        async postResolveAnomaly({anomalyId, hubId, userId}){
            return await hubService.resolveAnomaly(anomalyId, hubId, userId).then(()=>{
                const date = actions.hub.getS().hub.anomalyMonth
                const fromTime = moment(date).startOf('month')
                const toTime = moment(date).endOf('month')
                actions.hub.getDetailedAnomalies({hubId, fromTime, toTime, size: globalConstants.TIMELINE_SIZE, page: 0 })
                actions.hub.getUnResolvedAnomalies(hubId)
            }
            )
        },
        async saveTestMessage({hubId, payload}){
            await hubService.postTestMessage(hubId, payload)
        },
        async updateHub(hub) {
            await hubService.putHub(hub).then(() =>
                actions.hub.getHubs()
            )
        },
        async updateHouseJSON(hubId){
            await hubService.updateHouseJSON(hubId)
        },
        async addSensor(hubId){
            return await hubService.addSensor(hubId)
        },

        async replaceSensor({hubId, deviceId}){
            return await hubService.replaceSensor(hubId, deviceId)
        },

        async cancelSensor(hubId){
            return await hubService.cancelSensor(hubId)
        },

        async updateSensor({hubId,payload}){
            return await hubService.updateSensor(hubId, payload).then(()=>{
                actions.hub.getHubDevices(payload.hub_id)
                actions.hub.getSensors(payload.hub_id)
            })
        },

        async offSensor({hubId,payload}){
            return await hubService.offSensor(hubId, payload)
        },

        async removeSensor(payload){
            try {
                await hubService.removeSensor(payload).then(()=>{
                    actions.hub.getHubDevices(payload.hub_id)
                    actions.hub.getSensors(payload.hub_id)
                })
            } catch (err){
                return Promise.reject(err.response.data)
            }
        },

        async removeNewSensor(payload){
            await hubService.removeNewSensor(payload).then(()=>{
                actions.hub.getHubNewDevices(payload.hub_id)
            })
        },

        async removeSpace(payload){
            try {
                await hubService.deleteSpace(payload).then(()=>{
                    actions.hub.getHubSpaces(payload.hub_id)
                })
            } catch (err){
                return Promise.reject(err.response.data)
            }
        },

        async linkSensorToSpace(payload){
            await hubService.linkSensorToSpace(payload).then(()=>{
                actions.hub.getHubNewDevices(payload.hub_id)
                actions.hub.getHubDevices(payload.hub_id)
            })
        },
        async restartHub(hubId){
            await hubService.restart(hubId)
        },
        async hubTraceUpload(hubId){
            await hubService.traceUpload(hubId)
        },
        async checkForUpdate(hubId){
            await hubService.checkForUpdates(hubId)
        },
        async getDetailedMessage({hubId, fromTime, toTime, size, page}){
            const result = await hubService.getDetailedMessage(hubId, fromTime, toTime, size, page)
            actions.hub.save({
                detailedMessage: result||{}
            })
        },
        async getDetailedAnomalies({hubId, fromTime, toTime, size, page}){
            const result = await hubService.getDetailedAnomalies(hubId, fromTime, toTime, size, page)
            actions.hub.save({
                detailedAnomalies: result||{},
                anomalies: result.content
            })
        },
        async getDetailedActionState({hubId, fromTime, toTime, size, page}){
            const result = await hubService.getDetailedActionState(hubId, fromTime, toTime, size, page)
            actions.hub.save({
                detailedActionState: result||{},
            })
        },
        async getUnResolvedAnomalies(hubId){
            const result = await hubService.getUnResolvedAnomalies(hubId)
            actions.hub.save({
                unResolvedAnomalies: result.content
            })
        },
        async getDetailedMedication({hubId, fromTime, toTime, size, page}){
            const result = await hubService.getDetailedMedication(hubId, fromTime, toTime, size, page)
            actions.hub.save({
                detailedMedication: result||{}
            })
        },
        async getDetailedOccupancies({hubId, fromTime, toTime, size, page, condensed}){
            let allResults = []
            let newPage = page
            let result = {}
            do {
                result = await hubService.getDetailedOccupancies(hubId, fromTime, toTime, size, newPage, condensed)
                allResults = allResults.concat(result.content)
                newPage++
            } while (!result.last)
            actions.hub.save({
                detailedOccupancies: allResults||{}
            })
        },

        async getLastOccupancies({hubId, toTime, size}){

            try {
                const result = await hubService.getLastOccupancies(hubId, toTime, size)
                actions.hub.save({
                    lastOccupancies: result.content
                })
            } catch (err){
                actions.hub.save({
                    lastOccupancies: []
                })
                return Promise.reject(err.response.data)
            }
        },

        /** fetch hub beacon */
        async fetchHubBeaconHeadstates(hubId) {
            actions.hub.fetchHubBeacon (hubId).then(beacons=>{
                let requests = []
                beacons.map(beacon=>{
                    requests.push(beaconService.fetchBeaconHeadState(beacon.pub_id).catch(()=>null))
                })
                if (requests.length > 0) {
                    return Promise.allSettled(requests).then((results) => {
                        actions.hub.save({
                            hubBeaconHeadstates: results?.filter(result=>result?.value)?.map(result=>result.value)
                        })
                    })
                }
            })
        },

        /** fetch hub beacon */
        async fetchHubBeacon(hubId) {
            try {
                const data = await beaconService.fetchBeaconAssociateWithHub({ hubId })
                actions.hub.save ({
                    selectedHubBeacons: data.beacons,
                    totalHubBeacons: data.total_associated_beacons
                })
                return data.beacons
            } catch (err){
                actions.hub.save ({
                    selectedHubBeacons: [],
                    totalHubBeacons: 0
                })
                return Promise.reject(err.response.data)
            }
        },

        async getTPAccounts(hubId) {
            try {
                const data = await TPService.getHubTPs(hubId)
                actions.hub.save({
                    TPs: data
                })
            } catch(err) {
                actions.hub.save({
                    TPs: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async createTPAccount ({hubId, payload}) {
            try {
                return await TPService.postHubTP(hubId,payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateTPAccount ({hubId, id, payload}) {
            try {
                return await TPService.updateHubTP(hubId,id,payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async deleteTPAccount ({hubId, id}) {
            try {
                return await TPService.deleteHubTP(hubId, id).then(()=>{
                    actions.hub.getTPAccounts(hubId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async getHubTPCandidates(hubId) {
            try {
                const data = await orgService.fetchTPCandidates('HUB',hubId)
                actions.hub.save({
                    hubTPCandidates: data
                })
            } catch(err) {
                actions.hub.save({
                    hubTPCandidates: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async getHubNetwork(hubId) {
            try {
                const data = await hubService.getHubNetwork(hubId)
                actions.hub.save({
                    network: data
                })
            } catch(err) {
                actions.hub.save({
                    network: {}
                })
                return Promise.reject(err.response.data)
            }
        },

        async updateHubNetwork ({hubId, payload}) {
            try {
                return await hubService.putHubNetwork(hubId,payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateHubName(payload){
            try {
                await hubService.updateHubName(payload).then(()=>
                    actions.hub.getHubs()
                )
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateHubOOBE (payload) {
            try {
                return await hubService.putHubOOBE(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async getEventRules(hubId) {
            try {
                const data = await hubService.getEventRules(hubId)
                actions.hub.save({
                    eventRules: data
                })
            } catch(err) {
                actions.hub.save({
                    eventRules: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async createEventRules ({hubId, payload}) {
            try {
                return await hubService.postEventRules(hubId,payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateEventRules ({hubId, payload}) {
            try {
                return await hubService.putEventRules(hubId,payload).then(()=>{
                    actions.hub.getEventRules(hubId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async deleteEventRules ({hubId, hubEventRuleId}) {
            try {
                return await hubService.deleteEventRules(hubId, hubEventRuleId).then(()=>{
                    actions.hub.getEventRules(hubId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async getEventRuleLogs(hubId) {
            try {
                const data = await hubService.getEventRuleLogs(hubId)
                actions.hub.save({
                    eventRuleLogs: data.content
                })
            } catch(err) {
                actions.hub.save({
                    eventRuleLogs: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async getDeviceIntervalConfig(deviceId) {
            try {
                const data = await hubService.getIntervalConfig(deviceId)
                actions.hub.save({
                    deviceIntervalConfig: data
                })
            } catch(err) {
                actions.hub.save({
                    deviceIntervalConfig: {}
                })
                return Promise.reject(err.response.data)
            }
        },

        async updateDeviceIntervalConfig ({deviceId, payload}) {
            try {
                return await hubService.putIntervalConfig(deviceId,payload).then(()=>{
                    actions.hub.getDeviceIntervalConfig(deviceId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async getHubRadarUsers(radarId) {
            try {
                const data = await radarService.getRadarUsers(radarId)
                actions.hub.save({
                    hubRadarUsers: data
                })
            } catch (err) {
                actions.radar.save({
                    hubRadarUsers: []
                })
                return Promise.reject(err.response.data)
            }
        },
    }
}

import { actions } from 'mirrorx'
import radarService from '@/services/Radar'
import { retrieveJSONData, storeDeviceData } from '@/utility/Storage'
import { Modal } from 'antd'
import moment from 'moment-timezone'
import TPService from '@/services/ThirdParty'
import orgService from '@/services/Organisation'
import hubService from '@/services/Hub'
import { format4Api } from '@/utility/Locale'
import {formatRadar} from '@/utility/Common'

export default {
    name: 'radar',
    initialState: {
        selectedRadar: null,
        radars: [],
        loading: false,
        radarUsers: null,
        radarAnomalies: null,
        selectedAnomaly: null,
        anomalies: null,
        allAnomalies: null,
        activeAnomalies: null,
        anomalyMonth: moment(),
        TPs: null,
        radarTPCandidates: [],
        radarConfig: null,
        radarOrgs: null,
        userRadars: [],
        radarHubs: null,
        radarHubUsers: null,
        radarSpaces: null,
        radarStateHistory: null,
        selectedStateHistoryPersons: [],
        showXYZData: 'hide',
        showFallLayer: 'fallLayerHide',
        showLive: true,
        radarCommands: null,
        radarSurrounds: null,
        radarNotifications: []
    },
    reducers: {
        setLoading(state,loading) {
            return { ...state, loading }
        },
    },
    effects: {
        getS(data, getState) {
            return getState()
        },

        selectAnomaly (anomaly) {
            actions.radar.save({
                selectedAnomaly: anomaly
            })
        },

        async selectRadar (radar) {
            let radarData = await radarService.getRadar(radar?.id)
            actions.radar.save({
                selectedRadar: {
                    ...radar,
                    ...formatRadar(radarData)
                },
            })
            moment.tz.setDefault(radarData?.timezone)
            radar && storeDeviceData('selectedRadar', radar.id)
        },

        async fetchAllRadars() {
            actions.radar.setLoading(true)
            let allResults = []
            let newPage = 0
            let result = {}
            do {
                result = await radarService.getRadars(newPage,100)
                allResults = allResults.concat(result.content)
                newPage++
            } while (!result.last)

            allResults = allResults.map(radar=>formatRadar(radar))
            actions.radar.save({
                radars: allResults
            })
            if (allResults.length>0) {
                const storedRadar = allResults?.find(item => item.id === retrieveJSONData('selectedRadar'))
                const selectedRadar = actions.radar.getS().radar.selectedRadar
                storedRadar && storedRadar !== selectedRadar && (await actions.radar.selectRadar(storedRadar))
            }
            actions.radar.setLoading(false)
            return allResults
        },

        async createRadar(payload) {
            try {
                const result = await radarService.postRadar(payload)
                actions.radar.fetchAllRadars()
                return result
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async saveRadarInfo(payload) {
            try {
                await radarService.patchRadar(payload)
                actions.radar.selectRadar(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchRadarUsers(radarId) {
            try {
                const data = await radarService.getRadarUsers(radarId)
                actions.radar.save({
                    radarUsers: data
                })
                return data
            } catch (err) {
                actions.radar.save({
                    radarUsers: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async associateRadarUser(payload) {
            try {
                return await radarService.postRadarUser(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async disassociateRadar(payload) {
            await radarService.deleteRadarUser(payload)
                .then(() => {
                    actions.radar.fetchRadarUsers(payload.product_id)
                }).catch((err)=> {
                    err.response.data.status === 400 && Modal.error({
                        title: 'You cannot delete this carer',
                        content: (
                            <div>
                                You cannot delete this carer - they are currently responsible for paying the subscription fees.
                                In order to remove this carer you or another carer take over paying the subscription fee - you can do this by
                                changing the card payment details to your credit or debit card.
                            </div>
                        ),
                        okText: 'Okay'
                    })
                    return Promise.reject(err.response.data)
                })
        },

        async getRadarAnomalies({radarId, page, pageSize=10,fromTime, toTime}){
            const params = {
                page: page-1,
                size: pageSize,
                sort: 'alarm_at,desc',
                resolved: true,
            }
            if (fromTime || toTime){
                params['start-date']= format4Api(fromTime)
                params['end-date']= format4Api(toTime)
            }
            const result = await radarService.getRadarAlarmHistory(radarId, params)
            actions.radar.save({
                anomalies: result,
            })
            return result
        },

        async getActiveRadarAnomalies({radarId}){
            const params = {
                resolved: false,
                size: 1000,
            }
            const result = await radarService.getRadarAlarmHistory(radarId, params)
            actions.radar.save({
                activeAnomalies: result,
            })
            return result
        },

        async getLatestRadarAnomaly(radarId){
            let currentAnomalies = actions.radar.getS().radar.anomalies
            const result = await radarService.getLatestAlarm(radarId)
            if (!currentAnomalies.some(item=>item?.radar_alarm_history_id===result.content[0]?.radar_alarm_history_id)){
                currentAnomalies.push(result.content[0])
                actions.radar.save({
                    anomalies: currentAnomalies
                })
            }
        },

        async getRadarAllAnomalies({radarId, page, pageSize=1000,fromTime, toTime}){
            const params = {
                page: page-1,
                size: pageSize,
                sort: 'alarm_at,desc',
            }
            if (fromTime || toTime){
                params['start-date']= format4Api(fromTime)
                params['end-date']= format4Api(toTime)
            }
            const result = await radarService.getRadarAlarmHistory(radarId, params)
            actions.radar.save({
                allAnomalies: result.content,
            })
            return result
        },

        async fetchRadarStateHistory({ radarId, ...params }){
            try {
                let allResults = []
                let newPage = 0
                let result = {}
                do {
                    params.page = newPage
                    result = await radarService.getRadarStateHistory(radarId, params)
                    allResults = allResults.concat(result.content)
                    newPage++
                } while (!result.last)
                actions.radar.save({
                    radarStateHistory: allResults
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }

            const fromTime = params['start-date'] || moment().startOf('month')
            const toTime = params['end-date'] || moment().endOf('month')

            actions.radar.getRadarAllAnomalies({
                radarId,
                page:1,
                fromTime,
                toTime
            })
        },

        async resolveRadarAnomaly({radarId, payload}){
            const {anomalyMonth} = actions.radar.getS().radar
            const fromTime = anomalyMonth.clone().startOf('month')
            const toTime = anomalyMonth.clone().endOf('month')
            try {
                return await radarService.putRadarResolveAlarmWithCode(radarId,payload).then(()=>{
                    actions.radar.getRadarAnomalies({
                        radarId,
                        page:1,
                        fromTime,
                        toTime
                    })
                    actions.radar.getActiveRadarAnomalies({radarId})
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async resolveSingleRadarAnomaly({radarId, payload}){
            const {anomalyMonth} = actions.radar.getS().radar
            const fromTime = anomalyMonth.clone().startOf('month')
            const toTime = anomalyMonth.clone().endOf('month')
            try {
                return await radarService.putRadarResolveSingleAlarmWithCode(radarId,payload).then(()=>{
                    actions.radar.getRadarAnomalies({
                        radarId,
                        page:1,
                        fromTime,
                        toTime
                    })
                    actions.radar.getActiveRadarAnomalies({radarId})
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async getTPAccounts(radarId) {
            try {
                const data = await TPService.getRadarTPs(radarId)
                actions.radar.save({
                    TPs: data
                })
            } catch(err) {
                actions.radar.save({
                    TPs: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async createTPAccount ({radarId, payload}) {
            try {
                return await TPService.postRadarTP(radarId,payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateTPAccount ({radarId, id, payload}) {
            try {
                return await TPService.updateRadarTP(radarId,id,payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async deleteTPAccount ({radarId, id}) {
            try {
                return await TPService.deleteRadarTP(radarId, id).then(()=>{
                    actions.radar.getTPAccounts(radarId)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async getRadarTPCandidates(radarId) {
            try {
                const data = await orgService.fetchTPCandidates('RADAR',radarId)
                actions.radar.save({
                    radarTPCandidates: data
                })
            } catch(err) {
                actions.radar.save({
                    radarTPCandidates: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchRadarConfig(radarId) {
            actions.radar.setLoading(true)
            try {
                const data = await radarService.getRadarConfig(radarId)
                actions.radar.save({
                    radarConfig: data
                })
                actions.radar.setLoading(false)
            } catch (err) {
                actions.radar.setLoading(false)
                return Promise.reject(err.response.data)
            }
        },

        async updateRadarConfig(payload) {
            try {
                return await radarService.postRadarConfig(payload).then(()=>
                    actions.radar.fetchRadarConfig(payload.id))
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async rebootRadar(radarId) {
            try {
                return await radarService.putRadarReboot(radarId)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async sendTestFall(radarId) {
            try {
                return await radarService.postRadarTestFall(radarId)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async sendTestActivation(radarId) {
            try {
                return await radarService.postRadarTestActivation(radarId)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async requestLinkingRadar(payload) {
            try {
                return await radarService.requestLinkingRadar(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchRadarHub(radarId) {
            try {
                const data = await radarService.getRadarHubs(radarId)
                actions.radar.save({
                    radarHubs: data
                })
            } catch (err) {
                actions.radar.save({
                    radarHubs: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async linkRadarHub(payload) {
            try {
                return await radarService.postRadarHub(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async unLinkRadarHub(payload) {
            try {
                return await radarService.deleteRadarHub(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchRadarSpace(radarId) {
            try {
                const data = await radarService.getRadarSpaces(radarId)
                actions.radar.save({
                    radarSpaces: data
                })
            } catch (err) {
                actions.radar.save({
                    radarSpaces: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async linkRadarSpace(payload) {
            try {
                return await radarService.postRadarSpace(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async unLinkRadarSpace(payload) {
            try {
                return await radarService.deleteRadarSpace(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async editRadarSpace(payload) {
            try {
                return await radarService.putRadarSpace(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async getRadarHubUsers(hubId){
            const result = await hubService.hubUserData(hubId)
            actions.radar.save({
                radarHubUsers: result
            })
        },

        async startRadarCalibration(payload) {
            try {
                return await radarService.putRadarCalibration(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchRadarCommands(radarId) {
            try {
                const data = await radarService.getRadarCommands(radarId)
                actions.radar.save({
                    radarCommands: data.content
                })
            } catch (err) {
                actions.radar.save({
                    radarCommands: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async createRadarCommand(payload) {
            try {
                return await radarService.postRadarCommands(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchRadarSurrounds(radarId) {
            try {
                const data = await radarService.getRadarSurrounds(radarId)
                actions.radar.save({
                    radarSurrounds: data
                })
                return data
            } catch (err) {
                actions.radar.save({
                    radarCommands: {}
                })
                return Promise.reject(err.response.data)
            }
        },

        async updateRadarSurrounds(payload) {
            try {
                return await radarService.putRadarSurrounds(payload).then(()=>{
                    actions.radar.save({
                        radarSurrounds: payload
                    })
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchRadarNotifications(params) {
            try {
                const data = await radarService.getRadarNotifications(params)
                actions.radar.save({
                    radarNotifications: data
                })
                return data
            } catch (err) {
                actions.radar.save({
                    radarNotifications: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async updateRadarNotifications(payload) {
            try {
                return await radarService.putRadarNotifications(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async getRadarOrgs(radarId){
            const result = await radarService.getRadarOrgs(radarId)
            actions.radar.save({
                radarOrgs: result
            })
        },
    }
}

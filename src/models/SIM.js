import SIMService from '../services/SIM'
import { actions } from 'mirrorx'
import { message } from 'antd'

export default {
    name: 'SIM',
    initialState: {
        SIMActivations: null,
        carriers: null,
        iccids: null,
        providers: null,
        productActivation: null,
        deactivationSuggestion: null,
        bypassSIMActivation: false,
        scheduledDeactivations: null,
        activeDeactivation: null,
    },
    reducers: {
    },
    effects: {
        getS(data, getState) {
            return getState()
        },
        async fetchAllActivations () {
            try {
                const data = await SIMService.getSIMActivations()
                actions.SIM.save({
                    SIMActivations: data?.content
                })
            } catch(err) {
                actions.SIM.save({
                    SIMActivations: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchProviders () {
            try {
                const data = await SIMService.getSIMProviders()
                actions.SIM.save({
                    providers: data
                })
                return data
            } catch(err) {
                actions.SIM.save({
                    providers: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchCarriers (providerName) {
            try {
                const data = await SIMService.getCarriers(providerName)
                actions.SIM.save({
                    carriers: data
                })
                return data
            } catch(err) {
                actions.SIM.save({
                    carriers: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchICCIDs (providerName) {
            try {
                const data = await SIMService.getICCIDs(providerName)
                actions.SIM.save({
                    iccids: data
                })
            } catch(err) {
                actions.SIM.save({
                    iccids: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async createActivation (payload) {
            try {
                return await SIMService.postSIMActivation(payload).then(()=>{
                    actions.SIM.fetchAllActivations()
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async refreshActivation (id) {
            try {
                return await SIMService.getSIMActivation(id).then(()=>{
                    actions.SIM.fetchAllActivations()
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateActivation (payload) {
            try {
                return await SIMService.updateSIMActivation(payload).then(()=>{
                    actions.SIM.fetchAllActivations()
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async deleteActivation (id) {
            try {
                return await SIMService.deleteSIMActivation(id).then(()=>{
                    actions.SIM.fetchAllActivations()
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async activateSIM ({id, notify}) {
            try {
                await SIMService.putSIMActivate(id, notify).then((result)=>{
                    result?.errors && !result?.errors.includes('already been activated') && message.error(result.errors, 10)
                    actions.SIM.save({
                        productActivation: result
                    })
                    actions.SIM.fetchAllActivations()
                    return result
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async deactivateSIM (id) {
            try {
                await SIMService.putSIMDeactivate(id).then((result)=>{
                    result?.errors && !result?.errors.includes('already been activated') && message.error(result.errors, 10)
                    actions.SIM.save({
                        productActivation: result
                    })
                    actions.SIM.fetchAllActivations()
                    return result
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchSIMByProduct ({type, macOrImei}) {
            try {
                const data = await SIMService.getProductActivation(type, macOrImei)
                actions.SIM.save({
                    productActivation: data
                })
                if (data?.id){
                    const deactivationData = await SIMService.getActiveDeactivationById(data.id)
                    actions.SIM.save({
                        activeDeactivation: deactivationData
                    })
                }
                return data
            } catch(err) {
                actions.SIM.save({
                    productActivation: null
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchSIMDeactivationSuggestion (payload) {
            try {
                const data = await SIMService.putSIMDeactivationSuggestion(payload)
                actions.SIM.save({
                    deactivationSuggestion: data
                })
                return data
            } catch(err) {
                actions.SIM.save({
                    deactivationSuggestion: null
                })
                return Promise.reject(err.response.data)
            }
        },

        async massDeactivation (payload) {
            try {
                await SIMService.putSIMMassDeactivation(payload).then((result)=>{
                    actions.SIM.fetchAllActivations()
                    return result
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async createSSDeactivations (payload) {
            try {
                return await SIMService.postScheduledDeactivation(payload).then(()=>{
                    actions.SIM.fetchSSDeactivations()
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchSSDeactivations () {
            let allResults = []
            let newPage = 0
            let result = {}
            do {
                result = await SIMService.getScheduledDeactivations(newPage,100)
                allResults = allResults.concat(result.content)
                newPage++
            } while (!result.last)

            actions.SIM.save({
                scheduledDeactivations: allResults
            })
        },

        async updateSSDeactivations (payload) {
            try {
                return await SIMService.updateScheduledDeactivation(payload).then(()=>{
                    actions.SIM.fetchSSDeactivations()
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async deleteSSDeactivations (id) {
            try {
                return await SIMService.deleteScheduledDeactivation(id).then(()=>{
                    actions.SIM.fetchSSDeactivations()
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

    }
}

import { actions } from 'mirrorx'
import PortalFunction from '../services/PortalFunction'
import BillingService from '@/services/Billing'
import UserService from '@/services/User'

export default {
    name: 'common',
    initialState: {
        sideMenuCollapsed: false,
        newHubModal: false,
        newWatchModal: false,
        newBeaconModal: false,
        newLifeModal: false,
        newDeviceModal: false,
        newRadarModal: false,
        showDownTime: true,
        adminPortal: false,
        lastDevicePage: null,
        hubWelcomeModal: false,
        beaconWelcomeModal: false,
        portalFunctions: null,
        SideButton: null,
        stripeEnabled: true,
        loneWorkerEnabled: true,
    },
    reducers: {
        toggleSideMenu(state) {
            return { ...state, sideMenuCollapsed: !state.sideMenuCollapsed }
        },
        changeLayoutCollapsed(state, sideMenuCollapsed) {
            return { ...state, sideMenuCollapsed}
        },
        changeNewHubModal(state, newHubModal) {
            return { ...state, newHubModal}
        },
        changeNewRadarModal(state, newRadarModal) {
            return { ...state, newRadarModal}
        },
        changeNewBeaconModal(state, newBeaconModal) {
            return { ...state, newBeaconModal}
        },
        changeNewWatchModal(state, newWatchModal) {
            return { ...state, newWatchModal}
        },
        changeNewLifeModal(state, newLifeModal) {
            return { ...state, newLifeModal}
        },
        changeNewDeviceModal(state, newDeviceModal) {
            return { ...state, newDeviceModal}
        },
        changeBeaconWelcomeModal(state, beaconWelcomeModal) {
            return { ...state, beaconWelcomeModal}
        },
        changeHubWelcomeModal(state, hubWelcomeModal) {
            return { ...state, hubWelcomeModal}
        },
        changeShowDownTime(state, showDownTime) {
            return { ...state, showDownTime}
        },
    },
    effects: {
        async fetchPortalFunctions (feature) {
            try {
                const data = await PortalFunction.getPortalFunctionRules(feature)
                actions.common.save({
                    portalFunctions: data
                })
            } catch(err) {
                actions.common.save({
                    portalFunctions: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async createPortalFunction (payload) {
            try {
                await PortalFunction.postPortalFunctionRules(payload).then(()=>{
                    actions.common.fetchPortalFunctions(payload.function)
                })

            } catch(err) {
                return Promise.reject(err.response.data)
            }
        },

        async updatePortalFunction (payload) {
            try {
                await PortalFunction.putPortalFunctionRules(payload).then(()=>{
                    actions.common.fetchPortalFunctions(payload.function)
                })

            } catch(err) {
                return Promise.reject(err.response.data)
            }
        },

        async deletePortalFunction ({feature,ruleId}) {
            try {
                await PortalFunction.deletePortalFunctionRules(ruleId).then(()=>{
                    actions.common.fetchPortalFunctions(feature)
                })

            } catch(err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchProductFunctions (payload) {
            try {
                const data = await PortalFunction.getProductPortalFunctionRules(payload)
                data && actions.common.save({
                    [data['function']]: data
                })
            } catch(err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchStripeEnabled () {
            try {
                const data = await BillingService.getStripeEnabled()
                actions.common.save({
                    stripeEnabled: data
                })
            } catch(err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchLoneWorkerEnabled () {
            try {
                const data = await UserService.getLoneWorkerConfig()
                actions.common.save({
                    loneWorkerEnabled: data?.enabled
                })
            } catch(err) {
                return Promise.reject(err.response.data)
            }
        },
    }
}

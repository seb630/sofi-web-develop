import BillingService from '../services/Billing'
import { actions } from 'mirrorx'
import { Modal } from 'antd'

export default {
    name: 'billing',
    initialState: {
        stripeKey: null,
        paymentMethod: null,
        subscription: null,
        paymentRequired: true,
        stripePlan: null,
        subscriptionStatus: null,
        bypassPayment: false,
        bypassDisable: false,
        allSubscriptions: null,
        disabledProduct: null,
        disabledReasons: null,
        expiringCards: null,
        userSubscriptions: null,
        userRadarSubscriptions: null,
        subscriptionHistory: null,
        subscriptionConditions: null,
        loading: false,
    },
    reducers: {
        setLoading(state,loading) {
            return { ...state, loading }
        },
    },
    effects: {
        getS(data, getState){
            return getState()
        },

        async fetchStripeKey () {
            try {
                const data = await BillingService.getStripeKey()
                actions.billing.save({
                    stripeKey: data.public_key
                })
            } catch(err) {
                return Promise.reject(err.response.data)
            }
        },

        async createCustomer (payload) {
            try {
                return await BillingService.postCreateCustomer(payload)
            } catch (err) {
                Modal.error({
                    title: 'Payment declined',
                    content: err.response.data.message
                })
                return Promise.reject(err.response.data)
            }
        },

        async createSubscription (payload) {
            try {
                return await BillingService.postSubscription(payload)
            } catch (err) {
                Modal.error({
                    title: 'Create subscription failed',
                    content: err.response.data.message
                })
                return Promise.reject(err.response.data)
            }
        },

        async createCheckout (payload) {
            try {
                return await BillingService.postCheckout(payload)
            } catch (err) {
                Modal.error({
                    title: 'Navigate to Checkout failed',
                    content: err.response.data.message
                })
                return Promise.reject(err.response.data)
            }
        },

        async updateCheckoutPaymentMethod (payload) {
            try {
                return await BillingService.patchCheckoutPaymentMethod(payload)
            } catch (err) {
                Modal.error({
                    title: 'Navigate to Checkout failed',
                    content: err.response.data.message
                })
                return Promise.reject(err.response.data)
            }
        },

        async updateCardDetail (payload) {
            try {
                return await BillingService.putPaymentMethod(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchSubscription (productId) {
            actions.billing.setLoading(true)
            try {
                const paymentRequired = await BillingService.getPaymentRequired(productId)
                actions.billing.save({
                    paymentRequired: paymentRequired
                })

                const data = await BillingService.getSubscription(productId)
                actions.billing.save({
                    subscription: data
                })
                return paymentRequired
            } catch(err) {
                return Promise.reject(err.response.data)
            } finally {
                actions.billing.setLoading(false)
            }
        },

        async cancelSubscription ({productId, refresh=true}) {
            try {
                await BillingService.cancelSubscription(productId).then(()=>refresh && actions.billing.fetchSubscription(productId))
            } catch(err) {
                return Promise.reject(err.response.data)
            }
        },

        async cancelRadarSubscription ({productId, subscriptionId, refresh=true}) {
            try {
                await BillingService.patchCancelRadarSubscription(subscriptionId).then(()=>refresh && actions.billing.fetchSubscription(productId))
            } catch(err) {
                return Promise.reject(err.response.data)
            }
        },

        async resumeRadarSubscription ({productId, subscriptionId, refresh=true}) {
            try {
                await BillingService.patchResumeRadarSubscription(subscriptionId).then(()=>refresh && actions.billing.fetchSubscription(productId))
            } catch(err) {
                return Promise.reject(err.response.data)
            }
        },

        async resumeSubscription (productId) {
            try {
                await BillingService.resumeSubscription(productId).then(()=>actions.billing.fetchSubscription(productId))
            } catch(err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchStripePlan (product) {
            actions.billing.setLoading(true)
            try {
                const data = await BillingService.getStripePlan(product)
                actions.billing.save({
                    stripePlan: data
                })
            } catch(err) {
                return Promise.reject(err.response.data)
            }finally {
                actions.billing.setLoading(false)
            }
        },

        async fetchStripePlanByPubId ({product, pub_id}) {
            actions.billing.setLoading(true)
            try {
                const data = await BillingService.getStripePlan2(product,pub_id)
                actions.billing.save({
                    stripePlan: data
                })
            } catch(err) {
                return Promise.reject(err.response.data)
            }finally {
                actions.billing.setLoading(false)
            }
        },

        async fetchSubscriptionStatus () {
            try {
                const data = await BillingService.getSubscriptionStatus()
                actions.billing.save({
                    subscriptionStatus: data
                })
            } catch(err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateSubscription ({productId, payload}) {
            try {
                return await BillingService.putSubscription(productId,payload).then(result=>actions.billing.save({
                    subscription: result
                }))
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchAllSubscriptions () {
            let allResults = []
            let newPage = 0
            let result = {}
            try {
                do {
                    result = await BillingService.getAllSubscription(100, newPage)
                    allResults = allResults.concat(result.content)
                    newPage++
                } while (!result.last)
                actions.billing.save({
                    allSubscriptions: allResults||{}
                })
            } catch(err) {
                actions.billing.save({
                    allSubscriptions: []
                })
                return Promise.reject(err.response.data)
            }
        },

        async fetchDisableStatus(productId) {
            try {
                const data = await BillingService.getDisabledProduct(productId)
                actions.billing.save({
                    disabledProduct: data!=='' ? data : null
                })
                return data
            } catch(err) {
                return Promise.reject(err.response.data)
            }
        },

        async postDisableStatus(payload) {
            try {
                return await BillingService.postDisabledProduct(payload).then(()=>{
                    actions.billing.fetchDisableStatus(payload.product_id)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateDisableStatus (payload) {
            try {
                return await BillingService.putDisabledProduct(payload).then(()=>{
                    actions.billing.fetchDisableStatus(payload.product_id)
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchDisableReasons () {
            try {
                const data = await BillingService.getDisabledProductReasons()
                actions.billing.save({
                    disabledReasons: data
                })
            } catch(err) {
                return Promise.reject(err.response.data)
            }
        },

        async pauseSubscription (payload) {
            try {
                return await BillingService.patchPausePayment(payload).then((data)=>{
                    actions.billing.save({
                        subscription: data
                    })
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async addToSubscription (payload) {
            try {
                return await BillingService.patchAddSubscription(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async resumePausedSubscription (payload) {
            try {
                return await BillingService.patchResumePayment(payload).then((data)=>{
                    actions.billing.save({
                        subscription: data
                    })
                })
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchExpiringCards () {
            try {
                const data = await BillingService.getExpiringCards()
                actions.billing.save({
                    expiringCards: data
                })
            } catch(err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchUserSubscriptions () {
            try {
                const data = await BillingService.getSubscriptionByUser()
                actions.billing.save({
                    userSubscriptions: data
                })
            } catch(err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchUserRadarSubscriptions (email) {
            try {
                const radarData = await BillingService.getRadarSubscriptionByUser(email)
                actions.billing.save({
                    userRadarSubscriptions: radarData
                })
            } catch(err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchSubscriptionHistory (id) {
            try {
                const data = await BillingService.getSubscriptionHistory(id)
                actions.billing.save({
                    subscriptionHistory: data
                })
            } catch(err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateSubscriptionHistoryDescription (payload) {
            try {
                return await BillingService.patchSubscriptionHistory(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async removeSubscriptionHistory(id) {
            try {
                return await BillingService.deleteSubscriptionHistory(id)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateSubscriptionPeriod (payload) {
            try {
                return await BillingService.patchSubscriptionPeriod(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateSubscriptionOwnership (payload) {
            try {
                return await BillingService.patchSubscriptionOwnership(payload)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async updateStripeSync (product) {
            try {
                return await BillingService.putStripeSync(product)
            } catch (err) {
                return Promise.reject(err.response.data)
            }
        },

        async fetchSubscriptionConditions () {
            try {
                const data = await BillingService.getSubscriptionConditions()
                actions.billing.save({
                    subscriptionConditions: data
                })
            } catch(err) {
                return Promise.reject(err.response.data)
            }
        },
    }
}

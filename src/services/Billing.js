import { getData, saveData } from '@/utility/AxiosCalls'

function getStripeKey() {
    const url = 'stripe/public-key'
    return getData(url)
}

function postCreateCustomer(payload) {
    const url = 'stripe/create-customer'
    return saveData(url, payload, 'POST')
}

function postCheckout(payload) {
    const url = 'stripe/checkout/subscription'
    return saveData(url, payload, 'POST')
}

function patchCheckoutPaymentMethod(payload) {
    const url = 'stripe/checkout/payment-method'
    return saveData(url, payload, 'PATCH')
}

function putPaymentMethod(payload) {
    const url = 'stripe/update-card'
    return saveData(url, payload, 'PUT')
}

function getStripePlan(product) {
    const url = `stripe/price/${product}`
    return getData(url)
}

function getStripePlan2(product, pub_id) {
    const url = `stripe/price/${product}/${pub_id}`
    return getData(url)
}

function getSubscription(productId) {
    const url = `stripe/subscription/product/${productId}`
    return getData(url)
}

function getPaymentRequired(productId) {
    const url = `stripe/payment-required/product/${productId}`
    return getData(url)
}

function postSubscription(payload) {
    const url = 'stripe/subscription'
    return saveData(url, payload, 'POST')
}

function cancelSubscription(productId) {
    const url = `stripe/subscription/cancel/product/${productId}`
    return saveData(url, null, 'PUT')
}

function resumeSubscription(productId) {
    const url = `stripe/subscription/resume/product/${productId}`
    return saveData(url, null, 'PUT')
}

function putSubscription(productId, payload) {
    const url = `stripe/subscription/product/${productId}`
    return saveData(url, payload, 'PUT')
}

function patchAddSubscription(payload) {
    const url = 'stripe/subscription/products/add'
    return saveData(url, payload, 'PATCH')
}

function patchCancelRadarSubscription(id) {
    const url = `stripe/subscription/${id}/cancel`
    return saveData(url, null, 'PATCH')
}

function patchResumeRadarSubscription(id) {
    const url = `stripe/subscription/${id}/resume`
    return saveData(url, null, 'PATCH')
}

function getSubscriptionStatus() {
    const url = 'stripe/subscription/status'
    return getData(url)
}

function getAllSubscription(size, page) {
    const url = `stripe/subscription?size=${size}&page=${page}`
    return getData(url)
}

function getDisabledProduct(productId) {
    const url = `disabled-products/${productId}`
    return getData(url)
}

function postDisabledProduct(payload) {
    const url = 'disabled-products/'
    return saveData(url,payload,'POST')
}

function putDisabledProduct(payload) {
    const url = `disabled-products/${payload.product_id}`
    return saveData(url,payload,'PUT')
}

function getDisabledProductReasons() {
    const url = 'disabled-products/proposed-reasons'
    return getData(url)
}

function getStripeEnabled() {
    const url = 'stripe/enabled'
    return getData(url)
}

function patchPausePayment(payload) {
    const url = 'stripe/subscription/pause-payment'
    return saveData(url,payload,'PATCH')
}

function patchResumePayment(payload) {
    const url = 'stripe/subscription/resume-payment'
    return saveData(url,payload,'PATCH')
}

function getExpiringCards() {
    const url = 'stripe/devices/expiring-cards'
    return getData(url)
}

function getSubscriptionByUser() {
    const url = 'stripe/devices'
    return getData(url)
}

function getRadarSubscriptionByUser(email) {
    const url = `stripe/subscription/email/${email}`
    return getData(url)
}

function getSubscriptionHistory(id) {
    const url = `subscription-history/${id}`
    return getData(url)
}

function patchSubscriptionHistory(payload) {
    const url = `subscription-history/${payload.id}`
    return saveData(url,payload,'PATCH')
}

function deleteSubscriptionHistory(id) {
    const url = `subscription-history/${id}`
    return saveData(url, {},'DELETE')
}

function patchSubscriptionPeriod(payload){
    const url = `subscription/${payload.type}`
    return saveData(url,payload,'PATCH')
}

function patchSubscriptionOwnership(payload){
    const url = 'stripe/subscription/ownership'
    return saveData(url,payload,'PATCH')
}

function putStripeSync(product) {
    const url = `stripe/subscription/price/sync/${product}`
    return saveData(url, {},'PUT')
}

function getSubscriptionConditions() {
    const url = 'enum/SubscriptionCond'
    return getData(url)
}

export default {
    getStripeKey,
    postCheckout,
    postCreateCustomer,
    getStripePlan,
    getStripePlan2,
    getSubscription,
    getPaymentRequired,
    postSubscription,
    cancelSubscription,
    putSubscription,
    getSubscriptionStatus,
    getAllSubscription,
    resumeSubscription,
    putPaymentMethod,
    getDisabledProductReasons,
    getDisabledProduct,
    postDisabledProduct,
    putDisabledProduct,
    getStripeEnabled,
    patchPausePayment,
    patchResumePayment,
    getExpiringCards,
    getSubscriptionByUser,
    getRadarSubscriptionByUser,
    getSubscriptionHistory,
    patchSubscriptionHistory,
    deleteSubscriptionHistory,
    patchSubscriptionPeriod,
    patchAddSubscription,
    patchSubscriptionOwnership,
    patchCancelRadarSubscription,
    patchResumeRadarSubscription,
    patchCheckoutPaymentMethod,
    putStripeSync,
    getSubscriptionConditions,
}

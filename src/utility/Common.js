import moment from 'moment-timezone'
import { MyIcon } from '@/pages/Common/Common'
import Icon from '@ant-design/icons'
import UnknownWifi from '../images/wifi-unknown.svg'
import { globalConstants } from '@/_constants'
import { useLayoutEffect, useState } from 'react'

export const formatTimeWithTimezone = (time, deviceTimezone) => {
    let timeString = moment(time).tz(moment.tz.guess()).format(globalConstants.LONGDATETIME_FORMAT_TZ)
    if (deviceTimezone) {
        const timezoneStr = moment(time).tz(deviceTimezone).format(globalConstants.LONGDATETIME_FORMAT_TZ)
        return `${timezoneStr} (or ${timeString} in your time zone)`
    } else return timeString
}

export function getSpaceIcons(text, item, hubOffline) {
    let status = 'redTooltip'
    if (item?.status === 'ONLINE' && !hubOffline) {
        status = 'greenTooltip'
    } else if (item?.status === 'WARNING' && !hubOffline) {
        status = 'orangeTooltip'
    }

    if (item?.device_kind === 'CONTACT' && !hubOffline) {
        status = item.action_state?.toLowerCase() === 'closed' ? 'greenTooltip' : 'orangeTooltip'
    }

    if (text.includes('Bedroom')) {
        return <MyIcon className={`roomIcon ${status}`} type="icon-bed" />
    } else if (text.includes('Bathroom')) {
        return <MyIcon className={`roomIcon ${status}`} type="icon-bath" />
    } else if (text.includes('Kitchen')) {
        return <MyIcon className={`roomIcon ${status}`} type="icon-kitchen" />
    } else if (text.includes('Spare')) {
        return <MyIcon className={`roomIcon ${status}`} type="icon-spare" />
    } else if (text.includes('Living')) {
        return <MyIcon className={`roomIcon ${status}`} type="icon-lounge" />
    } else if (text.includes('Lounge')) {
        return <MyIcon className={`roomIcon ${status}`} type="icon-lounge" />
    } else if (text.includes('Medication')) {
        return <MyIcon className={`roomIcon ${status}`} type="icon-medical" />
    } else {
        return <MyIcon className={`roomIcon ${status}`} type="icon-room" />
    }
}

export function changeMinsToMillsec(durationValue) {
    return durationValue * 60000
}
//convert 24 hours to 12 hours format
export function convertto12HrTimestamp(timestamp) {
    let timeArr = timestamp.split(':')
    let ampm = 'AM'
    if (timeArr[0] >= 12) {
        ampm = 'PM'
    }
    if (timeArr[0] > 12) {
        timeArr[0] = timeArr[0] - 12
    }
    if (timeArr[0] === '00') {
        timeArr[0] = 12
    }
    return timeArr[0] + ':' + timeArr[1] + ' ' + ampm
}

export const regionLink = {
    AU: 'https://portal.sofihub.com',
    US: 'https://portal.us-sofihub-production.sofieco.net',
    NZ: 'https://portal.nz-adt-production.sofieco.net',
    DEV: 'https://portal.au-sofihub-develop.sofieco.net',
    INT: 'https://portal.au-sofihub-internal.sofieco.net',
    TP: 'https://portal.au-tp-production.sofieco.net',
    GSP: 'https://portal.au-gsp-production.sofieco.net/'
}

export function sortWeekDays(a, b) {
    const sorter = {
        'monday': 1,
        'tuesday': 2,
        'wednesday': 3,
        'thursday': 4,
        'friday': 5,
        'saturday': 6,
        'sunday': 7
    }

    const day1 = a.toLowerCase()
    const day2 = b.toLowerCase()
    return sorter[day1] - sorter[day2]
}

export function sortDateTime(a, b) {
    if (a === null) return -1
    if (b === null) return 1
    return moment(a).diff(moment(b))
}

export function sortString(a, b, field) {
    if (a[field] === null || a[field] === undefined) return -1
    if (b[field] === null || b[field] === undefined) return 1
    return a[field].toString().localeCompare(b[field].toString())
}

export function renderTime(a, b) {
    const start = moment(a, 'H').format('h a')
    const end = moment(b, 'H').format('h a')
    return start + ' - ' + end
}

/**
 * display time from now
 * @param: { time , format , timezone , deviceTimezone }
*/
export function timeFromNow(timeUTC, format, deviceTimezone) {
    const time = moment(timeUTC)
    if (moment().diff(time, 'minutes') > 60) {
        let timeString = moment(time).tz(moment.tz.guess()).format(format)
        if (deviceTimezone) {
            timeString = moment(time).tz(deviceTimezone).format(format)
        }
        return timeString
    }
    return time.fromNow()
}

// Fills in a template with the values provided in the dict
// returns a list, so react object don't have to be converted to a string
// Any keys not found in the given dictionary are simply left untouched
// If a non-object is passed in, a dict will automatically be created with args[1...len] to be used.
// brackets can be escaped with \
// Examples:
// formatTemplate("{person} name is {name}", { person: "My", name: "Gaben" });
// returns [ "My", " name is ", "Gaben" ]
// formatTemplate("{person} name is {name}", { name: <font color={styles.golden}>{"Gaben"}</font> });
// returns [ "{person} name is ", <font color={styles.golden}>{"Gaben"}</font> ]
export const formatTemplate = (template, dict, ...rest) => {
    if (!template) {
        return ['(invalid template)']
    }
    let tmplValues = dict
    // If the 2nd argument isn't a dictionary, then we will gather arguments 1 => end into an object.
    // I'm arbitrarily making argument 0 the template.
    if (!(dict instanceof Object)) {
        tmplValues = Object.assign({}, [dict].concat(rest))
    }

    const pattern = /({[^}]+})/g
    let result = template.split(pattern)
    for (let i = 0; i < result.length; i += 1) {
        if (result[i].match(pattern) && result[i].slice(1, -1) in tmplValues) {
            result[i] = tmplValues[result[i].slice(1, -1)]
        }
    }
    result = result.filter(part => part !== '')
    return result
}

export const formatTemplateToString = (template, dict, ...rest) => formatTemplate(template, dict, ...rest).join('')

const signalToLevel = (signal) => {
    const signalObject = {
        'EXCELLENT': 5,
        'GOOD': 4,
        'FAIR': 3,
        'POOR': 1,
        'NO_SIGNAL': 0,
        'UNKNOWN': -1
    }
    return signalObject[signal]
}

export const levelToDescription = (level) => {
    const levelObject = {
        5: 'Excellent',
        4: 'Good',
        3: 'Fair',
        2: 'Poor',
        1: 'Poor',
        0: 'No signal',
    }
    return levelObject[level]
}

export const strengthToLevel = (strength) => {
    return strength ? strength > 24 ? 5 :
        strength > 19 ? 4 :
            strength > 14 ? 3 :
                strength > 9 ? 2 :
                    strength > 0 ? 1 :
                        strength === 0 ? 0 :
                            strength >= -65 ? 5 :
                                strength >= -75 ? 4 :
                                    strength >= -85 ? 3 :
                                        strength > -95 ? 2 :
                                            strength <= -95 ? 1 : 0 : 0
}

export const generate4gIcon = (signal) => {
    const level = signalToLevel(signal)
    return level >= 0 && <MyIcon type={`icon-Signal-${level}`} style={{ marginRight: 6 }} />
}

export const generateBatteryStatus = (level, charging = false) => {
    let type
    if (charging) { type = 'icon-batterycharging' }
    else if (level > 80) { type = 'icon-battery4-copy' }
    else if (level > 60) { type = 'icon-battery3-copy' }
    else if (level > 40) { type = 'icon-battery2-copy' }
    else if (level > 20) { type = 'icon-battery1-copy' }
    else { type = 'icon-battery0-copy' }
    return <MyIcon type={type} />
}

export const generateBeacon4gIcon = (signal) => {
    const level = strengthToLevel(signal)
    return level >= 0 && <MyIcon type={`icon-Signal-${level}`} />
}

export const generateWifiIcon = (signal) => {
    const level = signalToLevel(signal)
    return level >= 0 ? <MyIcon type={`icon-Wifi-${level}`} style={{ marginRight: 6 }} /> :
        <Icon component={UnknownWifi} style={{ marginRight: 6 }} />
}


export const sensorWarning = (heartBeat) => moment().diff(moment(heartBeat), 'hours', true) < 2

export const requirePayment = (status, stripeEnabled = true) => stripeEnabled && (status === 'CANCELED' || status === 'UNPAID' || !status)

export const paymentFailed = (status) => status === 'INCOMPLETE' || status === 'INCOMPLETE_EXPIRED' || status === 'PAST_DUE'

export const noNeedPayment = (status, stripeEnabled) => !stripeEnabled || status === 'FREE' || status === 'MANUAL' || status === 'THIRD_PARTY_BILLING' || status === 'GRACE_PERIOD' || status === 'CONTRACT' || status === 'LOAN_PERIOD'

export const activeButNotMonthlySub = (status) => status === 'FREE' || status === 'MANUAL' || status === 'THIRD_PARTY_BILLING' || status === 'GRACE_PERIOD' || status === 'CONTRACT' || status === 'LOAN_PERIOD'

export const requireActivate = (activation) => activation?.sim_provider === 'KORE' && (activation.sim_status === 'NOT_ACTIVE' && activation.sim_ext_status === 'Scrapped' || activation.request_type === 'DEACTIVATION') ? false : activation && !activation.skip_activation && activation.sim_status !== 'ACTIVE'

export const sliderFormatter = (value) => {
    return value === 10 ? 'Off' : value
}

export const hasAccess = (privilege, currentOrg, myPrivileges, admin) => {
    return admin || myPrivileges && myPrivileges[currentOrg?.organization_id]?.includes(privilege)
}

export const checkBeaconStatus = (beacon) => {
    if (beacon.in_fallen_down || beacon.in_sos) {
        return 'red'
    } else if (beacon.beacon_status === 'OFFLINE' || beacon.beacon_status === null || (beacon.battery_level && beacon.battery_level <= 20)) {
        return 'ylw'
    } else {
        return 'blu'
    }
}

export const isHub = (item) => {
    return item.hub_id && item.mac_address
}

export const isBeacon = (item) => {
    return !!item.imei
}

export const isWatch = (item) => {
    return item?.model === globalConstants.EV06_BEACON_MODEL
}

export const isLife = (item) => {
    return item?.model === globalConstants.EV04_BEACON_MODEL
}

export const isSita = (item) => {
    return item.model === globalConstants.SITA_BEACON_MODEL
}

export const isHalo = (item) => {
    return item?.model === globalConstants.EV12_BEACON_MODEL
}

export const isRadar = (item) => {
    return !!item.ext_id
}

export const isOnline = (item) => {
    return isHub(item) ? item.connectivity_state === 'ONLINE' : isBeacon(item) ? item.beacon_status === 'ONLINE' || item.beacon_status === 'WARNING' : item.status === 'ONLINE'
}

export const getZoomLevel = (circle) => {
    if (circle !== null) {
        const radius = circle.getRadius()
        const scale = radius / 500
        return Number.parseInt(16 - Math.log(scale) / Math.log(2))
    }
}

export const getZoomLevelByRadius = (radius) => {
    const scale = radius / 500
    return Number.parseInt(16 - Math.log(scale) / Math.log(2))
}

export const removeDuplicateDevices = (devices) => {
    let newDevices = []
    let newDeviceIDs = []
    devices.map(device => {
        if (device.pub_id && !newDeviceIDs.includes(device.pub_id) || device.hub_id && device.mac_address && !newDeviceIDs.includes(device.hub_id)) {
            device.pub_id ? newDeviceIDs.push(device.pub_id) : newDeviceIDs.push(device.hub_id)
            newDevices.push(device)
        }
    })
    return newDevices
}

export const dollarSymbol = (currency) => currency === 'USD' ? 'US$' : currency === 'AUD' ? 'AU$' : currency === 'NZD' ? 'NZ$' : currency

export const timeout = (prom, time) => Promise.race([prom, new Promise((_r, rej) => setTimeout(rej, time))])

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window
    return {
        width,
        height
    }
}

export const useWindowDimensions = () => {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())

    useLayoutEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions())
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return windowDimensions
}

export const showCompanyName = (hostname) => {
    // const hostname = window.location.hostname
    return hostname.includes('nz-adt') ? 'ADT' :
        hostname.includes('au-tp') ? 'Threat Protect' :
            hostname.includes('au-tc') ? 'Total Communications' : 'SOFIHUB'
}

export const showProductName = (productType) => {
    const lowerProduct = productType.toLowerCase()
    return lowerProduct === 'radar' ? globalConstants.RADAR_HOBA : lowerProduct === 'hub' || lowerProduct === 'home' ?
        globalConstants.HUB_SOFIHUB : lowerProduct === 'beacon' ? globalConstants.BEACON_SOFIHUB : lowerProduct === 'watch' ? globalConstants.BEACON_WATCH : lowerProduct === 'life' ? globalConstants.LIFE_SOFIHUB : ''
}

export const formatTime = (time) => {
    return moment(time).zoneAbbr().includes('+') || moment(time).zoneAbbr().includes('-') ? moment(time).format('DD/MM/YYYY HH:mm (UTC zz)') : moment(time).format(globalConstants.DATETIME_TZ_FORMAT)
}

export const formatTimeOnly = (time) => {
    return moment(time).zoneAbbr().includes('+') || moment(time).zoneAbbr().includes('-') ? moment(time).format('HH:mm (UTC zz)') : moment(time).format('HH:mm (zz)')
}

export const formatRadar = (radarObject) => ({
    ...radarObject.product,
    ...radarObject.radar_state
})

export const checkBeaconFunction = (beacon, beaconFeatures, powerOptions, item) => {
    return beacon && beaconFeatures && beaconFeatures[beacon?.model] ? beaconFeatures[beacon.model][item] && powerOptions : true
}

export const moreRadars = (radarSubscription, plan) => {
    const deviceCount = radarSubscription?.products?.length
    const currentTier = plan?.tiers.find(tier => tier.from <= deviceCount && (!tier.to || tier.to >= deviceCount))
    const newTier = plan?.tiers.find(tier => tier.from <= deviceCount + 1 && (!tier.to || tier.to >= deviceCount + 1))
    const diffTier = currentTier?.amount !== newTier?.amount
    if (activeButNotMonthlySub(radarSubscription.subscription_status)) {
        return <span>Your existing subscription is currently set to {radarSubscription.subscription_status} and will remain the same when we bundle this additional radar.</span>
    }
    if (diffTier) {
        return <span>it will increase to {dollarSymbol(radarSubscription.currency) + newTier.amount} per month when we bundle this additional radar.</span>
    } else {
        return <span>your subscription price will remain the same when we bundle this additional radar.</span>
    }
}

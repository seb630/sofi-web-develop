import moment from 'moment'
import { globalConstants } from '@/_constants'

const myLocale = window.navigator.userLanguage || window.navigator.language || 'en-AU'
const localeData = moment.localeData(myLocale)

const Locales = {
    locale: myLocale,
    dateFormat: globalConstants.DATE_FORMAT || localeData.longDateFormat('L') || 'DD/MM/YYYY',
    timeFormat: globalConstants.TIME_FORMAT || localeData.longDateFormat('LT') || 'HH:mm',
    datetimeFormat: globalConstants.DATETIME_FORMAT || localeData.longDateFormat('LLL') || 'DD/MM/YYYY HH:mm',
    longDateFormat: globalConstants.LONGDATE_FORMAT || 'dddd DD MMMM YYYY',
    longDateTimeFormat: globalConstants.LONGDATETIME_FORMAT || 'dddd DD MMMM YYYY h:mm A',
    apiDateFormat: globalConstants.API_DATE_FORMAT || 'YYYY-MM-DD',
    apiTimeFormat: globalConstants.API_TIME_FORMAT || 'HH:mm',
    apiDateTimeFormat: globalConstants.API_DATETIME_FORMAT || 'YYYY-MM-DDTHH:mm:ss\\Z'
}

function format4Api(date) {
    return moment.utc(date)
        .format(Locales.apiDateTimeFormat)
}

export { Locales as locale, format4Api }

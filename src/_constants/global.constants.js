export const globalConstants = {
    // API BASE URL
    // API_BASE_URL: 'http://localhost:8080/api/',
    // API_BASE_URL: 'https://au-sofihub-internal.sofieco.net/api/',
    // API_BASE_URL: 'https://au-sofihub-production.sofieco.net/api/',
    API_BASE_URL: 'https://au-sofihub-develop.sofieco.net/api/',
    // API_BASE_URL: 'https://au-sofihub-demo.sofieco.net/api/',

    // API Login URL
    // API_LOGIN_URL: 'http://localhost:8080/oauth/token',
    // API_LOGIN_URL: 'https://au-sofihub-internal.sofieco.net/oauth/token',
    // API_LOGIN_URL: 'https://au-sofihub-production.sofieco.net/oauth/token',
    API_LOGIN_URL: 'https://au-sofihub-develop.sofieco.net/oauth/token',
    // API_LOGIN_URL: 'https://au-sofihub-demo.sofieco.net/oauth/token',
    AU_PRODUCTION_URL: 'portal.sofihub.com',

    // Grant Type
    GRANTPASSWORD: 'password',
    GRANTREFRESH: 'refresh_token',
    GRANTCLIENT: 'client_credentials',

    // Gateway Credentials
    USERNAME: 'serenity-app-gateway',
    PASSWORD: '584^B%6x%%$BMx7&D2Gf',

    //Google Analytics ID
    GA_TRACKING_ID: 'G-89QY5306CJ',
    // GoogleMap Credentials
    GOOGLEMAP_KEY: 'AIzaSyCzccG1_oX_OZzKbvlF1cw1E__FS62M0BA',

    GOOGLE_WEB_SERVICE_KEY: 'AIzaSyCBcKy0mNt8em1fKuF6lLGpcTU3hNj-xas',
    // ReCAPTCHA Credentials
    RECAPTCHA_KEY: '6LfohZcUAAAAALSQtaovWZ6q666indURiVg9NiXs',

    BLUE_MARKER_URL: 'https://maps.google.com/mapfiles/kml/paddle/blu-circle.png',
    PURPLE_MARKER_URL: 'https://maps.google.com/mapfiles/kml/paddle/purple-circle.png',
    DEFAULT_MARKER_URL: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png',

    // General Settings
    _3G_BEACON_MODEL: 'EV07W',
    SITA_BEACON_MODEL: 'CT21B',
    EV04_BEACON_MODEL: 'EV04',
    EV06_BEACON_MODEL: 'EV06',
    TIMELINE_THRESHOLD_MIN: 10, //10 Seconds
    TIMELINE_SIZE: 500,
    GENERAL_AUTO_REFRESH_TIME: 30000, // Milliseconds
    HUB_AUTO_REFRESH_TIME: 30000, // Milliseconds
    DASHBOARD_TIMEOUT_TIME: 10000, // Milliseconds
    BEACON_AUTO_REFRESH_TIME: 30000, // Milliseconds
    RADAR_AUTO_REFRESH_TIME: 30000, // Milliseconds
    SET_HOURS: 3,
    SET_24HOURS: 24,
    ACTIVITY_COUNT_LIMIT: 5,
    ACTIVITY_PAGE_COUNT: 10,
    MESSAGE_PAGE_SIZE: 4,
    INPUT_MAX_LENGTH: 255,
    IMEI_MAX_LENGTH: 15,
    TIME_WAIT_LONG_SMS: 30000, // Milliseconds
    TIME_RESEND_SMS: 120000, // Milliseconds
    DATE_FORMAT: 'DD/MM/YYYY',
    TIME_FORMAT: 'HH:mm',
    LONG_TIME_FORMAT: 'h:mm A',
    DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
    DATETIME_TZ_FORMAT: 'DD/MM/YYYY HH:mm (zz)',
    LONGDATE_FORMAT: 'dddd DD MMMM YYYY',
    LONGDATETIME_FORMAT: 'dddd DD MMMM YYYY h:mm A',
    LONGDATETIME_FORMAT_TZ: 'dddd DD MMMM YYYY h:mm A z',
    CLOCK_DT_FORMAT: 'YYYY/MM/DD HH:mm:ss (zz)',
    MESSAGE_DT_FORMAT: 'h:mm A ddd DD MMM',
    API_DATE_FORMAT: 'YYYY-MM-DD',
    API_TIME_FORMAT: 'HH:mm',
    API_DATETIME_FORMAT: 'YYYY-MM-DDTHH:mm:ss\\Z',
    LOCATION_CHANGE : '@@router/LOCATION_CHANGE',
    DEFAULT_COUNTRY: 'AU',
    DEFAULT_THROTTLE_TIME: 3000, // Milliseconds
    DEFAULT_DEBOUNCE_TIME: 500, // Milliseconds
    DEFAULT_RADAR_CALIBRATION_TIMEOUT: 240, //Seconds
    DEFAULT_RADAR_CALIBRATION_COUNT: 40,
    RADAR_HEART_BEAT_FREQUENCY: 35, // Minutes
    BEACON_DELAY_WARNING_TIME: 15, // Minutes
    LOCAL_STORAGE_EXPIRE: 120, //Minutes
    HDOP_TO_METER_RATIO: 10,
    ROUTINE_RECOMMENDATION: true,
    BEACON_BANNER_TIMEOUT: 30, // Minutes
    BEACON_HISTORY_TIME_UNIT: 'day',
    // Validation RegEx
    EMAIL_REGEX: /(.+)@(.+){2,}\.(.+){2,}/,
    BEACON_SMS_PREFIX_REGEX: /^[a-zA-Z0-9 ]{0,18}$/,
    OOBE_SKIP_TIME: 60, //Minutes
    CHANGE_LOG_BEACON_EC: 'B_EC',

    // Messages
    ACTIVITYTOOLTIP: 'This page shows a log of all detected occupancies within the home. The \'Detailed View\' which allows the user to show more detail of each and every movement. The non-detailed view shows a more high level view of activity',
    OCCUPANCIESTOOLTIP: 'This shows which room and the times the occupant was in it.',
    ANOMALIESTOOLTIP: 'This shows when either the patterns of behaviour change, e.g. spending too long in the bathroom, or when there is a system glitch, e.g. network outage.',
    MESSAGESTOOLTIP: 'This shows when messages, e.g. reminders, are played.',
    MEDICATIONSTOOLTIP: 'This shows when the medications were accessed.',
    NAMETOOLTIP: 'The name of the sensor, including its location and position. \'Motion\' sensors are installed and should only trigger by movement within the named room. \'Transit\' sensors are located in doorways and should only trigger when someone walks through the doorway.',
    HEARTBEATTOOLTIP: 'Each sensor sends a heartbeat to Sofihub at least once per hour. If the heartbeat shown is over two hours old we would regard this sensor as \'offline\'. The suggested action would be to check the sensor, change the batteries if required, and finally press the button on the rear of the sensor twice quickly. Wait for up to an hour for the sensor to reconnect to Sofihub before logging a support call via www.sofihub.com/support',
    TRIGGEREDTOOLTIP: 'The last time the sensor detected motion. The sensor sends a message to Sofihub as soon as motion is detected. After motion has been detected the sensor will wait for ten seconds of continuous inactivity before sending the \'motion stopped\' message to the hub.',
    BATTERYTOOLTIP: 'This column shows you the battery level of each sensor. Its recommended that you replace the battery when the battery icon has a red outline, indicating a battery level of less than 30%',
    ENTER_EMAIL: 'Please enter Email Address.',
    ENTER_PASSWORD: 'Please enter Password.',
    ENTER_MAC: 'Please enter Mac address.',
    ENTER_IP: 'Please enter IP address.',
    ENTER_HTTP_ENDPOINT: 'Please include port in HTTP endpoint if coutom port required',
    ENTER_PORT: 'Please enter Port number.',
    ENTER_IMEI: 'Please enter IMEI number',
    INCORRECT_CREDENTIAL: 'Username or Password incorrect.',
    WENT_WRONG: 'Something went wrong. Please try again.',
    REQUIRED_FIRSTNAME: 'Please enter First Name.',
    REQUIRED_LASTNAME: 'Please enter Last Name.',
    REQUIRED_BEACON_NAME: 'Please enter Display Name.',
    REQUIRED_PHONE: 'Please enter valid Mobile Number.',
    REQUIRED_HUBID: 'Please enter valid Hubid.',
    REQUIRED_ROOM: 'Please Select Room.',
    REQUIRED_COUNTRY: 'Please Select Country.',
    REQUIRED_CITY: 'Please enter City.',
    REQUIRED_STATE: 'Please enter State.',
    REQUIRED_GEOFENCE_NAME: 'Please enter Geofence Name.',
    REQUIRED_GEOFENCE_RADIUS: 'Please enter Geofence Radius.',
    UPDATE_SUCCESS: 'Information updated.',
    MUTE_MESSAGE: 'Please enter start and finish time.',
    REQUIRED_RMESSAGE: 'Please enter Reminder Message.',
    REQUIRED_RDATE: 'Please enter date.',
    REQUIRED_RTIME: 'Please enter time.',
    REQUIRED_RNAME: 'Please enter Resident Name',
    REQUIRED_HUBLOCATION: 'Please select hub location',
    REQUIRED_ESW: 'Please enter weekdays earliest sleep time.',
    REQUIRED_LSW: 'Please enter weekdays latest sleep time.',
    REQUIRED_ESWND: 'Please enter weekends earliest sleep time.',
    REQUIRED_LSWND: 'Please enter weekends latest sleep time.',
    REQUIRED_EWW: 'Please enter weekdays earliest waking time.',
    REQUIRED_LWW: 'Please enter weekdays latest waking time.',
    REQUIRED_EWWND: 'Please enter weekends earliest waking time.',
    REQUIRED_LWWND: 'Please enter weekends latest waking time.',
    REQUIRED_BATHTIME: 'Please enter bathing duration.',
    REQUIRED_MUTESTARTTIME: 'Please enter mute start time.',
    REQUIRED_MUTEENDTIME: 'Please enter mute end time.',
    REQUIRED_REMINDERNAME: 'Please enter Reminder Name',
    REQUIRED_FIELD:'this field is required',
    SPACES: ['BEDROOM', 'BATHROOM', 'KITCHEN', 'LOUNGE', 'CORRIDOR', 'MEDICATION_SPACE','OTHER_ROOM'],
    SLEEP_EARLIEST_RECOMMENDATION: '21:00',
    SLEEP_LATEST_RECOMMENDATION: '23:00',
    WAKE_EARLIEST_RECOMMENDATION: '06:00',
    WAKE_LATEST_RECOMMENDATION: '09:00',
    BATH_RECOMMENDATION: 15, // Minute
    ERROR_RTIME: 'Earliest time should not after Latest time',
    PASSWORD_TOOLTIP: 'Your password needs to be secure, include an: upper and lower case letter, a symbol, and a number. Make sure that your password is longer than 6 characters.',
    PASSWORD_REGEX: RegExp('^((?=.*?[A-Z])(?=.*?[a-z])(?=.*?\\d)(?=.*?[^a-zA-Z0-9])).{6,}$'),
    MAC_ADDRESS_REGEX: RegExp('^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$'),
    UUID_REGEX: RegExp('^[0-9a-fA-F]{8}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{12}$'),
    IP_REGEX: RegExp('^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$'),
    IMEI_REGEX: RegExp('^[0-9]{15}$'),
    NUMBER_ONLY_REGEX: RegExp('^[0-9]+$'),
    INVALID_MAC: 'Please input a valid MAC address',
    INVALID_IP: 'Please input a valid IP address',
    INVALID_IMEI: 'Please input a valid IMEI number (15 digits)',
    MAXIMUM_HISTORICAL_FILTER: 'Sorry a maximum of 24 hours history can be shown at any time, please select a different start or end date time',
    EMPTY_HISTORICAL_FILTER: 'There is no history for this time period, this may be because the SOFIHUB beacon has not moved since yesterday so there is no new location date for today, or possibly the Beacon was switched off or not within 3G/4G reception range',
    EMPTY_BEACON_MAP: 'No location data recorded yet, make sure your SOFIHUB Beacon is switched on. (You may need to take your SOFIHUB Beacon outside to acquire a location lock).',
    PREVENT_ACCESS_PAGE: 'Sorry, you do not have access to this page',
    SERVER_ERROR_MESSAGE: 'Something wrong, please try again!',
    ADD_IMEI_WARNING:'Warning: this IMEI number is not exactly 15 digits, please double check the number before adding this Beacon',
    MOBILE_VERIFY_ERROR: 'The mobile phone number verification code you typed is incorrect, please try again.',
    LOCATION_ACCURACY_TOOLTIP: 'When location accuracy is "Good" this means that the SOFIHUB beacon is connected to four or more GPS satellites. "Average" means that the SOFIHUB beacon is only connected to three satellites, and "Inaccurate" means it\'s connected less than two satellites. An "Inaccurate" location is an echo of a last "Average" or "Good" location - the SOFIHUB beacon will have most likely moved on from that place"',
    MELBOURNE: {lat:-37.8126757,lng:144.9619514},
    PORTAL_FUNCTIONS: {SideButton: ['settings','admin'] },

    // Device Branding
    HUB_SOFIHUB: 'TEQ-Home',
    LIFE_SOFIHUB: 'TEQ-Life',
    BEACON_EVIEW: 'TEQ-Secure',
    RADAR_RAYTEL: 'Eazense',
    RADAR_HOBA: 'TEQ-FallsAlert',
    BEACON_SITA: 'SITA Pendant',
    BEACON_SOFIHUB: 'TEQ-Secure',
    BEACON_WATCH: 'Watch',
    PENDANT_GENERIC: 'pendant',
    HUB_GENERIC: 'hub',
    RADAR_GENERIC: 'radar',
    COMPANY_BRAND: 'SOFIHUB',

    //Company Branding
    BILLING_COMPANY_NAME: 'Sofihub',
    BILLING_COMPANY_EMAIL: 'support@sofihub.com',
    BILLING_COMPANY_PHONE: '1300 110 366',

    EMERGENCY_CALL_NUMBERS: ['000', '111', '112', '911', '999']
}

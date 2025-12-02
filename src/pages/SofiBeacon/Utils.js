import _ from 'lodash'


/** build bound Area
 * @param {array} spots
 * @param {object} defaultCenter
 * @return {object} { ne: 122 , sw: 133}
 */
export function buildBoundArea(spots,defaultCenter) {
    const latAsc = _.orderBy(spots,['lat'],'asc')
    const lngAsc = _.orderBy(spots,['lng'],'asc')

    if(spots.length > 1) {
        const neLng = _.last(lngAsc).lng
        const swLng = _.first(lngAsc).lng
        return {
            ne: { lat: _.last(latAsc).lat + 0.005 , lng: neLng === swLng ? neLng + 0.005 : neLng } ,
            sw: { lat: _.first(latAsc).lat - 0.005, lng: neLng === swLng ?  swLng - 0.005 : swLng  }
        }
    } else if (spots.length === 1) {
        return {
            ne: { lat: spots[0].lat + 0.02 , lng: spots[0].lng + 0.02},
            sw:  { lat: spots[0].lat - 0.02 , lng: spots[0].lng - 0.02 }
        }
    }

    return {
        ne: { lat: defaultCenter.lat + 0.02 , lng: defaultCenter.lng + 0.02},
        sw:  { lat: defaultCenter.lat - 0.02 , lng: defaultCenter.lng - 0.02 }
    }
}

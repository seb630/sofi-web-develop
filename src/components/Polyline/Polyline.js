import { Component } from 'react'

export default class Polyline extends Component {

    constructor (props) {
        super(props)

        this.state = {
            geodesicPolyline : new props.maps.Polyline({
                geodesic: true,
                strokeColor: '#00a1e1',
                strokeOpacity: 1.0,
                strokeWeight: 4
            })
        }
    }

    renderPolylines () {
        const { markers, map, color} = this.props
        this.state.geodesicPolyline.setPath(markers)
        this.state.geodesicPolyline.setOptions({
            strokeColor: color,
        })
        /** Example of rendering geodesic polyline */
        this.state.geodesicPolyline.setMap(map)

    }

    render () {
        this.renderPolylines()
        return null
    }
}

import { Component, Fragment } from 'react'
import Current from './Current'
import SavedWifi from './SavedWifi'

export default class Wifi extends Component{

    render(){
        return (
            <Fragment>
                <Current />
                <SavedWifi />
            </Fragment>
        )
    }
}

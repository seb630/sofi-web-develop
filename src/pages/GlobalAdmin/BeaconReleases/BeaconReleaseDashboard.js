import { Component, Fragment } from 'react'
import { connect } from 'mirrorx'
import { Card, Select } from 'antd'
import BeaconIcon from '../../../images/beacon_icon.svg'
import BeaconReleaseStats from './BeaconReleaseStats'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    releases: state.release.beaconReleases,
    beacons: state.sofiBeacon.allBeacons || [],
    beaconModels: state.sofiBeacon.beaconModels
})

class BeaconReleaseDashboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            model: '',
        }
    }

    render() {
        let { model } = this.state
        let {beaconModels, releases, beacons} = this.props

        let beaconModelOptions = beaconModels && beaconModels.map(model=>(
            <Select.Option key={model.name} value={model.name}>{model.name}</Select.Option>
        ))
        beaconModelOptions?.push(<Select.Option key='null' value={null}>NULL</Select.Option>)
        beacons = beacons.filter(beacon=>beacon.model===model)

        return (
            <Fragment>
                <Card className="margin-bottom">
                    <Card.Meta
                        avatar={<BeaconIcon style={{ fontSize: '60px' }}/>}
                        title={`Select a ${globalConstants.PENDANT_GENERIC} model to see statistics`}
                        description={
                            <Select
                                placeholder="Select a model"
                                style={{ width: 200 }}
                                onChange={v=>this.setState({model: v})}>
                                {beaconModelOptions}
                            </Select>}
                    />
                </Card>
                <BeaconReleaseStats
                    model={model}
                    releases={ releases?.filter(release=>release.model===model)}
                    beacons={beacons}
                />
            </Fragment>
        )
    }
}

export default connect(mapStateToProps,{})(BeaconReleaseDashboard)

import { Component, Fragment } from 'react'
import { connect } from 'mirrorx'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import CreateBeaconIntro from './step-intro'
import CreateBeaconCreateForm from './step-create'
import CreateBeaconConfigure from './step-configure'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    APNs: state.APN.adminAPN && state.APN.adminAPN.filter(x => !x.apn_archived),
    beaconModels: state.sofiBeacon.beaconModels,
    subscriptionStatus: state.billing.subscriptionStatus,
    subscriptionConditions: state.billing.subscriptionConditions,
    orgs: state.organisation.orgs
})

class CreateBeaconModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            step: 0,
            context: {
                newBeacon: null //'f3fb071e-f0fb-484a-8a4a-94d77d00ac12'
            }
        }
    }

    /** handle move to dialog step*/
    moveTo(step) {
        this.setState({
            step
        })
    }

    handleCancel = () => {
        this.moveTo(0)
        this.setState({
            context: {
                newBeacon: null
            }
        })
    }

    render () {
        const { beaconModels, APNs, subscriptionStatus, subscriptionConditions, orgs } = this.props
        const { step, context } = this.state
        const width = 720
        return (
            <Fragment>
                <Button id="createBeaconBtn" type="primary" icon={<PlusOutlined />} onClick={this.moveTo.bind(this,1)}>Create {globalConstants.PENDANT_GENERIC}</Button>
                <CreateBeaconIntro
                    width={width}
                    open={step === 1}
                    onNext={this.moveTo.bind(this,2)}
                    onCancel={this.handleCancel}>
                </CreateBeaconIntro>
                <CreateBeaconCreateForm
                    beaconModels = {beaconModels}
                    APNs={APNs}
                    orgs={orgs}
                    subscriptionStatus = {subscriptionStatus}
                    subscriptionConditions = {subscriptionConditions}
                    width={width}
                    open={step === 2}
                    onNext={(newBeacon, values, gotoAdmin) => {
                        this.moveTo(3)
                        this.setState({
                            context: { newBeacon, values, gotoAdmin }
                        })
                    }}
                    onBack={this.moveTo.bind(this,1)}
                    onCancel={this.handleCancel} />
                <CreateBeaconConfigure
                    context={context}
                    open={step === 3}
                    onCancel={this.handleCancel} />
            </Fragment>
        )
    }
}

export default connect(mapStateToProps)(CreateBeaconModal)

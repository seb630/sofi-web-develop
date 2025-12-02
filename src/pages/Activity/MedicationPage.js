import { Component } from 'react'
import Medication from './Medication/newMedi'
import PortalLayout from '../Common/Layouts/PortalLayout'

class MedicationPage extends Component {

    render() {
        return (
            <PortalLayout
                menu='hub'
                contentClass="contentPage"
                page="Medication"
                content={<Medication />} />
        )
    }

}

export default MedicationPage

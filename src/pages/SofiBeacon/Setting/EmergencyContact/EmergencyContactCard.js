import { Fragment, useEffect, useRef } from 'react'
import { actions, connect, Link } from 'mirrorx'
import { Button, Card, Col, Row, Skeleton } from 'antd'
import EmergencyContactTable from '@/pages/SofiBeacon/Setting/EmergencyContact/EmergencyContactTable'
import { globalConstants } from '@/_constants'
import {checkBeaconFunction, isWatch} from '@/utility/Common'
import {PDFDownloadLink} from '@react-pdf/renderer'
import EmergencyContactPDF from '@/components/EmergencyContactPDF'

const mapStateToProps = state => ({
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    selectedBeaconEmergencyContacts: state.sofiBeacon.selectedBeaconEmergencyContacts || [],
    loading: state.sofiBeacon.loading,
    isAdmin: state.user.me ? state.user.me.authorities.some(role=>role.includes('ADMIN')) : false,
})

const EmergencyContactCard = (props) => {

    const {selectedBeacon, beaconFeatures} = props
    const {scrollToEC}  = actions.radar.getS().routing?.location?.state || {}
    const ecRef = useRef()
    let maxContacts = checkBeaconFunction(selectedBeacon, beaconFeatures, 'max_cnt_ec')
    maxContacts = typeof (maxContacts) !== 'number' && 10
    const handleBulkEdit = () => {
        actions.common.save({ adminPortal: true, lastDevicePage: 'beacon' })
        actions.routing.push('/globalAdmin/bulk-emergency-edit')
    }

    const handleHistoryLog = () => {
        actions.routing.push('/beacon/admin/history')
    }

    const scrollToECAction = () => {
        scrollToEC && ecRef.current.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(scrollToECAction, [scrollToEC])

    return (
        <Card className="beacon-card" id="emergencyBeaconCard" title="Emergency Contacts" ref={ecRef}>
            <Skeleton loading={props.loading} active>
                <p> When the SOS button on the {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC} is pressed, following phone numbers will have an SMS sent to them, and be called one by one from top to bottom.
                        You can add up to a maximum of {maxContacts} emergency contacts.</p>
                <p><strong>Please note:</strong> Emergency contacts do not have access to the portal - they will just be called or SMS&#39;d from the {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC}.
                    You can invite new carers (people with portal access) <Link to={'/beacon/settings/carer'}>here.</Link></p>

                <EmergencyContactTable
                    selectedBeaconEmergencyContacts = {props.selectedBeaconEmergencyContacts}
                    selectedBeacon = {props.selectedBeacon}
                />
                {props.isAdmin && <Fragment>
                    <h3>
                        Need to update the same contact across many {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC}s? (Admin only)
                    </h3>
                    <Row align="middle">
                        <Col flex="1 1 200px">
                                Head on over to our bulk emergency contact page, it will let you update emergency
                                contacts across many {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC}s. Note this function is only available to administrators.
                        </Col>
                        <Col flex="0 1 200px">
                            <Button type="primary" size="large" onClick={handleBulkEdit}>
                                    Go To Bulk Edit
                            </Button>
                        </Col>
                    </Row>

                    <h3>
                        Want to see emergency contact historical changes? (Admin only)
                    </h3>
                    <Row align="middle">
                        <Col flex="1 1 200px">
                            Head on over to our history log screen. Note this function is only available to administrators.
                        </Col>
                        <Col flex="0 1 200px">
                            <Button type="primary" size="large" onClick={handleHistoryLog}>
                                History Log
                            </Button>
                        </Col>
                    </Row>

                    {props.selectedBeaconEmergencyContacts?.length>0 &&<Fragment><h3>
                        Generate PDF file (Admin only)
                    </h3>
                    <Row align="middle">
                        <Col flex="1 1 200px">
                            Download generated PDF file
                        </Col>
                        <Col flex="0 1 200px">
                            <PDFDownloadLink document={<EmergencyContactPDF ec={props.selectedBeaconEmergencyContacts} />} fileName="EmergencyContact.pdf">
                                {({ loading }) =>
                                    loading ? 'Loading document...' : <Button type="primary" size="large" >Download</Button>
                                }
                            </PDFDownloadLink>
                        </Col>
                    </Row>
                    </Fragment>}

                </Fragment>}
            </Skeleton>
        </Card>
    )

}

export default connect(mapStateToProps,{})(EmergencyContactCard)

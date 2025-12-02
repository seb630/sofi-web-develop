import { Button, Col, Row } from 'antd'
import { Fragment } from 'react'
import OneSwitchComponent from './Component/oneSwitchComponent'
import { globalConstants } from '@/_constants'

const anomalyStep = (selectedHub, settings, anomalyPreferences, next, prev ) =>{
    const firstName = settings && settings.resident_profile.first_name
    const title = 'Anomaly detection'
    const bath = settings && parseInt(settings.routine.bathing.duration/60000,10)
    const content =
        <Fragment>
            <div className="advanced_block">
                <p>{globalConstants.HUB_SOFIHUB} can offer the ability to get in touch with all carers if an anomaly is detected. We use the {firstName}
                &#39;s routine you provided in the previous step to help determine if an anomaly may be occurring.</p>
                <p>{globalConstants.HUB_SOFIHUB} offers three anomalies which can be detected, you can opt to have some turned on, all, or none.</p>
                <OneSwitchComponent
                    type="anomaly"
                    selectedHub={selectedHub}
                    anomalyPreferences={anomalyPreferences}
                    feature="long_bathroom"
                    featureTitle="Long Bathroom Duration"
                    featureDescription={
                        <p>If {firstName} spends longer than {bath} minutes in the bathroom SOFIHUB will raise an anomaly.</p>
                    }
                />

                <OneSwitchComponent
                    type="anomaly"
                    selectedHub={selectedHub}
                    anomalyPreferences={anomalyPreferences}
                    feature="not_gone_to_bed"
                    featureTitle="Late To Bed"
                    featureDescription={
                        <p>
                           If {firstName} hasn&#39;t made their way to the bedroom by {settings?.routine?.sleeping?.weekdays?.latest} on weekdays
                            or {settings?.routine?.sleeping?.weekends?.latest} on weekends we&#39;ll raise an anomaly.
                        </p>
                    }
                />

                <OneSwitchComponent
                    type="anomaly"
                    selectedHub={selectedHub}
                    anomalyPreferences={anomalyPreferences}
                    feature="not_woken_up"
                    featureTitle="Late To Wake"
                    featureDescription={
                        <p>
                            If {firstName} hasn&#39;t walked past the hub by {settings?.routine?.waking?.weekdays?.latest} on
                            weekdays or {settings?.routine?.waking?.weekends?.latest} on weekends we&#39;ll raise an anomaly.
                        </p>
                    }
                />
            </div>
            <Row><Col span={24}><Button style={{ marginLeft: 8 }} onClick={prev}>
                Previous
            </Button>
            <Button
                type="primary"
                onClick={next}
                className="floatRight">Next</Button></Col>
            </Row>
        </Fragment>
    return {title,content}
}

export default anomalyStep

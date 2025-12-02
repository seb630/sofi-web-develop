import {Component, createRef, Fragment} from 'react'
import { actions } from 'mirrorx'
import {Button, message, Skeleton, Spin, Typography, Form, Select} from 'antd'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { globalConstants } from '@/_constants'
import CounterLoading from '../../../../components/CounterLoading'
import { isWatch } from '@/utility/Common'

class BeaconAPNField extends Component {
    constructor(props) {
        super(props)

        this.state = {
            submitting: false,
            selectedAPN: props.apns?.find(x => x.id === props.selectedBeacon?.apn_id),
            loading: {
                open: false,
                value: 0
            },
        }
        this.formRef = createRef()
        this.smsInterval = 0
    }

    componentWillUnmount() {
        if(this.smsInterval) {
            clearInterval(this.smsInterval)
        }
    }

    /** handle Save */
    handleSaveSMS = async (resent) => {
        try {
            const id = this.formRef.current.getFieldValue('apn_id')
            const { selectedBeacon, apns } = this.props
            const apn = apns.find(item=>item.id === id)
            this.setState({ submitting: true })
            await actions.sofiBeacon.saveBeaconInfor(_.extend({},selectedBeacon,{ apn_id: id }))
            await Promise.all([this.waitForSmS(globalConstants.TIME_WAIT_LONG_SMS), actions.sofiBeacon.smsAPN({ beaconId: selectedBeacon.pub_id, apnId: apn.pub_id })])
            message.success(resent? 'APN Resent':'APN Saved!')
        } catch (err) {
            err.global_errors && err.global_errors.forEach(e => {
                message.error(e.message,3)
            })
        } finally {
            this.setState({ submitting: false })
        }
    }

    /** handle Save */
    handleSave = async () => {
        try {
            const id = this.formRef.current.getFieldValue('apn_id')
            const { selectedBeacon } = this.props
            this.setState({ submitting: true })
            await actions.sofiBeacon.saveBeaconInfor(_.extend({},selectedBeacon,{ apn_id: id }))
            message.success('APN Saved!')
        } catch (err) {
            err.global_errors && err.global_errors.forEach(e => {
                message.error(e.message,3)
            })
        } finally {
            this.setState({ submitting: false })
        }
    }

    /** waiting while send sms
     * @param {number} duration
    */
    waitForSmS = (duration) => {
        return new Promise((resolve) => {
            let count = duration/1000
            const distance = 100/count

            this.setState({
                loading: {
                    open: true,
                    value: this.state.loading.value + distance
                }
            })
            -- count
            this.smsInterval = setInterval(() => {
                if(count === 0) {
                    clearInterval(this.smsInterval)
                    this.setState({
                        loading: {
                            value: 0,
                            open: false
                        }
                    })
                    resolve()
                    return
                }

                this.setState({
                    loading: {
                        open: true,
                        value: this.state.loading.value + distance
                    }
                })
                --count
            },1000)
        })
    }

    render() {
        const {  submitting, loading } = this.state
        const { selectedBeacon, apns } = this.props
        const apnOptions = apns?.map(apn=>({value: apn.id, label: apn.apn_name}))
        return (
            <Fragment>
                <CounterLoading message={'Please wait while we send the command...'} {...loading}/>
                <Skeleton loading={!selectedBeacon}>
                    {selectedBeacon && <Spin spinning={submitting}>
                        <Typography.Paragraph>
                            <Typography.Text strong>1. Send APN to {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC}: </Typography.Text>
                            <Typography.Text type="secondary" style={{fontSize: 14}}>(An APN is the mechanism to get the {isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC} connected to the Internet)</Typography.Text>
                        </Typography.Paragraph>
                        <Form layout="inline" ref={this.formRef}>
                            <Form.Item label="Current APN" initialValue={selectedBeacon?.apn_id} name='apn_id'>
                                <Select options={apnOptions} style={{width:200}}/>
                            </Form.Item>
                            <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.apn_id !== currentValues.apn_id}>
                                {({ isFieldTouched }) =>
                                    <Button type="primary" disabled={!isFieldTouched('apn_id')} onClick={this.handleSave}>Save</Button>
                                }
                            </Form.Item>
                            <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.apn_id !== currentValues.apn_id}>
                                {({ isFieldTouched }) =>
                                    <Button type="primary" disabled={!isFieldTouched('apn_id')} onClick={()=>this.handleSaveSMS(false)}>Save and send APN SMS</Button>
                                }
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" disabled={!selectedBeacon.apn_id} onClick={()=>this.handleSaveSMS(true)}>Resend APN SMS</Button>
                            </Form.Item>
                        </Form>
                    </Spin>}
                </Skeleton>
            </Fragment>
        )
    }
}

BeaconAPNField.propTypes = {
    selectedBeacon: PropTypes.shape({
        beacon_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        imei: PropTypes.string,
        phone: PropTypes.string,
        archived: PropTypes.bool
    }),
    apns: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        apn_name: PropTypes.string
    }))
}

export default BeaconAPNField

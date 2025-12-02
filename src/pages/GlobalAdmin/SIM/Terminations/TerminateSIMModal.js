import { Fragment, useEffect, useState } from 'react'
import { actions } from 'mirrorx'
import { Button, Col, DatePicker, Input, message, Modal, Row, Table, Typography } from 'antd'
import { globalConstants } from '@/_constants'
import moment from 'moment'
import PropTypes from 'prop-types'
import { sortString } from '@/utility/Common'
import { isMobile } from 'react-device-detect'

/** APN Modal HoC
 * @param {React.Component} ActionComponent
 * @return {React.Component}
*/
function withSIMModal (ActionComponent) {
    const SIMForm = (props) => {
        const [open, setOpen] = useState(false)
        const {simActivations, model} = props
        const [termDate, setTermDate] = useState(model? moment(model.scheduled_date) : null)
        const [selectedSIM, setSelectedSIM] = useState(model? simActivations?.find(record=>record.id === model.sim_activation_id) :null)
        const [searchModal, setSearchModal] = useState(false)
        const [notes, setNotes] = useState(model?.notes)
        const [listActivations, setListActivations] = useState(simActivations)

        useEffect(()=>setListActivations(simActivations),[simActivations])
        useEffect(()=>{
            setTermDate(model? moment(model.scheduled_date) : null)
            setSelectedSIM(model? simActivations?.find(record=>record.id === model.sim_activation_id) :null)
            setNotes(model?.notes)
        },[model, simActivations, open])

        /** handle close Modal */
        const handleClose = () => {
            setOpen(false)
            setTermDate(null)
            setSelectedSIM(null)
            setNotes(null)
            setSearchModal(false)
        }

        /** handle saving */
        const handleSave = () => {
            const action = []
            const newPayload = {sim_activation_id: selectedSIM.id,
                scheduled_date: termDate.format(), job_status: 'ACTIVE',
                notes
            }
            const payload = model ?  {...model, sim_activation_id: selectedSIM.id, scheduled_date: termDate.format(), notes} : newPayload
            action.push(model ?
                actions.SIM.updateSSDeactivations(payload):
                actions.SIM.createSSDeactivations(payload))
            Promise.all(action).then(()=>{
                message.success(model ? 'Record Updated' : 'Record Created')
                handleClose()
            }).catch (err=> {
                err.global_errors?.length>0 ? err.global_errors.map(item => {
                    message.error(`${item}`)
                }) : message.error(globalConstants.SERVER_ERROR_MESSAGE)
            })
        }

        const selectRecord = (record) => {
            setSelectedSIM(record)
            setSearchModal(false)
        }

        const renderHeader = () => {
            return (<Fragment>
                <Row type="flex" gutter={15} align="middle" className="margin-bottom">
                    <Col>
                        <Input.Search
                            placeholder="Search here ..."
                            onSearch={handleSearch}
                            enterButton
                            autoFocus = {!isMobile}
                        />

                    </Col>
                </Row>
            </Fragment>
            )
        }

        const handleSearch = (value) => {
            if (value === '' ){
                setListActivations(simActivations)
            }else{
                setListActivations(simActivations.filter(
                    record => record.iccid_full?.toLowerCase().includes(value.toLowerCase()) ||
                        record.product_mac_or_imei?.toLowerCase().includes(value.toLowerCase()) ||
                        record.msisdn_full?.toLowerCase().includes(value.toLowerCase())
                ))
            }
        }

        const columns = [
            {
                title: 'Full ICCID',
                dataIndex: 'iccid_full',
                key: 'iccid_full',
                defaultSortOrder: 'ascend',
                sorter: (a, b) => sortString(a,b,'iccid_full'),
            },
            {
                title: 'IMEI or MAC address',
                dataIndex: 'product_mac_or_imei',
                key: 'product_mac_or_imei',
            },
            {
                title: 'Mobile number',
                dataIndex: 'msisdn_full',
                key: 'msisdn_full',
            },
            {
                title: 'Product Type',
                dataIndex: 'product_type',
            },
            {
                title: 'SIM Carrier',
                dataIndex: 'sim_carrier',
            },
            {
                title: 'SIM status',
                dataIndex: 'sim_status',
            },
            {
                title: 'Action',
                key: 'action',
                render: (text,record) => <Button type="primary" onClick={()=>selectRecord(record)}>Select</Button>
            }
        ]

        const disabledDate = (current) => {
            // Can not select days before today and today
            return current && current < moment().endOf('day')
        }

        return (<Fragment>
            <ActionComponent onClick={()=>setOpen(true)} />
            <Modal
                destroyOnClose
                okText="Save"
                open={open}
                onCancel={handleClose}
                onOk={handleSave}
                okButtonProps={{disabled: !termDate || !selectedSIM}}
                centered={false}
                title={model ? `Edit SIM Termination Record: ${model.id}` : 'Create new SIM Termination Record'}
                width={650}
            >
                <Row gutter={[12,12]} className="margin-bottom">
                    <Col>
                        1. When should we terminate the SIM?
                    </Col>
                    <Col>
                        <DatePicker
                            disabledDate={disabledDate}
                            size="small"
                            placeholder="Select date"
                            onChange={(date)=>setTermDate(date)}
                            value={termDate}
                        />
                    </Col>
                </Row>

                <Row gutter={[12,12]} className="margin-bottom">
                    <Col>
                        2. Description for the termination
                    </Col>
                    <Col>
                        <Input.TextArea
                            autoSize
                            placeholder="description"
                            value={notes}
                            onChange={e=>setNotes(e.target.value)}
                        />
                    </Col>
                </Row>

                {selectedSIM ? <Typography>
                    <Row>
                        SIM details:
                    </Row>
                    <Row>
                        <Col span={6}>
                            Carrier:
                        </Col>
                        <Col span={18}>
                            {selectedSIM.sim_carrier}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>
                            ICCID:
                        </Col>
                        <Col span={18}>
                            {selectedSIM.iccid_full}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>
                            Mobile Number:
                        </Col>
                        <Col span={18}>
                            {selectedSIM.msisdn_full}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>
                                IMEI/MAC:
                        </Col>
                        <Col span={18}>
                            {selectedSIM.product_mac_or_imei}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>
                                Device Type:
                        </Col>
                        <Col span={18}>
                            {selectedSIM.product_type}
                        </Col>
                    </Row>
                    <Row className="margin-bottom">
                        <Col span={6}>
                                SIM Status:
                        </Col>
                        <Col span={18}>
                            {selectedSIM.sim_status}
                        </Col>
                    </Row>
                    <Row gutter={[12,12]}>
                        <Col>
                            Not the correct SIM card? Pick another:
                        </Col>
                        <Col>
                            <Button type="primary" onClick={()=>setSearchModal(true)}>Search</Button>
                        </Col>
                    </Row>
                </Typography> : <Row gutter={[12,12]}>
                    <Col>
                        3. Find SIM card record by phone number/MAC/IMEI:
                    </Col>
                    <Col >
                        <Button type="primary" onClick={()=>setSearchModal(true)}>Search</Button>
                    </Col>
                </Row>}
            </Modal>

            <Modal
                destroyOnClose
                open={searchModal}
                onCancel={()=>setSearchModal(false)}
                title="Search by phone number/MAC/IMEI"
                width={1000}
                footer={null}
            >
                <Table
                    scroll={{x: true}}
                    columns={columns}
                    dataSource={listActivations}
                    rowKey="id"
                    title={renderHeader}
                />
            </Modal>
        </Fragment>)

    }

    SIMForm.propTypes={
        model: PropTypes.object,
        device: PropTypes.object
    }
    return SIMForm
}

export default withSIMModal

import { Component, createRef, Fragment } from 'react'
import { InboxOutlined } from '@ant-design/icons'
import { Button, Form, Input, Modal, Row, Upload } from 'antd'
import { readRemoteFile } from 'react-papaparse'
import PreviewTable from './previewTable'
import MomentZone from 'moment-timezone/data/meta/latest.json'
import { actions, Link } from 'mirrorx'
import ResultTable from './resultTable'
import { titleCase } from 'change-case'
import { globalConstants } from '@/_constants'

const FormItem = Form.Item
const Dragger = Upload.Dragger

class BeaconUploadModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            preview: false,
            fileList: [],
            uploading: false,
            email: null,
            jsonObject: null,
            error: false,
            failures: null,
            showResult: false,
            success: null,
            total: null,
        }
        this.formRef = createRef()
    }

    handleSubmit = (e) => {
        const {preview, error, fileList, jsonObject, email} = this.state
        e.preventDefault()
        if (preview){
            if (!error){
                this.setState({uploading: true})
                const payload = {
                    email_recipients: email,
                    beacons: jsonObject.map(csvObj=>({
                        apn: csvObj.APN,
                        imei: csvObj.IMEI,
                        model: csvObj['Model Number'],
                        name: csvObj['Beacon Name'] && csvObj['Beacon Name']!=='' && csvObj['Beacon Name']?.trim()!=='' ? csvObj['Beacon Name'] : `${csvObj['Name Prefix']} ${csvObj.IMEI}`,
                        name_prefix: csvObj['Name Prefix'],
                        oobe_state: csvObj.OOBE,
                        phone: csvObj.Phone,
                        subscription_status: csvObj['Subscription State'],
                        timezone: csvObj.Timezone
                    }))
                }
                actions.sofiBeacon.createMassBeacons(payload).then(result=>{
                    this.setState({
                        success: result.success_count,
                        total: result.total_count,
                        failures: result.failures?.map(resObj=>{
                            let csvObj = {
                                APN: resObj.apn,
                                IMEI: resObj.imei,
                                OOBE: resObj.oobe_state,
                                Phone: resObj.phone,
                                error: resObj.error,
                                Timezone: resObj.timezone
                            }
                            csvObj['Model Number'] = resObj.model
                            csvObj['Beacon Name'] = resObj.name
                            csvObj['Name Prefix'] = resObj.name_prefix
                            csvObj['Subscription State'] = resObj.subscription_status
                            return csvObj
                        }),
                        showResult: true,
                        preview: false,
                        uploading: false,
                    })
                }).catch(()=>this.setState({uploading: false}))
            }
        }else{
            this.formRef.current?.validateFields().then(values => {
                this.setState({
                    email: values.email,
                    uploading: true,
                })
                fileList.forEach((file) => {
                    readRemoteFile(file, {
                        header: true,
                        complete: (results) => {
                            this.setState({
                                fileList: [],
                                uploading: false,
                                preview: true,
                                jsonObject: this.validateData(results?.data)
                            })
                        }
                    })
                })
            })
        }
    }

    validateData = dataSource => {
        const { beaconModels, APNs, subscriptionStates} = this.props
        const apnNames = APNs.map(apn=>apn.apn_name.toLowerCase())
        const modelNames = beaconModels.map(model=>model.name.toLowerCase())
        const subscriptionNames = subscriptionStates.map(state=>state.toLowerCase())
        const result = dataSource.filter(record=>record.IMEI).map(record=>{
            let error = []
            if (record.Timezone && !Object.keys(MomentZone.zones).map(key=>key.toLowerCase()).includes(record.Timezone?.toLowerCase())){
                error.push('Timezone not exist')
            }
            if (record.OOBE && !(record.OOBE.toLowerCase()==='none'||record.OOBE.toLowerCase()==='done')){
                error.push('OOBE has to be "DONE" or "NONE"')
            }
            if (record.APN && !apnNames.includes(record.APN?.toLowerCase())){
                error.push('APN not exist')
            }
            if (record.IMEI?.length!==15){
                error.push('IMEI length has to be 15')
            }
            if (record['Model Number'] && !modelNames.includes(record['Model Number']?.toLowerCase())){
                error.push('Model not exist')
            }
            if (record['Subscription State'] && !subscriptionNames.includes(record['Subscription State']?.toLowerCase())){
                error.push('Subscription State not exist')
            }
            error = error.toString()
            return {...record, error}
        })
        this.setState({error: result.some(record =>record?.error)})
        return result
    }

    onCancel = () => {
        this.setState({
            preview: false,
            fileList:[],
            uploading: false,
            email: null,
            jsonObject: null,
            error: false
        })
        this.props.onCancel()
    }

    renderTitle = () => {
        const {preview, showResult, error} = this.state
        if (showResult){
            return 'Bulk Creation Results'
        }else if (preview){
            if (error){
                return 'Preview (Please fix those errors and upload again)'
            }else{
                return 'Preview'
            }
        } else return `Bulk ${titleCase(globalConstants.PENDANT_GENERIC)} Creation`
    }

    render() {
        const { open } = this.props
        const { uploading, preview, jsonObject, error, fileList, success, total, failures, showResult } = this.state

        const props = {
            accept: '.csv',
            multiple: false,
            onRemove: (file) => {
                this.setState(({ fileList }) => {
                    const index = fileList.indexOf(file)
                    const newFileList = fileList.slice()
                    newFileList.splice(index, 1)
                    return {
                        fileList: newFileList,
                    }
                })
            },
            beforeUpload: (file) => {
                this.setState(({ fileList }) => ({
                    fileList: [...fileList, file],
                }))
                return false
            },
            fileList: fileList,
        }

        return (
            <Modal
                destroyOnClose
                width={1100}
                okText={ preview ? uploading ? 'Uploading' : 'Start Upload' : 'Preview'}
                open={open} onCancel={this.onCancel}
                onOk={this.handleSubmit}
                okButtonProps={{ disabled: !preview && fileList.length === 0 || preview && error, loading:uploading }}
                centered={false} title={this.renderTitle()}
            >
                {preview ? <PreviewTable dataSource={jsonObject} /> :
                    showResult ? <ResultTable dataSource={failures} success={success} total={total}/> :
                        <Fragment>
                            <Form
                                ref={this.formRef}
                                labelCol= {{ span: 8 }}
                                wrapperCol={{ span: 16 }}
                                layout="vertical"
                                className="margin-bottom"
                            >
                                <FormItem label="Email" name="email" initialValue={this.props.email} rules={[{
                                    required: true, message: 'Please input Email!',
                                }]}>
                                    <Input />
                                </FormItem>
                                <Dragger {...props}>
                                    <p className="ant-upload-drag-icon">
                                        <InboxOutlined />
                                    </p>
                                    <p className="ant-upload-text">Drop a .csv or click to select a file to upload</p>
                                </Dragger>
                            </Form>
                            <Row>
                                <Link to="/files/Mass_creation_example.csv" target="_blank" download><Button type="primary">Download Example CSV</Button></Link>
                            </Row>
                        </Fragment>}
            </Modal>
        )
    }
}

export default BeaconUploadModal

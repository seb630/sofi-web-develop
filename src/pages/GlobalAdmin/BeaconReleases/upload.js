import { Component, createRef, useState } from 'react'
import { InboxOutlined } from '@ant-design/icons'
import { Input, message, Modal, Select, Upload, Form } from 'antd'
import { actions } from 'mirrorx'
import { globalConstants } from '@/_constants'

const FormItem = Form.Item
const Dragger = Upload.Dragger

class UploadModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fileList: [],
            uploading: false,
            value: '?',
        }
        this.formRef = createRef()
    }


    handleSubmit = (values) => {
        const { fileList } = this.state
        const formData = new FormData()
        fileList.forEach((file) => {
            formData.append('file', file)
        })
        formData.append('version', values.version)
        formData.append('name', values.name)
        formData.append('model', values.model)
        this.setState({
            uploading: true,
        })

        actions.release.createBeaconRelease(formData).then(() => {
            this.setState({
                fileList: [],
                uploading: false,
            })
            message.success('upload successfully.')
            this.props.onCancel()
        }, (error) => {
            this.setState({
                uploading: false,
            })
            message.error(globalConstants.WENT_WRONG + '(' + error.response.data.error + ')')
        })
    }

    handleChange = (event) => {
        console.log(event)
        this.setState({ value: event })
    };


    render() {
        const { open, onCancel, beaconModels } = this.props
        const { uploading, value } = this.state
        const beaconModelOptions = beaconModels && beaconModels.map(model => (
            <Select.Option key={model.value} value={model.value}>{model.name}</Select.Option>
        ))


        const props = {
            accept: value === 'ev04'? '.apk' : '.zip,.bin',
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
            fileList: this.state.fileList,
        }

        return (
            <Modal
                okText={uploading ? 'Uploading' : 'Start Upload'}
                open={open} onCancel={onCancel}
                onOk={() => {
                    this.formRef.current?.validateFields().then((values) => {
                        this.handleSubmit(values)
                    })
                }}
                okButtonProps={{ disabled: this.state.fileList.length === 0, loading: uploading }}
                centered={false} title="Create New Release" style={{ height: '500px' }}
            >
                <Form
                    ref={this.formRef}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    layout="vertical"

                >
                    <FormItem
                        label="Version"
                        name="version"
                        rules={[{
                            required: true, message: 'Please input version name!',
                        }]}
                    >
                        <Input />
                    </FormItem>
                    <FormItem
                        label="Name"
                        name="name"
                    >
                        <Input />
                    </FormItem>
                    <FormItem
                        label="Model"
                        name="model"
                        initialValue="ev07bl"
                        rules={[{ required: true, message: 'Please select the model!' }]}
                    >
                        <Select onChange={this.handleChange} >
                            {beaconModelOptions}
                        </Select>
                    </FormItem>
                    <Dragger {...props}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Drop a {value === 'ev04'? '.apk' : '.zip/.bin'} or click to select a file to upload</p>
                    </Dragger>
                </Form>
            </Modal>
        )
    }
}

export default UploadModal

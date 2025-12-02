import { Component } from 'react'
import { InboxOutlined } from '@ant-design/icons'
import { Form } from '@ant-design/compatible'
import { Input, message, Modal, Select, Upload } from 'antd'
import { actions } from 'mirrorx'
import { globalConstants } from '@/_constants'
import moment from 'moment'

const FormItem = Form.Item
const Option = Select.Option
const Dragger = Upload.Dragger

class UploadModal extends Component {
    state = {
        fileList:[],
        uploading: false,
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {

                const { fileList } = this.state
                const formData = new FormData()
                fileList.forEach((file) => {
                    formData.append('file', file)
                })
                formData.append('service-type',values.service_type)
                formData.append('version',values.version)
                formData.append('release-tag',values.release_tag)
                this.setState({
                    uploading: true,
                })

                actions.release.createRelease(formData).then(() => {
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
                    message.error(globalConstants.WENT_WRONG + '(' + error.response.data.message+')')
                })
            }
        })
    }

    render() {
        const { open, onCancel, form } = this.props
        const { getFieldDecorator } = form
        const { uploading } = this.state

        const props = {
            accept: '.zip',
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
                onOk={this.handleSubmit}
                okButtonProps={{ disabled:this.state.fileList.length === 0, loading:uploading }}
                centered={false} title="Create New Release"  style={{height: '500px'}}
            >
                <Form layout="inline">
                    <FormItem
                        label="Version"
                    >
                        {getFieldDecorator('version', {
                            rules: [{
                                required: true, message: 'Please input version name!',
                            },{
                                pattern: RegExp('[0-9]+'), message: 'Version should only contains number!',
                            }],
                            initialValue: moment().format('YYYYMMDDHHmm')
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        label="Release Tag"
                    >
                        {getFieldDecorator('release_tag', {
                            rules: [{
                                required: true, message: 'Please input release tag!',
                            }],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        label="Service Type"
                    >
                        {getFieldDecorator('service_type', {
                            rules: [{ required: true, message: 'Please select type!'}],
                        })(
                            <Select style={{ width: 150 }}>
                                <Option value="APP">APP</Option>
                                <Option value="UPDATER">UPDATER</Option>
                            </Select>
                        )}
                    </FormItem>
                    <Dragger {...props}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Drop a .zip or click to select a file to upload</p>
                    </Dragger>
                </Form>
            </Modal>
        )
    }
}

export default Form.create()(UploadModal)

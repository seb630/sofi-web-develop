import { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, message, Modal, Row, Space, Typography, Upload } from 'antd'
import { actions } from 'mirrorx'
import { InboxOutlined } from '@ant-design/icons'
import BeaconService from '@/services/Beacon'
import FileSaver from 'file-saver'

const SubmitNewModal = (props) => {
    const {open, onCancel, afterSubmit} = props
    const [fileList, setFileList] = useState([])
    const [loading, setLoading] = useState(false)

    const uploadProps ={
        multiple: false,
        onRemove: () => {
            setFileList([])
        },
        beforeUpload: (file) => {
            setFileList([file])
            return false
        },
        fileList: fileList,
    }

    const handleSubmit = () => {
        let payloadFormData = new FormData()
        payloadFormData.append('file',fileList[0])
        payloadFormData.append('type','B')
        setLoading(true)
        actions.sofiBeacon.bulkUploadBeacons(payloadFormData).then((res)=>{
            afterSubmit(res)
        }).catch(error=>
            message.error(error.error)
        ).finally(
            ()=>{
                setLoading(false)
            })
    }

    const renderFooter = () => {
        return [
            <Button onClick={onCancel} key="cancel">Cancel</Button>,
            <Button disabled={ fileList.length===0 } onClick={handleSubmit} type="primary" key="restart">Submit</Button>,
        ]
    }

    const handleGetSample = () => {
        return BeaconService.getBulkUploadSample('B').then(file => {
            FileSaver.saveAs(file, 'sample.xlsx')
        })
            .catch(error => { console.log(error)})
    }

    return <Modal
        width={600}
        open={open}
        onCancel={onCancel}
        title={'Submit new bulk onboarding'}
        confirmLoading={loading}
        bodyStyle={{marginBottom: 36}}
        footer={renderFooter()}
    >
        <Space direction="vertical">
            <Typography.Paragraph>
                <Typography.Text strong>Step 1: </Typography.Text>
                <a onClick={handleGetSample}>Download blank sample spreadsheet sheet</a><br/>
                <Typography.Text strong>Step 2: </Typography.Text>Fill it out<br/>
                <Typography.Text strong>Step 3: </Typography.Text>Upload it back here and submit<br/>
                <Typography.Text strong>Step 4: </Typography.Text>This window will close, and the spreadsheet will be validated<br/>
                <Typography.Text strong>Step 5: </Typography.Text>If valid a new window will appear asking you to apply your changes
            </Typography.Paragraph>
            <Row justify="center" style={{width: '100%'}}>
                <Upload.Dragger {...uploadProps}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Drop the filled in .xls/xlsx file or click to select a file to upload</p>
                </Upload.Dragger>
            </Row>
        </Space>
    </Modal>
}

SubmitNewModal.propTypes={
    open: PropTypes.bool,
    onCancel: PropTypes.func,
}

export default SubmitNewModal

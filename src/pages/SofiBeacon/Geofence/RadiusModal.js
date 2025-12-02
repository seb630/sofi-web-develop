import { Component } from 'react'
import { Form } from '@ant-design/compatible'
import { Input, Modal } from 'antd'
import PropTypes from 'prop-types'
import changeCase from 'change-case'

class RadiusModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    handleSave = () => {
        const {form, field, geofence} = this.props
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                if (field==='radius' && values[field]<50){
                    Modal.warning({
                        title: 'Hey, quick tip',
                        content : 'Quick note GPS is accurate to within 10 metres, we recommend that a geofence radius is 50 metres or larger'
                    })
                }else{
                    this.props.handleRadiusChange(geofence, values[field], field)
                }
            }
        })
    }

    render() {
        const {form, open,onClose,geofence,field } = this.props
        const { getFieldDecorator } = form

        return (<div>
            <Modal
                destroyOnClose
                open={open}
                onOk={this.handleSave}
                onCancel={onClose}
                width={450}
            >
                <Form
                    onSubmit={this.handleSave}
                    labelCol= {{xs: { span: 24 },sm: { span: 8 }}}
                    wrapperCol={{xs: { span: 24 }, sm: { span: 16 }}}
                >

                    <Form.Item
                        label={changeCase.titleCase(field)}
                    >
                        {getFieldDecorator(field, {
                            rules: [{ required: true, message: `Please input ${field}!`}],
                            initialValue: field==='name' ? geofence.name : geofence.config.shape.circle.radius
                        })(
                            <Input style={{ width: '220px' }} addonAfter={field==='radius' ? 'meters':null}/>
                        )}
                    </Form.Item>
                </Form>

            </Modal>
        </div>)
    }
}

const RadiusModalPage = Form.create({})(RadiusModal)

RadiusModalPage.propTypes={
    geofence: PropTypes.object.isRequired,
    open: PropTypes.bool,
    onClose: PropTypes.func,
    handleRadiusChange: PropTypes.func,
    field: PropTypes.string
}

export default RadiusModalPage

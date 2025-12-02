import { Component, Fragment } from 'react'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { Form } from '@ant-design/compatible'
import { Button, Card, Checkbox, Col, Input, InputNumber, message, Modal, Row, Switch, Typography, } from 'antd'
import UserService from '../../../../services/User'
import BraftEditor from 'braft-editor'
import 'braft-editor/dist/index.css'
import { globalConstants } from '@/_constants'

const FormItem = Form.Item
let id = 0

class EmailForm extends Component {

    state = {
        editorState: BraftEditor.createEditorState(),
    }

    handleChange = (editorState) => {
        this.setState({ editorState })
    }

    preview = () => {
        if (window.previewWindow) {
            window.previewWindow.close()
        }

        window.previewWindow = window.open()
        window.previewWindow.document.write(this.buildPreviewHtml())
        window.previewWindow.document.close()

    }

    buildPreviewHtml () {
        return `
      <!Doctype html>
      <html>
        <head>
          <title>Preview Content</title>
          <style>
            html,body{
              height: 100%;
              margin: 0;
              padding: 0;
              overflow: auto;
              background-color: #f1f2f3;
            }
            .container{
              box-sizing: border-box;
              width: 1000px;
              max-width: 100%;
              min-height: 100%;
              margin: 0 auto;
              padding: 30px 20px;
              overflow: hidden;
              background-color: #fff;
              border-right: solid 1px #eee;
              border-left: solid 1px #eee;
            }
            .container img,
            .container audio,
            .container video{
              max-width: 100%;
              height: auto;
            }
            .container p{
              white-space: pre-wrap;
              min-height: 1em;
            }
            .container pre{
              padding: 15px;
              background-color: #f1f1f1;
              border-radius: 5px;
            }
            .container blockquote{
              margin: 0;
              padding: 15px;
              background-color: #f1f1f1;
              border-left: 3px solid #d1d1d1;
            }
          </style>
        </head>
        <body>
          <div class="container">${this.state.editorState.toHTML()}</div>
        </body>
      </html>
    `
    }

    generatePayload = () => {
        let payload = {}
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                payload = {...values}
                payload.specific_excluded_emails = values.specific_excluded_emails?.map(key => values.names[key]).toString()
                payload.specific_included_emails = values.specific_included_email_keys?.map(key => values.names[key]).toString()
                payload.email_body = values.email_body.toHTML()
            }
        })
        return payload
    }

    handleSend = () => {
        const payload = this.generatePayload()
        UserService.postMassEmail(payload).then(() => {
            message.success('Email sent')
            this.props.form.resetFields()
        }, (error) => {
            message.error(error.message)
        })

    }

    handleSubmit = (e) => {
        e.preventDefault()
        const payload = this.generatePayload()
        UserService.previewMassEmail(payload).then((result) => {
            let content
            if (payload.specific_included_email_keys?.length>0) {
                let emails = payload.specific_included_email_keys?.map(key => payload.names[key])
                if (payload.specific_included_email_keys?.length>3){
                    emails = emails.slice(0,3)
                    content = `${emails.toString()},...`
                }else {
                    content = `${emails.toString()},`
                }
                content = emails.length === result.recipient_number? `${content}`
                    : `${content} as well as a total of ${result.recipient_number-emails.length} other users?`
            }else {
                content = `${result.recipient_number} users?`
            }
            Modal.confirm({
                title: 'Are you sure?',
                content: `Are you sure you want to send an email to ${content}`,
                onOk: this.handleSend,
                okText: 'Send',
                cancelText : 'Do not send'
            })
        }, (error) => {
            message.error(error.message)
        })
    }

    remove = (k, field) => {
        const { form } = this.props
        // can use data-binding to get
        const keys = form.getFieldValue(field)
        // We need at least one passenger
        if (keys.length === 0) {
            return
        }

        // can use data-binding to set
        form.setFieldsValue({
            [field]: keys.filter(key => key !== k),
        })
    }

    add = (field) => {
        const { form } = this.props
        // can use data-binding to get
        const keys = form.getFieldValue(field)
        const nextKeys = keys.concat(id++)
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
            [field]: nextKeys,
        })
    }

    renderExcludeItems = (form) => {
        const {getFieldDecorator, getFieldValue} = form
        getFieldDecorator('specific_excluded_emails', { initialValue: [] })
        const keys = getFieldValue('specific_excluded_emails')
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 },
            },
        }
        const formItemLayoutWithOutLabel = {
            wrapperCol: {
                xs: { span: 24, offset: 0 },
                sm: { span: 20, offset: 4 },
            },
        }
        const formItems = keys.map((k, index) => (
            <Form.Item
                {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                label={index === 0 ? 'Emails or Domains: ' : ''}
                required={false}
                key={k}
            >
                {getFieldDecorator(`names[${k}]`, {
                    validateTrigger: ['onChange', 'onBlur'],
                    rules: [
                        {
                            required: true,
                            whitespace: true,
                            message: 'Please input email or domain or delete this field.',
                        },
                    ],
                })(<Input placeholder="email or domain" style={{ width: '60%', marginRight: 8 }} />)}
                <MinusCircleOutlined
                    className="dynamic-delete-button"
                    onClick={() => this.remove(k,'specific_excluded_emails')} />

            </Form.Item>
        ))

        return (
            <Fragment>
                {formItems}
                <Form.Item {...formItemLayoutWithOutLabel}>
                    <Button type="dashed" onClick={()=>this.add('specific_excluded_emails')} style={{ width: '60%' }}>
                        <PlusOutlined /> Add field
                    </Button>
                </Form.Item>
            </Fragment>
        )
    }

    renderIncludeItems = (form) => {
        const {getFieldDecorator, getFieldValue} = form
        getFieldDecorator('specific_included_email_keys', { initialValue: [] })
        const keys = getFieldValue('specific_included_email_keys')
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 },
            },
        }
        const formItemLayoutWithOutLabel = {
            wrapperCol: {
                xs: { span: 24, offset: 0 },
                sm: { span: 20, offset: 4 },
            },
        }
        const formItems = keys.map((k, index) => (
            <Form.Item
                {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                label={index === 0 ? 'Emails: ' : ''}
                required={false}
                key={k}
            >
                {getFieldDecorator(`names[${k}]`, {
                    validateTrigger: ['onChange', 'onBlur'],
                    rules: [
                        {
                            required: true,
                            whitespace: true,
                            message: 'Please input email or delete this field.',
                        },
                    ],
                })(<Input placeholder="email address" style={{ width: '60%', marginRight: 8 }} />)}
                <MinusCircleOutlined
                    className="dynamic-delete-button"
                    onClick={() => this.remove(k,'specific_included_email_keys')} />

            </Form.Item>
        ))

        return (
            <Fragment>
                <p>
                    1. Should we send an email to specific people? (please type email addresses to be included regardless of if they meet criteria outline below)
                </p>
                {formItems}
                <Form.Item {...formItemLayoutWithOutLabel}>
                    <Button type="dashed" onClick={()=>this.add('specific_included_email_keys')} style={{ width: '60%' }}>
                        <PlusOutlined /> Add field
                    </Button>
                </Form.Item>
            </Fragment>
        )
    }

    selectOneOfCarerOption = (rule, value, callback) => {
        const form = this.props.form
        if (form.getFieldValue('carer') && !form.getFieldValue('include_user_who_is_hub_carer') && !form.getFieldValue('include_user_who_is_beacon_carer') &&
            !form.getFieldValue('include_user_who_is_not_carer')) {
            callback('You have to select at least one option for these 3 fields')
        } else {
            callback()
        }
    }

    handleCriteriaChange = value => {
        !value && this.props.form.setFieldsValue({
            verify: false,
            include_user_whose_email_verified: false,
            include_user_whose_email_not_verified: false,
            login: false,
            include_user_never_logged_in: false,
            include_user_ever_logged_in: false,
            include_user_ever_logged_in_with_in_period: null,
            carer: false,
            include_user_who_is_hub_carer: false,
            include_user_who_is_beacon_carer: false,
            include_user_who_is_not_carer: false,
            exclude: false,
        })
    }

    handleVerifyChange = value => {
        !value.target.checked && this.props.form.setFieldsValue({
            verify: false,
            include_user_whose_email_verified: false,
            include_user_whose_email_not_verified: false,
        })
    }

    handleLoginChange = value => {
        !value.target.checked && this.props.form.setFieldsValue({
            login: false,
            include_user_never_logged_in: false,
            include_user_ever_logged_in: false,
            include_user_ever_logged_in_with_in_period: null,
        })
    }

    handleCarerChange = value => {
        !value.target.checked && this.props.form.setFieldsValue({
            carer: false,
            include_user_who_is_hub_carer: false,
            include_user_who_is_beacon_carer: false,
            include_user_who_is_not_carer: false,
        })
    }

    render() {
        const { form } = this.props
        const { getFieldDecorator,getFieldValue } = form
        const excludeControls = [
            'letter-spacing',
            'line-height',
            'clear',
            'headings',
            'superscript',
            'subscript',
            'hr',
            'text-align',
            'media',
        ]

        const extendControls = [
            {
                key: 'custom-button',
                type: 'button',
                text: 'Preview',
                onClick: this.preview
            }
        ]

        return (
            <Card title="Email"
            >
                <Form layout="vertical" onSubmit={this.handleSubmit}>
                    <p>Who should we send the email to?</p>
                    {this.renderIncludeItems(form)}

                    <FormItem label="2. Should we also send email to people in the user base who meet specific criteria?">
                        {getFieldDecorator('criteria', {
                            valuePropName: 'checked',
                            initialValue: false
                        })(
                            <Switch onChange={this.handleCriteriaChange}/>
                        )}
                    </FormItem>

                    <Typography.Text disabled={!getFieldValue('criteria')}>
                        <p>Criteria, send email to users:</p>

                        <Row>
                            <Col xs={24} lg={12}>
                                <FormItem>
                                    {getFieldDecorator('verify', {
                                        valuePropName: 'checked',
                                        initialValue: false
                                    })(
                                        <Checkbox
                                            disabled={!getFieldValue('criteria')}
                                            onChange={this.handleVerifyChange}
                                        >Whose email address is:</Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={12} lg={6}>
                                <FormItem>
                                    {getFieldDecorator('include_user_whose_email_verified', {
                                        valuePropName: 'checked',
                                        initialValue: false
                                    })(
                                        <Checkbox disabled={!getFieldValue('verify')}>Verified</Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={12} lg={6}>
                                <FormItem>
                                    {getFieldDecorator('include_user_whose_email_not_verified', {
                                        valuePropName: 'checked',
                                        initialValue: false
                                    })(
                                        <Checkbox disabled={!getFieldValue('verify')}>Not verified</Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={24} lg={12}>
                                <FormItem>
                                    {getFieldDecorator('login', {
                                        valuePropName: 'checked',
                                        initialValue: false
                                    })(
                                        <Checkbox
                                            disabled={!getFieldValue('criteria')}
                                            onChange={this.handleLoginChange}
                                        >AND whose login state is:</Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={12} lg={6}>
                                <FormItem>
                                    {getFieldDecorator('include_user_never_logged_in', {
                                        valuePropName: 'checked',
                                        initialValue: false
                                    })(
                                        <Checkbox disabled={!getFieldValue('login')}>Never logged in before</Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={12} lg={6}>
                                <FormItem>
                                    {getFieldDecorator('include_user_ever_logged_in', {
                                        valuePropName: 'checked',
                                        initialValue: false
                                    })(
                                        <Checkbox disabled={!getFieldValue('login')}>Logged in within a specific amount of time</Checkbox>
                                    )}
                                </FormItem>
                                {getFieldValue('include_user_ever_logged_in') && <Form.Item>
                                    {
                                        getFieldDecorator('include_user_ever_logged_in_with_in_period', {
                                            initialValue: 14
                                        })(
                                            <InputNumber
                                                min={1}
                                                formatter={value => `${value}days`}
                                                parser={value => value.replace('days', '')}
                                            />
                                        )
                                    }
                                </Form.Item>
                                }
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={24} lg={9}>
                                <FormItem>
                                    {getFieldDecorator('carer', {
                                        valuePropName: 'checked',
                                        initialValue: false
                                    })(
                                        <Checkbox
                                            disabled={!getFieldValue('criteria')}
                                            onChange={this.handleCarerChange}
                                        >AND who care for:</Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={8} lg={5}>
                                <FormItem>
                                    {getFieldDecorator('include_user_who_is_hub_carer', {
                                        valuePropName: 'checked',
                                        initialValue: false,
                                        rules: [{validator: this.selectOneOfCarerOption}]

                                    })(
                                        <Checkbox disabled={!getFieldValue('carer')}>At least one {globalConstants.HUB_GENERIC}</Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={8} lg={5}>
                                <FormItem>
                                    {getFieldDecorator('include_user_who_is_beacon_carer', {
                                        valuePropName: 'checked',
                                        initialValue: false,
                                        rules: [{validator: this.selectOneOfCarerOption}]

                                    })(
                                        <Checkbox disabled={!getFieldValue('carer')}>At least one {globalConstants.PENDANT_GENERIC}</Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                            <Col xs={8} lg={5}>
                                <FormItem>
                                    {getFieldDecorator('include_user_who_is_not_carer', {
                                        valuePropName: 'checked',
                                        initialValue: false,
                                        rules: [{validator: this.selectOneOfCarerOption}]

                                    })(
                                        <Checkbox disabled={!getFieldValue('carer')}>Does not care for any devices</Checkbox>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>

                        <FormItem label="3. Should any email addresses or domains be avoided when sending emails? (Applied to selected users based on criteria outlined in step2)">
                            {getFieldDecorator('exclude', {
                                valuePropName: 'checked',
                                initialValue: false
                            })(
                                <Switch onChange={this.handleCriteriaChange} disabled={!getFieldValue('criteria')}/>
                            )}
                        </FormItem>
                        {getFieldValue('exclude') && this.renderExcludeItems(form)}
                    </Typography.Text>

                    <p>4. Email Content</p>
                    <FormItem label="Email sent from">
                        {getFieldDecorator('sent_from', {
                            rules: [
                                {
                                    required: true,
                                    message: 'Please input email sent from.',
                                },
                                {
                                    type: 'email', message: 'The input is not valid Email!',
                                },
                            ],
                            initialValue: 'support@sofihub.com'
                        })(
                            <Input disabled/>
                        )}
                    </FormItem>
                    <FormItem label="Email subject line">
                        {getFieldDecorator('email_subject', {
                            rules: [
                                {
                                    required: true,
                                    message: 'Please input email subject.',
                                },
                            ],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem label="Email contents (Supports text replacement! Example: Dear {firstname} will turn into Dear John)" >
                        {getFieldDecorator('email_body', {
                            validateTrigger: 'onBlur',
                            rules: [{
                                required: true,
                                validator: (_, value, callback) => {
                                    if (value.isEmpty()) {
                                        callback('Please input email body')
                                    } else {
                                        callback()
                                    }
                                }
                            }],
                        })(
                            <BraftEditor
                                placeholder="Please input email body"
                                language="en"
                                className="my-editor"
                                excludeControls={excludeControls}
                                extendControls={extendControls}
                                contentStyle={{height: 400}}
                                onChange={this.handleChange}
                            />
                        )}
                    </FormItem>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form>
            </Card>
        )
    }
}

export default Form.create()(EmailForm)

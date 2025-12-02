import { Form } from '@ant-design/compatible'
import { Checkbox, Modal } from 'antd'
import { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import TCTemplate from '../TCPage/Template'
import TCPage from '../TCPage'
import { globalConstants } from '@/_constants'
import TCModal from '@/components/TCModal/TCModal'

// class AcceptOrgModal extends Component {

//     constructor(props) {
//         super(props)
//         this.state={
//             consequenceScrollBottom: false,
//             TCScrollBottom: false,
//         }
//     }

//     checkCheckBox = (rule, value, callback) => {
//         if (!value) {
//             callback('Please agree the terms and conditions!')
//         } else {
//             callback()
//         }
//     }

//     handleSubmit = (e) => {
//         e.preventDefault()
//         this.props.form.validateFieldsAndScroll((err) => {
//             if (!err) {
//                 this.props.handleSubmit().then(()=>{
//                     this.setState({
//                         consequenceScrollBottom: false,
//                         TCScrollBottom: false,
//                     })
//                 })
//             }
//         })
//     }

//     render() {
//         const {orgName, form} = this.props
//         const { getFieldDecorator } = form
//         const {consequenceScrollBottom, TCScrollBottom} = this.state
//         const consequenceContent = <Fragment>
//             <p>Whilst you have the received an invite to join the organisation you may not have permission to accept or you may have received this invite in error. Please get in contact with an administrative staff who are a part of the organisation or an authorised representative to seek permission to accept this invitation.</p>
//             <p>When referring to an &quot;organisation&quot; we&#39;re specifically referring to &quot;{orgName}&quot; which if you accept
//                 this invitation you will join. When we refer to an &quot;organisational user&quot; or &quot;user&quot; we mean staff who
//                 are part of &quot;{orgName}&quot; on the SOFIHUB system currently as well as those who are being invited to join the
//                 SOFIHUB system as a member of the organisation &quot;{orgName}&quot;.
//             </p>
//             <p>If you accept this invitation to join the organisation you may be able to see the details you or others have provided to
//                 SOFIHUB including personal details of other users in your organisation, as well the data that the {globalConstants.HUB_SOFIHUB} and {globalConstants.BEACON_SOFIHUB}s have collected and sent to SOFIHUB, for example:
//             </p>
//             <ul>
//                 <li>Personal information about a resident or customer provided to SOFIHUB, including but not limited to: reminders and their contents, resident routine, resident location, resident details ect...</li>
//                 <li>Personal information collected by a {globalConstants.HUB_SOFIHUB}, such as movement around the home, the messages that have played and what was said in those messages, ect...</li>
//                 <li>Personal information collected by a {globalConstants.BEACON_SOFIHUB}, such as movement in and around the home as well as movement beyond the home, emergency contact names, emergency contact phone numbers, ect...</li>
//                 <li>- Personal information provided to SOFIHUB, about people who care for the {globalConstants.HUB_SOFIHUB} or {globalConstants.BEACON_SOFIHUB}s. These are not staff members but may be family, friends, neighbours, or others.</li>
//             </ul>
//             <p>You must keep this information private.</p>
//             <p>Additionally you may be able to:</p>
//             <ul>
//                 <li>See other users in your organisation, including some contact details</li>
//                 <li>Invite more users to your organisation</li>
//                 <li>Modify details, settings, or permissions within the organisation</li>
//                 <li>Remove users from the organisation</li>
//             </ul>
//             <p>You must also keep this information private. You must also always seek permission before you add or remove users from the organisation or make any other changes to the organisation. You must seek this permission from administrative staff or authorised representatives of the organisation.</p>
//             <p>Additionally before accepting this invitation a please read through our Terms and Conditions, and if you agree you can proceed to accept this invitation to join the organisation.</p>
//         </Fragment>
//         return <Modal
//             className="TCModal"
//             width={800}
//             zIndex={1060}
//             okText="OK"
//             open={this.props.modal} onCancel={()=>this.props.handleModalstate(false)}
//             onOk={(e)=>this.handleSubmit(e)}
//             centered={true} title={`Before you accept to be a part of ${orgName || 'this organisation'}...`}  destroyOnClose
//         >
//             <Form onSubmit={this.handleSubmit}>
//                 <p>Before you accept your invite to join the organisation there are some things you should know, and also you must read
//                     and agree to our Terms and Conditions.</p>
//                 <TCTemplate
//                     content = {consequenceContent}
//                     onScrollToBottom={()=>this.setState({consequenceScrollBottom:true})}
//                 />
//                 <Form.Item>
//                     {getFieldDecorator('consequence_agreement', {
//                         valuePropName: 'checked',
//                         rules: [
//                             { validator: this.checkCheckBox }
//                         ]
//                     })(
//                         <Checkbox disabled={!consequenceScrollBottom}>I agree {!consequenceScrollBottom && '(Keep scrolling & reading to unlock)'}</Checkbox>
//                     )}
//                 </Form.Item>
//                 <TCPage onScrollToBottom={()=>this.setState({TCScrollBottom:true})}/>
//                 <Form.Item>
//                     {getFieldDecorator('agreement', {
//                         valuePropName: 'checked',
//                         rules: [
//                             { validator: this.checkCheckBox }
//                         ]
//                     })(
//                         <Checkbox disabled={!TCScrollBottom}>I agree {!TCScrollBottom && '(Keep scrolling & reading to unlock)'}</Checkbox>
//                     )}
//                 </Form.Item>
//             </Form>
//         </Modal>
//     }
// }

const AcceptOrgModal = (props) => {
    const title = `Before you accept to be a part of ${props?.orgName || 'this organisation'}...`

    const head = <p>Before you accept your invite to join the organisation there are some things you should know, and also you must read 
        and agree to our Terms and Conditions.</p>

    return <TCModal {...props} title={title} head={head} />
}

AcceptOrgModal.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    modal: PropTypes.bool.isRequired,
    handleModalstate: PropTypes.func.isRequired,
    orgName: PropTypes.string,
}

export default AcceptOrgModal

import {Modal, Button, Card} from 'antd'
import './index.scss'

const TCTemplate  = (props) =>{

    const {content, open, onCancel} = props
    return (
        <Modal
            width={1000}
            open={open}
            onCancel={onCancel}
            className="margin-bottom"
            footer={[
                <Button key="back" onClick={onCancel} type="primary">
                        Close
                </Button>]}
        >
            <Card>
                <div className="inner-scroll-example">
                    <div dangerouslySetInnerHTML={{__html: content}} />
                </div>
            </Card>
        </Modal>
    )
}

export default TCTemplate

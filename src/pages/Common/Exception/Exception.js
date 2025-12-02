import { Component } from 'react'
import { Popover, Result } from 'antd'
import Exception from '../../../images/exception.png'

export default class ExceptionPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            open: false,
            code: props.location.state?.code || 500,
        }
    }

    handleOpenChange = open => {
        this.setState({ open })
    }

    handleContact = () => {
        window.open('https://www.sofihub.com/contact-us')
    }


    render () {
        return <Result
            icon={<img src={Exception} width={350}/>}
            subTitle={<Popover
                title="Why am I seeing this page?"
                trigger="click"
                open={this.state.open}
                onOpenChange={this.handleOpenChange}
                content={
                    <div>
                        <p>
                            You are seeing this page because you&#39;ve received an error response from our web server, with a code of {
                                this.state.code}.
                        </p>
                        <p>This normally means we are doing a small update and we&#39;ll be back up and running shortly. Try refreshing
                        your page in a minute or two.</p>
                        <p>Got questions? <a onClick={this.handleContact}>Click here</a> to see how you can get in touch.</p>
                    </div>
                }
            >
                <a>Why am I seeing this page?</a>
            </Popover>}
        />

    }
}

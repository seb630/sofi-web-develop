import { Component } from 'react'
import { Button, Result } from 'antd'
import { actions } from 'mirrorx'

export default class Exception404 extends Component {

    handleBack = () => {
        actions.routing.push('/deviceSelection')
    }

    render () {
        return <Result
            status="404"
            title="404"
            subTitle="Sorry, this page is not exist."
            extra={<Button type="primary" onClick={this.handleBack}>Back Home</Button>}
        />
    }
}

import { Component } from 'react'
import {Result, Button} from 'antd'
import {actions} from 'mirrorx'

export default class Exception403 extends Component {

    handleBack = () => {
        actions.routing.push('/deviceSelection')
    }

    render () {
        return <Result
            status="403"
            title="403"
            subTitle="Sorry, you are not authorized to access this page."
            extra={<Button type="primary" onClick={this.handleBack}>Back Home</Button>}
        />
    }
}

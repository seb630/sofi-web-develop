import { Component } from 'react'
import { IeOutlined } from '@ant-design/icons'
import { Result } from 'antd'
import {isIE} from 'react-device-detect'


export default class NotSupportedBrowser extends Component {

    handleContinue = () => {
        localStorage.setItem('browserWarning', true)
        window.location.reload()

    }
    render () {
        return isIE && !(localStorage && localStorage.getItem('browserWarning')) ?
            <div>
                <Result
                    icon={<IeOutlined style={{ color: '#51C6E1' }} />}
                    title={<div style={{ color: '#51C6E1' }}>Hey there Internet Explorer user!</div>}
                    subTitle={
                        <div>
                            <p>Just letting you know we don&#39;t fully support Internet Explorer, and certain features of our portal
                        will not work correctly if you continue using Internet Explorer.</p>
                            <p>If you&#39;re using Windows 10 please switch over to the built in Microsoft Edge browser.</p>
                            <p>If you&#39;re using an older version of Windows we recommend choosing a third party browser such as Google
                            Chrome or Mozilla Firefox.</p>
                            <p>If you understand that proceeding with Internet Explorer means certain features of our portal won&#39;t work
                            correctly you can <a onClick={this.handleContinue}>continue here</a>.</p>
                        </div>}
                />
            </div>
            :this.props.children
    }
}

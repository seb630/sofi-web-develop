import { Component } from 'react'
import { LeftOutlined } from '@ant-design/icons'
import { Button, Col, Divider, List, PageHeader, Row } from 'antd'
import { regionLink } from '@/utility/Common'
import Logo from '../../images/logo.svg'
import { retrieveJSONData, storeJSONData } from '@/utility/Storage'
import { globalConstants } from '@/_constants'
import CounterLoading from '../CounterLoading'

class RegionSelection extends Component {

    constructor(props) {
        super(props)
        this.state = {
            count: 0,
            loading: {
                open: false,
                value: 0,
                width: 300,
                type: 'line',
            },
            cancel: false,
            redirectUrl: null
        }
    }

    componentDidMount () {
        const hostname = window.location.hostname
        const key = retrieveJSONData('region')
        if (key && hostname.includes(globalConstants.AU_PRODUCTION_URL)){
            this.handleRedirect()
        }
    }

    handleMenuClick = (key) => {
        storeJSONData('region',key)
        window.location.href= regionLink[key]
    }

    onButtonClick = () => {
        this.setState({count: this.state.count+1})
    }

    cancelRedirect = () => {
        sessionStorage && sessionStorage.removeItem('region')
        localStorage && localStorage.removeItem('region')
        clearInterval(this.smsinterval)
        this.setState({
            loading : {
                ...this.state.loading,
                open: false
            },
            cancel: false
        })
    }


    handleRedirect = async () => {
        const key = retrieveJSONData('region')
        if (key){
            this.setState ({redirectUrl: regionLink[key]})
            await this.countDown(5000)
            if (!this.state.cancel) {
                window.location.href = regionLink[key]
            }
        }
    }

    countDown = (duration) => {
        return new Promise((resolve) => {
            let count = duration/100
            const distance = 100/count

            this.setState({
                loading: {
                    ...this.state.loading,
                    open: true,
                    value: this.state.loading.value + distance
                }
            })
            -- count
            this.smsinterval = setInterval(() => {
                if(count === 0) {
                    clearInterval(this.smsinterval)
                    this.setState({
                        loading: {
                            ...this.state.loading,
                            value: 0,
                            open: false
                        }
                    })
                    resolve()
                    return
                }

                this.setState({
                    loading: {
                        ...this.state.loading,
                        open: true,
                        value: this.state.loading.value + distance
                    }
                })
                --count
            },100)
        })
    }

    render() {
        const {loading, redirectUrl} = this.state
        const data = this.state.count>10 ? [
            {
                title: 'Australia',
                key: 'AU'
            },
            {
                title: 'New Zealand',
                key: 'NZ'
            },
            {
                title: 'AU-sofihub-develop',
                key: 'DEV'
            },
            {
                title: 'AU-sofihub-internal',
                key: 'INT'
            },
            {
                title: 'US-sofihub-production',
                key: 'US'
            },
        ] :[{
            title: 'Australia',
            key: 'AU'
        },
        {
            title: 'New Zealand',
            key: 'NZ'
        }]

        const message = <div>
            <Row justify="center" type="flex">
                Redirecting to {redirectUrl}
            </Row>
            <Row justify="center" type="flex">
                <Button onClick={this.cancelRedirect}>Cancel</Button>
            </Row>
        </div>

        return (
            <div id="loginPage" className="loginPage">
                <div className="loginPage-region-container">
                    <PageHeader
                        title={null}
                        onBack={() => window.location.href='https://www.sofihub.com'}
                        backIcon = {<span><LeftOutlined />  Back to sofihub.com</span>}
                    />
                    <Row className="loginPage-form__logo logo">
                        <Logo width={360} height={190}/>
                    </Row>
                    <Row justify="center" className="regionArea">
                        <Col xs={20} lg={10}>
                            <Divider style={{height: 4}}><span onClick={this.onButtonClick}>Choose your region:</span></Divider>
                            <Row>
                                <List
                                    style={{width: '100%'}}
                                    itemLayout="horizontal"
                                    size="large"
                                    dataSource={data}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                title={<a onClick={()=>this.handleMenuClick(item.key)}>{item.title}</a>}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Row>
                        </Col>
                    </Row>
                    <CounterLoading message={message} {...loading}/>
                </div>
            </div>
        )
    }
}

export default RegionSelection

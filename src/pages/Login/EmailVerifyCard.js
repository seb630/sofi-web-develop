import './LoginPage.scss'
import { Progress } from 'antd'

const EmailVerifyCard = (props) => {
    const hostname = window.location.hostname
    const isSofihub = hostname?.toLowerCase().includes('sofihub')

    const handleLogin = () => {
        props.handleLogin()
    }
    return(
        <div className="loginPage-form">
            <div align="center" className='margin-bottom'>
                <Progress type="circle" percent={100} strokeColor='#44AF86' style={{margin: '40px'}}/>
                <p className='success'>You&#39;ve successfully verified your email</p>
            </div>
            <div className='margin-bottom' align='center'>
                {isSofihub ? <>
                    <p><b>You can now return to the mobile app.</b></p>
                    <p className="desc">Didn&#39;t come from the mobile app? Go to the <a onClick={handleLogin}>login page</a> instead.</p>
                </>:<>
                    <p><b>You need to <a onClick={handleLogin}>login</a> to continue.</b></p>
                </>
                }
            </div>
        </div>
    )
}

export default EmailVerifyCard

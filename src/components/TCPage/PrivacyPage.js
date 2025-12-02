import './index.scss'
import TCTemplate from './Template'
import {useEffect, useState} from 'react'
import CommonService from '@/services/Common'

const PrivacyPage = (props) => {
    const [content, setContent] = useState('')
    const {open} = props
    useEffect(()=>{
        open && CommonService.getPrivacy().then(res=>{
            setContent(res.data)
        })
    }, [open])

    return (
        content ? <TCTemplate {...props} content={content} /> : <></>
    )
}

export default PrivacyPage

import './index.scss'
import TCTemplate from './Template'
import {useEffect, useState} from 'react'
import CommonService from '@/services/Common'

// https://gsuite.google.com/marketplace/app/docs_to_markdown/700168918607
// The link to convert DOCX file to HTML markdown.

const TCPage = (props) => {
    const [content, setContent] = useState('')
    const {open} = props
    useEffect(()=>{
        open && CommonService.getTC().then(res=>{
            setContent(res.data)
        })
    }, [open])

    return (
        content ? <TCTemplate {...props} content={content} /> : <></>
    )
}

export default TCPage


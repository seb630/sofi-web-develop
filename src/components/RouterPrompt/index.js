import { useCallback, useEffect, useState } from 'react'

import { Modal } from 'antd'

export function RouterPrompt(props) {
    const { when, onOK, onCancel, title, okText, cancelText, history, content } = props

    const [showPrompt, setShowPrompt] = useState(false)
    const [currentPath, setCurrentPath] = useState('')

    useEffect(() => {
        if (when) {
            history.block((prompt) => {
                setCurrentPath(prompt.pathname)
                setShowPrompt(true)
                return 'true'
            })
        } else {
            history.block(() => {})
        }

        return () => {
            history.block(() => {})
        }
    }, [history, when])

    const handleOK = useCallback(async () => {
        if (onOK) {
            const canRoute = await Promise.resolve(onOK())
            if (canRoute) {
                history.block(() => {})
                history.push(currentPath)
            }
        }
    }, [currentPath, history, onOK])

    const handleCancel = useCallback(async () => {
        if (onCancel) {
            const canRoute = await Promise.resolve(onCancel())
            if (canRoute) {
                history.block(() => {})
                history.push(currentPath)
            }
        }
        setShowPrompt(false)
    }, [currentPath, history, onCancel])

    return showPrompt ? (
        <Modal
            title={title}
            open={showPrompt}
            onOk={handleOK}
            okText={okText}
            okButtonProps={{type:'default'}}
            onCancel={handleCancel}
            cancelButtonProps={{type: 'primary'}}
            cancelText={cancelText}
            closable={true}
        >{content}
        </Modal>
    ) : null
}

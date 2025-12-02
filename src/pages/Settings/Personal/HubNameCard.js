import { useState } from 'react'
import { Button, Card, Input, Row } from 'antd'
import { actions } from 'mirrorx'
import { EditOutlined, SaveOutlined } from '@ant-design/icons'
import { globalConstants } from '@/_constants'

export const HubNameCard = (props) => {
    const [edit, setEdit] = useState(false)
    const [hubName, setHubName] = useState(props.selectedHub.display_name)
    const handleSave = () => {
        let payload = {
            display_name: hubName,
            hub_id: props.selectedHub.hub_id
        }
        actions.hub.updateHubName(payload)
    }
    const handleButton = () => {
        edit ? handleSave()  : setEdit(true)
    }
    const name = props.settings.resident_profile ? props.settings.resident_profile.first_name+' '+props.settings.resident_profile.last_name:null
    return (
        <Card
            title={`${globalConstants.HUB_SOFIHUB} Display Name`}>
            <Row align="middle" type="flex" justify="center">
                <Input
                    style={{width: 200}}
                    className="margin-bottom"
                    onChange={(e)=>setHubName(e.target.value)}
                    disabled={!edit}
                    value={hubName}
                />
                <Button
                    type="primary"
                    className="margin-bottom"
                    icon={edit ? <SaveOutlined /> : <EditOutlined />}
                    style={{marginLeft:'20px'}}
                    onClick={handleButton}
                    disabled={edit && hubName.length<1}
                >
                    {edit ? 'Save' : 'Edit' }
                </Button>

            </Row>
            {props.settings.resident_profile.first_name.includes('Default') || props.settings.resident_profile.last_name.includes('Default') ?
                <p>
                    This is what you and other carers will see when searching for this {globalConstants.HUB_SOFIHUB}. This name will appear in device selection menu and
                    on the dashboard. Sofihub suggests something like this &quot;John Smith&#39;s Hub&quot;
                </p>:
                <span>
                    This is what you and other carers will see when searching for this {globalConstants.HUB_SOFIHUB}. This name will appear in device selection menu and
                    on the dashboard. Sofihub suggests something like this &quot;{name}&#39;s Hub&quot;
                </span>

            }
        </Card>
    )
}

import { useState } from 'react'
import ProfileForm from './ProfileForm'

const OrgProfile = (props) => {
    const [dirty, setDirty] = useState(false)
    return <ProfileForm
        {...props}
        onFormChange={()=>setDirty(true)}
        isDirty={dirty}
        onSave={()=>setDirty(false)}
    />
}

export default OrgProfile

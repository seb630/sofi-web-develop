import { Component } from 'react'
import { DownOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Dropdown, Menu } from 'antd'
import TimeBasedReminderModal from './TimeBasedReminderModal'
import MedicationReminderModal from './MedicationReminderModal'
import OccupancyBasedReminderModal from './OccupancybasedReminderModal'

class AddReminder extends Component {
    constructor(props) {
        super(props)
        this.state = {
            timeBasedReminderModal: false,
            medicationReminderModal: false,
            occupancyBasedReminderModal: false

        }
    }

    handleTimeBasedReminderModal = state => {
        this.setState({ timeBasedReminderModal: state })
    }

    handleMedicationdReminderModal = state => {
        this.setState({ medicationReminderModal: state })
    }

    handleOccupancyBasedReminderModal = state => {
        this.setState({ occupancyBasedReminderModal: state })
    }

    createMenu = () => {
        return <Menu>
            <Menu.Item key="time" className="drpmenu" onClick={() => this.handleTimeBasedReminderModal(true)} >
                <span className="editUser">Time Based Reminder</span>
            </Menu.Item>
            <Menu.Item key="medication" className="drpmenu" onClick={() => this.handleMedicationdReminderModal(true)} >
                <span className="editUser">Medication Reminder</span>
            </Menu.Item>
            <Menu.Item key="occupancy" className="drpmenu" onClick={() => this.handleOccupancyBasedReminderModal(true)} >
                <span className="editUser">Occupancy Based Reminder</span>
            </Menu.Item>
        </Menu>
    }

    render() {

        return (
            <div style={{marginTop: 8}}>
                <Dropdown overlay={this.createMenu()} trigger={['click']}>
                    <Button style={{ marginLeft: 8 }} type="primary" icon={<PlusOutlined />} size='large'>
                        Add Reminder <DownOutlined />
                    </Button>
                </Dropdown>

                <TimeBasedReminderModal
                    open={this.state.timeBasedReminderModal}
                    onClose={() => this.handleTimeBasedReminderModal(false)}
                    hubId={this.props.hubId}
                />
                <MedicationReminderModal
                    open={this.state.medicationReminderModal}
                    onClose={() => this.handleMedicationdReminderModal(false)}
                    hubId={this.props.hubId}
                />
                <OccupancyBasedReminderModal
                    open={this.state.occupancyBasedReminderModal}
                    onClose={() => this.handleOccupancyBasedReminderModal(false)}
                    hubId={this.props.hubId}
                    speaker_spaces={this.props.speaker_spaces}
                />
            </div>
        )

    }
}

export default AddReminder

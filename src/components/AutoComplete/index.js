import { createRef, Component } from 'react'
import { Select, Spin } from 'antd'
import {debounce} from 'lodash'
const Option = Select.Option

export default class AutoComplete extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            value: [],
            fetching: false,
            disabled: false
        }
        this.fetchLocation = debounce(this.fetchLocation, 800)
        this.autocompleteService = new props.maps.places.AutocompleteService()
        this.sessionToken = new props.maps.places.AutocompleteSessionToken()

        this.geocoder = new props.maps.Geocoder()
        this.selection = createRef()
    }

    componentDidMount() {
        const {defaultValue} = this.props
        if (defaultValue && defaultValue.length > 0) {
            this.setState({value: defaultValue})
        }
    }

    fetchLocation = (value) => {
        const isShorterThanMinLength = value.length < this.props.minLength

        if (isShorterThanMinLength || value.length === 0) {
            return
        }

        let options = {
            sessionToken: this.sessionToken,
            input: value
        }

        const mapOptions = ['location', 'radius', 'bounds', 'types']
        mapOptions.forEach(option => {
            if (this.props[option]) {
                options[option] = this.props[option]
            }
        })

        this.setState({data: [], fetching: true}, () => {
            // Get suggested locations from google map.
            this.autocompleteService.getPlacePredictions(
                options,
                suggestsGoogle => {
                    const suggestions = suggestsGoogle || []
                    const data = suggestions.map(datum => {
                        return {
                            address: datum.description,
                            placeId: datum.place_id
                        }
                    })
                    this.setState({data, fetching: false})
                }
            )
        })
    }

    handleChange = (value) => {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this
        // Geocode the location using Google geocode API. In order to get location's latitude and longtitude.
        function promiseGeocode(singleSite) {
            return new Promise((resolve) => {

                that.geocoder.geocode(
                    {
                        placeId: singleSite.placeId,
                        //sessionToken: that.sessionToken
                    },
                    (results, status) => {
                        const newData = singleSite
                        if (status === that.props.maps.GeocoderStatus.OK) {
                            const gmaps = results[0],
                                location = gmaps.geometry.location

                            newData.gmaps = gmaps
                            newData.lat = location.lat()
                            newData.lng = location.lng()
                        }
                        resolve(newData)
                    }
                )
            })
        }
        // Wait for all locations to finish geocoding, and call onChange function in the end.
        value && promiseGeocode({placeId: value.key, address: value.label}).then(result => {
            that.props.onChange(result)
        })

        this.setState({
            value: value,
            data: [],
            fetching: false,
        })
    }

    clearValue = () => {
        // reset value
        this.setState({
            data: [],
            value: [],
            fetching: false,
            disabled: false
        }, this.props.onChange([]))
    }

    render() {
        const { fetching, data, value, disabled } = this.state
        const { placeholder } = this.props
        return (
            <div>
                <Select
                    ref={node => this.selection = node}
                    allowClear
                    showSearch
                    labelInValue
                    showArrow={false}
                    value={value}
                    disabled={disabled}
                    placeholder={placeholder}
                    notFoundContent={!disabled && (fetching ? <Spin size="small" /> : 'No result')}
                    filterOption={false}
                    onSearch={this.fetchLocation}
                    onChange={this.handleChange}
                    style={{width: '100%', marginRight: '10px'}}
                >
                    {data.map(d => <Option key={d.placeId}>{d.address}</Option>)}
                </Select>
            </div>
        )
    }
}

AutoComplete.defaultProps = {
    placeholder: 'Type and search for places',
    minLength: 3,
    multiple: false
}

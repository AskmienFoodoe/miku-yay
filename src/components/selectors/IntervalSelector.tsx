import React from 'react'
import { Dropdown, Label, DropdownProps } from 'semantic-ui-react'
import { Interval } from '../../common/enums'

const options = [
    { key: 'two', text: '2', value: Interval.Two },
    { key: 'one', text: '1', value: Interval.One },
    { key: 'half', text: '1/2', value: Interval.Half },
    { key: 'triplet', text: '1/3', value: Interval.Triplet },
    { key: 'quarter', text: '1/4', value: Interval.Quarter },
    { key: 'sixth', text: '1/6', value: Interval.Sixth },
    { key: 'eighth', text: '1/8', value: Interval.Eighth },
    { key: 'twelfth', text: '1/12', value: Interval.Twelfth },
    { key: 'sixteenth', text: '1/16', value: Interval.Sixteenth },
    { key: 'twentyfourth', text: '1/24', value: Interval.Twentyfourth },
    { key: 'thirtysecond', text: '1/32', value: Interval.Thirtysecond }
]

type propsType = {
    onIntervalChange: (interval: Interval) => void
}

type stateType = {
    interval: Interval
}

export default class IntervalSelector extends React.Component<propsType, stateType> {

    state = {
        interval: Interval.Quarter,
    }

    handleOptionChange = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        let newInterval = data.value as Interval
        this.setState({ interval: newInterval })
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType) {
        if (prevState.interval !== this.state.interval) {
            this.props.onIntervalChange(this.state.interval)
        }
    }

    render() {
        return (
            <>
                <Label style={{ fontSize: '16px' }}>
                    <Dropdown options={options} value={this.state.interval} onChange={this.handleOptionChange} />
                </Label>
            </>
        )
    }
}
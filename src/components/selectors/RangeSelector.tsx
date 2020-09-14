import React from 'react'
import { Dropdown, Label, Input, InputOnChangeData, Popup, DropdownItemProps } from 'semantic-ui-react'
import { RangeSelectorOption } from '../../common/enums'
import ChartContext from '../../contexts/ChartContext'
import deepEqual from 'deep-equal'

const options = [
    { key: 'note', text: 'Notes', value: RangeSelectorOption.Note },
    { key: 'beat', text: 'Beats', value: RangeSelectorOption.Beat },
    //{ key: 'prev', text: 'Prev', value: RangeSelectorOption.Prev }
]

const popups: {[key: string]: string} = {
    [RangeSelectorOption.Note]: `Selects all notes between the Nth and Mth notes (inclusive).`,
    [RangeSelectorOption.Beat]: `Selects all notes that fall within the provided beats (inclusive). The actual range of the interval selected is determined by the positions of the first and last notes.`
}

type propsType = {
    onRangeChange: (state: rangeSelectorState) => void
}

type stateType = {
    rangeSelectorText: string
}

type rangeSelectorState = {
    rangeSelectorOption: RangeSelectorOption,
    start: number,
    end: number
}

export default class RangeSelector extends React.Component<propsType, stateType | rangeSelectorState> {

    static contextType = ChartContext
    context!: React.ContextType<typeof ChartContext>

    state = {
        rangeSelectorOption: RangeSelectorOption.Note,
        rangeSelectorText: 'Notes',
        start: 0,
        end: 0
    }

    handleOptionChange = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: DropdownItemProps) => {
        this.setState({ rangeSelectorOption: data.value as RangeSelectorOption, rangeSelectorText: data.text })
    }

    handleStartChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        let startValue = +data.value
        if (this.state.rangeSelectorOption === RangeSelectorOption.Note) {
            startValue = Math.floor(startValue)
        }
        this.setState({ start: Math.max(startValue, 0) })
    }

    handleEndChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        let endValue = +data.value
        if (this.state.rangeSelectorOption === RangeSelectorOption.Note) {
            endValue = Math.floor(endValue)
        }
        this.setState({ end: Math.max(endValue, 0) })
    }

    fixEndtoStart = () => {
        if (this.state.start > this.state.end) {
            this.setState({ end: this.state.start })
        }
    }

    fixStarttoEnd = () => {
        if (this.state.start > this.state.end) {
            this.setState({ start: this.state.end })
        }
    }

    componentDidMount() {
        this.setState({ end: this.context.chart.numNotes })
    }

    componentDidUpdate(prevProps: propsType, prevState: rangeSelectorState) {
        if (!deepEqual(prevState, this.state, { strict: true })) {
            this.props.onRangeChange(this.state)
        }
    }

    renderDropdownOptions() {
        return options.map((option) => 
            <Popup key={option.key} on={['hover']} position='right center' mouseEnterDelay={400} content={popups[option.value]} trigger={
                <Dropdown.Item {...option} active={this.state.rangeSelectorOption === option.value} onClick={this.handleOptionChange}/>
            } />
        )
    }

    render() {
        return (
            <>
                <Label style={{ fontSize: '16px' }}>
                    <Dropdown text={this.state.rangeSelectorText}>
                        <Dropdown.Menu>
                            {this.renderDropdownOptions()}
                        </Dropdown.Menu>
                    </Dropdown>
                </Label>
                <Input
                    style={{ width: '80px' }}
                    type='number'
                    start={0}
                    min={0}
                    value={this.state.start}
                    onChange={this.handleStartChange}
                    onBlur={this.fixEndtoStart}
                />
                <Label style={{ fontSize: '16px' }} basic>to</Label>
                <Input
                    style={{ width: '80px' }}
                    type='number'
                    start={0}
                    min={0}
                    value={this.state.end}
                    onChange={this.handleEndChange}
                    onBlur={this.fixStarttoEnd}
                />
            </>
        )
    }
}

export type { rangeSelectorState }
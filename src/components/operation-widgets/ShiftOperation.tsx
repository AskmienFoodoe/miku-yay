import React from 'react'
import RangeSelector, { rangeSelectorState } from '../selectors/RangeSelector'
import { Form, Popup, CheckboxProps, Label, Input, Dropdown, InputOnChangeData, DropdownProps } from 'semantic-ui-react'
import { PlacementType, NoteLane, RangeSelectorOption } from '../../common/enums'
import { BoundChartOperation, convertRangeToBeatRange } from '../../common/operations'
import { OperationWidget } from '../../common/OperationWidget'
import { Chart } from '../../common/Chart'
import deepEqual from 'deep-equal'
import { Note } from '../../common/notes'

const options = [
    { key: 'left', text: 'Left', value: false },
    { key: 'right', text: 'Right', value: true },
]

type propsType = {
    updateBoundOperation: (boundOperation: BoundChartOperation) => void
}

type stateType = {
    rangeState: rangeSelectorState,
    numLanes: number,
    direction: boolean,
    wrap: boolean
}

export default class ShiftOperation extends React.Component<propsType, stateType> implements OperationWidget {

    state = {
        rangeState: {
            rangeSelectorOption: RangeSelectorOption.Note,
            start: 0,
            end: 0
        },
        numLanes: 0,
        direction: true,
        wrap: false
    }

    handleRangeChange = (rangeState: rangeSelectorState) => {
        this.setState({ rangeState: rangeState })
    }

    handleCheckboxChange = (event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
        this.setState({ wrap: !this.state.wrap })
    }

    handleNumLanesChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        this.setState({ numLanes: Math.floor(+data.value) })
    }

    handleDirectionChange = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        this.setState({ direction: data.value as boolean })
    }

    bindOperation = (rangeState: rangeSelectorState, numLanes: number, direction: boolean, wrap: boolean) => {
        return (chart: Chart) => {
            const { start, end } = convertRangeToBeatRange(chart, rangeState)
            const notesExcerpt = chart.cutNotesExcerpt(start, end)
            const notesStart = notesExcerpt.length ? notesExcerpt[0].beat : 0
            const shiftedNotes: Note[] = []
            notesExcerpt.forEach(note => {
                let newNote = Object.assign({}, note)
                let newLane = newNote.lane + (direction ? 1 : -1) * numLanes
                newLane = wrap ? (((newLane - 1) % 7) + 7) % 7 + 1 : newLane
                if (newLane > 0 && newLane < 8) {
                    newNote.lane = newLane as NoteLane
                    shiftedNotes.push(newNote)
                }
            })
            chart.addNotes(shiftedNotes, notesStart, PlacementType.Place)
            return chart
        }
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType) {
        if (!deepEqual(prevState, this.state, { strict: true })) {
            const { rangeState, numLanes, direction, wrap } = this.state
            this.props.updateBoundOperation(this.bindOperation(rangeState, numLanes, direction, wrap))
        }
    }

    render() {
        return (
            <Form.Input>
                <RangeSelector onRangeChange={this.handleRangeChange} />
                <Label style={{ fontSize: '16px' }} basic>by</Label>
                <Input
                    style={{ width: '70px' }}
                    type='number'
                    value={this.state.numLanes}
                    onChange={this.handleNumLanesChange}
                />
                <Label style={{ fontSize: '16px' }} basic>lanes to the</Label>
                <Popup on={['hover']} position='top center' mouseEnterDelay={600} trigger={
                    <Label style={{ fontSize: '16px' }}>
                        <Dropdown options={options} value={this.state.direction} onChange={this.handleDirectionChange} />
                    </Label>
                }>
                    You can also set a negative number of lanes to shift in the opposite direction.
                </Popup>
                <Label style={{ fontSize: '16px' }} basic>and</Label>
                <Popup on={['hover']} position='top center' mouseEnterDelay={550} trigger={
                    <Form.Checkbox
                        label='Wrap'
                        checked={this.state.wrap}
                        onChange={this.handleCheckboxChange}
                        style={{ marginTop: '10px', marginLeft: '5px' }}
                    />
                }>
                    When enabled, causes notes to wrap around to the other side if they would exceed the boundaries. By default, notes will <b style={{ fontVariant: 'small-caps' }}>exit this earth's atomosphere</b> when they surpass the boundaries.
                </Popup>
            </Form.Input>
        )
    }
}
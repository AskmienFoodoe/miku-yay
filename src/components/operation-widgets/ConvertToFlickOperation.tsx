import React from 'react'
import RangeSelector, { rangeSelectorState } from '../selectors/RangeSelector'
import { Form, Label, Popup, CheckboxProps } from 'semantic-ui-react'
import { PlacementType, NoteType, RangeSelectorOption } from '../../common/enums'
import { BoundChartOperation, convertRangeToBeatRange } from '../../common/operations'
import { OperationWidget } from '../../common/OperationWidget'
import { Chart } from '../../common/Chart'
import deepEqual from 'deep-equal'
import { SlideNote, SingleNote } from '../../common/notes'

type propsType = {
    updateBoundOperation: (boundOperation: BoundChartOperation) => void
}

type stateType = {
    rangeState: rangeSelectorState,
    checkedBoxes: boolean[]
}

export default class ConvertToFlickOperation extends React.Component<propsType, stateType> implements OperationWidget {

    state = {
        rangeState: {
            rangeSelectorOption: RangeSelectorOption.Note,
            start: 0,
            end: 0
        },
        checkedBoxes: [true, false, false]
    }

    handleRangeChange = (rangeState: rangeSelectorState) => {
        this.setState({ rangeState: rangeState })
    }

    handleCheckboxChange = (event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
        const newCheckedBoxes = [...this.state.checkedBoxes]
        newCheckedBoxes[data.value as number] = !newCheckedBoxes[data.value as number]
        if (newCheckedBoxes[2] === true) {
            newCheckedBoxes[0] = newCheckedBoxes[1] = true
        }
        this.setState({checkedBoxes: newCheckedBoxes})
    }

    bindOperation = (rangeState: rangeSelectorState) => {
        return (chart: Chart) => {
            const { start, end } = convertRangeToBeatRange(chart, rangeState)
            const notesExcerpt = chart.cutNotesExcerpt(start, end)
            const notesStart = notesExcerpt.length ? notesExcerpt[0].beat : 0
            const convertedNotes = notesExcerpt.map(note => {
                let newNote = Object.assign({}, note)
                if (newNote.note === NoteType.Single && this.state.checkedBoxes[0]) {
                    (newNote as SingleNote).skill = false
                    newNote.flick = true
                } else if (newNote.note === NoteType.Slide && (newNote as SlideNote).end && this.state.checkedBoxes[1]) {
                    newNote.flick = true
                }
                if (this.state.checkedBoxes[2]) {
                    newNote = new SingleNote(newNote)
                    newNote.flick = true
                }
                return newNote
            })
            chart.addNotes(convertedNotes, notesStart, PlacementType.Place)
            return chart
        }
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType) {
        if (!deepEqual(prevState, this.state, { strict: true })) {
            this.props.updateBoundOperation(this.bindOperation(this.state.rangeState))
        }
    }

    render() {
        return (
            <Form.Input>
                <RangeSelector onRangeChange={this.handleRangeChange} />
                <Label style={{ fontSize: '16px' }} basic>for</Label>
                <Form.Checkbox 
                    value={0} 
                    label='Taps' 
                    checked={this.state.checkedBoxes[0]} 
                    onChange={this.handleCheckboxChange} 
                    style={{ marginTop: '10px', marginLeft: '5px' }} 
                />
                <Form.Checkbox 
                    value={1} 
                    label='Slide Ends' 
                    checked={this.state.checkedBoxes[1]} 
                    onChange={this.handleCheckboxChange} 
                    style={{ marginTop: '10px' }} 
                />
                <Popup on={['hover']} position='top center' mouseEnterDelay={550} content='This is probably a mistake.' trigger={
                    <Form.Checkbox
                        value={2} 
                        label='Everything' 
                        checked={this.state.checkedBoxes[2]} 
                        onChange={this.handleCheckboxChange} 
                        style={{ marginTop: '10px' }}
                    />
                }/>
            </Form.Input>
        )
    }
}
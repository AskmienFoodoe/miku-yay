import React from 'react'
import deepEqual from 'deep-equal'
import { Label, Form, Input, InputOnChangeData, Popup, List, Icon } from 'semantic-ui-react'
import PlacementTypeSelector from '../selectors/PlacementTypeSelector'
import PositionSelector, { positionSelectorState } from '../selectors/PositionSelector'
import { PlacementType, PositionSelectorOption, Interval, NoteLane, SlideNotePos } from '../../common/enums'
import { BoundChartOperation, convertPositionToBeatPosition } from '../../common/operations'
import { OperationWidget } from '../../common/OperationWidget'
import { Chart } from '../../common/Chart'
import IntervalSelector from '../selectors/IntervalSelector'
import { SlideNote } from '../../common/notes'

const regex = /^[1-7](,[1-7]?|,[fe][1-7](?!,[fe][1-7]))*$/

type propsType = {
    updateBoundOperation: (boundOperation: BoundChartOperation) => void,
    pos: SlideNotePos
}

type stateType = {
    pattern: string,
    interval: Interval,
    length: number,
    positionState: positionSelectorState,
    placementType: PlacementType,
    editingPattern: boolean,
    error: boolean
}

export default class GenerateSlidePatternOperation extends React.Component<propsType, stateType> implements OperationWidget {

    state = {
        pattern: '',
        interval: Interval.Quarter,
        length: 2,
        positionState: {
            positionSelectorOption: PositionSelectorOption.Note,
            position: 0
        },
        placementType: PlacementType.Place,
        editingPattern: false,
        error: false
    }

    handlePatternChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        this.setState({ pattern: data.value, error: false })
    }

    handleIntervalChange = (interval: Interval) => {
        this.setState({ interval: interval })
    }

    handleLengthChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        this.setState({ length: Math.max(Math.floor(+data.value), 2) })
    }

    handlePlacementTypeChange = (placementType: PlacementType) => {
        this.setState({ placementType: placementType })
    }

    handlePositionChange = (positionState: positionSelectorState) => {
        this.setState({ positionState: positionState })
    }

    private generateNotePattern(pattern: string, interval: Interval): { notePattern: SlideNote[], offset: number } {
        if (!regex.exec(pattern)) {
            throw new Error('Invalid pattern!')
        }

        const notePattern: SlideNote[] = []
        let flick = false
        const pos = this.props.pos
        let end = false
        let beat = 0
        for (let i = 0; i < pattern.length; i++) {
            const char = pattern.charAt(i)
            switch (char) {
                case 'f':
                    flick = true
                    end = true
                    break
                case 'e':
                    end = true
                    break
                case ',':
                    beat += interval
                    break
                default:
                    const lane = parseInt(char) as NoteLane
                    notePattern.push(new SlideNote({ lane, beat, flick, pos, start: false, end }))
                    flick = false
                    end = false
            }
        }

        return { notePattern, offset: beat + interval }
    }

    bindOperation = (pattern: string, interval: Interval, length: number, positionState: positionSelectorState, placementType: PlacementType) => {
        try {
            let { notePattern, offset } = this.generateNotePattern(pattern, interval)

            if (notePattern.length === 0) {
                return (chart: Chart) => chart
            }

            const notesExcerpt: SlideNote[] = []
            for (let i = 0; i < length; i++) {
                const newNote = new SlideNote(notePattern[i % notePattern.length])
                newNote.beat += offset * Math.floor(i / notePattern.length)
                if (i === 0 || notesExcerpt[i - 1].end === true) {
                    newNote.start = true
                } else if (i === length - 1) {
                    newNote.end = true
                }
                notesExcerpt.push(newNote)
            }

            return (chart: Chart) => {
                const position = convertPositionToBeatPosition(chart, positionState)
                chart.addNotes(notesExcerpt, position, placementType)
                return chart
            }
        } catch (error) {
            this.setState({ error: true })
            return (chart: Chart) => chart
        }
    }

    componentDidUpdate(prevProps: propsType, prevState: stateType) {
        if (!deepEqual(prevState, this.state, { strict: true })) {
            const { pattern, interval, length, positionState, placementType } = this.state
            this.props.updateBoundOperation(this.bindOperation(pattern, interval, length, positionState, placementType))
        }
    }

    render() {
        return (
            <Form.Input>
                <Popup on={['hover']} position='top left' mouseEnterDelay={700} trigger={
                    <Input
                        style={{ width: this.state.editingPattern ? '127px' : '70px' }}
                        value={this.state.pattern}
                        icon={this.state.error ? 'warning circle' : ''}
                        onChange={this.handlePatternChange}
                        onFocus={(e: Event) => this.setState({ editingPattern: true })}
                        onBlur={(e: Event) => this.setState({ editingPattern: false })}
                    />
                }>
                    Generates a pattern based on the following rules:
                    <List bulleted>
                        <List.Item>
                            Placing the numbers 1-7 puts a slide tick in the respective lane. The first tick in a pattern is automatically set as a slide start.
                        </List.Item>
                        <List.Item>
                            Placing a comma (,) advances the beat based on the interval selected in the dropdown to the right. You can place mutiple in succession to create space in the pattern.
                            <List.List>
                                <List.Item>
                                    There is an 'implicit' comma at the end of the pattern, e.g. '4' will put a tick on every interval, but '4,' will put a tick on every other interval.
                                </List.Item>
                            </List.List>
                        </List.Item>
                        <List.Item>
                            Placing 'e' directly before a number will make that tick a slide end. Placing 'f' instead makes it a flick end. The following tick will automatically be set as a slide start, so <em>you cannot do this twice in a row</em>.
                        </List.Item>
                        <List.Item>
                            The last tick in a pattern will automatically be set as a slide end if it is not a slide start.
                        </List.Item>
                        <List.Item>
                            If you see this <Icon name='warning circle' /> icon, your pattern is invalid and the operation will no-op.
                        </List.Item>
                    </List>
                </Popup>
                <Label style={{ fontSize: '16px', display: this.state.editingPattern ? 'none' : undefined }} basic>per</Label>
                <IntervalSelector onIntervalChange={this.handleIntervalChange} />
                <Label style={{ fontSize: '16px' }} basic>beats for</Label>
                <Input style={{ width: '60px' }} value={this.state.length} type='number' min={2} onChange={this.handleLengthChange} />
                <Label style={{ fontSize: '16px' }} basic>notes &</Label>
                <PlacementTypeSelector onPlacementTypeChange={this.handlePlacementTypeChange} />
                <Label style={{ fontSize: '16px' }} basic>at</Label>
                <PositionSelector excludeRelative onPositionChange={this.handlePositionChange} />
            </Form.Input>
        )
    }
}
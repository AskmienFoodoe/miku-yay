import React from 'react'
import { Form, TextArea, Input, Dropdown, Label, DropdownProps, InputOnChangeData, Button, ButtonProps, Message, Dimmer, Loader } from 'semantic-ui-react'
import { Chart } from '../common/Chart'
import ChartContext from '../contexts/ChartContext'
import { client } from '../common/api'

const options = [
    { key: 'local', text: 'Local', value: 'local' },
    { key: 'bandori', text: 'Bandori (Official)', value: 'bandori' },
    { key: 'bestdori', text: 'Bestdori (Custom)', value: 'bestdori' }
]
const requestError = 'The chart specified could not be found. Double check if the ID is correct, or if the selected difficulty actually exists.'
const parsingError = 'The chart source is invalid and could not be parsed correctly.'

type propsType = {

}

type stateType = {
    inputChart: string
    source: string
    chartId: string
    difficulty: string
    loading: boolean
    errorMessage: string
}

export default class ChartInput extends React.Component<propsType, stateType> {

    static contextType = ChartContext
    context!: React.ContextType<typeof ChartContext>

    state = {
        inputChart: '',
        source: 'local',
        chartId: '',
        difficulty: 'expert',
        loading: false,
        errorMessage: ''
    }

    handleInputChange = (event: Event, { value }: { value: string }) => {
        this.setState({ inputChart: value })
    }

    handleChartIdChange = (event: React.SyntheticEvent<HTMLElement, Event>, data: InputOnChangeData) => {
        this.setState({ chartId: data.value })
    }

    handleDifficultyChange = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
        this.setState({ difficulty: data.difficulty }, this.getChartFromApi)
    }

    handleDropdownChange = (event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        const newSource = data.value
        let newChartId = ''
        if (newSource === 'bandori') {
            newChartId = '175'
        } else if (newSource === 'bestdori') {
            newChartId = '25400'
        }
        this.setState({ source: data.value as string, chartId: newChartId })
    }

    updateChartInContext = () => {
        try {
            let inputChartAsJson = JSON.parse(this.state.inputChart)
            let inputChartAsChart = new Chart(inputChartAsJson)
            this.context.updateChart(inputChartAsChart)
            this.setState({ errorMessage: '' })
        } catch (err) {
            this.setState({ errorMessage: parsingError })
        }
    }

    getChartFromApi = () => {
        this.setState({ loading: true }, async() => {
            const source = this.state.source
            try {
                let response, chart
                if (source === 'bandori') {
                    response = await client.get(`/songs/chart/${this.state.chartId}.${this.state.difficulty}.json`)
                    chart = response.data
                } else if (source === 'bestdori') {
                    response = await client.get(`/post/details?id=${this.state.chartId}`)
                    chart = response.data.post.notes
                }
                const newChart = new Chart(chart)
                this.setState({ inputChart: JSON.stringify(newChart.chartElements), errorMessage: '', loading: false }, this.updateChartInContext)
            } catch (err) {
                this.setState({ errorMessage: requestError, loading:false })
            }
        })
    }

    componentDidMount() {
        const chartElements = this.context.chart.chartElements
        if (chartElements.length) {
            this.setState({ inputChart: JSON.stringify(this.context.chart.chartElements) })
        }
    }

    renderChartSelector() {
        const source = this.state.source
        if (source === 'bandori') {
            return (
                <>
                    <Input type='number' label='Chart ID' value={this.state.chartId} onChange={this.handleChartIdChange} onBlur={this.getChartFromApi} style={{ width: '100px' }} />
                    <Button.Group style={{ display: 'block', marginTop: '10px' }}>
                        <Button content='E' difficulty='easy' color={this.state.difficulty === 'easy' ? 'blue' : undefined} onClick={this.handleDifficultyChange} />
                        <Button content='N' difficulty='normal' color={this.state.difficulty === 'normal' ? 'green' : undefined} onClick={this.handleDifficultyChange} />
                        <Button content='H' difficulty='hard' color={this.state.difficulty === 'hard' ? 'yellow' : undefined} onClick={this.handleDifficultyChange} />
                        <Button content='Ex' difficulty='expert' color={this.state.difficulty === 'expert' ? 'red' : undefined} onClick={this.handleDifficultyChange} />
                        <Button content='Sp' difficulty='special' color={this.state.difficulty === 'special' ? 'pink' : undefined} onClick={this.handleDifficultyChange} />
                    </Button.Group>
                    <Message warning header='Warning!' content='Charts where straight holds and slides overlap may not parse correctly because trying to figure out how to convert from Longs to Slides makes me want to go commit die' />
                </>
            )
        } else if (source === 'bestdori') {
            return (
                <Input type='number' label='Chart ID' value={this.state.chartId} onChange={this.handleChartIdChange} onBlur={this.getChartFromApi} style={{ width: '100px' }} />
            )
        } else {
            return undefined
        }
    }

    render() {
        return (
            <Form warning error={!!this.state.errorMessage.length}>
                <h5>Source</h5>
                <Dimmer inverted active={this.state.loading}>
                    <Loader size='massive' />
                </Dimmer>
                <Form.Field inline>
                    <Label style={{ fontSize: '16px' }}>
                        <Dropdown options={options} value={this.state.source} onChange={this.handleDropdownChange} />
                    </Label>
                    {this.renderChartSelector()}
                </Form.Field>
                <Form.Field
                    style={{ minHeight: '300px' }}
                    control={TextArea}
                    value={this.state.inputChart}
                    onChange={this.handleInputChange}
                    onBlur={this.updateChartInContext}
                    placeholder='Chart source code goes here...'
                    readOnly={this.state.source !== 'local'}
                    error={this.state.errorMessage === parsingError}
                />
                <Message error
                    header={`(ʘᗩʘ')`}
                    content={this.state.errorMessage}
                />
            </Form>
        )
    }
}
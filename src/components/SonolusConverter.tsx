import React from "react";
import { Form, Grid, Segment, TextArea, Icon, Button, ButtonProps } from "semantic-ui-react";
import options from '../constants/sonolus/options.json'
import { susToEntities } from "../common/sonolus/sus-to-entities";
import { compile } from "../common/sonolus/compiler";
import { script } from "../constants/sonolus/script";
import levelScript from '../constants/sonolus/script.json';

export default class SonolusConverter extends React.Component {

    state = {
        inputChart: '',
        level: '',
        options: '',
    }

    handleInputChange = (event: Event, { value }: { value: string }) => {
        this.setState({ inputChart: value })
    }

    handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
        try {
            const entities = susToEntities(this.state.inputChart)
            const level = compile(script, levelScript, entities)
            this.setState({ level: JSON.stringify(level), options: JSON.stringify(options) })
        } catch(err) {
            console.log(err)
        }
    }

    render() {
        return (
            <Form>
                <Grid columns={3} textAlign='center' style={{ height: '100vh', paddingLeft: '150px', paddingRight: '150px' }} verticalAlign='middle' centered>
                    <Grid.Column width={4} style={{ minWidth: '250px' }}>
                        <Segment style={{textAlign: 'center'}}>
                            <h3>Input</h3>
                            <Form.Field
                                style={{ minHeight: '814px' }}
                                control={TextArea}
                                value={this.state.inputChart}
                                onChange={this.handleInputChange}
                                placeholder='Chart source code goes here...'
                            />
                        </Segment>
                    </Grid.Column>
                    <Grid.Column width={2} style={{textAlign: 'center'}}>
                        <Button color='twitter' animated onClick={this.handleClick}>
                            <Button.Content hidden>
                                <Icon name='long arrow alternate right' />
                            </Button.Content>
                            <Button.Content visible>
                                Convert
                            </Button.Content>
                        </Button>
                    </Grid.Column>
                    <Grid.Column width={4} style={{ minWidth: '250px' }}>
                        <Segment style={{textAlign: 'center'}}>
                            <h3>Output</h3>
                            <Form.Field
                                style={{ minHeight: '400px' }}
                                control={TextArea}
                                readOnly
                                value={this.state.level}
                                placeholder='level.json appears here!'
                            />
                            <Form.Field
                                style={{ minHeight: '400px' }}
                                control={TextArea}
                                readOnly
                                value={this.state.options}
                                placeholder='options.json appears here!'
                            />
                        </Segment>
                    </Grid.Column>
                </Grid>
            </Form>
        )
    }
}

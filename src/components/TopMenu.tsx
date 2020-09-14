import React from "react";
import { Sticky, Menu, Icon, Modal } from "semantic-ui-react";
import { Link, useLocation } from "react-router-dom";
import { version } from "../../package.json"

export default function TopMenu() {
    return (
        <Sticky>
            <Menu size='massive'>
                <Menu.Item as={Link} to='/' content='.sus-to-Sonolus Converter' active={useLocation().pathname === '/'} />
                <Menu.Menu position='right'>
                    <Menu.Item>
                        <Modal size='small' trigger={
                            <Icon name='info circle' />
                        }>
                            <Modal.Header>About this App (v{version})</Modal.Header>
                            <Modal.Content>
                                <p>
                                    Open sourced on <a href='https://github.com/AskmienFoodoe/miku-yay' target='_blank' rel="noopener noreferrer">Github<Icon name='github'/></a>
                                </p>
                                <p>
                                    Developed by <a href='https://bit.ly/32QV2fl' target='_blank' rel="noopener noreferrer">AskmienFoodoe<Icon name='github'/></a>
                                </p>
                                <p>
                                    Conversion code from <a href='https://github.com/LeptailurusServal/sus2entities' target='_blank' rel="noopener noreferrer">https://github.com/LeptailurusServal/sus2entities</a>
                                </p>
                                <p>
                                    Engine code from <a href='https://github.com/LeptailurusServal/sonolus-psekai-engine' target='_blank' rel="noopener noreferrer">https://github.com/LeptailurusServal/sonolus-psekai-engine</a>
                                </p>
                                <p>
                                    Banner and icon by <a href='https://twitter.com/paiiart' target='_blank' rel="noopener noreferrer">@paiiart<Icon name='twitter'/></a>
                                </p>
                            </Modal.Content>
                        </Modal>
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
        </Sticky>
    )    
}
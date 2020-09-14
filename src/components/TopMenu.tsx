import React, { useContext } from "react";
import { Sticky, Menu, Icon, Checkbox, CheckboxProps, Modal, Image, Divider } from "semantic-ui-react";
import { Link, useLocation } from "react-router-dom";
import LocalStorageContext from "../contexts/LocalStorageContext";
import { version } from "../../package.json"

export default function TopMenu() {

    const context = useContext(LocalStorageContext)

    return (
        <Sticky>
            <Menu size='massive'>
                <Menu.Item as={Link} to='/' content='Charting Tools' active={useLocation().pathname === '/'} />
                <Menu.Item as={Link} to='/sonolus-converter' content='Bestdori-to-Sonolus Converter' active={useLocation().pathname === '/sonolus-converter'} />
                <Menu.Menu position='right'>
                    <Menu.Item>
                        <Checkbox 
                            toggle
                            checked={context.kokoro === 'true'}
                            label={context.kokoro === 'true' ? 'Kokoro ❤️' : 'Nokoro 💔'}
                            onChange={(event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {context.handleContextChange({kokoro: `${data.checked}`})}}
                        />
                    </Menu.Item>
                    <Menu.Item>
                        <Modal size='small' trigger={
                            <Icon name='info circle' />
                        }>
                            <Modal.Header>About this App (v{version})</Modal.Header>
                            <Modal.Content>
                                <p>
                                    Make charts at <a href='https://bestdori.com/community/charts' target='_blank' rel="noopener noreferrer">Bestdori</a> and play them with <a href='https://sonolus.com/' target='_blank' rel="noopener noreferrer">Sonolus</a>!
                                </p>
                                <p>
                                    This app was designed for 1920x1080 display. If any UI elements are going <em style={{fontVariant: 'small-caps'}}>funky time</em>, try zooming out the browser window. <del>also please don't use this app on mobile</del>
                                </p>
                                <Divider />
                                <p>
                                    Developed by <a href='https://bit.ly/32QV2fl' target='_blank' rel="noopener noreferrer">AskmienFoodoe<Icon name='github'/></a>
                                </p>
                                <p>
                                    Conversion code from <a href='https://github.com/NonSpicyBurrito/sonolus-bandori-engine' target='_blank' rel="noopener noreferrer">https://github.com/NonSpicyBurrito/sonolus-bandori-engine</a>
                                </p>
                                <p>
                                    Illustration by <a href='https://twitter.com/paiiart' target='_blank' rel="noopener noreferrer">@paiiart<Icon name='twitter'/></a>
                                </p>
                                <Image src='/fullversion.png' size='big'/>
                            </Modal.Content>
                        </Modal>
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
        </Sticky>
    )    
}
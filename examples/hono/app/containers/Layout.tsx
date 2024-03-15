/**
 * v0 by Vercel.
 * @see https://v0.dev/t/O6IsURMK8RL
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import React from 'react'
import Main from '../containers/Main'
import Sidebar from '../containers/Sidebar'
import Container from '../containers/Container'
import SidebarLinkButton from '../components/sidebar/SidebarLinkButton'
import SidebarIconButton from '../components/sidebar/SidebarIconButton'
import SidebarImgButton from '../components/sidebar/SidebarImgButton'

// icons
import BellIcon from '../components/icons/BellIcon'
import SearchIcon from '../components/icons/SearchIcon'
// import Header from '../containers/Header'
// import ToolbarForm from '../components/toolbar/ToolbarForm'
import SidebarItem from '../containers/SidebarItem'
interface LayoutProps {
        children: React.ReactNode
}

const Layout = (props: LayoutProps) => {
        const { children } = props
        return (
                <Container>
                        <Sidebar>
                                <SidebarItem>
                                        <SidebarLinkButton href="/">
                                                Home
                                        </SidebarLinkButton>
                                        <SidebarLinkButton href="/new">
                                                Creation
                                        </SidebarLinkButton>
                                        <SidebarLinkButton href="/">
                                                Follow
                                        </SidebarLinkButton>
                                        <SidebarLinkButton href="/">
                                                Settings
                                        </SidebarLinkButton>
                                </SidebarItem>
                                <SidebarItem>
                                        <SidebarIconButton Icon={SearchIcon}>
                                                SearchIcon
                                        </SidebarIconButton>
                                        <SidebarIconButton Icon={BellIcon}>
                                                Notifications
                                        </SidebarIconButton>
                                        <SidebarImgButton>
                                                Toggle user menu
                                        </SidebarImgButton>
                                </SidebarItem>
                        </Sidebar>
                        <Main>{children}</Main>
                </Container>
        )
}

export default Layout

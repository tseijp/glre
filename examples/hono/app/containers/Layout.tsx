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
import BellIcon from '../icons/BellIcon'
import SearchIcon from '../icons/SearchIcon'
import SidebarItem from '../containers/SidebarItem'
import MainItem from './MainItem'
import Toolbar from './Toolbar'
import ToolbarItem from './ToolbarItem'
import ToolbarIconButton from '../components/toolbar/ToolbarIconButton'
import HeartIcon from '../icons/HeartIcon'
import RepeatIcon from '../icons/RepeartIcon'
import MessageCircleIcon from '../icons/MessageCircleIcon'
import BookmarkIcon from '../icons/BookmarkIcon'

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
                        <Main>
                                <MainItem>{children}</MainItem>
                                <Toolbar>
                                        <ToolbarItem>
                                                <ToolbarIconButton
                                                        Icon={HeartIcon}
                                                >
                                                        Like
                                                </ToolbarIconButton>
                                                <ToolbarIconButton
                                                        Icon={RepeatIcon}
                                                >
                                                        Retweet
                                                </ToolbarIconButton>
                                                <ToolbarIconButton
                                                        Icon={MessageCircleIcon}
                                                >
                                                        Reply
                                                </ToolbarIconButton>
                                                <ToolbarIconButton
                                                        Icon={BookmarkIcon}
                                                >
                                                        Save
                                                </ToolbarIconButton>
                                        </ToolbarItem>
                                        {/* <ToolbarItem>
                                                <ToolbarForm />
                                        </ToolbarItem> */}
                                </Toolbar>
                        </Main>
                </Container>
        )
}

export default Layout

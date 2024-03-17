/**
 * v0 by Vercel.
 * @see https://v0.dev/t/O6IsURMK8RL
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import React from 'react'

// compontents
import SidebarLinkButton from './components/sidebar/SidebarLinkButton'
import SidebarIconButton from './components/sidebar/SidebarIconButton'
import SidebarImgButton from './components/sidebar/SidebarImgButton'
import SidebarArrowButton from './components/sidebar/SidebarArrowButton'
import ToolbarIconButton from './components/toolbar/ToolbarIconButton'

// containers
import Container from './containers/Container'
import MainFlex from './containers/MainFlex'
import MainItem from './containers/MainItem'
import SidebarItem from './containers/SidebarItem'
import ToolbarFlex from './containers/ToolbarFlex'
import ToolbarItem from './containers/ToolbarItem'
import SidebarFlex from './containers/SidebarFlex'

// icons
import ArrowIcon from './icons/ArrowIcon'
import BellIcon from './icons/BellIcon'
import BookmarkIcon from './icons/BookmarkIcon'
import SearchIcon from './icons/SearchIcon'
import HeartIcon from './icons/HeartIcon'
import RepeatIcon from './icons/RepeartIcon'
import MessageCircleIcon from './icons/MessageCircleIcon'

interface LayoutProps {
        children: React.ReactNode
}

const Layout = (props: LayoutProps) => {
        const { children } = props
        const sidebarRef = React.useRef<HTMLDivElement>(null)

        return (
                <Container>
                        <SidebarFlex ref={sidebarRef}>
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
                        </SidebarFlex>
                        <MainFlex>
                                <MainItem>{children}</MainItem>
                                <ToolbarFlex>
                                        <ToolbarItem>
                                                <ToolbarIconButton
                                                        Icon={HeartIcon}
                                                >
                                                        Like
                                                </ToolbarIconButton>
                                                <ToolbarIconButton
                                                        Icon={RepeatIcon}
                                                >
                                                        Share
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
                                </ToolbarFlex>
                        </MainFlex>
                        <SidebarArrowButton sidebarRef={sidebarRef}>
                                <ArrowIcon />
                        </SidebarArrowButton>
                </Container>
        )
}

export default Layout

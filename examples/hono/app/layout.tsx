/**
 * v0 by Vercel.
 * @see https://v0.dev/t/O6IsURMK8RL
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import React from 'react'

// compontents
import SidebarArrowButton from './components/SidebarArrowButton'
import SidebarCloseOverlay from './components/SidebarCloseOverlay'
import SidebarIconButton from './components/SidebarIconButton'
import SidebarImageButton from './components/SidebarImageButton'
import ToolbarIconButton from './components/ToolbarIconButton'
import SidebarLinkAnchor from './components/SidebarLinkAnchor'

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
import SidebarViewport from './components/SidebarViewport'

interface LayoutProps {
        children: React.ReactNode
}

const Layout = (props: LayoutProps) => {
        const { children } = props

        return (
                <Container>
                        <SidebarCloseOverlay />
                        <SidebarFlex>
                                <SidebarItem>
                                        <SidebarLinkAnchor href="/new">
                                                New Creation
                                        </SidebarLinkAnchor>
                                        <SidebarLinkAnchor href="/">
                                                Home
                                        </SidebarLinkAnchor>
                                        <SidebarLinkAnchor href="#">
                                                Follow
                                        </SidebarLinkAnchor>
                                        <SidebarLinkAnchor href="#">
                                                Settings
                                        </SidebarLinkAnchor>
                                </SidebarItem>
                                <SidebarItem>
                                        <SidebarIconButton Icon={SearchIcon}>
                                                SearchIcon
                                        </SidebarIconButton>
                                        <SidebarIconButton Icon={BellIcon}>
                                                Notifications
                                        </SidebarIconButton>
                                        <SidebarImageButton>
                                                Toggle user menu
                                        </SidebarImageButton>
                                </SidebarItem>
                                <SidebarViewport />
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
                        <SidebarArrowButton Icon={ArrowIcon} />
                </Container>
        )
}

export default Layout

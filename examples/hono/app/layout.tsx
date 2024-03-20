/**
 * v0 by Vercel.
 * @see https://v0.dev/t/O6IsURMK8RL
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import React from 'react'

// compontents
import Canvas from './components/Canvas'
import SidebarArrowButton from './components/SidebarArrowButton'
import SidebarCloseOverlay from './components/SidebarCloseOverlay'
import SidebarIconButton from './components/SidebarIconButton'
import SidebarImgButton from './components/SidebarImgButton'
import SidebarLinkButton from './components/SidebarLinkButton'
import ToolbarIconButton from './components/ToolbarIconButton'

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

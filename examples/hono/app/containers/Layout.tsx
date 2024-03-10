import React from 'react'
import HomeButton from '../components/header/HomeButton'
import Discover from '../components/sidebar/Discover'
import Follower from '../components/sidebar/Follower'
import Following from '../components/sidebar/Following'
import Settings from '../components/sidebar/Settings'
import Container from './Container'
import Header from './Header'
import Sidebar from './Sidebar'
import Main from './Main'
import EditButton from '../components/header/EditButton'

interface LayoutProps {
        children: React.ReactNode
        creationId?: string
}

const Layout = (props: LayoutProps) => {
        const { children, creationId } = props
        return (
                <Container>
                        <Header>
                                <HomeButton />
                                <EditButton
                                        link={
                                                creationId
                                                        ? `/hono/${creationId}/edit`
                                                        : '/new'
                                        }
                                        children={
                                                creationId
                                                        ? 'Edit'
                                                        : 'New Create'
                                        }
                                />
                        </Header>
                        <Sidebar>
                                <Discover />
                                <Follower />
                                <Following />
                                <Settings />
                        </Sidebar>
                        <Main>{children}</Main>
                </Container>
        )
}

export default Layout

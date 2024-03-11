import Layout from '../containers/Layout'
import MainItem from '../containers/MainItem'
import Viewport from '../components/Viewport'
import Toolbar from '../containers/Toolbar'
import ToolbarItem from '../containers/ToolbarItem'
import ToolbarIconButton from '../components/toolbar/ToolbarIconButton'
import HeartIcon from '../components/icons/HeartIcon'
import RepeatIcon from '../components/icons/RepeartIcon'
import MessageCircleIcon from '../components/icons/MessageCircleIcon'
import BookmarkIcon from '../components/icons/BookmarkIcon'

interface HomeProps {
        creationItems: any[]
}

const Home = (props: HomeProps) => {
        const { creationItems } = props
        return (
                <Layout>
                        <MainItem>
                                {creationItems?.map((item) => (
                                        <div key={item.id}>
                                                <Viewport
                                                        fragmentShader={
                                                                item.content
                                                        }
                                                />
                                                <a href={`/hono/${item.id}`}>
                                                        {item.title + ' '}
                                                        {item.created_at + ' '}
                                                </a>
                                        </div>
                                ))}
                        </MainItem>
                        <Toolbar>
                                <ToolbarItem>
                                        <ToolbarIconButton Icon={HeartIcon}>
                                                Like
                                        </ToolbarIconButton>
                                        <ToolbarIconButton Icon={RepeatIcon}>
                                                Retweet
                                        </ToolbarIconButton>
                                        <ToolbarIconButton
                                                Icon={MessageCircleIcon}
                                        >
                                                Reply
                                        </ToolbarIconButton>
                                        <ToolbarIconButton Icon={BookmarkIcon}>
                                                Save
                                        </ToolbarIconButton>
                                </ToolbarItem>
                                {/* <ToolbarItem>
                                                <ToolbarForm />
                                        </ToolbarItem> */}
                        </Toolbar>
                </Layout>
        )
}

export default Home

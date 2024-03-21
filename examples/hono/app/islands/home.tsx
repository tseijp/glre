import Layout from '../layout'
import HomeFlex from '../containers/HomeFlex'
import HomeItem from '../containers/HomeItem'
import HomeViewport from '../components/HomeViewport'
import HomeImageButton from '../components/HomeImageButton'
import HomeLinkAnchor from '../components/HomeLinkAnchor'
// import HomeViewportTitle from '../componets/HomeViewportTitle'

interface HomeProps {
        creationItems: any[]
}

const Home = (props: HomeProps) => {
        const { creationItems } = props

        return (
                <Layout>
                        <HomeFlex>
                                {creationItems?.map((item) => (
                                        <HomeItem key={item.id}>
                                                <HomeViewport
                                                        fragmentShader={
                                                                item.content
                                                        }
                                                >
                                                        <HomeImageButton />
                                                        <HomeLinkAnchor
                                                                href={`hono/${item.id}`}
                                                        >
                                                                HELLO WORLD
                                                        </HomeLinkAnchor>
                                                </HomeViewport>
                                        </HomeItem>
                                ))}
                        </HomeFlex>
                </Layout>
        )
}

export default Home

import Layout from '../layout'
import HomeFlex from '../containers/HomeFlex'
import HomeItem from '../containers/HomeItem'
import HomeViewport from '../components/HomeViewport'
import HomeImage from '../components/HomeImage'
import HomeAnchor from '../components/HomeAnchor'
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
                                                        <HomeImage />
                                                        <HomeAnchor
                                                                href={`hono/${item.id}`}
                                                        >
                                                                HELLO WORLD
                                                        </HomeAnchor>
                                                </HomeViewport>
                                        </HomeItem>
                                ))}
                        </HomeFlex>
                </Layout>
        )
}

export default Home

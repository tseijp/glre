import Layout from '../layout'
import Footer from '../components/Footer'
import HomeFlex from '../containers/HomeFlex'
import HomeItem from '../containers/HomeItem'
import HomeViewport from '../components/HomeViewport'
import HomeImgButton from '../components/HomeImgButton.tsx'
import HomeLinkButton from '../components/HomeLinkButton'
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
                                                        <HomeImgButton />
                                                        <HomeLinkButton>
                                                                HELLO WORLD
                                                        </HomeLinkButton>
                                                </HomeViewport>
                                        </HomeItem>
                                ))}
                                <Footer />
                        </HomeFlex>
                </Layout>
        )
}

export default Home

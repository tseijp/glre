import Layout from '../layout'
import Footer from '../components/Footer'
import HomeViewport from '../components/HomeViewport'

interface HomeProps {
        creationItems: any[]
}

const Home = (props: HomeProps) => {
        const { creationItems } = props
        return (
                <Layout>
                        {creationItems?.map((item) => (
                                // <HomeViewport
                                //         key={item.id}
                                //         fragmentShader={item.content}
                                // />
                                <div key={item.id}>
                                        <HomeViewport
                                                fragmentShader={item.content}
                                        />
                                        <a href={`/hono/${item.id}`}>
                                                {item.title + ' '}
                                                {item.created_at + ' '}
                                        </a>
                                </div>
                        ))}
                        <Footer />
                </Layout>
        )
}

export default Home

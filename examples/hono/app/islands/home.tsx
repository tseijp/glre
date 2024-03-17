import Layout from '../layout'
import Viewport from '../components/Viewport'

interface HomeProps {
        creationItems: any[]
}

const Home = (props: HomeProps) => {
        const { creationItems } = props
        return (
                <Layout>
                        {creationItems?.map((item) => (
                                <div key={item.id}>
                                        <Viewport
                                                fragmentShader={item.content}
                                        />
                                        <a href={`/hono/${item.id}`}>
                                                {item.title + ' '}
                                                {item.created_at + ' '}
                                        </a>
                                </div>
                        ))}
                </Layout>
        )
}

export default Home

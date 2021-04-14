import { Button, Layout } from "antd";
import { ContentType } from "./App";

const { Header, Footer, Content } = Layout;

interface HomeProps {
    setContentType: (contentType: ContentType) => void;
}

export function Home(props: HomeProps) {
    return (
        <Layout className="App fill-height">
            <Header>
                <span style={{ color: '#ffffff' }}>Custom Q&amp;A</span>
            </Header>
            
            <Content className="App-content">
                <Button 
                    className="button" 
                    size="large" 
                    type="primary"
                    onClick={ props.setContentType.bind(null, "excise") }
                >开始练习</Button>
                
                <Button 
                    className="button" 
                    size="large"
                    onClick={ props.setContentType.bind(null, "editor") }
                >编写题本</Button>
            </Content>
        <Footer>Footer</Footer>
      </Layout>
    )
} 
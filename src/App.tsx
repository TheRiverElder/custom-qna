import React from 'react';
import './App.css';
import { Layout } from 'antd';
import { Home } from './Home';
import Editor from './Editor';

const { Header, Footer, Sider, Content } = Layout;

interface AppProp { }

type ContentType = "home" | "editor" | "excise";

interface AppState {
  content: ContentType;
}


class App extends React.Component<AppProp, AppState> {

  constructor(props: any) {
    super(props);
    this.state = { content: "home" };
  }

  setContentType(contentType: ContentType) {
    this.setState({ content: contentType });
  }

  render() {
    let content = null;
    switch(this.state.content) {
      case "home": content = (<Home setContentType={ this.setContentType.bind(this) }/>); break;
      case "editor": content = (<Editor/>); break;
      case "excise": content = null; break;
    }
    return content;
  }

}

export default App;

export type {
  ContentType,
}

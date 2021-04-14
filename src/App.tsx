import React from 'react';
import './App.css';
import { Home } from './Home';
import Editor from './Editor';
import Excise from './Excise';
import { createTestQnaSet } from './test-utils';

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
      case "editor": content = (<Editor gotoHome={ () => this.setState({ content: "home" })}/>); break;
      case "excise": content = (<Excise gotoHome={ () => this.setState({ content: "home" })} set={ createTestQnaSet(20) } />); break;
    }
    return content;
  }

}

export default App;

export type {
  ContentType,
}

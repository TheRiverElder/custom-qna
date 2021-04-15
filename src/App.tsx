import React from 'react';
import './App.css';
import Home, { DataModifier } from './Home';
import Editor from './Editor';
import Excise from './Excise';
import { QnaSet, QnaSetInfo, UserProgress, UserProgressInfo } from './interfaces';
import { 
  extractQnaSetInfo, 
  extractUserProgressInfo,
  addQnaSet,
  addUserProgress,
  getQnaSet,
  getUserProgress,
  removeQnaSet,
  removeUserProgress,
  getLoadedQnaSets,
  getLoadedUserProgresses,
  loadInfo,
} from './utils/data-manager';
import ErrorPanel from './ErrorPanel';

interface AppProp { }

type ContentType = "home" | "editor" | "excise";

interface AppState {
  content: ContentType;
  sets: Array<QnaSetInfo>;
  progresses: Array<UserProgressInfo>;
  editQnaSet: QnaSet | null;
  runProgress: UserProgress | null;
}


class App extends React.Component<AppProp, AppState> implements DataModifier {

  constructor(props: any) {
    super(props);

    const info = loadInfo();

    this.state = { 
      content: "home",
      sets: info.sets,
      progresses: info.progresses,
      editQnaSet: null,
      runProgress: null,
    };
  }

  addQnaSet(set: QnaSet, thenEdit: boolean = true): void {
    if (this.state.sets.find(s => s.qsuid === set.qsuid)) return;
    addQnaSet(set);
    const newState = { 
      sets: this.state.sets.slice().concat(extractQnaSetInfo(set)),
      content: thenEdit ? "editor" : this.state.content,
      editQnaSet: thenEdit ? set : null,
    };
    this.setState(newState);
  }

  removeQnaSet(set: QnaSetInfo): void {
    removeQnaSet(set.qsuid);
    const newSets = this.state.sets.slice();
    const index = newSets.findIndex(s => s.qsuid === set.qsuid);
    if (index >= 0) {
      newSets.splice(index, 1);
      this.setState({ sets: newSets });
    }
  }

  editQnaSet(set: QnaSetInfo): void {
    if (set) {
      this.setState({
        content: "editor",
        editQnaSet: getQnaSet(set.qsuid) || null,
      });
    }
  }

  addProgress(progress: UserProgress, thenStart?: boolean | undefined): void {
    if (this.state.progresses.find(p => p.upuid === progress.upuid)) return;
    addUserProgress(progress);
    const pi = extractUserProgressInfo(progress);
    this.setState({
      progresses: this.state.progresses.concat(pi),
      content: thenStart ? "excise" : this.state.content,
      runProgress: thenStart ? progress : null,
    });
  }
  
  removeProgress(progress: UserProgressInfo): void {
    removeUserProgress(progress.upuid);
    const newProgresses = this.state.progresses.slice();
    const index = newProgresses.findIndex(p => p.upuid === progress.upuid);
    if (index >= 0) {
      newProgresses.splice(index, 1);
      this.setState({ progresses: newProgresses });
    }
  }

  continueProgress(progress: UserProgressInfo): void {
    this.setState({
      content: "excise",
      runProgress: getUserProgress(progress.upuid),
    });
  }

  setContentType(contentType: ContentType) {
    this.setState({ content: contentType });
  }

  resetProgressWork(progressInfo: UserProgressInfo): void {
    const progress = getUserProgress(progressInfo.upuid);
    
    if (progress) {
      progress.hasWork = false;
      progress.work = [];
      progress.workCompleteCount = 0;

      progressInfo.qsuid = progress.qsuid;
      progressInfo.finishedCount = progress.finished.length;
      progressInfo.hasWork = !!progress.work && progress.work.length > 0;
      progressInfo.date = progress.date;
      progressInfo.lastModified = progress.date || 0;
      progressInfo.workCompleteCount = progress.workCompleteCount;

      this.setState({
        content: "excise",
        runProgress: progress,
      });
    }
  }

  gotoHome = () => {
    getLoadedQnaSets().forEach(set => {
      const setInfo = this.state.sets.find(s => s.qsuid === set.qsuid);
      if (setInfo) {
        setInfo.name = set.name;
        setInfo.version = set.version;
        setInfo.itemCount = set.items.length;
        setInfo.description = set.description;
      } else {
        this.state.sets.push(extractQnaSetInfo(set));
      }
    });
    getLoadedUserProgresses().forEach(progress => {
      const progressInfo = this.state.progresses.find(p => p.upuid === progress.upuid);
      if (progressInfo) {
        progressInfo.qsuid = progress.qsuid;
        progressInfo.finishedCount = progress.finished.length;
        progressInfo.hasWork = !!progress.work && progress.work.length > 0;
        progressInfo.date = progress.date;
        progressInfo.lastModified = progress.date || 0;
        progressInfo.workCompleteCount = progress.workCompleteCount;
      } else {
        this.state.progresses.push(extractUserProgressInfo(progress));
      }
    });
    this.setState({ content: "home" });
  };

  render() {

    let content = null;
    switch(this.state.content) {
      case "home": content = (
        <Home 
          dataModifier={ this }
          progresses={ this.state.progresses }
          sets={ this.state.sets }
        />
      ); break;
      case "editor": {
        const set = this.state.editQnaSet;
        if (!set) return this.renderError("未知题集");
        content = (
          <Editor 
            set={ set }
            gotoHome={ this.gotoHome }
          />
        ); 
      }; break;
      case "excise": {
        const progress = this.state.runProgress;
        if (!progress) return this.renderError("未知进度");
        const set = getQnaSet(progress.qsuid);
        if (!set) return this.renderError("未知题集：" + progress.qsuid);

        content = (
          <Excise 
            gotoHome={ this.gotoHome } 
            set={ set } 
            progress={ progress }
          />
        );
      }; break;
    }
    return content;
  }

  renderError(error: string) {
    return (
      <ErrorPanel 
        error={ error } 
        gotoHome={ this.gotoHome } 
      />
    );
  }

}

export default App;

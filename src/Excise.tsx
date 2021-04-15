import { Typography, Space, Divider, Button, ButtonProps, Layout } from "antd";
import React, { ReactNode } from "react";
import { QnaItem, QnaSet, UserProgress } from "./interfaces";
import { LeftOutlined } from '@ant-design/icons';
import { randomItems } from "./utils/math-utils";
import ReactMarkdown from "react-markdown";

const { Text, Title } = Typography;

interface ExceiseProps {
    set: QnaSet;
    progress: UserProgress;
    gotoHome: () => void;
}

interface ExceiseState {
    finished: Set<number>;
    work: Array<QnaItem>;
    index: number;
    success: boolean,
    prog: number;
    allFinished: boolean,
}

const QUESTION_SHOWN = 0;
const HINT_SHOWN = 1;
const ANSWER_SHOWN = 2;

function isToday(date: Date) {
    const today = new Date();
    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
}

// 根据当前进度，决定今日任务
// 若有剩余进度则还原，若无则从旧知识点，则分别从已完成与未完成的项目中选取
function decideWork(set: QnaSet, progress: UserProgress, newWorkSize: number = 10, oldWorkSize: number = 10): Array<QnaItem> {
    if (progress && 
        progress.hasWork && progress.work && progress.work.length > 0 && 
        progress.date && isToday(new Date(progress.date))
    ) {
        const map: Map<number, QnaItem> = new Map(set.items.map(item => [item.quid, item]));
        return progress.work.map(w => map.get(w)).filter(w => !!w) as Array<QnaItem>;
    } else {
        const finishedQuids: Set<number> = new Set<number>(progress?.finished || []);
        const unfinishedItems: Array<QnaItem> = [];
        const finishedItems: Array<QnaItem> = [];
        
        for (let item of set.items) {
            (finishedQuids.has(item.quid) ? finishedItems : unfinishedItems).push(item);
        }

        const oldWork = randomItems(finishedItems, oldWorkSize);
        const newWork = randomItems(unfinishedItems, newWorkSize);
        return oldWork.concat(...newWork);
    }
}


export default class Excise extends React.Component<ExceiseProps, ExceiseState> {

    constructor(props: ExceiseProps) {
        super(props);

        const progress = props.progress;

        const work = decideWork(props.set, progress);
        const index = progress.workCompleteCount || 0;
        
        progress.date = Date.now();
        progress.hasWork = true;
        progress.work = work.map(i => i.quid);
        progress.workCompleteCount = index;

        this.state = {
            finished: new Set(),
            work,
            index,
            success: false,
            prog: QUESTION_SHOWN,
            allFinished: index >= work.length,
        };
    }


    render() {
        let content: ReactNode;

        const buttonProps: ButtonProps = {
            size: "large",
            shape: "round",
            block: true,
        };

        if (this.state.allFinished) {
            content = (
                <div className="centerize-container fill-height">
                    <Space direction="vertical">
                        <Title>{ this.props.progress.finished.length >= this.props.set.items.length ? "该题集已全部答完" : "今日任务完成！"}</Title>

                        <Button {...buttonProps} type="primary" onClick={ this.props.gotoHome }>返回</Button>
                    </Space>
                </div>
            )
        } else {
            const ci = this.state.work[this.state.index];
            if (!ci) {
                content = (<div className="centerize-container fill-height">Something goes wrong</div>);
            } else {

                content = (
                    <div className="d-flex flex-column fill-height">
                        <Title className="question" level={3} style={{ color: "#595959", marginTop: ".5em" }}>{ ci.question }</Title>
                    
                        <Divider />

                        <div className="flex-1 scroll-y">
                            { this.state.prog >= ANSWER_SHOWN ? (<ReactMarkdown children={ ci.answer } />) : null }

                            { this.state.prog >= HINT_SHOWN ? (<Text type="secondary" style={{ fontStyle: "italic" }}>{ ci.hint }</Text>) : null }
                        </div>

                        <Space
                            size="middle"
                            direction="vertical"
                            style={{ width: '100%', marginBottom: "2em" }}
                        >
                            {
                                (this.state.prog < ANSWER_SHOWN)
                                    ? (<Button {...buttonProps} type="primary" onClick={ () => this.setState({ prog: ANSWER_SHOWN, success: true }) }>我知道</Button>)
                                    : (<Button {...buttonProps} type="primary" onClick={ this.nextQuestion.bind(this) }>下一题</Button>)
                            }

                            { 
                                (this.state.prog < HINT_SHOWN) ? (<Button {...buttonProps} disabled={ !!!ci.hint } onClick={ () => this.setState({ prog: HINT_SHOWN }) }>提示一下</Button>) : 
                                (this.state.prog < ANSWER_SHOWN) ? (<Button {...buttonProps} onClick={ () => this.setState({ prog: ANSWER_SHOWN, success: false }) } danger>显示答案</Button>) :
                                (this.state.success) ? (<Button {...buttonProps} onClick={ () => this.setState({ success: false }) }>标为答错</Button>) :
                                null
                            }
                            
                        </Space>
                    </div>
                );
            }
        }

        return (
            <Layout className="preview fill-height d-flex flex-column" >
                <Layout.Header className="d-flex align-items-center" style={{
                    background: "#1890ff",
                    padding: ".5em",
                    height: "3em"
                }}>
                    <Button 
                        type="text" 
                        shape="circle" 
                        icon={ <LeftOutlined /> }
                        style={{ color: "#ffffff" }}
                        onClick={ this.props.gotoHome }
                    />

                    <Text style={{ color: "#ffffff" }}>
                        今日完成：{ this.state.index + (this.state.success ? 1 : 0) } / { this.state.work.length }
                    </Text>

                    <span className="flex-1"/>
                </Layout.Header>

                <Layout.Content className="fill-height">{ content }</Layout.Content>
            </Layout>
        );
    }

    nextQuestion() {
        const ci = this.state.work[this.state.index];
        if (this.state.success) {
            const nextIndex = this.state.index + 1;
            if (nextIndex >= this.state.work.length) {
                this.setState({
                    finished: this.state.finished.add(ci.quid),
                    success: false,
                    index: nextIndex,
                    prog: QUESTION_SHOWN,
                    allFinished: true,
                });
            } else {
                this.setState({
                    finished: this.state.finished.add(ci.quid),
                    success: false,
                    index: nextIndex,
                    prog: QUESTION_SHOWN,
                });
            }
            this.onComplete(ci, nextIndex);
        } else {
            const newWork = this.state.work.slice();
            newWork.splice(this.state.index, 1);
            newWork.push(ci);
            this.setState({
                work: newWork,
                finished: this.state.finished.add(ci.quid),
                success: false,
                prog: QUESTION_SHOWN,
            });
        }
    }

    onComplete(item: QnaItem, workCompleteCount: number) {
        const p = this.props.progress;
        p.finished.push(item.quid);
        p.finished = Array.from(new Set<number>(p.finished));
        p.workCompleteCount = workCompleteCount;
    }
}
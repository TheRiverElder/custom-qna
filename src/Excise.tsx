import { Typography, Space, Divider, Button, ButtonProps, Layout } from "antd";
import React, { ReactNode } from "react";
import { QnaItem, QnaSet, UserProgress } from "./interfaces";
import { LeftOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface ExceiseProps {
    set: QnaSet;
    progress?: UserProgress;
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

function decideWork(set: QnaSet, progress?: UserProgress, workSize: number = 10): Array<QnaItem> {
    const finishedQuids: Set<number> = new Set<number>(progress?.finished || []);
    const unfinishedItems: Array<QnaItem> = set.items.filter(item => !finishedQuids.has(item.quid));
    
    if (progress && 
        progress.hasWork && progress.work && progress.work.length > 0 && 
        progress.date && isToday(new Date(progress.date))
    ) {
        const map: Map<number, QnaItem> = new Map(set.items.map(item => [item.quid, item]));
        return progress.work.map(w => map.get(w)).filter(w => !!w) as Array<QnaItem>;
    } else {
        const items = unfinishedItems;
        const actualWorkSize = Math.min(workSize, items.length);
        for (let i = 0; i < actualWorkSize; i++) {
            const j = Math.floor(Math.random() * (items.length - i));
            if (i === j) continue;
            const tmp = items[i];
            items[i] = items[j];
            items[j] = tmp;
        }
        return items.slice(0, actualWorkSize);
    }
}


export default class Excise extends React.Component<ExceiseProps, ExceiseState> {

    constructor(props: ExceiseProps) {
        super(props);

        this.state = {
            finished: new Set(),
            work: decideWork(props.set, props.progress),
            index: 0,
            success: false,
            prog: QUESTION_SHOWN,
            allFinished: false,
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
                        <Title>今日任务完成！</Title>

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
                        <Space
                            direction="vertical"
                            style={{ width: '100%' }}
                        >
                            <div className="question">
                                <Title level={3} style={{ color: "#595959", marginTop: "2em" }}>{ ci.question }</Title>
                            </div>
                            
                            <Divider style={{ marginTop: 0, width: "80%" }}/>

                            { this.state.prog >= ANSWER_SHOWN ? (<Text>{ ci.answer }</Text>) : null }

                            { this.state.prog >= HINT_SHOWN ? (<Text type="secondary" style={{ fontStyle: "italic" }}>{ ci.hint }</Text>) : null }
                        </Space>

                        <div className="flex-1"/>

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
            if (this.state.index >= this.state.work.length - 1) {
                this.setState({
                    finished: this.state.finished.add(ci.quid),
                    success: false,
                    index: this.state.index + 1,
                    prog: QUESTION_SHOWN,
                    allFinished: true,
                });
            } else {
                this.setState({
                    finished: this.state.finished.add(ci.quid),
                    success: false,
                    index: this.state.index + 1,
                    prog: QUESTION_SHOWN,
                });
            }
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
}
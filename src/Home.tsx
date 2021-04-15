import { Button, Layout, Tabs, List, Typography, Card, Space, Upload } from "antd";
import { QnaSet, QnaSetInfo, UserProgress, UserProgressInfo } from "./interfaces";
import { EditOutlined, DeleteOutlined, PlayCircleOutlined, SyncOutlined } from "@ant-design/icons";
import './Home.css';
import React from "react";
import { createEmptyQnaSet, createProgress, uid2str } from "./utils/data-manager";
import { readQnaSet } from "./utils/file-utils";

const { Header, Footer, Content } = Layout;
const { Title, Text } = Typography;

interface HomeProps {
    progresses: Array<UserProgressInfo>;
    sets: Array<QnaSetInfo>;
    dataModifier: DataModifier;
    saveData: () => void;
}

interface DataModifier {
    addQnaSet(set: QnaSet, thenEdit?: boolean): void;
    removeQnaSet(set: QnaSetInfo): void;
    editQnaSet(set: QnaSetInfo): void;
    addProgress(progress: UserProgress, thenStart?: boolean): void;
    removeProgress(progress: UserProgressInfo): void;
    continueProgress(progress: UserProgressInfo): void;
    resetProgressWork(progress: UserProgressInfo): void;
}

export default class Home extends React.Component<HomeProps> {

    render() {
        return (
            <Layout className="App fill-height">
                <Header className="centerize-container">
                    <Title level={2} style={{ margin: "0", color: '#ffffff' }}>Custom Q&amp;A</Title>
                </Header>
                
                <Content className="App-content">
                    <Tabs className="fill" style={{ margin: "0 1em" }}>
                        <Tabs.TabPane
                            className="fill scroll-y"
                            tab="进度"
                            key="progresses"
                        >
                            <List
                                dataSource={ this.props.progresses }
                                renderItem={ this.renderUserProgress.bind(this) }
                            />
                        </Tabs.TabPane>

                        <Tabs.TabPane
                            className="fill scroll-y"
                            tab="题集"
                            key="sets"
                        >
                            <List
                                dataSource={ this.props.sets }
                                header={ (
                                    <Space direction="horizontal" className="centerize-container">
                                        <Upload 
                                            showUploadList={ false } 
                                            onChange={ p => readQnaSet(p.file.originFileObj, s => this.props.dataModifier.addQnaSet(s, false)) }
                                        >
                                            <Button type="primary">导入</Button>
                                        </Upload>
                                        
                                        <Button onClick={ () => this.props.dataModifier.addQnaSet(createEmptyQnaSet(), true) }>新建</Button>
                                    </Space>
                                ) }
                                renderItem={ this.renderQnaSet.bind(this) }
                            />
                        </Tabs.TabPane>
                    </Tabs>
                </Content>

                <Footer>
                    <Space>
                        <Button onClick={ this.props.saveData }>强制保存</Button>
                    </Space>
                </Footer>
            </Layout>
        )
    }

    renderUserProgress(p: UserProgressInfo) {
        const setInfo = this.props.sets.find(s => s.qsuid === p.qsuid);
        return (
            <List.Item>
                <Card 
                    className="fill-width"
                    actions={ [
                        <SyncOutlined onClick={ () => this.props.dataModifier.resetProgressWork(p) }/>,
                        <PlayCircleOutlined onClick={ () => this.props.dataModifier.continueProgress(p) }/>,
                        <DeleteOutlined onClick={ () => this.props.dataModifier.removeProgress(p) }/>,
                    ] }
                >
                    <Card.Meta
                        title={ <Title level={3}>{ setInfo ? setInfo.name : "未知题集" }</Title> }
                        description={ 
                            <div className="qnaset-info-card">
                                <div>
                                    <Space>
                                        <Text>版本:{ setInfo ? setInfo.version : "?.?.?" }</Text>
                                        <Text>完成:{ p.finishedCount } / { setInfo ? setInfo.itemCount : '?' }</Text>
                                    </Space>
                                </div>

                                <div>
                                    <Space>
                                        <Text type="secondary">upuid:{ uid2str(p.upuid) }</Text>
                                        <Text type="secondary">qsuid:{ setInfo ? uid2str(setInfo.qsuid) : "???" }</Text>
                                    </Space>
                                </div>
                            </div>
                             
                        }
                    />
                </Card>
            </List.Item>
        );
    }

    renderQnaSet(s: QnaSetInfo) {
        return (
            <List.Item>
                <Card 
                    className="fill-width"
                    actions={ [
                        <EditOutlined onClick={ () => this.props.dataModifier.editQnaSet(s) }/>,
                        <PlayCircleOutlined onClick={ () => this.props.dataModifier.addProgress(createProgress(s.qsuid), true) }/>,
                        <DeleteOutlined onClick={ () => this.props.dataModifier.removeQnaSet(s) }/>,
                    ] }
                >
                    <Card.Meta
                        title={ <Title level={3}>{ s.name }</Title> }
                        description={ 
                            <div className="qnaset-info-card">
                                <div>
                                    <Space>
                                        <Text>版本:{ s.version }</Text>
                                        <Text>题数:{ s.itemCount }</Text>
                                        <Text>qsuid:{ uid2str(s.qsuid) }</Text>
                                    </Space>
                                </div>
                                
                                <div>
                                    <Text>{ s.description }</Text>
                                </div>
                            </div>
                        }
                    />
                </Card>
            </List.Item>
        );
    }
} 

export type {
    DataModifier,
}
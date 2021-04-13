import { Button, Divider, Form, FormInstance, Input, Layout, List, Space, Typography, Upload } from "antd";
import React from "react";
import { PlusOutlined, SaveOutlined, HomeOutlined, FileOutlined } from '@ant-design/icons';
import './Editor.css';
import { QnaItem } from "./interfaces";
import { readQnaSet, writeQnaSet } from "./file-utils";

const { Content, Header, Sider } = Layout;
const { Item } = List;
const { Meta } = Item;
const { TextArea } = Input;
const { Text, Title } = Typography;

interface EditorProps {
    items?: Array<QnaItem>;
    currentItem?: QnaItem | null;
}

interface EditorState {
    items: Array<QnaItem>;
    currentItem: QnaItem | null;
}

class Editor extends React.Component<EditorProps, EditorState> {

    constructor(props: EditorProps) {
        super(props);
        this.state = {
            items: [
                {
                    quid: genQuid(),
                    question: '翻译：我的父亲做菜真的很好吃。',
                    answer: 'Mein Vater kocht sehr gut.',
                },
                {
                    quid: genQuid(),
                    question: '翻译：Bis später.',
                    answer: '待会儿见。',
                    hint: 'See you later.',
                },
            ],
            currentItem: null,
        };
    }

    setCurrentItem(item: QnaItem) {
        if (this.state.items.findIndex(i => i === item || i.quid === item.quid) >= 0) {
            if (this.state.currentItem) {
                const ci = this.state.currentItem;
                const values = this.formRef.current?.getFieldsValue();
                if (values) {
                    this.changeQna({
                        quid: ci.quid,
                        question: values.question || ci.question,
                        answer: values.answer || ci.answer,
                        hint: values.hint || ci.hint || '',
                    });
                }
            }
            this.setState({ currentItem: item });
        }
    }
    
    render() {
        return (
            <Layout className="Editor fill-height">
                <Header className="d-flex align-items-center">
                    <Title level={2} style={{ color: "#ffffff", padding: 0 }}>题集编辑器</Title>

                    <span className="flex-1"/>

                    <Space>
                        <Button
                            shape="round"
                            icon={ <HomeOutlined /> } 
                            onClick={ this.gotoHome.bind(this) }
                        >主页</Button>

                        <Upload 
                            showUploadList={false}
                            onChange={ (e) => this.open(e.file.originFileObj) }
                        >
                            <Button
                                shape="round"
                                icon={ <FileOutlined /> } 
                            >打开</Button>
                        </Upload>

                        <Button
                            shape="round"
                            icon={ <SaveOutlined /> } 
                            onClick={ this.save.bind(this) }
                        >保存</Button>
                    </Space>
                </Header>

                <Layout>
                    <Sider className="Editor-sider-left fill-height" width="36vh">
                        <div className="Editor-sider-content fill-height d-flex flex-column">
                            <div className="list-content flex-1 scroll-y">
                                <List
                                    itemLayout="vertical"
                                    dataSource={ this.state.items }
                                    renderItem={ this.renderItem.bind(this) }
                                />
                            </div>

                            <Divider/>

                            <div className="qna-list-tool-bar">
                                <Button 
                                    icon={ <PlusOutlined/> }
                                    onClick={ this.addNewQna.bind(this) }
                                >新建</Button>
                            </div>
                        </div>
                    </Sider>

                    <Content className="Editor-content fill-height scroll-y">
                        { this.renderItemEdit() }
                    </Content>

                    <Divider style={{ height: "100%" }} type="vertical"/>

                    <Sider className="Editor-sider-right fill-height" width="50vh">

                        { this.renderPreview() }
                    </Sider>
                </Layout>
            </Layout>
        );
    }

    renderItem(item: QnaItem) {
        return (
            <Item onClick={ this.setCurrentItem.bind(this, item) }>
                <Meta
                    title={ <Text ellipsis>{ item.question || "无题-" + item.quid }</Text> }
                    description={ <Text type="secondary" ellipsis>{ item.answer }</Text> }
                />
            </Item>
        );
    }

    formRef = React.createRef<FormInstance>();

    renderItemEdit() {
        const ci = this.state.currentItem;
        if (ci === null) return null;

        this.formRef.current?.setFieldsValue(ci);
        
        return (
            <div className="fill-height">
                <p style={{ textAlign: "right" }}>
                    <Text type="secondary">quid: { ci.quid }</Text>
                </p>

                <Divider/>

                <Form 
                    ref={ this.formRef } 
                    layout="vertical"
                    initialValues={ Object.assign({}, ci) }
                    onFinish={ values => 
                        this.changeQna({
                            quid: ci.quid,
                            question: values.question || ci.question,
                            answer: values.answer || ci.answer,
                            hint: values.hint || ci.hint || '',
                        })
                    }
                >
                    <Form.Item
                        name="question"
                        label="问题"
                        rules={[{ required: true, message: "问题是必须的" }]}
                    >
                        <TextArea autoSize size="large"/>
                    </Form.Item>

                    <Form.Item 
                        name="answer"
                        label="答案"
                        rules={[{ required: true, message: "答案是必须的" }]}
                    >
                        <TextArea autoSize size="large"/>
                    </Form.Item>

                    <Form.Item
                        name="hint"
                        label="提示"
                    >
                        <TextArea autoSize size="large"/>
                    </Form.Item>

                    <Form.Item>
                        <Space className="fill-width centerize-container">
                            <Button type="primary" htmlType="submit">
                                提交
                            </Button>

                            <Button htmlType="button" onClick={ () => this.formRef.current?.resetFields() }>
                                重置
                            </Button>
                        </Space>
                    </Form.Item>

                    <Text type="secondary">当切换当前编辑词条时会自动提交。</Text>
                </Form>
            </div>
        )
    }

    renderPreview() {
        const ci = this.state.currentItem;
        if (ci === null) return null;

        return (
            <div className="preview fill-height d-flex flex-column" >
                <header style={{
                    background: "#1890ff",
                    padding: ".5em",
                }}>
                    <Text style={{ color: "#ffffff" }}>今日完成：14 / 30</Text>
                </header>

                <Space
                    direction="vertical"
                    style={{ width: '100%' }}
                >
                    <p className="question">
                        <Title level={3} style={{ color: "#595959", marginTop: "2em" }}>{ ci.question }</Title>
                    </p>
                    
                    <Divider style={{ marginTop: 0, width: "80%" }}/>

                    <Text>{ ci.answer }</Text>

                    <Text type="secondary" style={{ fontStyle: "italic" }}>{ ci.hint }</Text>
                </Space>

                <div className="flex-1"/>

                <Space
                    direction="vertical"
                    style={{ width: '100%' }}
                >
                    <Button size="large" shape="round" type="primary" block>我知道</Button>
                    <Button size="large" shape="round" type="default" block>提示一下</Button>
                </Space>
            </div>
        );
    }

    addNewQna() {
        const newQna: QnaItem = {
            quid: genQuid(),
            question: '',
            answer: '',
            hint: '',
        };
        this.setState({ 
            items: this.state.items.slice().concat(newQna),
            currentItem: newQna,
        });
    }

    changeQna(item: QnaItem) {
        const index = this.state.items.findIndex(i => i === item || i.quid === item.quid);
        if (index < 0) return;

        const newItems = this.state.items.slice();
        newItems[index] = item;
        if (this.state.currentItem === item || this.state.currentItem?.quid === item.quid) {
            this.setState({ items: newItems, currentItem: item });
        } else {
            this.setState({ items: newItems });
        }
    }

    save() {
        writeQnaSet({ items: this.state.items.slice() });
    }

    open(file: File) {
        const r = readQnaSet(file, s => this.setState({ items: s.items, currentItem: s.items[0] || null }));
    }

    gotoHome() {

    }
}

let count = 1;
function genQuid() {
    return count++;
}

export default Editor;

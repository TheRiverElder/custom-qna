import { Avatar, Breadcrumb, Button, Card, Divider, Form, FormInstance, Input, Layout, List, Space, Typography, Upload } from "antd";
import React from "react";
import { PlusOutlined, SaveOutlined, HomeOutlined, FileOutlined, LeftOutlined } from '@ant-design/icons';
import './Editor.css';
import { QnaItem, QnaSet } from "./interfaces";
import { readQnaSet, writeQnaSet } from "./file-utils";
import { createTestQnaSet, genQuid } from "./test-utils";

const { Content, Header, Sider } = Layout;
const { Item } = List;
const { Meta } = Item;
const { TextArea } = Input;
const { Text, Title } = Typography;

interface EditorProps {
    gotoHome: () => void;
}

interface EditableQnaSetMeta {
    name: string,
    version: string,
    description: string,
}

type EditorState = QnaSet & {
    currentItem: QnaItem | null;
    editMeta: boolean;
}

class Editor extends React.Component<EditorProps, EditorState> {

    constructor(props: EditorProps) {
        super(props);
        this.state = Object.assign(createTestQnaSet(), {
            currentItem: null,
            editMeta: false,
        });
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
            this.setState({ currentItem: item, editMeta: false });
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
                            onClick={ this.props.gotoHome }
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
                            <Card style={{ marginTop: ".5em" }} onClick={ this.editMeta.bind(this, true) }>
                                <Card.Meta
                                    avatar={ <Avatar size="large">{ this.state.name.slice(0, 2) }</Avatar> }
                                    title={ <Title level={3} ellipsis>{ this.state.name } { this.state.version }</Title> }
                                    description={ <Text ellipsis>{ this.state.description }</Text> }
                                />
                            </Card> 

                            <div className="list-content flex-1 scroll-y overflow-x-hidden">
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
                        { this.state.editMeta ? this.renderMetaEdit() : this.renderItemEdit() }
                    </Content>

                    <Divider style={{ height: "100%" }} type="vertical"/>

                    <Sider className="Editor-sider-right fill-height" width="50vh">
                        { (!this.state.editMeta && this.state.currentItem) ? this.renderPreview() : null }
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

    private formRef = React.createRef<FormInstance>();
    private metaEditFormRef = React.createRef<FormInstance>();

    renderItemEdit() {
        const ci = this.state.currentItem;
        if (ci === null) return null;

        this.formRef.current?.setFieldsValue(ci);
        
        return (
            <div className="fill-height">
                <div className="d-flex">
                    <Breadcrumb className="flex-1">
                        <Breadcrumb.Item>
                            <span onClick={ this.editMeta.bind(this, true) }>{ this.state.name }</span>
                        </Breadcrumb.Item>
                        
                        <Breadcrumb.Item>
                            <span>#{ ci.quid }</span>
                        </Breadcrumb.Item>
                    </Breadcrumb>

                    <Text type="secondary">quid: { ci.quid }</Text>
                </div>

                <Divider/>

                <Form 
                    name="item"
                    ref={ this.formRef } 
                    layout="vertical"
                    initialValues={ ci }
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

    renderMetaEdit() {
        const meta = {
            name: this.state.name,
            version: this.state.version,
            description: this.state.description,
        };

        this.formRef.current?.setFieldsValue(meta);

        return (
            <div className="fill-height">
                <div className="d-flex">
                    <Breadcrumb className="flex-1">
                        <Breadcrumb.Item>
                            <span>{ this.state.name }</span>
                        </Breadcrumb.Item>
                    </Breadcrumb>

                    <Text type="secondary">qsuid: { this.state.qsuid }</Text>
                </div>

                <Divider/>

                <Form 
                    name="meta"
                    ref={ this.formRef } 
                    layout="horizontal"
                    initialValues={ meta }
                    onFinish={ values => 
                        this.setMeta({
                            name: values.name,
                            version: values.version,
                            description: values.description,
                        })
                    }
                >
                    <Form.Item
                        name="name"
                        label="名称"
                        rules={[{ required: true, message: "名称是必须的" }]}
                    >
                        <Input size="large"/>
                    </Form.Item>

                    <Form.Item 
                        name="version"
                        label="版本"
                        rules={[{ required: true, message: "版本是必须的" }]}
                    >
                        <Input size="large" placeholder="形如 1.16.5 的版本号"/>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="描述"
                    >
                        <TextArea autoSize size="large" placeholder="在此输入该题集的描述以及想传达给使用者的信息"/>
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
                </Form>
            </div>
        )
    }

    renderPreview() {
        const ci = this.state.currentItem;
        if (ci === null) return null;

        return (
            <div className="preview fill-height d-flex flex-column" >
                <header className="d-flex align-items-center" style={{
                    background: "#1890ff",
                    padding: ".5em",
                }}>
                    <Button 
                        type="text" 
                        shape="circle" 
                        icon={ <LeftOutlined /> }
                        style={{ color: "#ffffff" }}
                    />

                    <Text style={{ color: "#ffffff" }}>今日完成：14 / 30</Text>

                    <span className="flex-1"/>
                </header>

                <Space
                    direction="vertical"
                    style={{ width: '100%' }}
                >
                    <div className="question">
                        <Title level={3} style={{ color: "#595959", marginTop: "2em" }}>{ ci.question }</Title>
                    </div>
                    
                    <Divider style={{ marginTop: 0, width: "80%" }}/>

                    <Text>{ ci.answer }</Text>

                    <Text type="secondary" style={{ fontStyle: "italic" }}>{ ci.hint }</Text>
                </Space>

                <div className="flex-1"/>

                <Space
                    size="middle"
                    direction="vertical"
                    style={{ width: '100%', marginBottom: "2em" }}
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
        if (index < 0 || item.quid !== this.state.currentItem?.quid) return;

        const newItems = this.state.items.slice();
        newItems[index] = item;
        if (this.state.currentItem === item || this.state.currentItem?.quid === item.quid) {
            this.setState({ items: newItems, currentItem: item });
        } else {
            this.setState({ items: newItems });
        }
    }

    editMeta(confirm: boolean = true) {
        this.setState({ editMeta: true });
    }

    setMeta(meta: EditableQnaSetMeta) {
        this.setState(meta);
    }

    save() {
        const s = this.state;
        writeQnaSet({ 
            developmentVersion: 1,
            qsuid: s.qsuid,
            version: s.version,
            name: s.name,
            description: s.description,
            items: s.items.slice(),
        });
    }

    open(file: File) {
        readQnaSet(file, s => this.setState({ 
            qsuid: s.qsuid,
            version: s.version,
            name: s.name,
            description: s.description,
            items: s.items, 
            currentItem: s.items[0] || null,
            editMeta: false, 
        }));
    }
}

export default Editor;

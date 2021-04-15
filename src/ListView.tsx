import { Layout, List } from "antd";
import React from "react";
import { QnaSet, UserProgress } from "./interfaces";

interface ListViewState {
    progresses: Array<UserProgress>;
    sets: Array<QnaSet>;
}

export default class ListView extends React.Component {

    constructor(props: any) {
        super(props);
        this.state = {
            
        };
    }

    render() {
        return (
            <Layout>
                <Layout.Content className="f-flex">
                    <List className="flex-1"

                    />

                    <List className="flex-1">
                        
                    </List>
                </Layout.Content>
            </Layout>
        );
    }

}
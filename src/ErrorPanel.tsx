import { Button, Space, Typography } from 'antd';

export default function ErrorPanel({ error, gotoHome }: { error: string, gotoHome: () => void }) {
    return (
        <Space direction="vertical" className="fill centerize-container">
            <Typography.Text type="danger">{ error }</Typography.Text>

            <Button shape="round" type="primary" onClick={ gotoHome }>返回</Button>
        </Space>
    );
}
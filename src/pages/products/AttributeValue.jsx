import React from "react";
import { Card, Typography, Breadcrumb } from "antd";

const { Title, Paragraph } = Typography;

export default function AttributeValue() {
    return (
        <div className="attribute-value-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Product" },
                    { title: "Attribute Values" },
                ]}
                style={{ marginBottom: 16 }}
            />
            <Card title={<Title level={3} style={{ margin: 0 }}>Attribute Values Management</Title>}>
                <Paragraph>Manage product attribute values here.</Paragraph>
            </Card>
        </div>
    );
}

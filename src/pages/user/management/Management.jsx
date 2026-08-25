import { useState, useEffect } from "react";
import { Table, Tag } from "antd";
import useTitle from "../../../hooks/useTitle";
import { getDatas } from "../../../services/request";

export default function Management() {
    // Hook
    useTitle('Management List');

    // States
    const [management, setManagement] = useState([]);
    const [loading, setLoading]       = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 25,
        total: 0,
    });

    const getManagement = async (page = 1, paginate_size = 25) => {
        try {
            setLoading(true);

            const res = await getDatas('/admin/user', {
                user_category_id: 2,
                page,
                paginate_size
            });

            if(res && res?.success){
                setManagement(res?.data?.items || []);
                setPagination({
                    current: res?.data?.pagination?.current_page || page,
                    pageSize: res?.data?.pagination?.per_page || paginate_size,
                    total: res?.data?.pagination?.total || 0,
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getManagement(pagination.current, pagination.pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTableChange = (newPagination) => {
        getManagement(newPagination.current, newPagination.pageSize);
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Phone Number',
            dataIndex: 'phone_number',
            key: 'phone_number',
        },
        {
            title: 'Category',
            key: 'category',
            render: (_, record) => record?.user_category?.name,
        },
        {
            title: 'Role',
            key: 'roles',
            render: (_, record) => (
                record?.roles?.map(role => role.display_name).join(', ')
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status?.toUpperCase()}
                </Tag>
            ),
        }
    ];
    
    return (
        <div>
            <Table
                columns={columns}
                dataSource={management}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    pageSizeOptions: ['25', '50', '100', '150', '200', '250', '300', '350', '400'],
                }}
                onChange={handleTableChange}
            />
        </div>
    );
}
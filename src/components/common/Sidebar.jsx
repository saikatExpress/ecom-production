import {
    DashboardOutlined,
    ProductOutlined,
    ShoppingCartOutlined,
    UserOutlined
} from "@ant-design/icons";

import { Menu } from "antd";
import { useNavigate } from "react-router-dom";


export default function Sidebar(){

    const navigate = useNavigate();


    const items = [
        {
            key:"dashboard",
            icon:<DashboardOutlined />,
            label:"Dashboard"
        },
        {
            key:"products",
            icon:<ProductOutlined />,
            label:"Products"
        },
        {
            key:"orders",
            icon:<ShoppingCartOutlined />,
            label:"Orders"
        },
        {
            key:"customers",
            icon:<UserOutlined />,
            label:"Customers"
        }
    ];


    const handleClick = ({key})=>{

        navigate(`/${key}`);

    };


    return (

        <aside className="sidebar">

            <div className="sidebar-logo">
                ECOM ADMIN
            </div>


            <Menu
                mode="inline"
                items={items}
                onClick={handleClick}
            />

        </aside>

    );

}
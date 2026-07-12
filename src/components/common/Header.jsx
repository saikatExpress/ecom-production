import { UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown } from "antd";

import { useSelector } from "react-redux";


export default function Header(){


    const {user}=useSelector(
        state=>state.auth
    );


    const items=[
        {
            key:"profile",
            label:"Profile"
        },
        {
            key:"logout",
            label:"Logout"
        }
    ];


    return (

        <header className="header">


            <div>
                Welcome, {user?.username}
            </div>


            <Dropdown
                menu={{
                    items
                }}
            >

                <Avatar
                    icon={<UserOutlined />}
                />

            </Dropdown>


        </header>

    );

}
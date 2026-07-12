import { Outlet } from "react-router-dom";

import Footer from "../components/common/Footer";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";

import "./AdminLayout.css";


export default function AdminLayout(){

    return (
        <div className="admin-layout">

            <Sidebar />


            <div className="admin-main">

                <Header />


                <main className="admin-content">
                    <Outlet />
                </main>


                <Footer />

            </div>

        </div>
    );
}
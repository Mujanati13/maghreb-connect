import React, { useState } from 'react';
import { AppstoreOutlined, RiseOutlined, UserOutlined, FileOutlined } from '@ant-design/icons';
import { Avatar, Menu } from 'antd';
import ClientPlusInfo from '../components/cl-interface/plus-info';
import EntrepriseServices from '../components/cl-interface/en-list';
import ClientDocument from '../components/cl-interface/document';
import Listconsultant from '../components/en-interface/list-consultant';
import ClientDocumentManagement from '../components/cl-interface/document';

const ClientProfile = () => {
    const [current, setCurrent] = useState('dashboard');

    const items = [
        {
            label: 'Tableau de Bord',
            key: 'dashboard',
            icon: <AppstoreOutlined />,
        },
        {
            label: 'Profil',
            key: 'profile',
            icon: <UserOutlined />,
        },
        {
            label: 'Entreprise de Services',
            key: 'messages',
            icon: <RiseOutlined />,
        },
        {
            label: 'Documents',
            key: 'documents',
            icon: <FileOutlined />,
        },
        {
            label: 'Consultants',
            key: 'consultant',
            icon: <FileOutlined />,
        },
    ];

    const onClick = (e) => {
        setCurrent(e.key);
    };

    const renderComponent = () => {
        switch (current) {
            case 'dashboard':
                return null;
            case 'profile':
                return <ClientPlusInfo />;
            case 'messages':
                return <EntrepriseServices />;
            case 'documents':
                return <ClientDocumentManagement />;
            case 'consultant':
                return <Listconsultant />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full">
            {/* Fixed header container */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md w-full h-20">
                <div className='w-full flex justify-between items-center p-5'>
                    <Avatar
                        size={40}
                        src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                        className="mr-4"
                    />
                    <Menu
                        className='flex-grow '
                        onClick={onClick}
                        selectedKeys={[current]}
                        mode="horizontal"
                        items={items}
                        style={{
                            justifyContent: 'space-between',
                            border: 'none'
                        }}
                    />
                </div>
                <hr className='mx-5 my-2' />
            </div>

            {/* Content with top padding to prevent overlap */}
            <div style={{marginTop:"90px"}} className="pt-32 px-5">
                {renderComponent()}
            </div>
        </div>
    );
};

export default ClientProfile;
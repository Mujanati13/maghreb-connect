import React, { useState } from 'react';
import { AppstoreOutlined, RiseOutlined, SettingOutlined, UserOutlined, FileOutlined, CalendarOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Avatar, Divider, Menu } from 'antd';
// import { Dashboard, Profile, Messages, Documents, Appointments, Events, Settings } from './Components';
import { ClientList } from '../components/en-interface/gestionClient';
import EmployeeManagement from '../components/en-interface/collaborateur';
import ClientDocumentManagement from '../components/en-interface/clientDocumen';
// import ServiceDashboard from '../components/cl-interface/dashboard';

const items = [
    {
        label: 'Tableau de Bord',
        key: 'dashboard',
        icon: <AppstoreOutlined />,
    },
    {
        label: 'Clients',
        key: 'profile',
        icon: <UserOutlined />,
    },
    {
        label: 'Collaborateur',
        key: 'collaborateur',
        icon: <UsergroupAddOutlined />,
    },
    {
        label: 'Documents',
        key: 'documents',
        icon: <FileOutlined />,
    },
    // {
    //     label: 'Calendrier',
    //     key: 'calendar',
    //     icon: <CalendarOutlined />,
    //     children: [
    //         // {
    //         //     label: 'Rendez-vous',
    //         //     key: 'appointments',
    //         //     children: [
    //         //         {
    //         //             label: 'Nouveau',
    //         //             key: 'appointments:new',
    //         //         },
    //         //         {
    //         //             label: 'Liste',
    //         //             key: 'appointments:list',
    //         //         }
    //         //     ]
    //         // },
    //         // {
    //         //     label: 'Événements',
    //         //     key: 'events',
    //         //     children: [
    //         //         {
    //         //             label: 'Créer',
    //         //             key: 'events:create',
    //         //         },
    //         //         {
    //         //             label: 'Voir Tous',
    //         //             key: 'events:all',
    //         //         }
    //         //     ]
    //         // }
    //     ]
    // },
    // {
    //     label: 'Paramètres',
    //     key: 'settings',
    //     icon: <SettingOutlined />,
    //     children: [
    //         {
    //             label: 'Général',
    //             key: 'settings:general',
    //             children: [
    //                 {
    //                     label: 'Préférences',
    //                     key: 'settings:preferences',
    //                 },
    //                 {
    //                     label: 'Sécurité',
    //                     key: 'settings:security',
    //                 }
    //             ]
    //         },
    //         {
    //             label: 'Notifications',
    //             key: 'settings:notifications',
    //             children: [
    //                 {
    //                     label: 'Email',
    //                     key: 'notifications:email',
    //                 },
    //                 {
    //                     label: 'Application',
    //                     key: 'notifications:app',
    //                 }
    //             ]
    //         }
    //     ]
    // },
];

const InterfaceEn = () => {
    const [current, setCurrent] = useState('dashboard');

    const onClick = (e) => {
        console.log('click ', e);
        setCurrent(e.key);
    };

    const renderComponent = () => {
        const [section, subsection] = current.split(':');

        switch (section) {
            case 'dashboard':
                return <></>;
            case 'profile':
                return <ClientList />;
            case 'collaborateur':
                return <EmployeeManagement />;
            case 'documents':
                return <ClientDocumentManagement />;
            // case 'appointments':
            //     return <Appointments type={subsection} />;
            // case 'events':
            //     return <Events type={subsection} />;
            // case 'settings':
            //     if (current.startsWith('notifications')) {
            //         return <Settings section="notifications" subsection={subsection} />;
            //     }
            // return <Settings section="general" subsection={subsection} />;
            default:
            // return <Dashboard />;
        }
    };

    return (
        <div className="w-full">
            <div className='w-full flex justify-between p-5 items-center '>
                <Avatar
                    size={40}
                    src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                />
                <Menu
                    className='w-[80%]'
                    onClick={onClick}
                    selectedKeys={[current]}
                    mode="horizontal"
                    items={items}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        border: 'none'
                    }}
                    expandedKeys={['calendar', 'settings']}
                />
            </div>
            <div className='pl-5 pr-5'>
                <hr />
            </div>
            <div className="px-5">
                {renderComponent()}
            </div>
        </div>
    );
};

export default InterfaceEn;
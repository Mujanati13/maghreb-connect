import React, { useState } from 'react';
import {
    Table,
    Card,
    Input,
    Button,
    Space,
    Tag,
    Tooltip,
    Dropdown,
    Modal,
    message,
    Radio,
    Row,
    Col,
    Avatar
} from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    MoreOutlined,
    ExportOutlined,
    ReloadOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    HomeOutlined
} from '@ant-design/icons';

export const ClientList = () => {
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [viewMode, setViewMode] = useState(''); // 'table' or 'card'

    // Sample data for the client table
    const data = [
        {
            key: '1',
            id: 1,
            name: 'Jean Dupont',
            email: 'jean.dupont@email.com',
            phone: '+33 6 12 34 56 78',
            status: 'active',
            address: '123 Rue de Paris',
            created: '2024-01-15',
        },
        {
            key: '2',
            id: 2,
            name: 'Marie Martin',
            email: 'marie.martin@email.com',
            phone: '+33 6 98 76 54 32',
            status: 'inactive',
            address: '456 Avenue des Champs',
            created: '2024-02-20',
        },
    ];

    const handleSearch = (value) => {
        setSearchText(value);
        // Implement search logic here
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Êtes-vous sûr de vouloir supprimer ce client?',
            content: `Cette action supprimera définitivement ${record.name}.`,
            okText: 'Oui',
            okType: 'danger',
            cancelText: 'Non',
            onOk() {
                message.success('Client supprimé avec succès');
            },
        });
    };

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            message.success('Données actualisées');
        }, 1000);
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
            width: 80,
        },
        {
            title: 'Nom',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) =>
                record.name.toLowerCase().includes(value.toLowerCase()) ||
                record.email.toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Téléphone',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Statut',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status === 'active' ? 'Actif' : 'Inactif'}
                </Tag>
            ),
            filters: [
                { text: 'Actif', value: 'active' },
                { text: 'Inactif', value: 'inactive' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <ActionButtons record={record} handleDelete={handleDelete} />
            ),
        },
    ];

    const ActionButtons = ({ record, handleDelete }) => (
        <Space size="middle">
            <Tooltip title="Modifier">
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => message.info('Modifier ' + record.name)}
                />
            </Tooltip>
            <Tooltip title="Supprimer">
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record)}
                />
            </Tooltip>
            <Dropdown
                menu={{
                    items: [
                        {
                            key: '1',
                            label: 'Voir détails',
                            onClick: () => message.info('Voir détails de ' + record.name),
                        },
                        {
                            key: '2',
                            label: 'Historique',
                            onClick: () => message.info('Historique de ' + record.name),
                        },
                    ]
                }}
            >
                <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
        </Space>
    );

    const CardView = ({ data, handleDelete }) => (
        <Row gutter={[16, 16]}>
            {data.map(client => (
                <Col xs={24} sm={12} md={8} lg={6} key={client.key}>
                    <Card
                        hoverable
                        actions={[
                            <EditOutlined key="edit" onClick={() => message.info('Modifier ' + client.name)} />,
                            <DeleteOutlined key="delete" onClick={() => handleDelete(client)} />,
                            <MoreOutlined key="more" onClick={() => message.info('Plus d\'options')} />
                        ]}
                    >
                        <Card.Meta
                            avatar={<Avatar icon={<UserOutlined />} size={64} />}
                            title={client.name}
                            description={
                                <Space direction="vertical" size="small">
                                    <Tag color={client.status === 'active' ? 'green' : 'red'}>
                                        {client.status === 'active' ? 'Actif' : 'Inactif'}
                                    </Tag>
                                    <Space>
                                        <MailOutlined /> {client.email}
                                    </Space>
                                    <Space>
                                        <PhoneOutlined /> {client.phone}
                                    </Space>
                                    <Space>
                                        <HomeOutlined /> {client.address}
                                    </Space>
                                </Space>
                            }
                        />
                    </Card>
                </Col>
            ))}
        </Row>
    );

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
    };

    return (
        <Card
            className='w-full'

        >
            <Space className='w-full flex flex-row items-center justify-between bg-white'>
                <div className='fflex flex-row items-center space-x-5'>
                    <Radio.Group
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value)}
                        buttonStyle="solid"
                    >
                        <Radio.Button value="table">Tableau</Radio.Button>
                        <Radio.Button value="card">Cartes</Radio.Button>
                    </Radio.Group>
                    <Input
                        placeholder="Rechercher..."
                        prefix={<SearchOutlined />}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: 200 }}
                    />
                </div>
                <div className='flex flex-row items-center space-x-5'>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => message.info('Ajouter un nouveau client')}
                    >
                        Nouveau Client
                    </Button>
                    <Button
                        icon={<ExportOutlined />}
                        onClick={() => message.info('Exporter les données')}
                    >
                        Exporter
                    </Button>
                    <Tooltip title="Actualiser">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                        />
                    </Tooltip>
                </div>
            </Space>
            <div className='mt-5'></div>
            {viewMode === 'table' ? (
                <>
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowSelection={rowSelection}
                        loading={loading}
                        pagination={{
                            total: data.length,
                            pageSize: 10,
                            showTotal: (total) => `Total ${total} clients`,
                            showSizeChanger: true,
                            showQuickJumper: true,
                        }}
                        size="middle"
                        onChange={(pagination, filters, sorter) => {
                            console.log('Table changed:', { pagination, filters, sorter });
                        }}
                        scroll={{ x: 'max-content' }}
                    />
                    <div style={{ marginTop: 16 }}>
                        <span style={{ marginLeft: 8 }}>
                            {selectedRowKeys.length > 0 ? (
                                `${selectedRowKeys.length} client(s) sélectionné(s)`
                            ) : (
                                ''
                            )}
                        </span>
                    </div>
                </>
            ) : (
                <CardView data={data} handleDelete={handleDelete} />
            )}
        </Card>
    );
};

export default ClientList;
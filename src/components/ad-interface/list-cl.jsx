import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    Avatar,
    Form,

   
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

    ,
    EyeOutlined
} from '@ant-design/icons';
import { token } from '../../helper/enpoint';

export const ClientList = () => {
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [viewMode, setViewMode] = useState('table');
    const [clients, setClients] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingClient, setEditingClient] = useState(null);

    // Fetch clients from API
    const fetchClients = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://51.38.99.75:4001/api/client/', {
                headers: {
                    Authorization: `${token()}`
                }
            });
            console.log(response.data);

            const formattedData = response.data.data.map(client => ({
                key: client.ID_clt,
                id: client.ID_clt,
                name: client.raison_sociale,
                email: client.mail_contact,
                phone: client.tel_contact,
                status: client.statut,
                address: `${client.adresse}, ${client.cp} ${client.ville}`,
                created: client.date_validation,
                siret: client.siret,
                pays: client.pays,
                province: client.province,
                n_tva: client.n_tva,
                iban: client.iban,
                bic: client.bic,
                banque: client.banque
            }));
            setClients(formattedData);
        } catch (error) {
            message.error('Erreur lors du chargement des clients');
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Add new client
    const handleClientAction = async (values) => {
        console.log(editingClient.id);

        const payload = editingClient ? values : { ...values, password: values.password || undefined };

        try {
            if (editingClient) {
                // Update existing client
                await axios.put(`http://51.38.99.75:4001/api/client/`, { ...payload, ID_clt: editingClient.id }, {
                    headers: {
                        Authorization: `${token()}`
                    }
                });
                message.success('Client mis à jour avec succès');
            } else {
                // Add new client
                await axios.post('http://51.38.99.75:4001/api/client/', payload, {
                    headers: {
                        Authorization: `${token()}`
                    }
                });
                message.success('Client ajouté avec succès');
            }
            fetchClients();
            setIsModalVisible(false);
            setEditingClient(null);
        } catch (error) {
            message.error(editingClient
                ? 'Erreur lors de la mise à jour du client'
                : 'Erreur lors de l\'ajout du client');
            console.error('Client action error:', error);
        }
    };

    // Delete client
    const handleDelete = async (record) => {
        Modal.confirm({
            title: 'Êtes-vous sûr de vouloir supprimer ce client?',
            content: `Cette action supprimera définitivement ${record.name}.`,
            okText: 'Oui',
            okType: 'danger',
            cancelText: 'Non',
            async onOk() {
                try {
                    await axios.delete(`http://51.38.99.75:4001/api/client/${record.id}`, {
                        headers: {
                            Authorization: `${token()}`
                        }
                    });
                    message.success('Client supprimé avec succès');
                    fetchClients();
                } catch (error) {
                    message.error('Erreur lors de la suppression du client');
                    console.error('Delete error:', error);
                }
            },
        });
    };

    // Refresh data
    const handleRefresh = () => {
        fetchClients();
    };

    // Lifecycle
    useEffect(() => {
        fetchClients();
    }, []);

    // Client Modal Form
    const ClientModalForm = () => {
        const [form] = Form.useForm();

        // Reset form or populate with editing client data
        useEffect(() => {
            if (editingClient) {
                form.setFieldsValue({
                    ID_clt: editingClient.ID_clt,
                    raison_sociale: editingClient.name,
                    siret: editingClient.siret,
                    mail_contact: editingClient.email,
                    tel_contact: editingClient.phone,
                    adresse: editingClient.address.split(',')[0].trim(),
                    cp: editingClient.address.split(',')[1]?.trim().split(' ')[0],
                    ville: editingClient.address.split(',')[1]?.trim().split(' ')[1],
                    pays: editingClient.pays,  // This should set 'pays' properly now
                    // Remove the password initialization
                });
            } else {
                form.resetFields();
            }
        }, [editingClient, form]);


        const onFinish = (values) => {
            handleClientAction(values);
        };

        return (
            <Modal
                title={editingClient ? "Modifier le Client" : "Nouveau Client"}
                visible={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingClient(null);
                }}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="raison_sociale"
                        label="Raison Sociale"
                        rules={[{ required: true, message: 'Veuillez saisir la raison sociale' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="siret"
                        label="SIRET"
                        rules={[{ required: true, message: 'Veuillez saisir le SIRET' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="mail_contact"
                        label="Email"
                        rules={[
                            { required: true, message: 'Veuillez saisir l\'email' },
                            { type: 'email', message: 'Veuillez saisir un email valide' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="tel_contact"
                        label="Téléphone"
                        rules={[{ required: true, message: 'Veuillez saisir le téléphone' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="adresse"
                        label="Adresse"
                        rules={[{ required: true, message: 'Veuillez saisir l\'adresse' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Mot de passe"
                        rules={[{ required: true, message: 'Veuillez saisir l\'adresse' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="cp"
                        label="Code Postal"
                        rules={[{ required: true, message: 'Veuillez saisir le code postal' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="ville"
                        label="Ville"
                        rules={[{ required: true, message: 'Veuillez saisir la ville' }]}
                    >
                        <Input />

                    </Form.Item>
                    <Form.Item
                        name="pays"
                        label="Pays"
                        rules={[{ required: true, message: 'Veuillez saisir le Pay' }]}
                    >
                        <Input />

                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {editingClient ? "Mettre à jour" : "Ajouter Client"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        );
    };

    // Columns definition
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
                <Tag color={status === 'validé' ? 'green' : 'red'}>
                    {status === 'validé' ? 'Validé' : 'Non Validé'}
                </Tag>
            ),
            filters: [
                { text: 'Validé', value: 'validé' },
                { text: 'Non Validé', value: 'non validé' },
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

    const ActionButtons = ({ record, handleDelete, setEditingClient, setIsModalVisible }) => {
        // Show details modal
        const showDetailsModal = () => {
            Modal.info({
                title: 'Détails du Client',
                content: (
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <p className="font-semibold text-gray-600">Raison Sociale:</p>
                            <p>{record.name}</p>

                            <p className="font-semibold text-gray-600">Email:</p>
                            <p>{record.email}</p>

                            <p className="font-semibold text-gray-600">Téléphone:</p>
                            <p>{record.phone}</p>

                            <p className="font-semibold text-gray-600">Adresse:</p>
                            <p>{record.address}</p>

                            <p className="font-semibold text-gray-600">SIRET:</p>
                            <p>{record.siret}</p>

                            <p className="font-semibold text-gray-600">N° TVA:</p>
                            <p>{record.n_tva}</p>
                        </div>
                    </div>
                ),
                width: 600,
                icon: null,
            });
        };

        // Dropdown menu items
        const dropdownItems = [
            {
                key: '1',
                label: 'Voir détails',
                icon: <EyeOutlined />,
                onClick: showDetailsModal,
            }
        ];

        return (
            <div className="flex items-center space-x-2">
                {/* Edit Button */}
                <Tooltip title="Modifier">
                    <Button
                        type="text"
                        className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingClient(record);
                            setIsModalVisible(true);
                        }}
                    />
                </Tooltip>

                {/* Delete Button */}
                <Tooltip title="Supprimer">
                    <Button
                        type="text"
                        danger
                        className="hover:bg-red-50 hover:text-red-600 transition-colors"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    />
                </Tooltip>

                {/* More Options Dropdown */}
                <Dropdown
                    menu={{ items: dropdownItems }}
                    placement="bottomRight"
                    trigger={['click']}
                >
                    <Button
                        type="text"
                        className="hover:bg-gray-50 hover:text-gray-600 transition-colors"
                        icon={<MoreOutlined />}
                    />
                </Dropdown>
            </div>
        );
    };
    // Card View Component
    const CardView = ({ data, handleDelete }) => (
        <Row gutter={[16, 16]}>
            {data.map(client => (
                <Col xs={24} sm={12} md={8} lg={6} key={client.key}>
                    <Card
                        hoverable
                        actions={[
                            <EditOutlined key="edit" onClick={() => {
                                setEditingClient(client);
                                setIsModalVisible(true);
                            }} />,
                            <DeleteOutlined key="delete" onClick={() => handleDelete(client)} />,
                            <MoreOutlined key="more" onClick={() => Modal.info({
                                title: 'Détails du Client',
                                content: (
                                    <div>
                                        <p><strong>Raison Sociale:</strong> {client.name}</p>
                                        <p><strong>Email:</strong> {client.email}</p>
                                        <p><strong>Téléphone:</strong> {client.phone}</p>
                                        <p><strong>Adresse:</strong> {client.address}</p>
                                        <p><strong>SIRET:</strong> {client.siret}</p>
                                        <p><strong>N° TVA:</strong> {client.n_tva}</p>
                                    </div>
                                ),
                                width: 520,
                            })} />
                        ]}
                    >
                        <Card.Meta
                            avatar={<Avatar icon={<UserOutlined />} size={64} />}
                            title={client.name}
                            description={
                                <Space direction="vertical" size="small">
                                    <Tag color={client.status === 'validé' ? 'green' : 'red'}>
                                        {client.status === 'validé' ? 'Validé' : 'Non Validé'}
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

    // Row selection configuration
    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
    };

    return (
        <Card className='w-full'>
            <Space className='w-full flex flex-row items-center justify-between bg-white'>
                <div className='flex flex-row items-center space-x-5'>
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
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 200 }}
                    />
                </div>
                <div className='flex flex-row items-center space-x-5'>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingClient(null);
                            setIsModalVisible(true);
                        }}
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
                        dataSource={clients}
                        rowSelection={rowSelection}
                        loading={loading}
                        pagination={{
                            total: clients.length,
                            pageSize: 10,
                            showTotal: (total) => `Total ${total} clients`,
                            showSizeChanger: true,
                            showQuickJumper: true,
                        }}
                        size="middle"
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
                <CardView data={clients} handleDelete={handleDelete} />
            )}
            <ClientModalForm />
        </Card>
    );
};


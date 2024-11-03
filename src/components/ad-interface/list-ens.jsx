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
  Divider,
  Select
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
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  HomeOutlined,
  GlobalOutlined,
  
} from '@ant-design/icons';
import { token } from '../../helper/enpoint';

const CollaboratorList = () => {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [viewMode, setViewMode] = useState('table');
  const [collaborators, setCollaborators] = useState([]);
  const [editingCollaborator, setEditingCollaborator] = useState(null);

  const API_BASE_URL = 'http://51.38.99.75:4001/api/ESN/';

  // Fetch Collaborators
  const fetchCollaborators = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_BASE_URL, {
        headers: {
          Authorization: `${token()}`
        }
      });
      const formattedData = response.data.data.map(item => ({
        key: item.ID_ESN,
        id: item.ID_ESN,
        nom: item.Raison_sociale,
        email: item.mail_Contact,
        phone: item.Tel_Contact,
        poste: 'N/A', // Add appropriate field if available
        status: item.Statut,
        Raison_sociale: item.Raison_sociale,
        SIRET: item.SIRET,
        Pays: item.Pays,
        Adresse: item.Adresse,
        CP: item.CP,
        Ville: item.Ville,
        mail_Contact: item.mail_Contact,
        IBAN: item.IBAN,
        BIC: item.BIC,
        Banque: item.Banque

        
      }));
      setCollaborators(formattedData);
      // message.success('Données chargées avec succès');
    } catch (error) {
      message.error('Erreur lors du chargement des données');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add Collaborator
  const handleAddCollaborator = async (values) => {
    console.log(values);
    console.log(editingCollaborator);

    try {
      const payload = {
        ...values,
        // password : ed
      };

      const response = await axios.post(API_BASE_URL, payload, {
        headers: {
          Authorization: `${token()}`
        }
      });
      message.success('ENS ajouté avec succès');
      fetchCollaborators();
    } catch (error) {
      message.error('Erreur lors de l\'ajout du ENS');
      console.error('Add error:', error);
    }
  };

  // Update Collaborator
  const handleUpdateCollaborator = async (values) => {
    try {
      const payload = {
        ...values,
        ID_ESN : editingCollaborator.id,
        // Adresse : editingCollaborator.adresse
      };

      const response = await axios.put(`${API_BASE_URL}`, payload, {
        headers: {
          Authorization: `${token()}`
        }
      });
      message.success('Collaborateur mis à jour avec succès');
      fetchCollaborators();
      setEditingCollaborator(null);
    } catch (error) {
      message.error('Erreur lors de la mise à jour du collaborateur');
      console.error('Update error:', error);
    }
  };

  // Delete Collaborator
  const handleDelete = async (record) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer ce collaborateur ?',
      content: `Cette action supprimera définitivement ${record.nom}.`,
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      async onOk() {
        try {
          await axios.delete(`${API_BASE_URL}`, {
            data: record, // Pass record here
            headers: {
              Authorization: `${token()}`
            }
          });
          message.success('ENS supprimé avec succès');
          fetchCollaborators();
        } catch (error) {
          message.error('Erreur lors de la suppression du ENS');
          console.error('Delete error:', error);
        }
      }
    });
  };
  

  // Initial data fetch
  useEffect(() => {
    fetchCollaborators();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleRefresh = () => {
    fetchCollaborators();
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
      width: 80
    },
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a, b) => a.nom.localeCompare(b.nom),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.nom.toLowerCase().includes(value.toLowerCase()) ||
        record.email.toLowerCase().includes(value.toLowerCase())
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Téléphone',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'Poste',
      dataIndex: 'poste',
      key: 'poste'
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'actif' ? 'green' : 'red'}>
          {status === 'actif' ? 'Actif' : 'Inactif'}
        </Tag>
      ),
      filters: [
        { text: 'Actif', value: 'actif' },
        { text: 'Inactif', value: 'inactif' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <ActionButtons
          record={record}
          handleDelete={handleDelete}
          onEdit={() => setEditingCollaborator(record)}
        />
      )
    }
  ];

  const ActionButtons = ({ record, handleDelete, onEdit }) => (
    <Space size="middle">
      <Tooltip title="Modifier">
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={onEdit}
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
              onClick: () => message.info(`Voir détails de ${record.nom}`)
            },
            // {
            //   key: '2',
            //   label: 'Historique',
            //   onClick: () => message.info(`Historique de ${record.nom}`)
            // }
          ]
        }}
      >
        <Button type="text" icon={<MoreOutlined />} />
      </Dropdown>
    </Space>
  );

  const CardView = ({ data, handleDelete }) => (
    <Row gutter={[16, 16]}>
      {data.map(collaborator => (
        <Col xs={24} sm={12} md={8} lg={6} key={collaborator.key}>
          <Card
            hoverable
            actions={[
              <EditOutlined key="edit" onClick={() => setEditingCollaborator(collaborator)} />,
              <DeleteOutlined key="delete" onClick={() => handleDelete(collaborator)} />,
              <MoreOutlined key="more" onClick={() => message.info('Plus d\'options')} />
            ]}
          >
            <Card.Meta
              avatar={<Avatar icon={<UserOutlined />} size={64} />}
              title={collaborator.nom}
              description={
                <Space direction="vertical" size="small">
                  <Tag color={collaborator.status === 'actif' ? 'green' : 'red'}>
                    {collaborator.status === 'actif' ? 'Actif' : 'Inactif'}
                  </Tag>
                  <Space>
                    <MailOutlined /> {collaborator.email}
                  </Space>
                  <Space>
                    <PhoneOutlined /> {collaborator.phone}
                  </Space>
                  <Space>
                    {collaborator.poste}
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
    onChange: (keys) => setSelectedRowKeys(keys)
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
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 200 }}
          />
        </div>
        <div className='flex flex-row items-center space-x-5'>
          <AddCollaboratorModal
            onAdd={handleAddCollaborator}
            editingCollaborator={editingCollaborator}
            onUpdate={handleUpdateCollaborator}
            onCancel={() => setEditingCollaborator(null)}
          />
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
            dataSource={collaborators}
            rowSelection={rowSelection}
            loading={loading}
            pagination={{
              total: collaborators.length,
              pageSize: 10,
              showTotal: (total) => `Total ${total} collaborateurs`,
              showSizeChanger: true,
              showQuickJumper: true
            }}
            size="middle"
            scroll={{ x: 'max-content' }}
          />
          <div style={{ marginTop: 16 }}>
            <span style={{ marginLeft: 8 }}>
              {selectedRowKeys.length > 0 ? (
                `${selectedRowKeys.length} collaborateur(s) sélectionné(s)`
              ) : (
                ''
              )}
            </span>
          </div>
        </>
      ) : (
        <CardView data={collaborators} handleDelete={handleDelete} />
      )}
    </Card>
  );
};

const AddCollaboratorModal = ({
  onAdd,
  editingCollaborator,
  onUpdate,
  onCancel
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingCollaborator) {
      console.log(editingCollaborator);
      
      setIsModalVisible(true);
      form.setFieldsValue({
        nom: editingCollaborator.nom,
        email: editingCollaborator.email,
        phone: editingCollaborator.phone,
        status: editingCollaborator.status,
        SIRET: editingCollaborator.SIRET,
        rce: editingCollaborator.rce,
        Pays: editingCollaborator.Pays,
        Adresse: editingCollaborator.Adresse,
        CP: editingCollaborator.CP,
        Ville: editingCollaborator.Ville,
        province: editingCollaborator.province,
        tva: editingCollaborator.tva,
        iban: editingCollaborator.iban,
        bic: editingCollaborator.bic,
        banque: editingCollaborator.banque,
        password: editingCollaborator.password
      });
    }
  }, [editingCollaborator, form]);

  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const formattedValues = {
        Raison_sociale: values.nom,
        SIRET: values.SIRET,
        RCE: values.rce,
        Pays: values.Pays,
        Adresse: values.Adresse,
        CP: values.CP,
        Ville: values.Ville,
        Province: values.province,
        mail_Contact: values.email,
        Tel_Contact: values.phone,
        Statut: values.status || 'En attente',
        N_TVA: values.tva,
        IBAN: values.iban,
        BIC: values.bic,
        Banque: values.banque,
        password : values.password,
      };

      if (editingCollaborator) {
        onUpdate({ ...formattedValues, id: editingCollaborator.id });
      } else {
        onAdd(formattedValues);
      }
      setIsModalVisible(false);
      form.resetFields();
    }).catch((info) => {
      console.log('Validate Failed:', info);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    onCancel && onCancel();
  };

  return (
    <>
      <Button type="primary" onClick={showModal} icon={<PlusOutlined />}>
        {editingCollaborator ? 'Modifier' : 'Nouveau ENS'}
      </Button>
      <Modal
        title={
          <div className="text-xl font-semibold text-gray-800">
            {editingCollaborator ? 'Modifier un ENS' : 'Ajouter un ENS'}
          </div>
        }
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingCollaborator ? 'Mettre à jour' : 'Ajouter'}
        cancelText="Annuler"
        width={900}
        className="rounded-lg"
        footer={[
          <Button key="back" onClick={handleCancel}>
            Annuler
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleOk}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {editingCollaborator ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="collaborator_form"
          className="space-y-4"
        >
          <div className="bg-gray-50 p-4 rounded-lg">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-medium text-gray-700">
                      Raison sociale
                    </span>
                  }
                  name="nom"
                  rules={[{ required: true, message: 'Veuillez saisir la raison sociale' }]}
                >
                  <Input 
                    prefix={<UserOutlined className="text-gray-400" />} 
                    placeholder="Nom de l'entreprise"
                    className="rounded-md"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-medium text-gray-700">
                      SIRET
                    </span>
                  }
                  name="SIRET"
                  rules={[{ required: true, message: 'Veuillez saisir le SIRET' }]}
                >
                  <Input 
                    placeholder="Numéro SIRET"
                    className="rounded-md"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider className="my-4" />

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="font-medium text-gray-700">
                      Pays
                    </span>
                  }
                  name="Pays"
                  rules={[{ required: true, message: 'Veuillez sélectionner le pays' }]}
                >
                  <Select 
                    placeholder="Sélectionner un pays"
                    prefix={<GlobalOutlined className="text-gray-400" />}
                    className="w-full"
                  >
                    <Option value="France">France</Option>
                    <Option value="Belgique">Belgique</Option>
                    <Option value="Suisse">Suisse</Option>
                    {/* Add more countries as needed */}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="font-medium text-gray-700">
                      Ville
                    </span>
                  }
                  name="Ville"
                  rules={[{ required: true, message: 'Veuillez saisir la ville' }]}
                >
                  <Input 
                    placeholder="Nom de la ville"
                    className="rounded-md"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="font-medium text-gray-700">
                      Code Postal
                    </span>
                  }
                  name="CP"
                  rules={[{ required: true, message: 'Veuillez saisir le code postal' }]}
                >
                  <Input 
                    placeholder="Code postal"
                    className="rounded-md"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  label={
                    <span className="font-medium text-gray-700">
                      Adresse
                    </span>
                  }
                  name="Adresse"
                  rules={[{ required: true, message: 'Veuillez saisir l\'adresse' }]}
                >
                  <Input 
                    prefix={<HomeOutlined className="text-gray-400" />} 
                    placeholder="Adresse complète"
                    className="rounded-md"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="font-medium text-gray-700">
                      Email
                    </span>
                  }
                  name="email"
                  rules={[
                    { required: true, message: 'Veuillez saisir l\'email' },
                    { type: 'email', message: 'Veuillez saisir un email valide' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined className="text-gray-400" />} 
                    placeholder="Email de contact"
                    className="rounded-md"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Additional Financial and Contact Information */}
            <Divider orientation="left" className="my-4">
              <span className="text-gray-600">Informations financières</span>
            </Divider>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="font-medium text-gray-700">
                      Banque
                    </span>
                  }
                  name="banque"
                >
                  <Input 
                    prefix={<BankOutlined className="text-gray-400" />} 
                    placeholder="Nom de la banque"
                    className="rounded-md"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="font-medium text-gray-700">
                      IBAN
                    </span>
                  }
                  name="iban"
                >
                  <Input 
                    placeholder="Numéro IBAN"
                    className="rounded-md"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="font-medium text-gray-700">
                      BIC
                    </span>
                  }
                  name="bic"
                >
                  <Input 
                    placeholder="Code BIC"
                    className="rounded-md"
                  />
                </Form.Item>
              </Col>
            </Row>

            {editingCollaborator && (
              <Row className="mt-4">
                <Col span={24}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Statut
                      </span>
                    }
                    name="status"
                  >
                    <Radio.Group>
                      <Radio value="actif" className="mr-4">
                        <span className="text-green-600">Actif</span>
                      </Radio>
                      <Radio value="inactif">
                        <span className="text-red-600">Inactif</span>
                      </Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>
            )}
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default CollaboratorList;
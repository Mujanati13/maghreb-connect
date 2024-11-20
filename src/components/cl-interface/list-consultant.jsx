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
  Avatar,
  Form
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
  PhoneOutlined
} from '@ant-design/icons';
import axios from 'axios';

const ConsultantManagement = () => {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [viewMode, setViewMode] = useState(''); // 'table' or 'card'
  const [consultantData, setConsultantData] = useState([]);

  const fetchConsultantData = async () => {
    try {
      const response = await axios.get('http://51.38.99.75:4001/api/candidature/');
      setConsultantData(response.data.data);
    } catch (error) {
      console.error('Error fetching consultant data:', error);
      message.error('Failed to fetch consultant data');
    }
  };

  React.useEffect(() => {
    fetchConsultantData();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    // Add search logic here
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Êtes-vous sûr de vouloir supprimer ce consultant ?',
      content: `Cette action supprimera définitivement ${record.responsable_compte}.`,
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk() {
        message.success('Consultant supprimé avec succès');
      },
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchConsultantData().then(() => {
      setLoading(false);
      message.success('Données actualisées');
    });
  };

  const columns = [
    {
      title: 'ID Candidature',
      dataIndex: 'id_cd',
      key: 'id_cd',
      sorter: (a, b) => a.id_cd - b.id_cd,
      width: 120,
    },
    {
      title: 'Responsable Compte',
      dataIndex: 'responsable_compte',
      key: 'responsable_compte',
      sorter: (a, b) => a.responsable_compte.localeCompare(b.responsable_compte),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.responsable_compte.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Date Candidature',
      dataIndex: 'date_candidature',
      key: 'date_candidature',
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (status) => (
        <Tag color={status === 'En cours' ? 'geekblue' : 'volcano'}>
          {status}
        </Tag>
      ),
      filters: [
        { text: 'En cours', value: 'En cours' },
        { text: 'Fermé', value: 'Fermé' },
      ],
      onFilter: (value, record) => record.statut === value,
    },
    {
      title: 'TJM',
      dataIndex: 'tjm',
      key: 'tjm',
      sorter: (a, b) => parseFloat(a.tjm) - parseFloat(b.tjm),
    },
    {
      title: 'Date Disponibilité',
      dataIndex: 'date_disponibilite',
      key: 'date_disponibilite',
    },
    {
      title: 'Commentaire',
      dataIndex: 'commentaire',
      key: 'commentaire',
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
          onClick={() => message.info(`Modifier ${record.responsable_compte}`)}
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
              onClick: () => message.info(`Voir détails de ${record.responsable_compte}`),
            },
            {
              key: '2',
              label: 'Historique',
              onClick: () => message.info(`Historique de ${record.responsable_compte}`),
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
      {data.map(consultant => (
        <Col xs={24} sm={12} md={8} lg={6} key={consultant.id_cd}>
          <Card
            hoverable
            actions={[
              <EditOutlined key="edit" onClick={() => message.info(`Modifier ${consultant.responsable_compte}`)} />,
              <DeleteOutlined key="delete" onClick={() => handleDelete(consultant)} />,
              <MoreOutlined key="more" onClick={() => message.info('Plus d\'options')} />
            ]}
          >
            <Card.Meta
              avatar={<Avatar icon={<UserOutlined />} size={64} />}
              title={consultant.responsable_compte}
              description={
                <Space direction="vertical" size="small">
                  <Tag color={consultant.statut === 'En cours' ? 'geekblue' : 'volcano'}>
                    {consultant.statut}
                  </Tag>
                  <Space>
                    <MailOutlined /> {consultant.responsable_compte}
                  </Space>
                  <Space>
                    <PhoneOutlined /> {consultant.id_consultant}
                  </Space>
                  <Space>
                     {consultant.poste}
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

  const handleAddConsultant = () => {
    // Implement add consultant functionality
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
          <AddConsultantModal onAdd={handleAddConsultant} />
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
            dataSource={consultantData}
            rowSelection={rowSelection}
            loading={loading}
            pagination={{
              total: consultantData.length,
              pageSize: 10,
              showTotal: (total) => `Total ${total} Consultants`,
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
                `${selectedRowKeys.length} consultant(s) sélectionné(s)`
              ) : (
                ''
              )}
            </span>
          </div>
        </>
      ) : (
        <CardView data={consultantData} handleDelete={handleDelete} />
      )}
    </Card>
  );
};

const AddConsultantModal = ({ onAdd }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      onAdd(values);
      setIsModalVisible(false);
      form.resetFields();
      message.success('Nouveau consultant ajouté avec succès');
    }).catch((info) => {
      console.log('Validate Failed:', info);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <>
      {/* <Button type="primary" onClick={showModal} icon={<PlusOutlined />}>
        Nouveau Consultant
      </Button> */}
      <Modal
        title="Ajouter un Consultant"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Ajouter"
        cancelText="Annuler"
      >
        <Form form={form} layout="vertical" name="add_consultant">
          <Form.Item
            label="Nom Responsable"
            name="responsable_compte"
            rules={[{ required: true, message: 'Veuillez saisir le nom du responsable' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="ID Consultant"
            name="id_consultant"
            rules={[{ required: true, message: 'Veuillez saisir l\'ID du consultant' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Date Candidature"
            name="date_candidature"
            rules={[{ required: true, message: 'Veuillez saisir la date de candidature' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Statut"
            name="statut"
            rules={[{ required: true, message: 'Veuillez saisir le statut' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="TJM"
            name="tjm"
            rules={[{ required: true, message: 'Veuillez saisir le TJM' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Date Disponibilité"
            name="date_disponibilite"
            rules={[{ required: true, message: 'Veuillez saisir la date de disponibilité' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Commentaire"
            name="commentaire"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ConsultantManagement;
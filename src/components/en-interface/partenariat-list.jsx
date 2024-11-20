import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Space, 
  Popconfirm, 
  Card, 
  Typography,
  DatePicker,
  Switch,
  Row,
  Col,
  Select,
  Tag,
  Tooltip,
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  TagOutlined,
  UserOutlined,
  BankOutlined,
  GlobalOutlined,
  TeamOutlined,
  DollarOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ClientPartenariatInterface = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([
    {
      id: 1,
      nomEntreprise: 'Ahmed elxample',
      secteur: 'Industrie',
      taille: 'Grande entreprise',
      dateDebut: '2024-01-01',
      budget: '250000',
      description: 'Client majeur dans le secteur industriel',
      contactPrincipal: 'Pierre Dubois',
      email: 'pierre.dubois@globalcorp.com',
      telephone: '+33 1 23 45 67 89',
      location: 'Paris',
      statut: 'Actif',
      website: 'www.globalcorp.com',
      nombreEmployes: '5000+'
    },
    {
      id: 2,
      nomEntreprise: 'Jonth natan',
      secteur: 'Technologie',
      taille: 'PME',
      dateDebut: '2024-02-15',
      budget: '120000',
      description: 'Entreprise innovante en croissance',
      contactPrincipal: 'Sophie Martin',
      email: 'sophie.martin@techsolutions.com',
      telephone: '+33 1 98 76 54 32',
      location: 'Lyon',
      statut: 'En négociation',
      website: 'www.techsolutions.com',
      nombreEmployes: '100-500'
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isCardView, setIsCardView] = useState(false);

  const secteurs = [
    'Industrie',
    'Technologie',
    'Finance',
    'Santé',
    'Commerce',
    'Services',
    'Transport',
    'Éducation'
  ];

  const tailles = [
    'TPE',
    'PME',
    'ETI',
    'Grande entreprise'
  ];

  const statuts = [
    'Actif',
    'En négociation',
    'En pause',
    'Terminé'
  ];

  const getTagColor = (statut) => {
    const colors = {
      'Actif': 'green',
      'En négociation': 'blue',
      'En pause': 'orange',
      'Terminé': 'red'
    };
    return colors[statut] || 'default';
  };

  const getSecteurColor = (secteur) => {
    const colors = {
      'Industrie': 'purple',
      'Technologie': 'blue',
      'Finance': 'green',
      'Santé': 'pink',
      'Commerce': 'cyan',
      'Services': 'magenta',
      'Transport': 'orange',
      'Éducation': 'geekblue'
    };
    return colors[secteur] || 'default';
  };

  const showModal = (record = null) => {
    setEditingId(record?.id);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const showViewModal = (record) => {
    setSelectedRecord(record);
    setIsViewModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editingId) {
        setData(data.map((item) =>
          item.id === editingId ? { ...values, id: editingId } : item
        ));
      } else {
        setData([...data, { ...values, id: data.length + 1 }]);
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleDelete = (id) => {
    setData(data.filter((item) => item.id !== id));
  };

  const columns = [
    {
      title: 'Client',
      dataIndex: 'nomEntreprise',
      key: 'nomEntreprise',
      sorter: (a, b) => a.nomEntreprise.localeCompare(b.nomEntreprise),
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          <Tag color={getSecteurColor(record.secteur)}>{record.secteur}</Tag>
        </Space>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut) => (
        <Tag color={getTagColor(statut)}>{statut}</Tag>
      ),
      filters: statuts.map(statut => ({ text: statut, value: statut })),
      onFilter: (value, record) => record.statut === value,
    },
    {
      title: 'Contact',
      dataIndex: 'contactPrincipal',
      key: 'contactPrincipal',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text>{record.contactPrincipal}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <MailOutlined /> {record.email}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget) => (
        <Text>€{parseInt(budget).toLocaleString()}</Text>
      ),
      sorter: (a, b) => a.budget - b.budget,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Voir les détails">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => showViewModal(record)}
              ghost
            />
          </Tooltip>
          {/* <Tooltip title="Modifier">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
              style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
            />
          </Tooltip> */}
          <Tooltip title="Supprimer">
            <Popconfirm
              title="Êtes-vous sûr de vouloir supprimer?"
              onConfirm={() => handleDelete(record.id)}
              okText="Oui"
              cancelText="Non"
            >
              <Button
                type="primary"
                icon={<DeleteOutlined />}
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const CardViewItem = ({ item }) => (
    <Col xs={24} sm={12} lg={8} xxl={6} style={{ padding: '8px' }}>
      <Card
        hoverable
        actions={[
          <Tooltip title="Voir les détails">
            <EyeOutlined key="view" onClick={() => showViewModal(item)} />
          </Tooltip>,
        //   <Tooltip title="Modifier">
        //     <EditOutlined key="edit" onClick={() => showModal(item)} />
        //   </Tooltip>,
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer?"
            onConfirm={() => handleDelete(item.id)}
            okText="Oui"
            cancelText="Non"
          >
            <DeleteOutlined key="delete" />
          </Popconfirm>
        ]}
      >
        <Card.Meta
          title={
            <Space direction="vertical" size={0}>
              <Text strong>{item.nomEntreprise}</Text>
              <Space size="small">
                <Tag color={getSecteurColor(item.secteur)}>{item.secteur}</Tag>
                <Tag color={getTagColor(item.statut)}>{item.statut}</Tag>
              </Space>
            </Space>
          }
          description={
            <Space direction="vertical" size="small" style={{ width: '100%', marginTop: '8px' }}>
              <Text type="secondary">
                <Space>
                  <TeamOutlined />
                  {item.nombreEmployes} employés
                </Space>
              </Text>
              <Text type="secondary">
                <Space>
                  <DollarOutlined />
                  €{parseInt(item.budget).toLocaleString()}
                </Space>
              </Text>
              <Text type="secondary">
                <Space>
                  <EnvironmentOutlined />
                  {item.location}
                </Space>
              </Text>
              <Paragraph ellipsis={{ rows: 2 }} type="secondary">
                {item.description}
              </Paragraph>
              <Space direction="vertical" size="small">
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <UserOutlined /> {item.contactPrincipal}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <MailOutlined /> {item.email}
                </Text>
              </Space>
            </Space>
          }
        />
      </Card>
    </Col>
  );

  return (
    <div style={{ padding: '0px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
          {/* <Title level={4} style={{ margin: 0 }}>Gestion des Partenariats Clients</Title> */}
          <Space>
            <Switch
              checkedChildren={<AppstoreOutlined />}
              unCheckedChildren={<UnorderedListOutlined />}
              checked={isCardView}
              onChange={setIsCardView}
            />
            {/* <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Nouveau Client
            </Button> */}
          </Space>
        </div>

        {isCardView ? (
          <Row gutter={[16, 16]}>
            {data.map(item => (
              <CardViewItem key={item.id} item={item} />
            ))}
          </Row>
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            bordered
          />
        )}

        <Modal
          title={editingId ? "Modifier le client" : "Ajouter un client"}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={() => setIsModalVisible(false)}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            name="clientForm"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="nomEntreprise"
                  label="Nom de l'entreprise"
                  rules={[{ required: true, message: 'Veuillez entrer le nom' }]}
                >
                  <Input prefix={<BankOutlined />} placeholder="Nom de l'entreprise" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="secteur"
                  label="Secteur d'activité"
                  rules={[{ required: true, message: 'Veuillez sélectionner le secteur' }]}
                >
                  <Select placeholder="Sélectionner le secteur">
                    {secteurs.map(secteur => (
                      <Option key={secteur} value={secteur}>
                        {secteur}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="taille"
                  label="Taille de l'entreprise"
                  rules={[{ required: true, message: 'Veuillez sélectionner la taille' }]}
                >
                  <Select placeholder="Sélectionner la taille">
                    {tailles.map(taille => (
                      <Option key={taille} value={taille}>
                        {taille}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="statut"
                  label="Statut"
                  rules={[{ required: true, message: 'Veuillez sélectionner le statut' }]}
                >
                  <Select placeholder="Sélectionner le statut">
                    {statuts.map(statut => (
                      <Option key={statut} value={statut}>
                        {statut}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="budget"
                  label="Budget (€)"
                  rules={[{ required: true, message: 'Veuillez entrer le budget' }]}
                >
                  <Input prefix="€" type="number" placeholder="Budget" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="dateDebut"
                  label="Date de début"
                  rules={[{ required: true, message: 'Veuillez sélectionner la date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="nombreEmployes"
                  label="Nombre d'employés"
                  rules={[{ required: true, message: 'Veuillez entrer le nombre d\'employés' }]}
                >
<Select placeholder="Nombre d'employés">
                    <Option value="1-10">1-10</Option>
                    <Option value="11-50">11-50</Option>
                    <Option value="51-200">51-200</Option>
                    <Option value="201-500">201-500</Option>
                    <Option value="501-1000">501-1000</Option>
                    <Option value="1000+">1000+</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="contactPrincipal"
                  label="Contact Principal"
                  rules={[{ required: true, message: 'Veuillez entrer le contact' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Nom du contact" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Veuillez entrer l\'email' },
                    { type: 'email', message: 'Email invalide' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Email du contact" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="telephone"
                  label="Téléphone"
                  rules={[{ required: true, message: 'Veuillez entrer le téléphone' }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Numéro de téléphone" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="location"
                  label="Localisation"
                  rules={[{ required: true, message: 'Veuillez entrer la localisation' }]}
                >
                  <Input prefix={<EnvironmentOutlined />} placeholder="Ville" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="website"
              label="Site Web"
              rules={[{ required: true, message: 'Veuillez entrer le site web' }]}
            >
              <Input prefix={<GlobalOutlined />} placeholder="www.exemple.com" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Veuillez entrer la description' }]}
            >
              <TextArea rows={4} placeholder="Description du partenariat client" />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={<Space><EyeOutlined /> Détails du Client</Space>}
          open={isViewModalVisible}
          onCancel={() => setIsViewModalVisible(false)}
          footer={[
            // <Button key="edit" type="primary" onClick={() => {
            //   setIsViewModalVisible(false);
            //   showModal(selectedRecord);
            // }} style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}>
            //   Modifier
            // </Button>,
            <Button key="close" onClick={() => setIsViewModalVisible(false)}>
              Fermer
            </Button>
          ]}
          width={800}
        >
          {selectedRecord && (
            <div style={{ padding: '20px' }}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Title level={4}>{selectedRecord.nomEntreprise}</Title>
                  <Space>
                    <Tag color={getSecteurColor(selectedRecord.secteur)}>{selectedRecord.secteur}</Tag>
                    <Tag color={getTagColor(selectedRecord.statut)}>{selectedRecord.statut}</Tag>
                  </Space>
                </div>

                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="Budget"
                      value={`€${parseInt(selectedRecord.budget).toLocaleString()}`}
                      prefix={<DollarOutlined />}
                    />
                  </Col>
                  {/* <Col span={8}>
                    <Statistic
                      title="Taille"
                      value={selectedRecord.taille}
                      prefix={<TeamOutlined />}
                    />
                  </Col> */}
                  <Col span={8}>
                    <Statistic
                      title="Date de début"
                      value={selectedRecord.dateDebut}
                      prefix={<CalendarOutlined />}
                    />
                  </Col>
                </Row>

                {/* <Card size="small" title="Informations de l'entreprise">
                  <Space direction="vertical">
                    <Space>
                      <GlobalOutlined />
                      <Text strong>Site Web:</Text>
                      <a href={`https://${selectedRecord.website}`} target="_blank" rel="noopener noreferrer">
                        {selectedRecord.website}
                      </a>
                    </Space>
                    <Space>
                      <EnvironmentOutlined />
                      <Text strong>Localisation:</Text>
                      <Text>{selectedRecord.location}</Text>
                    </Space>
                    <Space>
                      <TeamOutlined />
                      <Text strong>Nombre d'employés:</Text>
                      <Text>{selectedRecord.nombreEmployes}</Text>
                    </Space>
                  </Space>
                </Card> */}

                <Card size="small" title="Contact Principal">
                  <Space direction="vertical">
                    <Space>
                      <UserOutlined />
                      <Text strong>Nom:</Text>
                      <Text>{selectedRecord.contactPrincipal}</Text>
                    </Space>
                    <Space>
                      <MailOutlined />
                      <Text>{selectedRecord.email}</Text>
                    </Space>
                    <Space>
                      <PhoneOutlined />
                      <Text>{selectedRecord.telephone}</Text>
                    </Space>
                  </Space>
                </Card>

                <Card size="small" title="Description">
                  <Paragraph>{selectedRecord.description}</Paragraph>
                </Card>
              </Space>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default ClientPartenariatInterface;
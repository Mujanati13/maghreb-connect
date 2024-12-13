import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card,
  Input,
  Table,
  Button,
  Modal,
  Form,
  DatePicker,
  message,
  Select,
  Divider,
  Typography,
  Steps
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  DeleteOutlined, 
  EditOutlined,
  FileDoneOutlined,
  SendOutlined,
  DollarOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import moment from 'moment';
import { Endponit } from '../../helper/enpoint';

const { TextArea } = Input;
const { Step } = Steps;

const BonDeCommandeInterface = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPurchaseOrder, setCurrentPurchaseOrder] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const clientId = localStorage.getItem('id');
      const response = await axios.get(`${Endponit()}/api/get_bon_de_commande_by_client/?client_id=${clientId}`);
      setPurchaseOrders(response.data.data);
    } catch (error) {
      message.error('Échec de la récupération des bons de commande');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'pending_esn', label: 'En attente de validation ESN' },
    { value: 'accepted_esn', label: 'Accepté ESN' },
    { value: 'rejected_esn', label: 'Rejeté ESN' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending_esn: 'warning',
      accepted_esn: 'success',
      rejected_esn: 'error'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Numéro',
      dataIndex: 'numero_bdc',
      key: 'numero_bdc',
      render: (text) => <span className="font-medium">{text}</span>
    },
    {
      title: 'Date de création',
      dataIndex: 'date_creation',
      key: 'date_creation',
      render: (date) => format(new Date(date), 'dd MMMM yyyy', { locale: fr })
    },
    {
      title: 'Montant Total',
      dataIndex: 'montant_total',
      key: 'montant_total',
      render: (amount) => (
        <span className="font-medium">
          <DollarOutlined className="mr-1" />
          {amount.toFixed(2)} €
        </span>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (status) => (
        <Select
          value={status}
          style={{ width: 200 }}
          options={statusOptions}
          disabled
          status={getStatusColor(status)}
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            title="Modifier"
          />
          <Button 
            type="primary"
            icon={<SendOutlined />}
            onClick={() => handleSendToESN(record)}
            disabled={record.statut !== 'pending_esn'}
            title="Envoyer à l'ESN"
          />
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id_bdc)}
            disabled={record.statut === 'accepted_esn'}
            title="Supprimer"
          />
        </div>
      )
    }
  ];

  const handleSendToESN = async (record) => {
    try {
      await axios.put(`${Endponit()}/api/Bondecommande/${record.id_bdc}`, {
        ...record,
        statut: 'pending_esn'
      });
      message.success('Bon de commande envoyé à l\'ESN pour validation');
      fetchPurchaseOrders();
    } catch (error) {
      message.error('Échec de l\'envoi du bon de commande');
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setCurrentPurchaseOrder(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      ...record,
      date_creation: new moment(record.date_creation)
    });
    setCurrentPurchaseOrder(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${Endponit()}/api/Bondecommande/${id}`);
      fetchPurchaseOrders();
      message.success('Bon de commande supprimé avec succès');
    } catch (error) {
      message.error('Échec de la suppression du bon de commande');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const clientId = localStorage.getItem('id');
      const formattedValues = {
        ...values,
        date_creation: values.date_creation.toISOString(),
        candidature_id: 1, // Adding required field from API structure
        client_id: clientId
      };

      if (currentPurchaseOrder) {
        await axios.put(`${Endponit()}/api/Bondecommande/`, {...formattedValues, id_bdc:currentPurchaseOrder.id_bdc});
        message.success('Bon de commande mis à jour avec succès');
      } else {
        await axios.post(`${Endponit()}/api/Bondecommande/`, {
          ...formattedValues,
          statut: 'pending_esn'
        });
        message.success('Nouveau bon de commande créé avec succès');
      }
      setIsModalVisible(false);
      fetchPurchaseOrders();
    } catch (error) {
      message.error('Échec de la soumission du bon de commande');
    }
  };

  return (
    <Card className="shadow-sm">
      <div className="mb-6">
        <Steps size="small" className="mb-6">
          <Step title="Création" icon={<FileDoneOutlined />} />
          <Step title="Validation ESN" icon={<SendOutlined />} />
          <Step title="Finalisation" icon={<FileTextOutlined />} />
        </Steps>
        <div className="flex justify-between items-center">
          <Input
            placeholder="Rechercher des bons de commande"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            className="w-64"
          />
          {/* <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Créer un bon de commande
          </Button> */}
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={purchaseOrders&&purchaseOrders.filter((po) =>
          po.numero_bdc?.toLowerCase().includes(searchText.toLowerCase()) ||
          po.description?.toLowerCase().includes(searchText.toLowerCase())
        )}
        rowKey="id_bdc"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50']
        }}
      />

      <Modal
        title={
          <div className="flex items-center">
            <FileTextOutlined className="mr-2" />
            {currentPurchaseOrder ? 'Modifier le bon de commande' : 'Créer un bon de commande'}
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Numéro du bon de commande"
              name="numero_bdc"
              rules={[{ required: true, message: 'Veuillez entrer le numéro du bon de commande' }]}
            >
              <Input prefix={<FileTextOutlined />} />
            </Form.Item>

            <Form.Item
              label="Date de création"
              name="date_creation"
              rules={[{ required: true, message: 'Veuillez sélectionner une date' }]}
            >
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
          </div>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Veuillez fournir une description' }]}
          >
            <TextArea rows={4} placeholder="Description du bon de commande..." />
          </Form.Item>

          <Form.Item
            label="Montant total (€)"
            name="montant_total"
            rules={[{ required: true, message: 'Veuillez entrer le montant' }]}
          >
            <Input prefix={<DollarOutlined />} type="number" step="0.01" />
          </Form.Item>

          <Divider />

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setIsModalVisible(false)}>
              Annuler
            </Button>
            <Button type="primary" htmlType="submit">
              {currentPurchaseOrder ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </Card>
  );
};

export default BonDeCommandeInterface;
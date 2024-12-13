import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  Input,
  Table,
  Button,
  Modal,
  message,
  Tag,
  Typography,
  Space,
  Tooltip,
  Badge,
  Descriptions,
  Alert
} from 'antd';
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Endponit } from '../../helper/enpoint';

const { Text } = Typography;
const { confirm } = Modal;

const PurchaseOrderInterface = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const esnId = localStorage.getItem('id');
      if (!esnId) {
        message.error('ID ESN non trouvé dans le stockage local');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${Endponit()}/api/get_bon_de_commande_by_client/?client_id=${esnId}`);
      setPurchaseOrders(response.data.data);
    } catch (error) {
      message.error('Échec de la récupération des bons de commande');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      'pending_esn': { color: 'processing', icon: <ClockCircleOutlined />, text: 'En attente ESN' },
      'accepted_esn': { color: 'success', icon: <CheckCircleOutlined />, text: 'Accepté ESN' },
      'rejected_esn': { color: 'error', icon: <CloseCircleOutlined />, text: 'Refusé ESN' }
    };
    const config = statusConfig[status] || statusConfig['pending_esn'];
    
    return (
      <Tag icon={config.icon} color={config.color}>
        {config.text}
      </Tag>
    );
  };

  const showAcceptConfirm = (record) => {
    confirm({
      title: 'Accepter le bon de commande',
      icon: <CheckCircleOutlined className="text-green-500" />,
      content: `Êtes-vous sûr de vouloir accepter le bon de commande n°${record.numero_bdc} ?`,
      okText: 'Accepter',
      okType: 'primary',
      cancelText: 'Annuler',
      onOk() {
        handleAccept(record.id_bdc);
      },
    });
  };

  const showRejectConfirm = (record) => {
    confirm({
      title: 'Refuser le bon de commande',
      icon: <CloseCircleOutlined className="text-red-500" />,
      content: `Êtes-vous sûr de vouloir refuser le bon de commande n°${record.numero_bdc} ?`,
      okText: 'Refuser',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk() {
        handleReject(record.id_bdc);
      },
    });
  };

  const handleAccept = async (id) => {
    try {
      await axios.put(`${Endponit()}/api/Bondecommande/${id}`, { statut: 'accepted_esn' });
      message.success('Bon de commande accepté avec succès');
      await fetchPurchaseOrders();
    } catch (error) {
      message.error('Échec de l\'acceptation du bon de commande');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`${Endponit()}/api/Bondecommande/${id}`, { statut: 'rejected_esn' });
      message.success('Bon de commande refusé');
      await fetchPurchaseOrders();
    } catch (error) {
      message.error('Échec du refus du bon de commande');
    }
  };

  const showDetails = (record) => {
    setSelectedPO(record);
    setIsDetailsModalVisible(true);
  };

  const columns = [
    {
      title: 'Numéro BDC',
      dataIndex: 'numero_bdc',
      key: 'numero_bdc',
      render: (text) => (
        <Text strong className="text-blue-600">
          {text}
        </Text>
      ),
    },
    {
      title: 'Date de création',
      dataIndex: 'date_creation',
      key: 'date_creation',
      render: (date) => format(new Date(date), 'dd MMMM yyyy', { locale: fr })
    },
    {
      title: 'Montant',
      dataIndex: 'montant_total',
      key: 'montant_total',
      render: (amount) => (
        <Text strong className="text-green-600">
          {amount.toFixed(2)} €
        </Text>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Voir les détails">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => showDetails(record)}
            />
          </Tooltip>
          {record.statut === 'pending_esn' && (
            <>
              <Tooltip title="Accepter">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  className="bg-green-500"
                  onClick={() => showAcceptConfirm(record)}
                />
              </Tooltip>
              <Tooltip title="Refuser">
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => showRejectConfirm(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card className="shadow-sm">
      <div className="mb-6">
        <Space direction="vertical" className="w-full">
          <div className="flex justify-between items-center">
            <Badge 
              count={purchaseOrders&&purchaseOrders.filter(po => po.statut === 'pending_esn').length}
              showZero
              className="mr-4"
            >
              <Tag icon={<ClockCircleOutlined />} color="processing">
                En attente
              </Tag>
            </Badge>
          </div>
          <Text type="secondary">
            Gérez et validez vos bons de commande entrants
          </Text>
        </Space>

        <div className="mt-4 mb-6">
          <Input
            placeholder="Rechercher par numéro ou description..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        {purchaseOrders&&purchaseOrders.filter(po => po.statut === 'pending_esn').length > 0 && (
          <Alert
            message="Bons de commande en attente"
            description={`Vous avez ${purchaseOrders.filter(po => po.statut === 'pending_esn').length} bon(s) de commande en attente de validation.`}
            type="info"
            showIcon
            className="mb-4"
          />
        )}
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
          pageSizeOptions: ['10', '20', '50'],
        }}
      />

      <Modal
        title={
          <Space>
            <FileTextOutlined />
            Détails du Bon de Commande
          </Space>
        }
        open={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailsModalVisible(false)}>
            Fermer
          </Button>,
          selectedPO?.statut === 'pending_esn' && (
            <>
              <Button
                key="accept"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => {
                  showAcceptConfirm(selectedPO);
                  setIsDetailsModalVisible(false);
                }}
                className="bg-green-500"
              >
                Accepter
              </Button>
              <Button
                key="reject"
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  showRejectConfirm(selectedPO);
                  setIsDetailsModalVisible(false);
                }}
              >
                Refuser
              </Button>
            </>
          ),
        ].filter(Boolean)}
        width={700}
      >
        {selectedPO && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Numéro BDC" span={2}>
              {selectedPO.numero_bdc}
            </Descriptions.Item>
            <Descriptions.Item label="Date de création">
              {format(new Date(selectedPO.date_creation), 'dd MMMM yyyy', { locale: fr })}
            </Descriptions.Item>
            <Descriptions.Item label="Statut">
              {getStatusTag(selectedPO.statut)}
            </Descriptions.Item>
            <Descriptions.Item label="Montant total" span={2}>
              <Text strong className="text-green-600">
                {selectedPO.montant_total.toFixed(2)} €
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {selectedPO.description}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  );
};

export default PurchaseOrderInterface;
import React, { useState, useEffect } from "react";
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
  Alert,
  Form,
  DatePicker,
  InputNumber,
  Tabs,
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ContactsOutlined,
  SaveOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Endponit } from "../../helper/enpoint";

const { Text, Title } = Typography;
const { confirm } = Modal;
const { TextArea } = Input;
const { TabPane } = Tabs;

const OrderAndContractInterface = () => {
  // States for Purchase Orders
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState({});

  // States for Contracts
  const [contracts, setContracts] = useState([]);
  const [isContractModalVisible, setIsContractModalVisible] = useState(false);
  const [contractForm] = Form.useForm();
  const [contractLoading, setContractLoading] = useState(false);

  useEffect(() => {
    fetchPurchaseOrders();
    fetchContracts();
  }, []);

  // Purchase Orders Functions
  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const esnId = localStorage.getItem("id");
      if (!esnId) {
        message.error("ID ESN non trouvé dans le stockage local");
        return;
      }
      const response = await axios.get(
        `${Endponit()}/api/get_bon_de_commande_by_client/?client_id=${esnId}`
      );
      setPurchaseOrders(response.data.data);
    } catch (error) {
      message.error("Échec de la récupération des bons de commande");
    } finally {
      setLoading(false);
    }
  };

  // Contracts Functions
  const fetchContracts = async () => {
    try {
      const esnId = localStorage.getItem("id");
      const response = await axios.get(
        `${Endponit()}/api/contrat_by_idClient/?clientId=${esnId}`
      );
      console.log("====================================");
      console.log(response.data);
      console.log("====================================");
      setContracts(response.data.data);
    } catch (error) {
      message.error("Échec de la récupération des contrats");
    }
  };

  const handleCreateContract = async (values) => {
    setContractLoading(true);
    try {
      const formattedValues = {
        ...values,
        candidature_id: selectedPO?.candidature_id,
        date_signature: values.date_signature?.format("YYYY-MM-DD"),
        date_debut: values.date_debut?.format("YYYY-MM-DD"),
        date_fin: values.date_fin?.format("YYYY-MM-DD"),
        statut: "active",
      };

      const response = await axios.post(
        `${Endponit()}/api/Contrat/`,
        formattedValues
      );

      if (response.data && response.data.id_contrat) {
        const clientId = localStorage.getItem("id");

        // Send notification
        await axios.post(`${Endponit()}/api/notify_signature_contrat/`, {
          client_id: clientId,
          esn_id: response.data.esn_id,
          contrat_id: response.data.id_contrat,
        });

        message.success("Contrat créé avec succès");
        setIsContractModalVisible(false);
        contractForm.resetFields();
        fetchContracts();
      }
    } catch (error) {
      message.error("Échec de la création du contrat");
    } finally {
      setContractLoading(false);
    }
  };

  // PDF Generation
  const generatePDF = (record) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Bon de Commande", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Numéro BDC: ${record.numero_bdc}`, 20, 40);
    doc.text(
      `Date de création: ${format(
        new Date(record.date_creation),
        "dd MMMM yyyy",
        { locale: fr }
      )}`,
      20,
      50
    );
    doc.text(`Montant total: ${record.montant_total.toFixed(2)} €`, 20, 60);
    doc.text(`Statut: ${getStatusLabel(record.statut)}`, 20, 70);

    if (record.description) {
      doc.text("Description:", 20, 90);
      const splitDescription = doc.splitTextToSize(record.description, 170);
      doc.text(splitDescription, 20, 100);
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} sur ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    return doc;
  };

  // Status Helpers
  const getStatusLabel = (status) => {
    const statusMap = {
      pending_esn: "En attente ESN",
      accepted_esn: "Accepté ESN",
      rejected_esn: "Refusé ESN",
    };
    return statusMap[status] || status;
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending_esn: {
        color: "processing",
        icon: <ClockCircleOutlined />,
        text: "En attente ESN",
      },
      accepted_esn: {
        color: "success",
        icon: <CheckCircleOutlined />,
        text: "Accepté ESN",
      },
      rejected_esn: {
        color: "error",
        icon: <CloseCircleOutlined />,
        text: "Refusé ESN",
      },
    };
    const config = statusConfig[status] || statusConfig["pending_esn"];

    return (
      <Tag icon={config.icon} color={config.color}>
        {config.text}
      </Tag>
    );
  };

  // Action Handlers
  const handleDownload = async (record) => {
    setDownloadLoading((prev) => ({ ...prev, [record.id_bdc]: true }));
    try {
      const doc = generatePDF(record);
      doc.save(`BDC_${record.numero_bdc}.pdf`);
      message.success("Bon de commande téléchargé avec succès");
    } catch (error) {
      message.error("Échec du téléchargement du bon de commande");
    } finally {
      setDownloadLoading((prev) => ({ ...prev, [record.id_bdc]: false }));
    }
  };

  const handleAccept = async (id, bdc) => {
    try {
      await axios.put(`${Endponit()}/api/Bondecommande/${id}`, {
        ...bdc,
        statut: "accepted_esn",
      });
      message.success("Bon de commande accepté avec succès");
      await fetchPurchaseOrders();
    } catch (error) {
      message.error("Échec de l'acceptation du bon de commande");
    }
  };

  const handleReject = async (id, bdc) => {
    try {
      await axios.put(`${Endponit()}/api/Bondecommande/${id}`, {
        ...bdc,
        statut: "rejected_esn",
      });
      message.success("Bon de commande refusé");
      await fetchPurchaseOrders();
    } catch (error) {
      message.error("Échec du refus du bon de commande");
    }
  };

  // Confirmation Dialogs
  const showAcceptConfirm = (record) => {
    confirm({
      title: "Accepter le bon de commande",
      icon: <CheckCircleOutlined className="text-green-500" />,
      content: `Êtes-vous sûr de vouloir accepter le bon de commande n°${record.numero_bdc} ?`,
      okText: "Accepter",
      okType: "primary",
      cancelText: "Annuler",
      onOk() {
        handleAccept(record.id_bdc, record);
      },
    });
  };

  const showRejectConfirm = (record) => {
    confirm({
      title: "Refuser le bon de commande",
      icon: <CloseCircleOutlined className="text-red-500" />,
      content: `Êtes-vous sûr de vouloir refuser le bon de commande n°${record.numero_bdc} ?`,
      okText: "Refuser",
      okType: "danger",
      cancelText: "Annuler",
      onOk() {
        handleReject(record.id_bdc, record);
      },
    });
  };

  // Table Columns
  const purchaseOrderColumns = [
    {
      title: "Numéro BDC",
      dataIndex: "numero_bdc",
      key: "numero_bdc",
      render: (text) => (
        <Text strong className="text-blue-600">
          {text}
        </Text>
      ),
    },
    {
      title: "Date de création",
      dataIndex: "date_creation",
      key: "date_creation",
      render: (date) => format(new Date(date), "dd MMMM yyyy", { locale: fr }),
    },
    {
      title: "Montant",
      dataIndex: "montant_total",
      key: "montant_total",
      render: (amount) => (
        <Text strong className="text-green-600">
          {amount.toFixed(2)} €
        </Text>
      ),
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Voir les détails">
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedPO(record);
                setIsDetailsModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Télécharger">
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
              loading={downloadLoading[record.id_bdc]}
            />
          </Tooltip>
          {record.statut === "pending_esn" && (
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
          <Tooltip title="Créer un contrat">
            <Button
              type="primary"
              icon={<ContactsOutlined />}
              onClick={() => {
                setSelectedPO(record);
                setIsContractModalVisible(true);
              }}
              className="bg-blue-500"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const contractColumns = [
    {
      title: "Numéro de contrat",
      dataIndex: "numero_contrat",
      key: "numero_contrat",
    },
    {
      title: "Date de signature",
      dataIndex: "date_signature",
      key: "date_signature",
      render: (date) => format(new Date(date), "dd MMMM yyyy", { locale: fr }),
    },
    {
      title: "Date de début",
      dataIndex: "date_debut",
      key: "date_debut",
      render: (date) => format(new Date(date), "dd MMMM yyyy", { locale: fr }),
    },
    {
      title: "Date de fin",
      dataIndex: "date_fin",
      key: "date_fin",
      render: (date) => format(new Date(date), "dd MMMM yyyy", { locale: fr }),
    },
    {
      title: "Montant",
      dataIndex: "montant",
      key: "montant",
      render: (amount) => `${amount.toFixed(2)} €`,
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
    },
  ];

  return (
    <Card className="shadow-sm">
      <Tabs defaultActiveKey="1">
        <TabPane
          tab={
            <span>
              {/* <FileTextOutlined /> */}
              Bons de commande
            </span>
          }
          key="1"
        >
          <div className="mb-0">
            <div className="mt-4 mb-2">
              <Input
                placeholder="Rechercher par numéro ou description..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="max-w-md"
              />
            </div>

            {purchaseOrders.filter((po) => po.statut === "pending_esn").length >
              0 && (
              <Alert
                message="Bons de commande en attente"
                description={`Vous avez ${
                  purchaseOrders.filter((po) => po.statut === "pending_esn")
                    .length
                } bon(s) de commande en attente de validation.`}
                type="info"
                showIcon
                className="mb-4"
              />
            )}
          </div>

          <Table
            columns={purchaseOrderColumns}
            dataSource={purchaseOrders.filter(
              (po) =>
                po.numero_bdc
                  ?.toLowerCase()
                  .includes(searchText.toLowerCase()) ||
                po.description?.toLowerCase().includes(searchText.toLowerCase())
            )}
            rowKey="id_bdc"
            loading={loading}
            pagination={{
              pageSize: 4,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
            }}
          />
        </TabPane>

        <TabPane
          tab={
            <span>
              {/* <ContactsOutlined /> */}
              Contrats
            </span>
          }
          key="2"
        >
          <Table
            columns={contractColumns}
            dataSource={contracts || []} // Fallback to an empty array
            rowKey="id_contrat"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
            }}
          />
        </TabPane>
      </Tabs>

      {/* Purchase Order Details Modal */}
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
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(selectedPO)}
            loading={downloadLoading[selectedPO?.id_bdc]}
          >
            Télécharger
          </Button>,
          <Button key="close" onClick={() => setIsDetailsModalVisible(false)}>
            Fermer
          </Button>,
          selectedPO?.statut === "pending_esn" && (
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
              {format(new Date(selectedPO.date_creation), "dd MMMM yyyy", {
                locale: fr,
              })}
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

      {/* Contract Creation Modal */}
      <Modal
        title={
          <Space>
            <ContactsOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Création d'un nouveau contrat
            </Title>
          </Space>
        }
        open={isContractModalVisible}
        onCancel={() => {
          setIsContractModalVisible(false);
          contractForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={contractForm}
          layout="vertical"
          onFinish={handleCreateContract}
          className="mt-4"
        >
          <Form.Item
            name="numero_contrat"
            label="Numéro du contrat"
            rules={[
              {
                required: true,
                message: "Veuillez saisir le numéro du contrat",
              },
            ]}
          >
            <Input
              prefix={<ContactsOutlined />}
              placeholder="ex: CONT-2024-001"
              value={"CONT-" + new Date().getFullYear() + "-"}
            />
          </Form.Item>

          <Form.Item
            name="date_signature"
            label="Date de signature"
            rules={[
              {
                required: true,
                message: "Veuillez sélectionner la date de signature",
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Sélectionnez la date de signature"
            />
          </Form.Item>

          <Space className="w-full gap-4">
            <Form.Item
              name="date_debut"
              label="Date de début"
              className="flex-1"
              rules={[
                {
                  required: true,
                  message: "Veuillez sélectionner la date de début",
                },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Date de début"
              />
            </Form.Item>

            <Form.Item
              name="date_fin"
              label="Date de fin"
              className="flex-1"
              rules={[
                {
                  required: true,
                  message: "Veuillez sélectionner la date de fin",
                },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Date de fin"
              />
            </Form.Item>
          </Space>

          <Form.Item
            name="montant"
            label="Montant"
            rules={[
              {
                required: true,
                message: "Veuillez saisir le montant",
              },
            ]}
          >
            <InputNumber
              className="w-full"
              min={0}
              step={0.01}
              formatter={(value) => `${value} €`}
              parser={(value) => value.replace(" €", "")}
            />
          </Form.Item>

          <Form.Item
            name="conditions"
            label="Conditions"
            rules={[
              {
                required: true,
                message: "Veuillez saisir les conditions du contrat",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Saisissez les conditions du contrat..."
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button
                onClick={() => {
                  setIsContractModalVisible(false);
                  contractForm.resetFields();
                }}
              >
                Annuler
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={contractLoading}
                className="bg-blue-500"
              >
                Créer le contrat
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default OrderAndContractInterface;

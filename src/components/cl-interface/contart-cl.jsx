import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Typography,
  Space,
  Divider,
  Row,
  Col,
  Table,
  Badge,
  Tag,
  Descriptions,
  Collapse,
  Progress,
  List,
  message,
  Tabs,
} from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  UploadOutlined,
  ProjectOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileSearchOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  BarsOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const ContractList = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedContract, setExpandedContract] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await fetch(
        "http://51.38.99.75:4001/api/contrat_by_idClient/?clientId=" +
          localStorage.getItem("id")
      );
      const result = await response.json();

      // Transform API data to match our component's data structure
      const transformedContracts = result.data.map((contract) => ({
        id: contract.id_contrat,
        status: getStatusMapping(contract.statut),
        projectDetails: {
          title: `Contrat ${contract.numero_contrat}`,
          startDate: new Date(contract.date_debut).toLocaleDateString("fr-FR"),
          endDate: new Date(contract.date_fin).toLocaleDateString("fr-FR"),
          duration: calculateDuration(contract.date_debut, contract.date_fin),
          budget: `${contract.montant.toLocaleString()} €`,
          location: "France", // Default value as not provided in API
          team: "Équipe projet", // Default value as not provided in API
        },
        esnSigned: contract.date_signature ? true : false,
        conditions: contract.conditions,
        deliverables: [
          {
            key: "1",
            item: "Début de mission",
            deadline: new Date(contract.date_debut).toLocaleDateString("fr-FR"),
            status: "En cours",
          },
          {
            key: "2",
            item: "Fin de mission",
            deadline: new Date(contract.date_fin).toLocaleDateString("fr-FR"),
            status: "En attente",
          },
        ],
      }));

      setContracts(transformedContracts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      message.error("Erreur lors du chargement des contrats");
      setLoading(false);
    }
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} jours`;
  };

  const getStatusMapping = (apiStatus) => {
    const statusMap = {
      "En cours": "processing",
      Terminé: "success",
      "En attente": "pending",
    };
    return statusMap[apiStatus] || "default";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "processing";
      case "success":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "processing":
        return "En cours";
      case "success":
        return "Terminé";
      default:
        return status;
    }
  };

  const handleSignature = async (contractId) => {
    try {
      // Here you would typically make an API call to update the contract signature
      // For now, we'll just update the local state
      setContracts((prevContracts) =>
        prevContracts.map((contract) => {
          if (contract.id === contractId) {
            const newContract = {
              ...contract,
              esnSigned: true,
              status: "processing",
            };
            message.success("Signature effectuée avec succès");
            return newContract;
          }
          return contract;
        })
      );
    } catch (error) {
      message.error("Erreur lors de la signature du contrat");
    }
  };

  const renderExpandedContent = (contract) => (
    <div style={{ padding: "0 24px" }}>
      <Tabs defaultActiveKey="1">
        <TabPane
          tab={
            <span>
              <ProjectOutlined />
              Détails du Projet
            </span>
          }
          key="1"
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item
              label={
                <>
                  <ProjectOutlined /> Projet
                </>
              }
            >
              {contract.projectDetails.title}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  <CalendarOutlined /> Date de début
                </>
              }
            >
              {contract.projectDetails.startDate}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  <ClockCircleOutlined /> Durée
                </>
              }
            >
              {contract.projectDetails.duration}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  <DollarOutlined /> Budget
                </>
              }
            >
              {contract.projectDetails.budget}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  <EnvironmentOutlined /> Localisation
                </>
              }
            >
              {contract.projectDetails.location}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  <TeamOutlined /> Équipe
                </>
              }
            >
              {contract.projectDetails.team}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Title level={4}>
            <BarsOutlined /> Livrables
          </Title>
          <Table
            dataSource={contract.deliverables}
            columns={[
              {
                title: "Livrable",
                dataIndex: "item",
                key: "item",
              },
              {
                title: "Date limite",
                dataIndex: "deadline",
                key: "deadline",
                render: (text) => (
                  <Tag icon={<CalendarOutlined />} color="blue">
                    {text}
                  </Tag>
                ),
              },
              {
                title: "Statut",
                dataIndex: "status",
                key: "status",
                render: (status) => <Badge status="processing" text={status} />,
              },
            ]}
            pagination={false}
          />
        </TabPane>

        <TabPane
          tab={
            <span>
              <FileSearchOutlined />
              Conditions
            </span>
          }
          key="2"
        >
          <Collapse defaultActiveKey={["1"]}>
            <Panel header="Conditions Générales" key="1">
              <Paragraph>{contract.conditions}</Paragraph>
            </Panel>
          </Collapse>
        </TabPane>

        <TabPane
          tab={
            <span>
              <CheckCircleOutlined />
              Signatures
            </span>
          }
          key="3"
        >
          <Card type="inner" title="Signature Client">
            <Row justify="space-between" align="middle">
              <Col>
                <Space direction="vertical">
                  <Text strong>Représentant le Client</Text>
                  <Text type="secondary">Autorité signataire désignée</Text>
                </Space>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={
                    contract.esnSigned ? (
                      <CheckCircleOutlined />
                    ) : (
                      <UploadOutlined />
                    )
                  }
                  onClick={() => handleSignature(contract.id)}
                  disabled={contract.esnSigned}
                  size="large"
                >
                  {contract.esnSigned ? "Signé" : "Signer"}
                </Button>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );

  return (
    <div>
      <List
        loading={loading}
        dataSource={contracts}
        renderItem={(contract) => (
          <Card style={{ marginBottom: 16, borderRadius: 8 }} key={contract.id}>
            <Row justify="space-between" align="middle">
              <Col span={8}>
                <Space direction="vertical">
                  <Title level={4} style={{ margin: 0 }}>
                    {contract.projectDetails.title}
                  </Title>
                  <Space>
                    <Tag icon={<CalendarOutlined />} color="blue">
                      Début: {contract.projectDetails.startDate}
                    </Tag>
                    <Tag icon={<ClockCircleOutlined />} color="cyan">
                      {contract.projectDetails.duration}
                    </Tag>
                  </Space>
                </Space>
              </Col>
              <Col span={8} style={{ textAlign: "center" }}>
                <Space direction="vertical">
                  <Badge
                    status={getStatusColor(contract.status)}
                    text={getStatusText(contract.status)}
                  />
                  <Progress
                    percent={contract.esnSigned ? 100 : 0}
                    size="small"
                    status={contract.esnSigned ? "success" : "active"}
                  />
                </Space>
              </Col>
              <Col span={8} style={{ textAlign: "right" }}>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() =>
                    setExpandedContract(
                      expandedContract === contract.id ? null : contract.id
                    )
                  }
                >
                  {expandedContract === contract.id
                    ? "Masquer"
                    : "Voir détails"}
                </Button>
              </Col>
            </Row>
            {expandedContract === contract.id && (
              <div style={{ marginTop: 24 }}>
                {renderExpandedContent(contract)}
              </div>
            )}
          </Card>
        )}
      />
    </div>
  );
};

export default ContractList;

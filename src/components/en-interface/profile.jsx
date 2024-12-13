import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Descriptions,
  Tag,
  Divider,
  Avatar,
  Space,
  Button,
  Modal,
  Row,
  Col,
  message,
  Form,
  Input,
} from "antd";
import {
  BuildOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SafetyOutlined,
  LoadingOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { Endponit, token } from "../../helper/enpoint";

const { Text, Paragraph } = Typography;

const axiosConfig = {
  headers: {
    Authorization: `Bearer ${token()}`,
    "Content-Type": "application/json",
  },
};

const ESNProfilePageFrancais = () => {
  const [isDataVisible, setIsDataVisible] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchESNData = async () => {
      try {
        const esnId = localStorage.getItem("id");

        if (!esnId) {
          throw new Error("ESN ID not found in localStorage");
        }

        const response = await axios.get(
          `${Endponit()}/api/getEsnData/?esnId=${esnId}`
        );

        if (
          response.data &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          setProfileData(response.data.data[0]);
        } else {
          throw new Error("No ESN data found");
        }
      } catch (err) {
        setError(err.message);
        message.error("Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchESNData();
  }, []);

  // Function to mask sensitive data
  const maskData = (data, type) => {
    if (data == null) return "";
    const stringData = String(data);

    if (!isDataVisible) {
      switch (type) {
        case "siret":
          return stringData.length > 6
            ? stringData.slice(0, 3) + "********" + stringData.slice(-3)
            : stringData;
        case "iban":
          return stringData.length > 4
            ? stringData.slice(0, 4) + " **** **** **** **** ****"
            : stringData;
        case "phone":
          return stringData.length > 3
            ? stringData.slice(0, 3) + " ** ** ** **"
            : stringData;
        case "email":
          if (stringData.includes("@")) {
            const [username, domain] = stringData.split("@");
            return username.length > 2
              ? username.slice(0, 2) + "****@" + domain
              : stringData;
          }
          return stringData;
        case "tva":
          return stringData.length > 4
            ? stringData.slice(0, 4) + "*********"
            : stringData;
        default:
          return stringData;
      }
    }
    return stringData;
  };

  // Handle form submission for updating profile
  const handleUpdate = async (values) => {
    try {
      setLoading(true);
      const esnId = localStorage.getItem("id");

      // Prepare update payload
      const updatePayload = {
        ...values,
        ID_ESN: esnId,
        password : null,
      };

      // Make API call to update ESN data
      const response = await axios.put(
        `${Endponit()}/api/ESN/`,
        updatePayload,
        axiosConfig
      );

      // Update local state with response
      if (response.data) {
        setProfileData((prevData) => ({
          ...prevData,
          ...updatePayload,
        }));
        message.success("Profil mis à jour avec succès");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Update error:", error);
      message.error("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Space direction="vertical" align="center">
          <LoadingOutlined style={{ fontSize: 48, color: "#1890ff" }} />
          <Text>Chargement des données...</Text>
        </Space>
      </div>
    );
  }

  // Render error state
  if (error || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center">
          <Typography.Title level={4} type="danger">
            Erreur de Chargement
          </Typography.Title>
          <Text>{error || "Aucune donnée disponible"}</Text>
        </Card>
      </div>
    );
  }

  // Render editing form or profile view
  const renderContent = () => {
    if (isEditing) {
      return (
        <Form
          form={form}
          layout="vertical"
          initialValues={profileData}
          onFinish={handleUpdate}
        >
          <Row gutter={[16, 16]}>
            {/* Company Information */}
            <Col span={24}>
              <Card title="Informations de l'Entreprise">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="Raison_sociale"
                      label="Raison Sociale"
                      rules={[
                        {
                          required: true,
                          message: "Veuillez saisir la raison sociale",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="SIRET"
                      label="Numéro SIRET"
                      rules={[
                        {
                          required: true,
                          message: "Veuillez saisir le numéro SIRET",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Contact Information */}
            <Col span={24}>
              <Card title="Coordonnées de Contact">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="mail_Contact"
                      label="E-mail"
                      rules={[
                        { required: true, message: "Veuillez saisir l'email" },
                        {
                          type: "email",
                          message: "Veuillez saisir un email valide",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="Tel_Contact"
                      label="Téléphone"
                      rules={[
                        {
                          required: true,
                          message: "Veuillez saisir le numéro de téléphone",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="Adresse"
                      label="Adresse"
                      rules={[
                        {
                          required: true,
                          message: "Veuillez saisir l'adresse",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="CP"
                      label="Code Postal"
                      rules={[
                        {
                          required: true,
                          message: "Veuillez saisir le code postal",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Bank Information */}
            <Col span={24}>
              <Card title="Informations Bancaires">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="IBAN"
                      label="IBAN"
                      rules={[
                        { required: true, message: "Veuillez saisir l'IBAN" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="BIC"
                      label="Code BIC"
                      rules={[
                        {
                          required: true,
                          message: "Veuillez saisir le code BIC",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Form Actions */}
            <Col span={24} className="text-center">
              <Space>
                <Button type="default" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                >
                  Enregistrer
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      );
    }

    // Original profile view
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <Card className="max-w-6xl mx-auto rounded-3xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01]">
          <Row gutter={[16, 16]}>
            <Col span={24} className="text-center">
              <Avatar
                size={100}
                icon={<BuildOutlined />}
                className="border-8 border-white shadow-2xl bg-blue-500 transform hover:rotate-6 transition-transform duration-300"
              />
              <div className="mt-6">
                <Tag
                  color="success"
                  icon={<CheckCircleOutlined />}
                  className="text-base px-4 py-1"
                >
                  {profileData.Statut}
                </Tag>
              </div>
            </Col>

            <Col span={24}>
              <Divider orientation="center" className="text-2xl font-semibold">
                <Space>
                  <SafetyOutlined />
                  Informations de l'Entreprise
                </Space>
              </Divider>

              <Card
                className="rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
                bordered={false}
              >
                <Descriptions
                  layout="vertical"
                  bordered
                  column={{ xs: 1, sm: 2, md: 3 }}
                  className="bg-white rounded-2xl p-4"
                >
                  <Descriptions.Item label="Numéro SIRET">
                    <Text strong>{maskData(profileData.SIRET, "siret")}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Numéro RCE">
                    <Text strong>{profileData.RCE}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Numéro de TVA">
                    <Text strong>{maskData(profileData.N_TVA, "tva")}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col span={24}>
              <Divider orientation="center" className="text-2xl font-semibold">
                <Space>
                  <GlobalOutlined />
                  Coordonnées de Contact
                </Space>
              </Divider>

              <Card
                className="rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
                bordered={false}
              >
                <Descriptions
                  layout="vertical"
                  bordered
                  column={{ xs: 1, sm: 2, md: 3 }}
                  className="bg-white rounded-2xl p-4"
                >
                  <Descriptions.Item label="Adresse" span={2}>
                    <Paragraph copyable className="mb-0 text-base">
                      {profileData.Adresse}, {profileData.CP}{" "}
                      {profileData.Ville}
                    </Paragraph>
                  </Descriptions.Item>
                  <Descriptions.Item label="Pays">
                    <Space>
                      <GlobalOutlined /> {profileData.Pays}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="E-mail">
                    <Space>
                      <MailOutlined />{" "}
                      {maskData(profileData.mail_Contact, "email")}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Téléphone">
                    <Space>
                      <PhoneOutlined />{" "}
                      {maskData(profileData.Tel_Contact, "phone")}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Région">
                    {profileData.Province}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col span={24}>
              <Divider orientation="center" className="text-2xl font-semibold">
                <Space>
                  <BankOutlined />
                  Informations Bancaires
                </Space>
              </Divider>

              <Card
                className="rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
                bordered={false}
              >
                <Descriptions
                  layout="vertical"
                  bordered
                  column={{ xs: 1, sm: 2, md: 3 }}
                  className="bg-white rounded-2xl p-4"
                >
                  <Descriptions.Item label="Banque">
                    {profileData.Banque}
                  </Descriptions.Item>
                  <Descriptions.Item label="IBAN">
                    {maskData(profileData.IBAN, "iban")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Code BIC">
                    {profileData.BIC}
                  </Descriptions.Item>
                  <Descriptions.Item label="Date de Validation" span={2}>
                    {profileData.Date_validation}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>

          <Modal
            title="Vérification des Informations Sensibles"
            visible={false}
            onCancel={() => setIsDataVisible(true)}
            footer={[
              <Button
                key="submit"
                type="primary"
                onClick={() => setIsDataVisible(true)}
              >
                Vérifier
              </Button>,
            ]}
          >
            <p>
              Une vérification supplémentaire est requise pour accéder aux
              détails complets.
            </p>
            <p>
              Veuillez cliquer sur "Vérifier" pour afficher toutes les
              informations.
            </p>
          </Modal>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <Card
        className="max-w-6xl mx-auto rounded-3xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01]"
        extra={
          !isEditing ? (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
            >
              Modifier le Profil
            </Button>
          ) : null
        }
      >
        {renderContent()}

        <Row className="mt-6">
          <Col span={24} className="text-center">
            {!isEditing ? (
              <Button
                type="primary"
                size="large"
                icon={
                  isDataVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />
                }
                onClick={() => setIsDataVisible(!isDataVisible)}
                className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
              >
                {isDataVisible
                  ? "Masquer les Informations Sensibles"
                  : "Afficher les Informations Sensibles"}
              </Button>
            ) : (
              ""
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ESNProfilePageFrancais;

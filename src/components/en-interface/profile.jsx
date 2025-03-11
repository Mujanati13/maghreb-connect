import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Typography,
  Descriptions,
  Tag,
  Divider,
  Avatar,
  Space,
  Button,
  Row,
  Col,
  message,
  Form,
  Input,
  DatePicker,
  Progress,
  Alert,
  Tooltip,
  Select,
  Modal,
  Checkbox,
} from "antd";
import {
  BuildOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  SafetyOutlined,
  LoadingOutlined,
  EditOutlined,
  SaveOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  CreditCardOutlined,
  BarcodeOutlined,
  NumberOutlined,
  FileProtectOutlined,
  FilePdfOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { Endponit, token } from "../../helper/enpoint";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import "jspdf-autotable";
const { Text, Paragraph } = Typography;
const { Option } = Select;

const axiosConfig = {
  headers: {
    Authorization: `Bearer ${token()}`,
    "Content-Type": "application/json",
  },
};

// Add this constant near the top of your file, after imports
const pulseAnimationStyle = `
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.7);
      transform: scale(1);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
      transform: scale(1.05);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
      transform: scale(1);
    }
  }
`;

const ESNProfilePageFrancais = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [completionStatus, setCompletionStatus] = useState(0);
  const [isAccountActive, setIsAccountActive] = useState(false);
  const [contractModalVisible, setContractModalVisible] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [contractCheckbox, setContractCheckbox] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const pdfRef = useRef(null);

  // Add this useEffect after your other useEffects
  useEffect(() => {
    // Show a notification when component mounts if contract needs to be signed
    if (profileData?.Statut === "à signer") {
      message.info({
        content:
          "Action requise: Veuillez accepter le contrat pour activer votre compte",
        duration: 5,
        icon: <FileProtectOutlined style={{ color: "#1890ff" }} />,
      });
    }
  }, [profileData?.Statut]);

  // Handle opening contract modal
  const showContractModal = () => {
    setContractModalVisible(true);
  };

  // Handle contract acceptance
  const handleContractAcceptance = async () => {
    if (!contractCheckbox) {
      message.warning("Veuillez accepter les termes du contrat");
      return;
    }

    try {
      setLoading(true);
      const esnId = localStorage.getItem("id");

      // Update ESN status to "ready"
      const updatePayload = {
        ...profileData,
        ID_ESN: esnId,
        Statut: "Actif",
      };

      const response = await axios.put(
        `${Endponit()}/api/ESN/`,
        updatePayload,
        axiosConfig
      );

      if (response) {
        setContractAccepted(true);
        setContractModalVisible(false);

        // Update local profileData state
        setProfileData({
          ...profileData,
          Statut: "Actif",
        });

        message.success("Contrat accepté avec succès!");
        // Generate PDF after accepting the contract
        generatePDF();
      } else {
        throw new Error("Échec de la mise à jour du statut");
      }
    } catch (error) {
      console.error("Error accepting contract:", error);
      message.error("Erreur lors de l'acceptation du contrat");
    } finally {
      setLoading(false);
    }
  };

  // Handle activating ESN account
  const activateESNAccount = async () => {
    try {
      setLoading(true);
      const esnId = localStorage.getItem("id");

      // Update ESN status to "actif"
      const updatePayload = {
        ID_ESN: esnId,
        Statut: "actif",
        Date_validation: dayjs().format("YYYY-MM-DD"),
      };

      const response = await axios.put(
        `${Endponit()}/api/ESN/updateStatus`,
        updatePayload,
        axiosConfig
      );

      if (response.data && response.data.success) {
        // Update local profileData state
        setProfileData({
          ...profileData,
          Statut: "actif",
          Date_validation: dayjs(),
        });

        setIsAccountActive(true);
        message.success("Compte ESN activé avec succès!");
      } else {
        throw new Error("Échec de l'activation du compte");
      }
    } catch (error) {
      console.error("Error activating account:", error);
      message.error("Erreur lors de l'activation du compte");
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF with ESN information
  const generatePDF = () => {
    if (!profileData) return;

    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.setTextColor(0, 51, 102);
      doc.text("Fiche d'Enregistrement ESN", 105, 20, { align: "center" });

      // Add date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Généré le: ${dayjs().format("DD/MM/YYYY")}`, 105, 30, {
        align: "center",
      });

      // Add ESN logo placeholder
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(75, 40, 60, 30, 3, 3, "FD");
      doc.setFontSize(12);
      doc.setTextColor(150, 150, 150);
      doc.text("Logo ESN", 105, 55, { align: "center" });

      // Add company information
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Informations de l'Entreprise", 20, 90);
      doc.setFontSize(11);

      // Company details
      const companyInfo = [
        ["Raison Sociale", profileData.Raison_sociale || ""],
        ["Numéro SIRET", profileData.SIRET || ""],
        ["Numéro de TVA", profileData.N_TVA || ""],
        ["RCE", profileData.RCE || ""],
        ["Pays", profileData.Pays || ""],
      ];

      doc.autoTable({
        startY: 95,
        head: [["Champ", "Valeur"]],
        body: companyInfo,
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Contact information
      doc.setFontSize(14);
      doc.text("Coordonnées de Contact", 20, doc.lastAutoTable.finalY + 20);

      const contactInfo = [
        [
          "Adresse",
          `${profileData.Adresse || ""}, ${profileData.CP || ""} ${
            profileData.Ville || ""
          }`,
        ],
        ["Province/Région", profileData.Province || ""],
        ["E-mail", profileData.mail_Contact || ""],
        ["Téléphone", profileData.Tel_Contact || ""],
      ];

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 25,
        head: [["Champ", "Valeur"]],
        body: contactInfo,
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Banking information
      doc.setFontSize(14);
      doc.text("Informations Bancaires", 20, doc.lastAutoTable.finalY + 20);

      const bankInfo = [
        ["Banque", profileData.Banque || ""],
        ["IBAN", profileData.IBAN || ""],
        ["Code BIC", profileData.BIC || ""],
      ];

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 25,
        head: [["Champ", "Valeur"]],
        body: bankInfo,
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Add footer with status
      doc.setFontSize(12);
      const status =
        profileData.Statut === "actif" ? "Actif" : "En attente d'activation";
      doc.setTextColor(0, 0, 0);
      doc.text(`Statut actuel: ${status}`, 20, 270);
      doc.text("© MaghrebitConnect", 105, 280, { align: "center" });

      // Save the PDF
      doc.save(`ESN_${profileData.Raison_sociale}_Fiche.pdf`);
      setPdfGenerated(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error("Erreur lors de la génération du PDF");
    }
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = (data) => {
    // Required fields with higher weights
    const requiredFields = {
      Raison_sociale: { weight: 15, filled: !!data.Raison_sociale },
      mail_Contact: { weight: 15, filled: !!data.mail_Contact },
      Adresse: { weight: 10, filled: !!data.Adresse },
    };

    const importantFields = {
      SIRET: { weight: 10, filled: !!data.SIRET },
      CP: { weight: 5, filled: !!data.CP },
      Ville: { weight: 5, filled: !!data.Ville },
      Tel_Contact: { weight: 5, filled: !!data.Tel_Contact },
      N_TVA: { weight: 5, filled: !!data.N_TVA },
      Province: { weight: 3, filled: !!data.Province },
    };

    const additionalFields = {
      Pays: { weight: 3, filled: !!data.Pays },
      RCE: { weight: 5, filled: !!data.RCE },
      IBAN: { weight: 7, filled: !!data.IBAN },
      BIC: { weight: 5, filled: !!data.BIC },
      Banque: { weight: 5, filled: !!data.Banque },
    };

    const allFields = {
      ...requiredFields,
      ...importantFields,
      ...additionalFields,
    };

    let totalWeight = 0;
    let filledWeight = 0;

    Object.values(allFields).forEach((field) => {
      totalWeight += field.weight;
      if (field.filled) {
        filledWeight += field.weight;
      }
    });

    const completion = Math.round((filledWeight / totalWeight) * 100);
    setCompletionStatus(completion);

    // Account is considered active if completion is >= 80% and status is "actif"
    const active = completion >= 99 && data.Statut?.toLowerCase() === "actif";
    setIsAccountActive(active);

    // Auto-update status to "à valider" when profile is 100% complete
    if (
      completion === 100 &&
      data.Statut !== "à signer" &&
      data.Statut !== "actif" &&
      data.Statut !== "à valider"
    ) {
      if (completion === 100 && data.Statut === "Draft") {
        // Only update if current status is specifically "Draft"
        updateProfileStatus(data);
      }
    }
  };

  // Add this new function to handle the automatic status update
  const updateProfileStatus = async (data) => {
    try {
      const esnId = localStorage.getItem("id");

      const updatePayload = {
        ...data,
        ID_ESN: esnId,
        Statut: "à valider",
        password: null,
      };

      const response = await axios.put(
        `${Endponit()}/api/ESN/`,
        updatePayload,
        axiosConfig
      );

      if (response.data) {
        // Update local state
        setProfileData({
          ...data,
          Statut: "à valider",
        });
        message.success(
          "Votre profil est complet! Statut mis à jour: à valider"
        );
      }
    } catch (error) {
      console.error("Error updating ESN status:", error);
      message.error("Erreur lors de la mise à jour automatique du statut");
    }
  };

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
        if (response.data && response.data.data) {
          const data = response.data.data[0] || response.data.data;
          // Convert Date_validation to dayjs if it exists
          if (data.Date_validation) {
            data.Date_validation = dayjs(data.Date_validation);
          }
          setProfileData(data);
          calculateProfileCompletion(data);
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

  const handleUpdate = async (values) => {
    try {
      setLoading(true);
      const esnId = localStorage.getItem("id");

      // Create update payload with form values
      let updatePayload = {
        ...values,
        ID_ESN: esnId,
        password: null,
        Date_validation: values.Date_validation
          ? values.Date_validation.format("YYYY-MM-DD")
          : null,
      };

      // Check profile completion to determine if status should change to "à valider"
      const updatedData = {
        ...profileData,
        ...values,
      };

      // Calculate completion with temporary updated data
      let tempCompletion = 0;
      const requiredFields = [
        "Raison_sociale",
        "mail_Contact",
        "Adresse",
        "SIRET",
        "CP",
        "Ville",
        "Tel_Contact",
      ];
      const allFieldsFilled = requiredFields.every(
        (field) => updatedData[field]
      );

      // If profile is complete and status isn't already set to higher level, update to "à valider"
      if (
        allFieldsFilled &&
        profileData.Statut !== "ready" &&
        profileData.Statut !== "Actif" &&
        profileData.Statut !== "à valider"
      ) {
        updatePayload.Statut = "à valider";
      }

      const response = await axios.put(
        `${Endponit()}/api/ESN/`,
        updatePayload,
        axiosConfig
      );

      if (response.data) {
        const updatedData = {
          ...profileData,
          ...updatePayload,
          Date_validation: values.Date_validation, // Keep as dayjs object for UI display
        };
        setProfileData(updatedData);
        calculateProfileCompletion(updatedData);

        // Show specific message if status was updated to "à valider"
        if (updatePayload.Statut === "à valider") {
          message.success("Profil complété et soumis pour validation!");
        } else {
          message.success("Profil mis à jour avec succès");
        }

        setIsEditing(false);
      }
    } catch (error) {
      console.error("Update error:", error);
      message.error("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

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

  const renderContent = () => {
    const formItemLayout = {
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    };

    if (isEditing) {
      return (
        <Form
          form={form}
          layout="vertical"
          initialValues={profileData}
          onFinish={handleUpdate}
          {...formItemLayout}
        >
          <Row gutter={[16, 16]}>
            {/* Company Icon/Avatar */}
            <Col span={24} className="text-center mb-6">
              <Avatar
                size={100}
                icon={<BuildOutlined />}
                className="mb-4 border-4 border-blue-500"
              />
            </Col>

            {/* Company Information */}
            <Col span={24}>
              <Card
                title={
                  <Space>
                    <SafetyOutlined />
                    Informations de l'Entreprise
                  </Space>
                }
              >
                <Row gutter={16}>
                  <Col span={24} md={8}>
                    <Form.Item
                      name="Raison_sociale"
                      label="Raison sociale"
                      rules={[{ required: true, message: "Champ requis" }]}
                    >
                      <Input prefix={<BuildOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={24} md={8}>
                    <Form.Item
                      name="SIRET"
                      label="Numéro SIRET"
                      rules={[{ required: true, message: "Champ requis" }]}
                    >
                      <Input prefix={<IdcardOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={24} md={8}>
                    <Form.Item name="N_TVA" label="Numéro de TVA">
                      <Input prefix={<BarcodeOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={24} md={12}>
                    <Form.Item name="RCE" label="RCE">
                      <Input prefix={<IdcardOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={24} md={12}>
                    <Form.Item name="Pays" label="Pays">
                      <Select placeholder="Sélectionner un Pays">
                        <Option value="France">France</Option>
                        <Option value="Belgique">Belgique</Option>
                        <Option value="Suisse">Suisse</Option>
                        <Option value="Canada">Canada</Option>
                        <Option value="Maroc">Maroc</Option>
                        <Option value="Other">Autre</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Contact Information */}
            <Col span={24}>
              <Card
                title={
                  <Space>
                    <GlobalOutlined />
                    Coordonnées de Contact
                  </Space>
                }
              >
                <Row gutter={16}>
                  <Col span={24} md={6}>
                    <Form.Item
                      name="mail_Contact"
                      label="E-mail"
                      rules={[
                        { required: true, message: "Champ requis" },
                        { type: "email", message: "E-mail invalide" },
                      ]}
                    >
                      <Input prefix={<MailOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={24} md={6}>
                    <Form.Item
                      name="Tel_Contact"
                      label="Téléphone"
                      rules={[{ required: true, message: "Champ requis" }]}
                    >
                      <Input prefix={<PhoneOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={24} md={12}>
                    <Form.Item
                      name="Adresse"
                      label="Adresse"
                      rules={[{ required: true, message: "Champ requis" }]}
                    >
                      <Input prefix={<HomeOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={24} md={4}>
                    <Form.Item
                      name="CP"
                      label="Code Postal"
                      rules={[{ required: true, message: "Champ requis" }]}
                    >
                      <Input prefix={<NumberOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={24} md={4}>
                    <Form.Item
                      name="Ville"
                      label="Ville"
                      rules={[{ required: true, message: "Champ requis" }]}
                    >
                      <Input prefix={<EnvironmentOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={24} md={4}>
                    <Form.Item name="Province" label="Province/Région">
                      <Input prefix={<EnvironmentOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Bank Information */}
            <Col span={24}>
              <Card
                title={
                  <Space>
                    <BankOutlined />
                    Informations Bancaires
                  </Space>
                }
              >
                <Row gutter={16}>
                  <Col span={24} md={8}>
                    <Form.Item name="Banque" label="Banque">
                      <Input prefix={<BankOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={24} md={8}>
                    <Form.Item name="IBAN" label="IBAN">
                      <Input prefix={<CreditCardOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={24} md={8}>
                    <Form.Item name="BIC" label="Code BIC">
                      <Input prefix={<CreditCardOutlined />} />
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

    return (
      <div>
        {/* Profile Completion Progress Section */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col span={24}>
            <Card
              className="rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
              bordered={false}
            >
              <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <div className="mb-4 md:mb-0 w-full">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-blue-900 mr-3">
                      Complétude du profil
                    </h3>
                  </div>
                </div>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setIsEditing(true)}
                  className="transition-transform hover:scale-105"
                >
                  Modifier le Profil
                </Button>
              </div>

              <Tooltip title={`Profil ${completionStatus}% complété`}>
                <Progress
                  percent={completionStatus}
                  status={completionStatus === 100 ? "success" : "active"}
                  strokeColor={{
                    "0%": "#108ee9",
                    "100%": "#87d068",
                  }}
                  strokeWidth={10}
                  className="w-full"
                />
              </Tooltip>

              {!isAccountActive && completionStatus < 80 && (
                <Alert
                  message="Pour activer votre compte ESN, complétez votre profil"
                  description="Les informations essentielles sont nécessaires pour activer votre compte et accéder à toutes les fonctionnalités."
                  type="warning"
                  showIcon
                  className="mt-4"
                />
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={24} className="text-center">
            {/* <Avatar
              size={120}
              icon={<BuildOutlined />}
              className="mb-4 border-4 border-blue-500 shadow-lg"
            /> */}
            <div className="mt-4">
              <Tag
                color={isAccountActive ? "success" : "warning"}
                icon={
                  isAccountActive ? (
                    <CheckCircleOutlined />
                  ) : (
                    <ExclamationCircleOutlined />
                  )
                }
                className="text-base px-4 py-1"
              >
                {profileData.Statut || "En attente d'activation"}
              </Tag>
            </div>
          </Col>

          {/* Contract Status and Buttons */}
          <Col span={24}>
            <Card
              className="rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
              bordered={false}
            >
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Statut du contrat:{" "}
                    <Tag
                      color={
                        contractAccepted ||
                        profileData.Statut === "ready" ||
                        profileData.Statut === "Actif"
                          ? "green"
                          : "orange"
                      }
                    >
                      {contractAccepted ||
                      profileData.Statut === "ready" ||
                      profileData.Statut === "Actif"
                        ? "Contrat accepté"
                        : "En attente de signature"}
                    </Tag>
                  </h3>
                  <p className="text-gray-600">
                    {contractAccepted ||
                    profileData.Statut === "ready" ||
                    profileData.Statut === "Actif"
                      ? "Vous avez accepté les conditions générales d'utilisation."
                      : "Pour activer votre compte, veuillez accepter les conditions générales d'utilisation."}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  {!contractAccepted && profileData.Statut == "à signer" && (
                    <Button
                      type="primary"
                      icon={<FileProtectOutlined />}
                      onClick={showContractModal}
                      className="pulse-animation mr-2"
                      style={{
                        boxShadow: "0 0 8px #1890ff",
                        animation: "pulse 1.5s infinite",
                      }}
                    >
                      Accepter le contrat
                    </Button>
                  )}
                  {/* {(contractAccepted || profileData.Statut === "ready") &&
                    profileData.Statut !== "actif" && (
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={activateESNAccount}
                        className="mr-2"
                      >
                        Activer mon compte ESN
                      </Button>
                    )} */}
                  {(contractAccepted || profileData.Statut === "Actif") && (
                    <Button
                      type="default"
                      icon={<FilePdfOutlined />}
                      onClick={generatePDF}
                    >
                      Télécharger le contrat
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </Col>
          {/* Company Information Section */}
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
                <Descriptions.Item label="Raison Sociale">
                  <Text strong>{profileData.Raison_sociale}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Numéro SIRET">
                  <Text strong>{profileData.SIRET}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Numéro de TVA">
                  <Text strong>{profileData.N_TVA}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="RCE">
                  <Text strong>{profileData.RCE}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Pays">
                  <Text strong>{profileData.Pays}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Contact Information Section */}
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
                    {profileData.Adresse}, {profileData.CP} {profileData.Ville}
                  </Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label="Province/Région">
                  <Space>
                    <EnvironmentOutlined /> {profileData.Province}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="E-mail">
                  <Space>
                    <MailOutlined /> {profileData.mail_Contact}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Téléphone">
                  <Space>
                    <PhoneOutlined /> {profileData.Tel_Contact}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Bank Information Section */}
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
                  {profileData.Banque || "Non spécifié"}
                </Descriptions.Item>
                <Descriptions.Item label="IBAN">
                  {profileData.IBAN || "Non spécifié"}
                </Descriptions.Item>
                <Descriptions.Item label="Code BIC">
                  {profileData.BIC || "Non spécifié"}
                </Descriptions.Item>
                <Descriptions.Item label="Date de Validation" span={2}>
                  {profileData.Date_validation
                    ? profileData.Date_validation.format("DD/MM/YYYY")
                    : "Non spécifié"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // Add this before the return statement

  // Contract modal content
  const contractModal = (
    <Modal
      title={
        <div className="text-center">
          <FileProtectOutlined /> Contrat d'Adhésion ESN
        </div>
      }
      visible={contractModalVisible}
      onCancel={() => setContractModalVisible(false)}
      footer={[
        <Button key="back" onClick={() => setContractModalVisible(false)}>
          Annuler
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          disabled={!contractCheckbox}
          onClick={handleContractAcceptance}
        >
          Accepter et Continuer
        </Button>,
      ]}
      width={800}
    >
      <div className="contract-content p-4 max-h-96 overflow-auto border rounded mb-4">
        <h2 className="text-xl mb-4">CONDITIONS GÉNÉRALES D'UTILISATION</h2>
        <p className="mb-3">
          Le présent contrat définit les conditions d'utilisation de la
          plateforme MaghrebitConnect par les Entreprises de Services Numériques
          (ESN).
        </p>

        <h3 className="text-lg font-bold mt-4">1. Objet du contrat</h3>
        <p className="mb-3">
          Ce contrat a pour objet de définir les conditions dans lesquelles
          l'ESN peut utiliser les services proposés par la plateforme
          MaghrebitConnect.
        </p>

        <h3 className="text-lg font-bold mt-4">2. Obligations de l'ESN</h3>
        <p className="mb-3">L'ESN s'engage à :</p>
        <ul className="list-disc pl-6 mb-3">
          <li>
            Fournir des informations exactes et à jour concernant son entreprise
          </li>
          <li>Respecter les conditions d'utilisation de la plateforme</li>
          <li>
            Ne pas utiliser la plateforme à des fins illégales ou frauduleuses
          </li>
          <li>Maintenir la confidentialité de ses identifiants de connexion</li>
        </ul>

        <h3 className="text-lg font-bold mt-4">3. Services fournis</h3>
        <p className="mb-3">
          MaghrebitConnect s'engage à fournir un accès aux services suivants :
        </p>
        <ul className="list-disc pl-6 mb-3">
          <li>Publication d'offres d'emploi</li>
          <li>Recherche de profils</li>
          <li>Gestion des candidatures</li>
          <li>Suivi des recrutements</li>
        </ul>

        <h3 className="text-lg font-bold mt-4">4. Responsabilités</h3>
        <p className="mb-3">MaghrebitConnect ne peut être tenu responsable :</p>
        <ul className="list-disc pl-6 mb-3">
          <li>
            Des inexactitudes ou erreurs dans les informations fournies par
            l'ESN
          </li>
          <li>De l'utilisation frauduleuse de la plateforme par l'ESN</li>
          <li>Des interruptions temporaires de service pour maintenance</li>
        </ul>

        <h3 className="text-lg font-bold mt-4">5. Durée du contrat</h3>
        <p className="mb-3">
          Le présent contrat est conclu pour une durée indéterminée à compter de
          son acceptation.
        </p>

        <h3 className="text-lg font-bold mt-4">6. Résiliation</h3>
        <p className="mb-3">
          Chacune des parties peut résilier le contrat moyennant un préavis de
          30 jours.
        </p>
      </div>

      <div className="text-center">
        <Checkbox
          onChange={(e) => setContractCheckbox(e.target.checked)}
          checked={contractCheckbox}
        >
          J'ai lu et j'accepte les conditions générales d'utilisation
        </Checkbox>
      </div>
    </Modal>
  );

  return (
    <div className="min-h-screen p-6">
      <style>{pulseAnimationStyle}</style>
      <Card
        className="max-w-6xl mx-auto rounded-3xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01]"
        bordered={false}
      >
        {renderContent()}
      </Card>
      {contractModal}
    </div>
  );
};

export default ESNProfilePageFrancais;

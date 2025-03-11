import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  Button,
  Avatar,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  Upload,
  message,
  Select,
  Switch,
  Progress,
  Tag,
  Tooltip,
  Alert,
  Divider,
  Collapse,
  Modal,
  Checkbox,
  Space,
} from "antd";
import {
  EditOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  BankOutlined,
  UploadOutlined,
  SaveOutlined,
  CloseOutlined,
  LinkedinOutlined,
  GithubOutlined,
  TwitterOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  NumberOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  CreditCardOutlined,
  BarcodeOutlined,
  FileProtectOutlined,
  FilePdfOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import { Endponit, token } from "../../helper/enpoint";
import jsPDF from "jspdf";
import "jspdf-autotable";

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

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

const ClientPlusInfo = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [img_path, setimg_path] = useState("");
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: true,
    showPhone: false,
    showLocation: true,
  });
  const [profile, setProfile] = useState(null);
  const [profileedit, setProfileedit] = useState(null);
  const [completionStatus, setCompletionStatus] = useState(0);
  const [profileStatus, setProfileStatus] = useState(false);
  // Add new state variables for contract handling
  const [contractModalVisible, setContractModalVisible] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [contractCheckbox, setContractCheckbox] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  useEffect(() => {
    // Show a notification when component mounts if contract needs to be signed
    if (profile?.Statut === "à signer") {
      message.info({
        content:
          "Action requise: Veuillez accepter le contrat pour activer votre compte",
        duration: 5,
        icon: <FileProtectOutlined style={{ color: "#1890ff" }} />,
      });
    }
  }, [profile?.Statut]);

  // Show contract modal
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
      const clientId = localStorage.getItem("id");

      // Update client status to "ready"
      const updatePayload = {
        ...profileedit,
        ID_clt: clientId,
        statut: "Actif",
      };

      const response = await axios.put(
        `${Endponit()}/api/client/`,
        updatePayload,
        {
          headers: {
            Authorization: `Bearer ${token()}`,
          },
        }
      );

      if (response) {
        setContractAccepted(true);
        setContractModalVisible(false);

        // Update local profile state
        const updatedProfile = {
          ...profileedit,
          statut: "Actif",
        };

        setProfile(updatedProfile);
        message.success("Contrat accepté avec succès!");

        // Generate PDF after accepting contract
        generatePDF();
      } else {
        throw new Error("Échec de la mise à jour du statut");
      }
    } catch (error) {
      console.error("Error accepting contract:", error);
      message.error("Erreur lors de l'acceptation du contrat");
    }
  };

  // Activate client account
  const activateClientAccount = async () => {
    try {
      const clientId = localStorage.getItem("id");

      // Update client status to "validé" instead of "actif"
      const updatePayload = {
        ID_clt: clientId,
        Statut: "validé",
        date_validation: dayjs().format("YYYY-MM-DD"),
      };

      const response = await axios.put(
        `${Endponit()}/api/client/updateStatus`,
        updatePayload,
        {
          headers: {
            Authorization: `Bearer ${token()}`,
          },
        }
      );

      if (response.data && response.data.success) {
        // Update local profile state
        const updatedProfile = {
          ...profile,
          Statut: "validé",
          birthDate: dayjs(),
        };

        setProfile(updatedProfile);
        setProfileStatus(true);
        message.success("Compte client activé avec succès!");
      } else {
        throw new Error("Échec de l'activation du compte");
      }
    } catch (error) {
      console.error("Error activating account:", error);
      message.error("Erreur lors de l'activation du compte");
    }
  };

  // Generate PDF with client information
  const generatePDF = () => {
    if (!profile) return;

    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.setTextColor(0, 51, 102);
      doc.text("Fiche Client", 105, 20, { align: "center" });

      // Add date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Généré le: ${dayjs().format("DD/MM/YYYY")}`, 105, 30, {
        align: "center",
      });

      // Add client logo placeholder or image
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(75, 40, 60, 30, 3, 3, "FD");
      doc.setFontSize(12);
      doc.setTextColor(150, 150, 150);
      doc.text("Logo Client", 105, 55, { align: "center" });

      // Add company information
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Informations de l'Entreprise", 20, 90);
      doc.setFontSize(11);

      // Company details
      const companyInfo = [
        ["Raison Sociale", profile.raison_sociale || ""],
        ["Numéro SIRET", profile.siret || ""],
        ["Numéro de TVA", profile.n_tva || ""],
        ["Secteur d'Activité", profile.industry || ""],
        ["Description/RCE", profile.bio || ""],
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
          `${profile.address || ""}, ${profile.cp || ""} ${
            profile.ville || ""
          }`,
        ],
        ["Province/Région", profile.province || ""],
        ["E-mail", profile.email || ""],
        ["Téléphone", profile.phone || ""],
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
        ["Banque", profile.banque || ""],
        ["IBAN", profile.iban || ""],
        ["Code BIC", profile.bic || ""],
      ];

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 25,
        head: [["Champ", "Valeur"]],
        body: bankInfo,
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Web presence
      doc.setFontSize(14);
      doc.text("Présence Web", 20, doc.lastAutoTable.finalY + 20);

      const webInfo = [
        ["LinkedIn", profile.socialLinks?.linkedin || ""],
        ["Twitter", profile.socialLinks?.twitter || ""],
        ["Site Web", profile.socialLinks?.website || ""],
      ];

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 25,
        head: [["Plateforme", "Lien"]],
        body: webInfo,
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Add footer with status
      doc.setFontSize(12);
      const status = profileStatus ? "Actif" : "En attente d'activation";
      doc.setTextColor(0, 0, 0);
      doc.text(`Statut actuel: ${status}`, 20, 270);
      doc.text("© MaghrebitConnect", 105, 280, { align: "center" });

      // Save the PDF
      doc.save(`Client_${profile.raison_sociale}_Fiche.pdf`);
      setPdfGenerated(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error("Erreur lors de la génération du PDF");
    }
  };

  useEffect(() => {
    fetchClientData();
  }, []);

  // Calculate the profile completion percentage
  const calculateProfileCompletion = (profileData) => {
    const requiredFields = {
      raison_sociale: { weight: 15, filled: !!profileData.raison_sociale },
      email: { weight: 15, filled: !!profileData.email },
    };

    const optionalFields = {
      phone: { weight: 5, filled: !!profileData.phone },
      address: { weight: 5, filled: !!profileData.address },
      // cp: { weight: 3, filled: !!profileData.cp },
      ville: { weight: 3, filled: !!profileData.ville },
      province: { weight: 3, filled: !!profileData.province },
      siret: { weight: 8, filled: !!profileData.siret },
      n_tva: { weight: 5, filled: !!profileData.n_tva },
      // occupation: { weight: 5, filled: !!profileData.occupation },
      // birthDate: { weight: 5, filled: !!profileData.birthDate },
      // bio: { weight: 5, filled: !!profileData.bio },
      // industry: { weight: 5, filled: !!profileData.industry },
      // img_path: { weight: 10, filled: !!profileData.img_path },
      iban: { weight: 3, filled: !!profileData.iban },
      bic: { weight: 3, filled: !!profileData.bic },
      banque: { weight: 2, filled: !!profileData.banque },
    };

    const allFields = { ...requiredFields, ...optionalFields };

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

    // Check if profile is 100% complete and update status if needed
    if (
      completion === 100 &&
      profile &&
      profile.Statut === "Draft" // Only update if current status is specifically "Draft"
    ) {
      updateClientStatus("à valider");
    }
  };

  // Function to update client status
  const updateClientStatus = async (newStatus) => {
    try {
      const clientId = localStorage.getItem("id");

      const updatePayload = {
        // ...profileedit,
        mail_contact: profileedit.mail_contact,
        ID_clt: clientId,
        statut: newStatus,
      };

      const response = await axios.put(
        `${Endponit()}/api/client/`,
        updatePayload,
        {
          headers: {
            Authorization: `Bearer ${token()}`,
          },
        }
      );

      if (response) {
        // Update local profile state
        const updatedProfile = {
          ...profile,
          Statut: newStatus,
        };

        setProfile(updatedProfile);
        message.success(
          `Votre profil est complet! Statut mis à jour: ${newStatus}`
        );
      } else {
        throw new Error("Échec de la mise à jour du statut");
      }
    } catch (error) {
      console.error("Error updating client status:", error);
      message.error("Erreur lors de la mise à jour du statut");
    }
  };

  const fetchClientData = async () => {
    const id = localStorage.getItem("id");

    try {
      const response = await axios.get(`${Endponit()}/api/getUserData`, {
        headers: {
          Authorization: `Bearer ${token()}`,
        },
        params: {
          clientId: id,
        },
      });

      const client = response.data.data;
      setProfileedit(client[0]);
      const profileData = {
        id: client[0].ID_clt,
        img_path: client[0].img_path,
        raison_sociale: client[0].raison_sociale || "",
        email: client[0].mail_contact,
        phone: client[0].tel_contact || "",
        address: client[0].adresse || "",
        cp: client[0].cp || "",
        ville: client[0].ville || "",
        province: client[0].province || "",
        siret: client[0].siret || "",
        n_tva: client[0].n_tva || "",
        occupation: client[0].statut || "",
        birthDate: client[0].date_validation
          ? dayjs(client[0].date_validation)
          : null,
        bio: client[0].rce || "",
        industry: client[0].pays || "",
        iban: client[0].iban || "",
        bic: client[0].bic || "",
        banque: client[0].banque || "",
        socialLinks: {
          linkedin: client[0].linkedin || "",
          twitter: client[0].twitter || "",
          website: client[0].website || "",
        },
        Statut: client[0].statut || "",
      };

      // Set account status - now checking for "validé" status
      setProfileStatus(
        client[0].statut?.toLowerCase() === "validé" ||
          client[0].statut?.toLowerCase() === "Actif"
      );

      // Set contract status - now checking for "ready" or "validé" status
      setContractAccepted(client[0].statut?.toLowerCase() === "Actif");

      // Calculate profile completion
      calculateProfileCompletion(profileData);

      setProfile(profileData);
      form.setFieldsValue({
        ...profileData,
        ...profileData.socialLinks,
      });
    } catch (error) {
      console.error("Error fetching client data:", error);
      message.error(
        "Une erreur s'est produite lors du chargement des données du client."
      );
    }
  };

  const handlePrivacyToggle = (setting) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
    message.info(
      `Visibilité de ${setting
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())} mise à jour`
    );
  };

  const handleEdit = useCallback(() => {
    if (isEditing) {
      form
        .validateFields()
        .then(async (values) => {
          const updatedProfile = {
            ID_clt: profile.id,
            raison_sociale: values.raison_sociale,
            mail_contact: values.email,
            tel_contact: values.phone || "",
            adresse: values.address || "",
            cp: values.cp || "",
            ville: values.ville || "",
            province: values.province || "",
            siret: values.siret || "",
            n_tva: values.n_tva || "",
            statut: values.occupation || "",
            date_validation: values.birthDate
              ? values.birthDate.format("YYYY-MM-DD")
              : null,
            rce: values.bio || "",
            pays: values.industry || "",
            linkedin: values.linkedin || "",
            twitter: values.twitter || "",
            website: values.website || "",
            iban: values.iban || "",
            bic: values.bic || "",
            banque: values.banque || "",
            img_path: img_path || profile.img_path,
            password: null,
          };

          try {
            await axios.put(`${Endponit()}/api/client/`, updatedProfile, {
              headers: {
                Authorization: `Bearer ${token()}`,
              },
            });

            const updatedProfileData = {
              ...profile,
              ...updatedProfile,
              birthDate: values.birthDate,
              address: values.address,
              cp: values.cp,
              ville: values.ville,
              province: values.province,
              siret: values.siret,
              n_tva: values.n_tva,
              iban: values.iban,
              bic: values.bic,
              banque: values.banque,
              socialLinks: {
                linkedin: values.linkedin || "",
                twitter: values.twitter || "",
                website: values.website || "",
              },
            };

            setProfile(updatedProfileData);
            calculateProfileCompletion(updatedProfileData);
            setIsEditing(false);
            message.success("Profil mis à jour avec succès");

            // Retrieve updated profile data to reflect any status changes
            fetchClientData();
          } catch (error) {
            console.error("Error updating client data:", error);
            message.error(
              "Une erreur s'est produite lors de la mise à jour du profil."
            );
          }
        })
        .catch((error) => {
          message.error("Veuillez vérifier les champs requis");
        });
    } else {
      setIsEditing(true);
    }
  }, [form, isEditing, profile, img_path]);

  const handleCancelEdit = () => {
    form.setFieldsValue({
      ...profile,
      ...profile.socialLinks,
    });
    setIsEditing(false);
  };

  const handleProfileImageUpload = async (info) => {
    const file = info.file;
    const isImage = file.type.startsWith("image/");
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isImage) {
      message.error("Vous ne pouvez télécharger que des fichiers image!");
      return;
    }

    if (!isLt2M) {
      message.error("L'image doit être inférieure à 2MB!");
      return;
    }

    const formData = new FormData();
    formData.append("uploadedFile", file.originFileObj);
    formData.append("path", "./upload/profile/");

    try {
      const uploadResponse = await axios.post(
        `${Endponit()}/api/saveDoc/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token()}`,
          },
        }
      );

      const imagePath = uploadResponse.data.path;
      setimg_path(imagePath);

      const updatedProfile = { ...profile, img_path: imagePath };
      setProfile(updatedProfile);
      calculateProfileCompletion(updatedProfile);
    } catch (error) {
      console.error("Upload Error:", error);
      message.error("Erreur lors du téléchargement de l'image");
    }
  };

  // Contract modal content
  const contractModal = (
    <Modal
      title={
        <div className="text-center">
          <FileProtectOutlined /> Contrat d'Adhésion Client
        </div>
      }
      open={contractModalVisible}
      onCancel={() => setContractModalVisible(false)}
      footer={[
        <Button key="back" onClick={() => setContractModalVisible(false)}>
          Annuler
        </Button>,
        <Button
          key="submit"
          type="primary"
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
          plateforme MaghrebitConnect par les Clients professionnels.
        </p>

        <h3 className="text-lg font-bold mt-4">1. Objet du contrat</h3>
        <p className="mb-3">
          Ce contrat a pour objet de définir les conditions dans lesquelles le
          Client peut utiliser les services proposés par la plateforme
          MaghrebitConnect.
        </p>

        <h3 className="text-lg font-bold mt-4">2. Obligations du Client</h3>
        <p className="mb-3">Le Client s'engage à :</p>
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
          <li>Accès à des profils de consultants qualifiés</li>
          <li>Services de mise en relation</li>
          <li>Suivi des missions</li>
          <li>Gestion des projets</li>
        </ul>

        <h3 className="text-lg font-bold mt-4">4. Responsabilités</h3>
        <p className="mb-3">MaghrebitConnect ne peut être tenu responsable :</p>
        <ul className="list-disc pl-6 mb-3">
          <li>
            Des inexactitudes ou erreurs dans les informations fournies par le
            Client
          </li>
          <li>De l'utilisation frauduleuse de la plateforme par le Client</li>
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

  return profile ? (
    <div className="w-full mx-auto p-6 bg-gradient-to-br from-blue-50 to-blue-100">
      <style>{pulseAnimationStyle}</style>
      <Card
        className="shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl"
        bodyStyle={{ padding: 0 }}
      >
        {/* En-tête avec Progression et Actions de Modification */}
        <div className="p-6 bg-white flex flex-col md:flex-row justify-between items-center border-b border-blue-100">
          <div className="w-full mb-4 md:mb-0 md:mr-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-blue-900">
                Complétude du profil
              </h3>
              <Tag
                color={profileStatus ? "green" : "orange"}
                className="text-sm"
              >
                {profileStatus ? (
                  <>
                    <CheckCircleOutlined /> {profile.Statut}
                  </>
                ) : (
                  <>
                    <ExclamationCircleOutlined /> {profile.Statut}
                  </>
                )}
              </Tag>
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
            {/* Contract Status and Actions section */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h3 className="text-base font-semibold text-blue-900 mb-2">
                    Statut du contrat:{" "}
                    <Tag
                      color={
                        contractAccepted ||
                        profile.Statut === "Actif" ||
                        profileStatus
                          ? "green"
                          : profile.Statut === "à valider"
                          ? "gold"
                          : "green"
                      }
                    >
                      {contractAccepted ||
                      profile.Statut === "Actif" ||
                      profileStatus
                        ? "Contrat accepté"
                        : profile.Statut === "à valider"
                        ? "En attente de validation"
                        : profile.Statut}
                    </Tag>
                  </h3>
                  <p className="text-sm text-gray-600">
                    {contractAccepted ||
                    profile.Statut === "Actif" ||
                    profileStatus
                      ? "Vous avez complété toutes les informations requises."
                      : profile.Statut === "à valider"
                      ? "Votre profil est complet et en cours de validation par notre équipe."
                      : "Veuillez compléter toutes les informations requises."}
                  </p>
                </div>
                <div className="mt-3 md:mt-0 space-x-2">
                  {console.log(profile.Statut)}
                  {profile.Statut == "à signer" && (
                    <Button
                      type="primary"
                      icon={<FileProtectOutlined />}
                      onClick={showContractModal}
                      size="middle"
                      className="pulse-animation" // Add this class
                      style={{
                        boxShadow: "0 0 8px #1890ff",
                        animation: "pulse 1.5s infinite",
                      }}
                    >
                      Accepter le contrat
                    </Button>
                  )}

                  {(contractAccepted || profile.Statut === "Actif") && (
                    <Button
                      type="default"
                      icon={<FilePdfOutlined />}
                      onClick={generatePDF}
                      size="middle"
                    >
                      Télécharger le contrat
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleEdit}
                  className="transition-transform hover:scale-105"
                >
                  Enregistrer
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  onClick={handleCancelEdit}
                  className="transition-transform hover:scale-105"
                >
                  Annuler
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                className="transition-transform hover:scale-105"
              >
                Modifier le Profil
              </Button>
            )}
          </div>
        </div>

        {/* Contenu du Profil */}
        <Row gutter={0} className="p-6">
          {/* Colonne de Gauche - Photo et Confidentialité */}
          <Col xs={24} md={8} className="border-r border-blue-100 pr-6">
            <div className="flex flex-col items-center">
              <Avatar
                size={180}
                src={
                  profile.img_path
                    ? `${Endponit()}/media/${profile.img_path}`
                    : undefined
                }
                icon={!profile.img_path && <UserOutlined />}
                className="mb-4 border-4 border-blue-500 shadow-lg"
              />
              <Upload
                name="avatar"
                listType="picture"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={(file) => {
                  // Image type validation
                  const isImage = file.type.startsWith("image/");
                  if (!isImage) {
                    message.error(
                      "Vous ne pouvez télécharger que des fichiers image!"
                    );
                    return false;
                  }

                  // File size validation
                  const isLt2M = file.size / 1024 / 1024 < 2;
                  if (!isLt2M) {
                    message.error("L'image doit être inférieure à 2MB!");
                    return false;
                  }

                  return isImage && isLt2M;
                }}
                onChange={handleProfileImageUpload}
              >
                <Button
                  icon={<UploadOutlined />}
                  type="dashed"
                  className="mb-4"
                >
                  Changer de Photo
                </Button>
              </Upload>

              {/* Paramètres de Confidentialité */}
              <div className="w-full bg-blue-50 p-4 rounded-lg shadow-inner">
                <h4 className="text-center mb-4 font-semibold text-blue-800">
                  Contrôles de Confidentialité
                </h4>
                <div className="space-y-3">
                  {Object.entries(privacySettings).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center"
                    >
                      <span className="text-blue-700">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </span>
                      <Switch
                        checked={value}
                        onChange={() => handlePrivacyToggle(key)}
                        className="bg-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Col>

          {/* Colonne de Droite - Informations */}
          <Col xs={24} md={16} className="pl-6">
            <Form
              form={form}
              layout="vertical"
              disabled={!isEditing}
              className="space-y-4"
            >
              <Divider orientation="left">Informations de l'entreprise</Divider>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="raison_sociale"
                    label="Raison sociale"
                    rules={[
                      {
                        required: true,
                        message: "Veuillez entrer votre raison sociale",
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Raison sociale"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item name="siret" label="Numéro SIRET">
                    <Input
                      prefix={<IdcardOutlined />}
                      placeholder="Numéro SIRET"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="E-mail"
                    rules={[
                      {
                        required: true,
                        message: "Veuillez entrer votre e-mail",
                      },
                      {
                        type: "email",
                        message: "Veuillez entrer un e-mail valide",
                      },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="E-mail"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="phone" label="Téléphone">
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="Numéro de Téléphone"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="occupation" label="Profession">
                    <Input
                      prefix={<BankOutlined />}
                      placeholder="Profession"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="industry" label="Secteur d'Activité">
                    <Select
                      placeholder="Sélectionner un Secteur"
                      className="w-full"
                    >
                      <Option value="Technology">Technologie</Option>
                      <Option value="Finance">Finance</Option>
                      <Option value="Healthcare">Santé</Option>
                      <Option value="Education">Éducation</Option>
                      <Option value="Other">Autre</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="n_tva" label="Numéro de TVA">
                <Input
                  prefix={<BarcodeOutlined />}
                  placeholder="Numéro de TVA"
                  className="rounded-lg"
                />
              </Form.Item>

              <Divider orientation="left">Adresse</Divider>

              <Form.Item name="address" label="Adresse">
                <Input
                  prefix={<HomeOutlined />}
                  placeholder="Adresse"
                  className="rounded-lg"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={6}>
                  <Form.Item name="cp" label="Code Postal">
                    <Input
                      prefix={<NumberOutlined />}
                      placeholder="Code Postal"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={10}>
                  <Form.Item name="ville" label="Ville">
                    <Input
                      prefix={<EnvironmentOutlined />}
                      placeholder="Ville"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="province" label="Province/Région">
                    <Input
                      prefix={<EnvironmentOutlined />}
                      placeholder="Province ou Région"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">Informations bancaires</Divider>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="iban" label="IBAN">
                    <Input
                      prefix={<CreditCardOutlined />}
                      placeholder="IBAN"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="bic" label="BIC">
                    <Input
                      prefix={<CreditCardOutlined />}
                      placeholder="BIC"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="banque" label="Banque">
                <Input
                  prefix={<BankOutlined />}
                  placeholder="Nom de la banque"
                  className="rounded-lg"
                />
              </Form.Item>

              <Divider orientation="left">Informations complémentaires</Divider>

              <Form.Item name="bio" label="Description / RCE">
                <TextArea
                  rows={4}
                  placeholder="Description de votre entreprise"
                  className="rounded-lg"
                />
              </Form.Item>

              <Divider orientation="left">Réseaux sociaux et Web</Divider>
              <div className="space-y-4">
                <Form.Item name="linkedin" label="LinkedIn">
                  <Input
                    prefix={<LinkedinOutlined />}
                    placeholder="URL LinkedIn"
                    className="rounded-lg"
                  />
                </Form.Item>

                <Form.Item name="twitter" label="Twitter">
                  <Input
                    prefix={<TwitterOutlined />}
                    placeholder="URL Twitter"
                    className="rounded-lg"
                  />
                </Form.Item>

                <Form.Item name="website" label="Site Web">
                  <Input
                    prefix={<GlobalOutlined />}
                    placeholder="URL Site Web"
                    className="rounded-lg"
                  />
                </Form.Item>
              </div>
            </Form>
          </Col>
        </Row>
      </Card>
      {contractModal}
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default ClientPlusInfo;

import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  Button,
  Avatar,
  Progress,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  Upload,
  message,
  Tooltip,
  Select,
  Switch,
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
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import { Endponit, token } from "../../helper/enpoint";

const { TextArea } = Input;
const { Option } = Select;

const ClientPlusInfo = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [profileImage, setProfileImage] = useState(null);
  const [img_path, setimg_path] = useState("");
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: true,
    showPhone: false,
    showLocation: true,
  });
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchClientData();
  }, []);

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

      setProfile({
        id: client[0].ID_clt,
        img_path: client[0].img_path,
        raison_sociale: client[0].raison_sociale || "",
        email: client[0].mail_contact,
        phone: client[0].tel_contact,
        address: client[0].adresse,
        occupation: client[0].statut || "",
        birthDate: dayjs(client[0].date_validation || "1990-01-01"),
        bio: client[0].rce || "",
        industry: client[0].pays,
        socialLinks: {
          linkedin: "",
          github: "",
          twitter: "",
          website: "",
        },
        completionStatus: calculateProfileCompletion({
          raison_sociale: client[0].raison_sociale.split(" ")[0],
          email: client[0].mail_contact,
          phone: client[0].tel_contact,
          address: client[0].adresse,
          occupation: client[0].statut || "",
          birthDate: dayjs(client[0].date_validation || "1990-01-01"),
          bio: client[0].rce || "",
          industry: client[0].pays,
        }),
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
            ID_clt: profile.ID_clt,
            raison_sociale: `${values.raison_sociale}`,
            mail_contact: values.email,
            tel_contact: values.phone,
            adresse: values.address,
            statut: values.occupation,
            date_validation: values.birthDate.format("YYYY-MM-DD"),
            rce: values.bio,
            pays: values.industry,
            linkedin: values.linkedin || "",
            twitter: values.twitter || "",
            website: values.website || "",
          };

          try {
            await axios.put(
              `${Endponit()}/api/client/`,
              {
                ...updatedProfile,
                ID_clt: profile.id,
                password: null,
                img_path: img_path,
              }, // Data to be sent in the request body
              {
                headers: {
                  Authorization: `Bearer ${token()}`, // Authorization header
                },
              }
            );

            setProfile(updatedProfile);
            setIsEditing(false);
            message.success("Profil mis à jour avec succès");
          } catch (error) {
            console.error("Error updating client data:", error);
            message.error(
              "Une erreur s'est produite lors de la mise à jour du profil."
            );
          }
        })
        .catch((error) => {
          message.error("Veuillez vérifier tous les champs requis");
        });
    } else {
      form.setFieldsValue({
        ...profile,
        birthDate: profile.birthDate,
        ...profile.socialLinks,
      });
      setIsEditing(true);
    }
  }, [form, isEditing, profile]);

  const calculateProfileCompletion = (values) => {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "occupation",
      "birthDate",
      "bio",
      "industry",
    ];

    const filledFields = requiredFields.filter((field) => {
      // Handle different types of values
      if (field === "birthDate") {
        // Check if birthDate is a valid dayjs object or date string
        return (
          values[field] &&
          (values[field].isValid ? values[field].isValid() : true)
        );
      }

      // For other fields, check if they are non-empty strings
      return (
        values[field] &&
        values[field] !== undefined &&
        values[field] !== "" &&
        values[field] !== null
      );
    });

    // Calculate completion percentage, ensuring it's between 0 and 100
    const completionPercentage = Math.max(
      0,
      Math.min(
        100,
        Math.round((filledFields.length / requiredFields.length) * 100)
      )
    );

    return completionPercentage;
  };

  const handleCancelEdit = () => {
    form.resetFields();
    setIsEditing(false);
  };

  const renderSocialLink = (icon, placeholder, name) => (
    <Form.Item name={name} label={name.charAt(0).toUpperCase() + name.slice(1)}>
      <Input prefix={icon} placeholder={placeholder} />
    </Form.Item>
  );

  const handleProfileImageUpload = async (info) => {
    const file = info.file;

    // Validate file before upload
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
          onUploadProgress: (progressEvent) => {
            const percent = Math.floor(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            console.log(`Upload Progress: ${percent}%`);
          },
        }
      );

      const imagePath = uploadResponse.data.path;
      console.log("Upload Response Path:", imagePath);

      if (imagePath) {
        // Update profile with the new image path
        await axios.put(
          `${Endponit()}/api/client/`,
          {
            ID_clt: profile.id,
            password: null,
            img_path: imagePath, // Ensure image path is included
            raison_sociale: profile.raison_sociale,
            mail_contact: profile.email,
            tel_contact: profile.phone,
            adresse: profile.address,
            statut: profile.occupation,
            date_validation: profile.birthDate.format("YYYY-MM-DD"),
            rce: profile.bio,
            pays: profile.industry,
            linkedin: profile.socialLinks?.linkedin || "",
            twitter: profile.socialLinks?.twitter || "",
            website: profile.socialLinks?.website || "",
          },
          {
            headers: {
              Authorization: `Bearer ${token()}`,
            },
          }
        );

        // Update local state
        setimg_path(imagePath);
        setProfile((prevProfile) => ({
          ...prevProfile,
          img_path: imagePath,
        }));

        // message.success("Image de profil mise à jour avec succès");
      }
    } catch (error) {
      console.error("Detailed Upload Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });

      // More detailed error message
      if (error.response) {
        message.error(
          `Échec du téléchargement: ${
            error.response.data?.message || "Erreur serveur"
          }`
        );
      } else if (error.request) {
        message.error("Aucune réponse reçue du serveur");
      } else {
        message.error("Erreur lors de la préparation du téléchargement");
      }
    }
  };

  return profile ? (
    <div className="w-full mx-auto p-6 bg-gradient-to-br from-blue-50 to-blue-100">
      <Card
        className="shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl"
        bodyStyle={{ padding: 0 }}
      >
        {/* En-tête avec Progression et Actions de Modification */}
        <div className="p-6 bg-white flex justify-between items-center border-b border-blue-100">
          <div className="w-full mr-4">
            {/* <Tooltip title={`Profil ${profile.completionStatus}% Complété`}>
              <Progress
                percent={profile.completionStatus}
                status={profile.completionStatus === 100 ? "success" : "active"}
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
                strokeWidth={10}
                className="w-full"
              />
            </Tooltip>  */}
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
                // icon={!profile.img_path && <UserOutlined />}
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
                  // disabled={!isEditing}
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
              initialValues={profile}
              className="space-y-4"
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="raison_sociale"
                    label="Raison social"
                    rules={[
                      {
                        required: true,
                        message: "Veuillez entrer votre prénom",
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Raison social"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                {/* <Col xs={24} md={12}>
                  <Form.Item
                    name="lastName"
                    label="Nom de Famille"
                    rules={[
                      {
                        required: true,
                        message: "Veuillez entrer votre nom de famille",
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Nom de Famille"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col> */}
              </Row>

              <Form.Item
                name="email"
                label="E-mail"
                rules={[
                  { required: true, message: "Veuillez entrer votre e-mail" },
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

              <Form.Item
                name="phone"
                label="Téléphone"
                rules={[
                  {
                    required: true,
                    message: "Veuillez entrer votre numéro de téléphone",
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Numéro de Téléphone"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="address"
                label="Adresse"
                rules={[
                  { required: true, message: "Veuillez entrer votre adresse" },
                ]}
              >
                <Input
                  prefix={<HomeOutlined />}
                  placeholder="Adresse"
                  className="rounded-lg"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="occupation"
                    label="Profession"
                    rules={[
                      {
                        required: true,
                        message: "Veuillez entrer votre profession",
                      },
                    ]}
                  >
                    <Input
                      prefix={<BankOutlined />}
                      placeholder="Profession"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="industry"
                    label="Secteur d'Activité"
                    rules={[
                      {
                        required: true,
                        message: "Veuillez sélectionner un secteur",
                      },
                    ]}
                  >
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

              <Form.Item
                name="birthDate"
                label="Date de Naissance"
                rules={[
                  {
                    required: true,
                    message: "Veuillez sélectionner votre date de naissance",
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  placeholder="Sélectionner la Date de Naissance"
                  className="rounded-lg w-full"
                />
              </Form.Item>

              <Form.Item
                name="bio"
                label="Biographie"
                rules={[
                  {
                    required: true,
                    message: "Veuillez entrer votre biographie",
                  },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Parlez-nous de vous"
                  className="rounded-lg"
                />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Card>
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default ClientPlusInfo;

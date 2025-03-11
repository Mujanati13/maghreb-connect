import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Divider,
  Radio,
  Select,
  DatePicker,
  notification,
  Checkbox,
  Modal,
  Spin,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  BankOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Make sure to install axios
import { Endponit } from "../helper/enpoint";

const { Title, Text, Link } = Typography;
const { Option } = Select;

const PDFViewer = ({ url }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ width: "100%", height: "60vh", position: "relative" }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Spin size="large" />
        </div>
      )}
      <iframe
        src={`${url}#toolbar=0`}
        width="100%"
        height="100%"
        style={{ border: "none" }}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("client");
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
  const [isPrivacyModalVisible, setIsPrivacyModalVisible] = useState(false);

  const termsPdfUrl = "../../public/MAGHREB CONNECT IT SOCIÉTÉ.pdf";

  const privacyContent = `
    Protection des Données Personnelles

    1. Engagement de confidentialité
    - Protection stricte des données personnelles
    - Respect des dispositions de la Politique de Confidentialité
    - Obtention du consentement explicite pour l'utilisation des données

    2. Responsabilités
    - Exactitude des données fournies
    - Mise à jour régulière des informations
    - Protection des données personnelles des utilisateurs

    3. Durée de conservation
    - Conservation des données pendant la durée nécessaire
    - Suppression sécurisée des données obsolètes
    - Respect des délais légaux de conservation
    `;

  const onFinish = async (values) => {
    if (!values.acceptConditions) {
      notification.error({
        message: "Erreur",
        description: "Vous devez accepter les conditions pour créer un compte.",
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare data based on user type
      const registrationData =
        userType === "client"
          ? {
              firstName: values.prenom,
              lastName: values.nom,
              dateOfBirth: values.dateNaissance.format("YYYY-MM-DD"),
              email: values.email,
              mail_contact: values.email,
              phone: values.telephone,
              password: values.password,
              address: values.adresse,
              city: values.ville,
              country: values.pays,
              status: "Draft",
            }
          : {
              Raison_sociale: values.raisonSociale,
              email: values.emailPro,
              phone: values.telephone,
              password: values.password,
              Adresse: values.adresse,
              city: values.ville,
              country: values.pays,
              mail_Contact: values.emailPro,
              CP: "00000",
              Status: "Draft",
            };

      // Choose endpoint based on user type
      const endpoint = userType === "client" ? "/api/client/" : "/api/ESN/";

      // Send registration request
      const response = await axios.post(
        Endponit() + endpoint,
        registrationData
      );

      notification.success({
        message: "Inscription réussie",
        description: "Votre compte a été créé avec succès!",
      });

      // Navigate to login or dashboard
      navigate("/login");
    } catch (error) {
      // Handle registration error
      notification.error({
        message: "Erreur d'inscription",
        description:
          error.response?.data?.message ||
          "Une erreur est survenue lors de l'inscription.",
      });
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject("Veuillez saisir votre mot de passe!");
    }
    if (value.length < 8) {
      return Promise.reject(
        "Le mot de passe doit contenir au moins 8 caractères!"
      );
    }
    if (!/[A-Z]/.test(value)) {
      return Promise.reject(
        "Le mot de passe doit contenir au moins une majuscule!"
      );
    }
    if (!/[0-9]/.test(value)) {
      return Promise.reject(
        "Le mot de passe doit contenir au moins un chiffre!"
      );
    }
    return Promise.resolve();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Card
        style={{
          maxWidth: "500px",
          width: "100%",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Title level={2} style={{ marginBottom: "8px" }}>
            Créer un compte
          </Title>
          <Text type="secondary">Rejoignez-nous dès aujourd'hui</Text>
        </div>

        <Modal
          title="Conditions Générales"
          open={isTermsModalVisible}
          onOk={() => setIsTermsModalVisible(false)}
          onCancel={() => setIsTermsModalVisible(false)}
          width={800}
          footer={[
            <Button
              key="submit"
              type="primary"
              onClick={() => setIsTermsModalVisible(false)}
            >
              J'ai lu et je comprends
            </Button>,
          ]}
        >
          <PDFViewer url={termsPdfUrl} />
        </Modal>

        <Modal
          title="Politique de Confidentialité"
          open={isPrivacyModalVisible}
          onOk={() => setIsPrivacyModalVisible(false)}
          onCancel={() => setIsPrivacyModalVisible(false)}
          width={800}
          footer={[
            <Button
              key="submit"
              type="primary"
              onClick={() => setIsPrivacyModalVisible(false)}
            >
              J'ai lu et je comprends
            </Button>,
          ]}
        >
          <div
            style={{
              maxHeight: "60vh",
              overflow: "auto",
              whiteSpace: "pre-line",
            }}
          >
            {privacyContent}
          </div>
        </Modal>

        <div style={{ marginBottom: "24px" }}>
          <Radio.Group
            value={userType}
            onChange={(e) => {
              setUserType(e.target.value);
              form.resetFields();
            }}
            buttonStyle="solid"
            style={{ width: "100%" }}
          >
            <Radio.Button
              value="client"
              style={{ width: "50%", textAlign: "center" }}
            >
              Client final
            </Radio.Button>
            <Radio.Button
              value="societe"
              style={{ width: "50%", textAlign: "center" }}
            >
              Prestataire de service
            </Radio.Button>
          </Radio.Group>
        </div>

        <Form
          form={form}
          name="signup"
          onFinish={onFinish}
          layout="vertical"
          requiredMark="optional"
        >
          {userType === "client" ? (
            <>
              <Space style={{ width: "100%" }} size="middle">
                {/* <Form.Item
                  name="prenom"
                  style={{ width: "100%" }}
                  rules={[
                    {
                      required: true,
                      message: "Veuillez saisir votre prénom!",
                    },
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Prénom" />
                </Form.Item> */}

                <Form.Item
                  name="nom"
                  style={{ width: "100%" }}
                  rules={[
                    { required: true, message: "Veuillez saisir votre nom!" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Raison sociale"
                  />
                </Form.Item>
              </Space>

              <Form.Item
                name="dateNaissance"
                rules={[
                  {
                    required: true,
                    message: "Veuillez saisir votre date de naissance!",
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Date de naissance"
                  format="DD/MM/YYYY"
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Veuillez saisir votre email!" },
                  { type: "email", message: "Email invalide!" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="raisonSociale"
                rules={[
                  {
                    required: true,
                    message: "Veuillez saisir la raison sociale!",
                  },
                ]}
              >
                <Input prefix={<BankOutlined />} placeholder="Raison sociale" />
              </Form.Item>

              <Form.Item
                name="emailPro"
                rules={[
                  {
                    required: true,
                    message: "Veuillez saisir l'email professionnel!",
                  },
                  { type: "email", message: "Email invalide!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Email professionnel"
                />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="telephone"
            rules={[
              {
                required: true,
                message: "Veuillez saisir votre numéro de téléphone!",
              },
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Téléphone" />
          </Form.Item>

          <Space style={{ width: "100%" }} size="middle">
            <Form.Item
              name="password"
              style={{ width: "100%" }}
              rules={[{ validator: validatePassword }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mot de passe"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              style={{ width: "100%" }}
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Veuillez confirmer votre mot de passe!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      "Les mots de passe ne correspondent pas!"
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirmer le mot de passe"
              />
            </Form.Item>
          </Space>

          <Form.Item
            name="adresse"
            rules={[
              { required: true, message: "Veuillez saisir votre adresse!" },
            ]}
          >
            <Input prefix={<EnvironmentOutlined />} placeholder="Adresse" />
          </Form.Item>

          <Space style={{ width: "100%" }} size="middle">
            <Form.Item
              name="ville"
              style={{ width: "100%" }}
              rules={[{ required: true, message: "Ville requise!" }]}
            >
              <Input placeholder="Ville" />
            </Form.Item>
          </Space>

          <Form.Item
            name="pays"
            rules={[
              { required: true, message: "Veuillez sélectionner votre pays!" },
            ]}
          >
            <Select placeholder="Sélectionnez votre pays">
              <Option value="FR">France</Option>
              <Option value="BE">Belgique</Option>
              <Option value="CH">Suisse</Option>
              <Option value="LU">Luxembourg</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="acceptConditions"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(
                        "Veuillez accepter les conditions pour continuer"
                      ),
              },
            ]}
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox />
                <Text>
                  J'accepte les{" "}
                  <Link
                    onClick={(e) => {
                      e.preventDefault();
                      setIsTermsModalVisible(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    conditions générales
                  </Link>{" "}
                  et la{" "}
                  <Link
                    onClick={(e) => {
                      e.preventDefault();
                      setIsPrivacyModalVisible(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    politique de confidentialité
                  </Link>
                </Text>
              </div>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: "40px",
                borderRadius: "6px",
                background: "#1890ff",
              }}
            >
              S'inscrire
            </Button>
          </Form.Item>

          <Divider plain>
            <Text type="secondary">OU</Text>
          </Divider>

          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div style={{ textAlign: "center" }}>
              <Text type="secondary">
                Vous avez déjà un compte ?{" "}
                <Link
                  onClick={() => {
                    navigate("/login");
                  }}
                >
                  Se connecter
                </Link>
              </Text>
            </div>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default SignupPage;

import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Modal,
  Form,
  message,
  Card,
  Row,
  Col,
  Upload,
  Dropdown,
  Menu,
  Select,
  Spin,
  DatePicker,
} from "antd";
import {
  InboxOutlined,
  DownOutlined,
  LoadingOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { TextArea } = Input;

const AppelDOffreInterface = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [applyForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://51.38.99.75:4001/api/appelOffre/"
      );
      setData(response.data.data);
    } catch (error) {
      message.error("Erreur lors du chargement des appels d'offre");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = async (value) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://51.38.99.75:4001/api/appelOffre/?search=${value}`
      );
      setData(response.data.data);
    } catch (error) {
      message.error("Erreur lors de la recherche");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (record) => {
    setCurrentOffer(record);
    applyForm.resetFields();
    applyForm.setFieldsValue({
      AO_id: record.id,
    });
    setIsApplyModalVisible(true);
  };

  const handleApplySubmit = () => {
    applyForm.submit();
  };

  const onApplyFinish = async (values) => {
    setSubmitting(true);
    try {
      const formData = {
        AO_id: currentOffer.id,
        esn_id: localStorage.getItem("id") || 3, // This should come from user context or configuration
        responsable_compte: values.responsable_compte,
        id_consultant: values.id_consultant,
        date_candidature: dayjs().format("YYYY-MM-DD"),
        statut: "En cours",
        tjm: values.tjm,
        date_disponibilite: values.date_disponibilite.format("YYYY-MM-DD"),
        commentaire: values.commentaire,
      };

      const res_data = await axios.post("http://51.38.99.75:4001/api/candidature/", formData);
      await axios.post("http://51.38.99.75:4001/api/notify_new_candidature/", {
        condidature_id: res_data.data.id_cd,
        appel_offre_id: currentOffer.id,
        client_id : currentOffer.id_client
      });

      message.success("Votre candidature a été soumise avec succès !");

      setIsApplyModalVisible(false);
      applyForm.resetFields();
    } catch (error) {
      message.error("Erreur lors de la soumission de la candidature");
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      1: "Ouvert",
      2: "En cours",
      3: "Fermé",
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Input.Search
          placeholder="Rechercher un appel d'offre"
          onSearch={handleSearch}
          className="w-64"
        />
      </div>

      <Row gutter={[16, 16]}>
        {data.map((item) => (
          <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              className="h-full"
              actions={[
                <Button
                  type="primary"
                  onClick={() => handleApply(item)}
                  disabled={item.statut === "3"}
                >
                  Postuler
                </Button>,
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item key="view-details">Voir les détails</Menu.Item>
                    </Menu>
                  }
                  trigger={["click"]}
                >
                  <Button>
                    Actions <DownOutlined />
                  </Button>
                </Dropdown>,
              ]}
            >
              <Card.Meta
                title={item.titre}
                description={
                  <div className="space-y-2">
                    <p className="text-sm">{item.description}</p>
                    <p className="text-sm">Profil: {item.profil}</p>
                    <p className="text-sm">
                      TJM: {item.tjm_min}€ - {item.tjm_max}€
                    </p>
                    <p className="text-sm">
                      Statut: {getStatusLabel(item.statut)}
                    </p>
                    <p className="text-sm">
                      Publication: {formatDate(item.date_publication)}
                    </p>
                    <p className="text-sm">
                      Date limite: {formatDate(item.date_limite)}
                    </p>
                    <p className="text-sm">
                      Début: {formatDate(item.date_debut)}
                    </p>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="Soumettre une candidature"
        open={isApplyModalVisible}
        onCancel={() => setIsApplyModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsApplyModalVisible(false)}>
            Annuler
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleApplySubmit}
            loading={submitting}
          >
            Soumettre
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={applyForm}
          onFinish={onApplyFinish}
          layout="vertical"
          initialValues={{
            date_candidature: dayjs(),
          }}
        >
          <Form.Item name="AO_id" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="responsable_compte"
            label="Responsable compte"
            rules={[
              {
                required: true,
                message: "Veuillez saisir le nom du responsable",
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Ex: Jean Dupont" />
          </Form.Item>

          <Form.Item
            name="id_consultant"
            label="Consultant"
            rules={[{ required: true, message: "Consultant" }]}
          >
            <Input type="number" placeholder="" />
          </Form.Item>

          <Form.Item
            name="tjm"
            label="TJM proposé"
            rules={[
              { required: true, message: "Veuillez saisir le TJM" },
              {
                validator: (_, value) => {
                  if (value && currentOffer) {
                    if (
                      value < currentOffer.tjm_min ||
                      value > currentOffer.tjm_max
                    ) {
                      return Promise.reject(
                        `Le TJM doit être entre ${currentOffer.tjm_min}€ et ${currentOffer.tjm_max}€`
                      );
                    }
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              prefix={<DollarOutlined />}
              type="number"
              suffix="€"
              placeholder={`Entre ${currentOffer?.tjm_min} et ${currentOffer?.tjm_max}`}
            />
          </Form.Item>

          <Form.Item
            name="date_disponibilite"
            label="Date de disponibilité"
            rules={[
              {
                required: true,
                message: "Veuillez sélectionner une date de disponibilité",
              },
            ]}
          >
            <DatePicker
              className="w-full"
              format="DD/MM/YYYY"
              placeholder="Sélectionnez une date"
              suffixIcon={<CalendarOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="commentaire"
            label="Commentaire"
            rules={[
              { required: true, message: "Veuillez ajouter un commentaire" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Ajoutez vos commentaires, expériences pertinentes..."
              prefix={<CommentOutlined />}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AppelDOffreInterface;

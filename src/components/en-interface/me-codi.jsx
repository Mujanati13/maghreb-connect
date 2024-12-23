import React, { useState, useEffect } from "react";
import {
  Collapse,
  Card,
  Button,
  Modal,
  Descriptions,
  Tag,
  Typography,
  Table,
  message,
} from "antd";
import {
  DownloadOutlined,
  CheckOutlined,
  CloseOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Endponit } from "../../helper/enpoint";

const { Panel } = Collapse;
const { Title, Text } = Typography;

const ESNCandidatureInterface = () => {
  const [missions, setMissions] = useState([]);
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentConsultant, setCurrentConsultant] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);


  // Fetch data from APIs
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch missions
      const missionsRes = await fetch(Endponit() + "/api/get-appel-offre-with-candidatures-by-esn/?esn_id="+localStorage.getItem("id"));
      const missionsData = await missionsRes.json();
      const missions = missionsData.data;
      setMissions(missions);

      
      // Fetch candidatures for the first mission (or you can modify this logic)
      if (missions.length > 0) {
        const projectId = missions[0].id;
        const candidaturesRes = await fetch(
          `${Endponit()}/api/get-candidatures/?esn_id=${localStorage.getItem('id')}&project_id=${projectId}`
        );
        const candidaturesData = await candidaturesRes.json();
        setCandidatures(candidaturesData.data);
      }
    } catch (error) {
      message.error("Erreur lors du chargement des données");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewConsultant = (consultant) => {
    setCurrentConsultant(consultant);
    setIsModalVisible(true);
  };

  const handleAssign = async (consultant, mission) => {
    try {
      const response = await fetch(`http://51.38.99.75:4001/api/consultant/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_consultant: consultant.id_consultant,
          ...consultant,
          status: "Assigné",
          mission_id: mission.id,
        }),
      });

      if (response.ok) {
        message.success("Consultant assigné avec succès");
        fetchData();
      } else {
        throw new Error("Failed to assign consultant");
      }
    } catch (error) {
      message.error("Erreur lors de l'assignation");
      console.error("Error assigning consultant:", error);
    }
  };

  const handleUnassign = async (consultant) => {
    try {
      const response = await fetch(`http://51.38.99.75:4001/api/consultant/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_consultant: consultant.id_consultant,
          ...consultant,
          status: "Disponible",
          mission_id: null,
        }),
      });

      if (response.ok) {
        message.success("Consultant désassigné");
        fetchData();
      } else {
        throw new Error("Failed to unassign consultant");
      }
    } catch (error) {
      message.error("Erreur lors de la désassignation");
      console.error("Error unassigning consultant:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "assigné":
        return "success";
      case "indisponible":
        return "error";
      case "disponible":
        return "processing";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingOutlined style={{ fontSize: 24 }} spin />
      </div>
    );
  }

  return (
    <div>
      <Collapse accordion>
        {missions.map((mission) => {
          // Filter candidatures for the current mission
          const missionCandidatures = candidatures.filter(
            (candidature) => candidature.AO_id === mission.id
          );

          return (
            <Panel
              header={
                <div>
                  <div>{mission.titre}</div>
                  <Text type="secondary">{mission.description}</Text>
                </div>
              }
              key={mission.id}
            >
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <Text type="secondary">TJM Client:</Text>
                    <Text>{`${mission.tjm_client} €`}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Statut:</Text>
                    <Text>{mission.statut}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Date début:</Text>
                    <Text>
                      {new Date(mission.date_debut).toLocaleDateString()}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary">Durée:</Text>
                    <Text>{`${mission.duree} mois`}</Text>
                  </div>
                </div>

                <Table
                  dataSource={missionCandidatures}
                  rowKey="id_candidature"
                  columns={[
                    {
                      title: "Nom",
                      dataIndex: "responsable_compte",
                      key: "nom",
                    },
                    // {
                    //   title: "Compétences",
                    //   dataIndex: "competences",
                    //   key: "competences",
                    //   render: (competences) => (
                    //     <>
                    //       {competences.map((comp) => (
                    //         <Tag key={comp}>{comp}</Tag>
                    //       ))}
                    //     </>
                    //   ),
                    // },
                    {
                      title: "TJM Consultant",
                      dataIndex: "tjm",
                      key: "tjm",
                      render: (tjm) => `${tjm} €`,
                    },
                    // {
                    //   title: "Expérience",
                    //   dataIndex: "experience",
                    //   key: "experience",
                    //   render: (exp) => `${exp} ans`,
                    // },
                    // {
                    //   title: "Statut",
                    //   dataIndex: "status",
                    //   key: "status",
                    //   render: (status) => (
                    //     <Tag color={getStatusColor(status)}>{status}</Tag>
                    //   ),
                    // },
                    // {
                    //   title: "Actions",
                    //   key: "actions",
                    //   render: (_, record) => (
                    //     <div>
                    //       <Button
                    //         type="primary"
                    //         shape="circle"
                    //         icon={<CheckOutlined />}
                    //         onClick={() => handleAssign(record, mission)}
                    //         disabled={record.status !== "Disponible"}
                    //       />
                    //       <Button
                    //         type="danger"
                    //         shape="circle"
                    //         icon={<CloseOutlined />}
                    //         style={{ marginLeft: 8 }}
                    //         onClick={() => handleUnassign(record)}
                    //         disabled={record.status !== "Assigné"}
                    //       />
                    //     </div>
                    //   ),
                    // },
                  ]}
                  onRow={(record) => ({
                    onClick: () => handleViewConsultant(record),
                  })}
                />
              </Card>
            </Panel>
          );
        })}
      </Collapse>

      <Modal
        title={`Candidature - ${currentConsultant?.nom}`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Descriptions bordered>
          <Descriptions.Item label="Nom" span={3}>
            {currentConsultant?.nom}
          </Descriptions.Item>
          <Descriptions.Item label="TJM" span={3}>
            {currentConsultant?.tjm} €
          </Descriptions.Item>
          <Descriptions.Item label="Expérience" span={3}>
            {currentConsultant?.experience} ans
          </Descriptions.Item>
          <Descriptions.Item label="Compétences" span={3}>
            {currentConsultant?.competences?.map((comp) => (
              <Tag key={comp}>{comp}</Tag>
            ))}
          </Descriptions.Item>
          <Descriptions.Item label="Statut" span={3}>
            <Tag color={getStatusColor(currentConsultant?.status)}>
              {currentConsultant?.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Notes" span={3}>
            {currentConsultant?.notes}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </div>
  );
};

export default ESNCandidatureInterface;
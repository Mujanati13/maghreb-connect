import React, { useState, useEffect } from 'react';
import { Collapse, Card, Button, Modal, Descriptions, Tag, Typography, Table, message } from 'antd';
import { DownloadOutlined, CheckOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const { Title, Text } = Typography;

const CandidatureInterface = () => {
    const [appelsOffre, setAppelsOffre] = useState([]);
    const [candidatures, setCandidatures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentCandidature, setCurrentCandidature] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Fetch data from both APIs
    const fetchData = async () => {
        setLoading(true);
        try {
            const [appelsOffreRes, candidaturesRes] = await Promise.all([
                fetch('http://51.38.99.75:4001/api/appelOffre/'),
                fetch('http://51.38.99.75:4001/api/candidature/')
            ]);

            const appelsOffreData = await appelsOffreRes.json();
            const candidaturesData = await candidaturesRes.json();

            setAppelsOffre(appelsOffreData.data);
            setCandidatures(candidaturesData.data);
        } catch (error) {
            message.error('Erreur lors du chargement des données');
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleViewCandidature = (candidature) => {
        setCurrentCandidature(candidature);
        setIsModalVisible(true);
    };

    const handleAccept = async (candidature) => {
        try {
            // Update candidature status through API
            const response = await fetch(`http://51.38.99.75:4001/api/candidature/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_cd : candidature.id_cd,
                    ...candidature,
                    statut: 'Accepté'
                })
            });

            if (response.ok) {
                message.success('Candidature acceptée avec succès');
                fetchData(); // Refresh data
            } else {
                throw new Error('Failed to update candidature');
            }
        } catch (error) {
            message.error('Erreur lors de la mise à jour du statut');
            console.error('Error updating candidature:', error);
        }
    };

    const handleReject = async (candidature) => {
        try {
            // Update candidature status through API
            const response = await fetch(`http://51.38.99.75:4001/api/candidature/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_cd : candidature.id_cd,
                    ...candidature,
                    statut: 'Refusé'
                })
            });

            if (response.ok) {
                message.success('Candidature refusée');
                fetchData(); // Refresh data
            } else {
                throw new Error('Failed to update candidature');
            }
        } catch (error) {
            message.error('Erreur lors de la mise à jour du statut');
            console.error('Error updating candidature:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'accepté':
                return 'success';
            case 'refusé':
                return 'error';
            case 'en cours':
                return 'processing';
            default:
                return 'default';
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
                {appelsOffre.map((offre) => {
                    const relatedCandidatures = candidatures.filter(
                        (candidature) => candidature.AO_id === offre.id
                    );

                    return (
                        <Panel
                            header={
                                <div>
                                    <div>{offre.titre}</div>
                                    <Text type="secondary">{offre.description}</Text>
                                </div>
                            }
                            key={offre.id}
                        >
                            <Card>
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <Text type="secondary">TJM:</Text>
                                        <Text>{`${offre.tjm_min} - ${offre.tjm_max} €`}</Text>
                                    </div>
                                    <div>
                                        <Text type="secondary">Statut:</Text>
                                        <Text>{offre.statut === '1' ? 'Actif' : 'Inactif'}</Text>
                                    </div>
                                    <div>
                                        <Text type="secondary">Date limite:</Text>
                                        <Text>{new Date(offre.date_limite).toLocaleDateString()}</Text>
                                    </div>
                                    <div>
                                        <Text type="secondary">Date début:</Text>
                                        <Text>{new Date(offre.date_debut).toLocaleDateString()}</Text>
                                    </div>
                                </div>

                                <Table
                                    dataSource={relatedCandidatures}
                                    rowKey="id_cd"
                                    columns={[
                                        {
                                            title: 'Responsable',
                                            dataIndex: 'responsable_compte',
                                            key: 'responsable_compte'
                                        },
                                        {
                                            title: 'TJM Proposé',
                                            dataIndex: 'tjm',
                                            key: 'tjm',
                                            render: (tjm) => `${tjm} €`
                                        },
                                        {
                                            title: 'Date Candidature',
                                            dataIndex: 'date_candidature',
                                            key: 'date_candidature',
                                            render: (date) => new Date(date).toLocaleDateString()
                                        },
                                        {
                                            title: 'Disponibilité',
                                            dataIndex: 'date_disponibilite',
                                            key: 'date_disponibilite',
                                            render: (date) => new Date(date).toLocaleDateString()
                                        },
                                        {
                                            title: 'Statut',
                                            dataIndex: 'statut',
                                            key: 'statut',
                                            render: (statut) => (
                                                <Tag color={getStatusColor(statut)}>{statut}</Tag>
                                            )
                                        },
                                        {
                                            title: 'Actions',
                                            key: 'actions',
                                            render: (_, record) => (
                                                <div>
                                                    <Button
                                                        type="primary"
                                                        shape="circle"
                                                        icon={<CheckOutlined />}
                                                        onClick={() => handleAccept(record)}
                                                        disabled={record.statut !== 'En cours'}
                                                    />
                                                    <Button
                                                        type="danger"
                                                        shape="circle"
                                                        icon={<CloseOutlined />}
                                                        style={{ marginLeft: 8 }}
                                                        onClick={() => handleReject(record)}
                                                        disabled={record.statut !== 'En cours'}
                                                    />
                                                </div>
                                            )
                                        }
                                    ]}
                                    onRow={(record) => ({
                                        onClick: () => handleViewCandidature(record)
                                    })}
                                />
                            </Card>
                        </Panel>
                    );
                })}
            </Collapse>

            <Modal
                title={`Candidature - ${currentCandidature?.responsable_compte}`}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Descriptions bordered>
                    <Descriptions.Item label="Responsable" span={3}>
                        {currentCandidature?.responsable_compte}
                    </Descriptions.Item>
                    <Descriptions.Item label="TJM Proposé" span={3}>
                        {currentCandidature?.tjm} €
                    </Descriptions.Item>
                    <Descriptions.Item label="Date de candidature" span={3}>
                        {currentCandidature?.date_candidature &&
                            new Date(currentCandidature.date_candidature).toLocaleDateString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Date de disponibilité" span={3}>
                        {currentCandidature?.date_disponibilite &&
                            new Date(currentCandidature.date_disponibilite).toLocaleDateString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Statut" span={3}>
                        <Tag color={getStatusColor(currentCandidature?.statut)}>
                            {currentCandidature?.statut}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Commentaire" span={3}>
                        {currentCandidature?.commentaire}
                    </Descriptions.Item>
                </Descriptions>
            </Modal>
        </div>
    );
};

export default CandidatureInterface;
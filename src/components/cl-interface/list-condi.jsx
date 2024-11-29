import React, { useState, useEffect } from 'react';
import { Collapse, Card, Button, Modal, Descriptions, Tag, Typography, Table, message, Empty } from 'antd';
import { DownloadOutlined, CheckOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const { Title, Text } = Typography;

const CandidatureInterface = () => {
    const [appelsOffre, setAppelsOffre] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentCandidate, setCurrentCandidate] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Fetch data from APIs
    const fetchData = async () => {
        setLoading(true);
        try {
            // Get client ID from local storage
            const clientId = localStorage.getItem('id');
            if (!clientId) {
                throw new Error('Client ID not found in local storage');
            }

            // First, fetch Appel d'Offre data
            const appelsOffreRes = await fetch('http://51.38.99.75:4001/api/appelOffre/');
            const appelsOffreData = await appelsOffreRes.json();
            setAppelsOffre(appelsOffreData.data);

            // Fetch candidates for each Appel d'Offre
            const candidatesPromises = appelsOffreData.data.map(async (offre) => {
                try {
                    const candidatesRes = await fetch(`http://51.38.99.75:4001/api/get_candidates/?clientId=${clientId}&appelOffreId=${offre.id}`);
                    const candidatesData = await candidatesRes.json();

                    // Check if the response indicates no candidates found
                    if (candidatesData.status === false && 
                        candidatesData.message === "Aucun appel d'offre trouvé pour ce client") {
                        return []; // Return empty array for this specific offre
                    }

                    // Return candidates data if available
                    return candidatesData.data || [];
                } catch (error) {
                    console.error(`Error fetching candidates for offre ${offre.id}:`, error);
                    return []; // Return empty array in case of error
                }
            });

            const candidatesResults = await Promise.all(candidatesPromises);
            
            // Flatten and combine candidates from all Appel d'Offre
            const allCandidates = candidatesResults.flatMap(result => result);
            setCandidates(allCandidates);

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

    const handleViewCandidate = (candidate) => {
        setCurrentCandidate(candidate);
        setIsModalVisible(true);
    };

    const handleAccept = async (candidate) => {
        try {
            const response = await fetch(`http://51.38.99.75:4001/api/get_candidates/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...candidate,
                    statut: 'Accepté'
                })
            });

            if (response.ok) {
                message.success('Candidature acceptée avec succès');
                fetchData();
            } else {
                throw new Error('Failed to update candidature');
            }
        } catch (error) {
            message.error('Erreur lors de la mise à jour du statut');
            console.error('Error updating candidature:', error);
        }
    };

    const handleReject = async (candidate) => {
        try {
            const response = await fetch(`http://51.38.99.75:4001/api/get_candidates/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...candidate,
                    statut: 'Refusé'
                })
            });

            if (response.ok) {
                message.success('Candidature refusée');
                fetchData();
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
                    const relatedCandidates = candidates.filter(
                        (candidate) => candidate.appelOffreId === offre.id
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

                                {relatedCandidates.length > 0 ? (
                                    <Table
                                        dataSource={relatedCandidates}
                                        rowKey="id"
                                        columns={[
                                            {
                                                title: 'Nom',
                                                dataIndex: 'nom',
                                                key: 'nom'
                                            },
                                            {
                                                title: 'Prénom',
                                                dataIndex: 'prenom',
                                                key: 'prenom'
                                            },
                                            {
                                                title: 'TJM Proposé',
                                                dataIndex: 'tjm',
                                                key: 'tjm',
                                                render: (tjm) => `${tjm} €`
                                            },
                                            {
                                                title: 'Date Candidature',
                                                dataIndex: 'dateCandidature',
                                                key: 'dateCandidature',
                                                render: (date) => new Date(date).toLocaleDateString()
                                            },
                                            {
                                                title: 'Disponibilité',
                                                dataIndex: 'dateDisponibilite',
                                                key: 'dateDisponibilite',
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
                                            onClick: () => handleViewCandidate(record)
                                        })}
                                    />
                                ) : (
                                    <Empty 
                                        description="Aucun candidat pour cet appel d'offre"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                    />
                                )}
                            </Card>
                        </Panel>
                    );
                })}
            </Collapse>

            <Modal
                title={`Candidature - ${currentCandidate?.nom} ${currentCandidate?.prenom}`}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Descriptions bordered>
                    <Descriptions.Item label="Nom" span={3}>
                        {currentCandidate?.nom}
                    </Descriptions.Item>
                    <Descriptions.Item label="Prénom" span={3}>
                        {currentCandidate?.prenom}
                    </Descriptions.Item>
                    <Descriptions.Item label="TJM Proposé" span={3}>
                        {currentCandidate?.tjm} €
                    </Descriptions.Item>
                    <Descriptions.Item label="Date de candidature" span={3}>
                        {currentCandidate?.dateCandidature &&
                            new Date(currentCandidate.dateCandidature).toLocaleDateString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Date de disponibilité" span={3}>
                        {currentCandidate?.dateDisponibilite &&
                            new Date(currentCandidate.dateDisponibilite).toLocaleDateString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Statut" span={3}>
                        <Tag color={getStatusColor(currentCandidate?.statut)}>
                            {currentCandidate?.statut}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>
            </Modal>
        </div>
    );
};

export default CandidatureInterface;
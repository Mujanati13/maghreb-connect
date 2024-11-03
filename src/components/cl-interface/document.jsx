import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table,
    Upload,
    Button,
    message,
    Space,
    Modal,
    Tag,
    Typography,
    Input,
    Card,
    Avatar,
    Radio,
    Form
} from 'antd';
import {
    AppstoreOutlined,
    UploadOutlined,
    DeleteOutlined,
    SearchOutlined,
    EyeOutlined,
    DownloadOutlined,
    FileOutlined,
    EditOutlined
} from '@ant-design/icons';
import { token } from '../../helper/enpoint';

const { Title } = Typography;
const { Search } = Input;

const ClientDocument = () => {
    const [isTableView, setIsTableView] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [editForm] = Form.useForm();

    // Fetch documents from API
    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('http://51.38.99.75:4001/api/documentClient/', {
                headers: {
                    Authorization: `${token()}`
                }
            });
            if (response.data && response.data.data) {
                // Transform API data to match existing component structure
                const transformedDocs = response.data.data.map(doc => ({
                    key: doc.ID_DOC_CLT.toString(),
                    id_doc_clt: doc.ID_DOC_CLT,
                    id_clt: doc.ID_CLT,
                    nom: doc.Titre,
                    type: doc.Doc_URL.split('.').pop().toUpperCase(),
                    taille: 'N/A', // API doesn't provide file size
                    dateUpload: doc.Date_Valid,
                    status: doc.Statut,
                    client: doc.client,
                    description: doc.Description,
                    url: doc.Doc_URL
                }));
                setDocuments(transformedDocs);
            }
        } catch (error) {
            message.error('Erreur lors de la récupération des documents');
            console.error('Fetch error:', error);
        }
        setIsLoading(false);
    };

    // Initial document fetch
    useEffect(() => {
        fetchDocuments();
    }, []);

    // File upload handler with new saveDoc API
    const uploadProps = {
        name: 'uploadedFile',
        customRequest: async ({ file, onSuccess, onError, onProgress }) => {
            const formData = new FormData();
            formData.append('uploadFile', file);

            try {
                // First API call - Save the document file
                const saveDocResponse = await axios.post(
                    'http://51.38.99.75:4001/api/saveDoc',
                    formData,
                    {
                        params: {
                            path: 'C:/Users/helka/OneDrive/Bureau/MaghrebIT-Connect/media/doc_client/'
                        },
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `${token()}`,
                        },
                        onUploadProgress: (progressEvent) => {
                            const percent = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
                            onProgress({ percent });
                        }
                    }
                );

                // If first API call is successful, proceed with second API call
                if (saveDocResponse.data && saveDocResponse.data.path) {
                    // Second API call - Save document metadata
                    const metadataResponse = await axios.post(
                        'http://51.38.99.75:4001/api/documentClient/',
                        {
                            ID_CLT: '1', // Consider making this dynamic
                            Titre: file.name,
                            Description: 'Document ajouté via upload',
                            Statut: 'En Attente',
                            Doc_URL: saveDocResponse.data.path
                        },
                        {
                            headers: {
                                Authorization: `${token()}`
                            }
                        }
                    );

                    if (metadataResponse.data) {
                        onSuccess(saveDocResponse.data);
                        message.success(`${file.name} fichier téléchargé avec succès`);
                        fetchDocuments(); // Refetch documents list
                    }
                }
            } catch (error) {
                console.error('Upload error:', error);
                onError(error);
                message.error(`${file.name} échec du téléchargement.`);
            }
        },
        beforeUpload: (file) => {
            // File type validation
            const isPDForDOC = file.type === 'application/pdf' ||
                file.type === 'application/msword' ||
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

            if (!isPDForDOC) {
                message.error(`${file.name} n'est pas un fichier PDF ou DOC`);
                return false;
            }

            // File size validation
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
                message.error('Le fichier doit être inférieur à 10MB!');
                return false;
            }

            return isPDForDOC && isLt10M;
        },
        onChange: (info) => {
            if (info.file.status === 'error') {
                message.error(`${info.file.name} échec du téléchargement.`);
            }
        },
    };


    // Table columns configuration
    const columns = [
        { title: 'Nom du Document', dataIndex: 'nom', key: 'nom', sorter: (a, b) => a.nom.localeCompare(b.nom) },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <Tag color={type === 'PDF' ? 'blue' : 'green'}>{type}</Tag>
        },
        { title: 'Taille', dataIndex: 'taille', key: 'taille' },
        {
            title: 'Date Upload',
            dataIndex: 'dateUpload',
            key: 'dateUpload',
            sorter: (a, b) => new Date(a.dateUpload) - new Date(b.dateUpload)
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={status === 'Validé' ? 'green' : 'orange'}>{status}</Tag>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EyeOutlined />} onClick={() => handleView(record)} />
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={() => window.open(record.url, '_blank')}
                    />
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDelete(record)}
                    />
                </Space>
            ),
        },
    ];

    // Action handlers
    const handleView = (record) => {
        setSelectedDocument(record);
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setSelectedDocument(record);
        editForm.setFieldsValue({
            Titre: record.nom,
            Description: record.description,
            Statut: record.status,
            client: record.client
        });
        setIsEditModalVisible(true);
    };

    const handleEditSubmit = async (values) => {
        try {
            const response = await axios.put(`http://51.38.99.75:4001/api/documentClient/${selectedDocument.id_doc_clt}`, {
                ID_CLT: selectedDocument.id_clt,
                Titre: values.Titre,
                Description: values.Description,
                Statut: values.Statut,
                client: values.client
            });

            if (response.data) {
                message.success('Document mis à jour avec succès');
                setIsEditModalVisible(false);
                fetchDocuments();
            }
        } catch (error) {
            message.error('Erreur lors de la mise à jour du document');
            console.error('Edit error:', error);
        }
    };

    const handleDelete = async (record) => {
        Modal.confirm({
            title: 'Êtes-vous sûr de vouloir supprimer ce document ?',
            content: `Cette action supprimera définitivement ${record.nom}`,
            okText: 'Oui',
            okType: 'danger',
            cancelText: 'Non',
            async onOk() {
                try {
                    await axios.delete(`http://51.38.99.75:4001/api/documentClient/${record.key}`);
                    message.success('Document supprimé avec succès');
                    // Refetch documents to get updated list
                    fetchDocuments();
                } catch (error) {
                    message.error('Erreur lors de la suppression du document');
                    console.error('Delete error:', error);
                }
            },
        });
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    // Filter documents based on search
    const filteredDocuments = documents.filter(doc =>
        doc.nom.toLowerCase().includes(searchText.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchText.toLowerCase()) ||
        doc.status.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="p-4">
            <div className="mb-4 flex flex-row justify-between items-center">
                <div>
                    <Radio.Group
                        value={isTableView}
                        onChange={(e) => setIsTableView(!isTableView)}
                        buttonStyle="solid"
                    >
                        <Radio.Button value="table">Tableau</Radio.Button>
                        <Radio.Button value="card">Cartes</Radio.Button>
                    </Radio.Group>
                </div>
                <div className="flex justify-between space-x-5 items-center">
                    <Search
                        placeholder="Rechercher un document..."
                        allowClear
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: 300 }}
                    />
                    <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />} type="primary">Ajouter un Document</Button>
                    </Upload>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center">Chargement des documents...</div>
            ) : isTableView ? (
                <Table
                    columns={columns}
                    dataSource={filteredDocuments}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    {filteredDocuments.map((doc) => (
                        <Card
                            key={doc.key}
                            style={{ width: 300 }}
                            actions={[
                                <EyeOutlined key="view" onClick={() => handleView(doc)} />,
                                <DownloadOutlined key="download" onClick={() => window.open(doc.url, '_blank')} />,
                                <EditOutlined key="edit" onClick={() => handleEdit(doc)} />,
                                <DeleteOutlined key="delete" onClick={() => handleDelete(doc)} />
                            ]}
                        >
                            <Card.Meta
                                avatar={<Avatar icon={<FileOutlined />} />}
                                title={doc.nom}
                                description={
                                    <>
                                        <p>Type: <Tag color={doc.type === 'PDF' ? 'blue' : 'green'}>{doc.type}</Tag></p>
                                        <p>Taille: {doc.taille}</p>
                                        <p>Date Upload: {doc.dateUpload}</p>
                                        <p>Status: <Tag color={doc.status === 'Validé' ? 'green' : 'orange'}>{doc.status}</Tag></p>
                                    </>
                                }
                            />
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                title="Aperçu du Document"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedDocument && (
                    <div>
                        <p><strong>Titre:</strong> {selectedDocument.nom}</p>
                        <p><strong>Client:</strong> {selectedDocument.client}</p>
                        <p><strong>Description:</strong> {selectedDocument.description}</p>
                        <p><strong>Date de Validation:</strong> {selectedDocument.dateUpload}</p>
                        <p><strong>Statut:</strong> {selectedDocument.status}</p>
                        <Button
                            type="primary"
                            onClick={() => window.open(selectedDocument.url, '_blank')}
                        >
                            Ouvrir le Document
                        </Button>
                    </div>
                )}
            </Modal>

            <Modal
                title="Modifier le Document"
                visible={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditSubmit}
                >
                    <Form.Item
                        name="Titre"
                        label="Titre du Document"
                        rules={[{ required: true, message: 'Veuillez saisir le titre' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="Description"
                        label="Description"
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item
                        name="Statut"
                        label="Statut"
                        rules={[{ required: true, message: 'Veuillez sélectionner un statut' }]}
                    >
                        <Radio.Group>
                            <Radio value="Validé">Validé</Radio>
                            <Radio value="En Attente">En Attente</Radio>
                            <Radio value="Rejeté">Rejeté</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        name="client"
                        label="Client"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Mettre à jour
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ClientDocument;
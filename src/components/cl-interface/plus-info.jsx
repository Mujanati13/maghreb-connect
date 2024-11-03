import React, { useState, useCallback } from 'react';
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
    Switch
} from 'antd';
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
    GlobalOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const ClientPlusInfo = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();
    const [profileImage, setProfileImage] = useState(null);
    const [privacySettings, setPrivacySettings] = useState({
        showEmail: true,
        showPhone: false,
        showLocation: true
    });

    const initialProfile = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@exemple.com',
        phone: '+33 6 12 34 56 78',
        address: '123 Rue de l\'Entreprise, Paris, France',
        occupation: 'Développeur Logiciel',
        birthDate: dayjs('1990-05-15'),
        bio: 'Professionnel expérimenté passionné par la technologie et l\'innovation.',
        industry: 'Technologie',
        socialLinks: {
            linkedin: 'jeandupont',
            github: 'jeandupont',
            twitter: '@jeandupont',
            website: 'https://jeandupont.com'
        },
        completionStatus: 80
    };

    const [profile, setProfile] = useState(initialProfile);

    const handleProfileImageUpload = (info) => {
        const file = info.file;
        if (file.status === 'done') {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImage(e.target.result);
                message.success('Photo de profil mise à jour avec succès');
            };
            reader.readAsDataURL(file);
        } else if (file.status === 'error') {
            message.error('Échec du téléchargement de la photo');
        }
    };

    const handlePrivacyToggle = (setting) => {
        setPrivacySettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
        message.info(`Visibilité de ${setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} mise à jour`);
    };

    const handleEdit = useCallback(() => {
        if (isEditing) {
            form.validateFields()
                .then((values) => {
                    const updatedProfile = {
                        ...values,
                        birthDate: values.birthDate,
                        completionStatus: calculateProfileCompletion(values),
                        socialLinks: {
                            linkedin: values.linkedin || '',
                            github: values.github || '',
                            twitter: values.twitter || '',
                            website: values.website || ''
                        }
                    };
                    setProfile(updatedProfile);
                    setIsEditing(false);
                    message.success('Profil mis à jour avec succès');
                })
                .catch((error) => {
                    message.error('Veuillez vérifier tous les champs requis');
                });
        } else {
            form.setFieldsValue({
                ...profile,
                birthDate: profile.birthDate,
                ...profile.socialLinks
            });
            setIsEditing(true);
        }
    }, [form, isEditing, profile]);

    const calculateProfileCompletion = (values) => {
        const requiredFields = [
            'firstName', 'lastName', 'email', 'phone', 
            'address', 'occupation', 'birthDate', 'bio', 
            'industry'
        ];
        const filledFields = requiredFields.filter(field => 
            values[field] && values[field] !== undefined
        );
        return Math.round((filledFields.length / requiredFields.length) * 100);
    };

    const handleCancelEdit = () => {
        form.resetFields();
        setIsEditing(false);
    };

    const renderSocialLink = (icon, placeholder, name) => (
        <Form.Item
            name={name}
            label={name.charAt(0).toUpperCase() + name.slice(1)}
        >
            <Input 
                prefix={icon} 
                placeholder={placeholder} 
            />
        </Form.Item>
    );

    return (
        <div className="w-full mx-auto p-6 bg-gradient-to-br from-blue-50 to-blue-100">
            <Card 
                className="shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl"
                bodyStyle={{ padding: 0 }}
            >
                {/* En-tête avec Progression et Actions de Modification */}
                <div className="p-6 bg-white flex justify-between items-center border-b border-blue-100">
                    <div className="w-full mr-4">
                        <Tooltip title={`Profil ${profile.completionStatus}% Complété`}>
                            <Progress 
                                percent={profile.completionStatus} 
                                status={profile.completionStatus === 100 ? 'success' : 'active'}
                                strokeColor={{
                                    '0%': '#108ee9',
                                    '100%': '#87d068',
                                }}
                                strokeWidth={10}
                                className="w-full"
                            />
                        </Tooltip>
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
                                src={profileImage || undefined}
                                icon={!profileImage && <UserOutlined />} 
                                className="mb-4 border-4 border-blue-500 shadow-lg"
                            />
                            <Upload
                                name="avatar"
                                listType="picture"
                                className="avatar-uploader"
                                showUploadList={false}
                                beforeUpload={() => false}
                                onChange={handleProfileImageUpload}
                            >
                                <Button 
                                    icon={<UploadOutlined />} 
                                    type="dashed"
                                    disabled={!isEditing}
                                    className="mb-4"
                                >
                                    Changer de Photo
                                </Button>
                            </Upload>

                            {/* Paramètres de Confidentialité */}
                            <div className="w-full bg-blue-50 p-4 rounded-lg shadow-inner">
                                <h4 className="text-center mb-4 font-semibold text-blue-800">Contrôles de Confidentialité</h4>
                                <div className="space-y-3">
                                    {Object.entries(privacySettings).map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center">
                                            <span className="text-blue-700">
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
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
                            initialValues={initialProfile}
                            className="space-y-4"
                        >
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="firstName"
                                        label="Prénom"
                                        rules={[{ required: true, message: 'Veuillez entrer votre prénom' }]}
                                    >
                                        <Input 
                                            prefix={<UserOutlined />} 
                                            placeholder="Prénom" 
                                            className="rounded-lg"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="lastName"
                                        label="Nom de Famille"
                                        rules={[{ required: true, message: 'Veuillez entrer votre nom de famille' }]}
                                    >
                                        <Input 
                                            prefix={<UserOutlined />} 
                                            placeholder="Nom de Famille" 
                                            className="rounded-lg"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="email"
                                label="E-mail"
                                rules={[
                                    { required: true, message: 'Veuillez entrer votre e-mail' },
                                    { type: 'email', message: 'Veuillez entrer un e-mail valide' }
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
                                rules={[{ required: true, message: 'Veuillez entrer votre numéro de téléphone' }]}
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
                                rules={[{ required: true, message: 'Veuillez entrer votre adresse' }]}
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
                                        rules={[{ required: true, message: 'Veuillez entrer votre profession' }]}
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
                                        rules={[{ required: true, message: 'Veuillez sélectionner un secteur' }]}
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
                                rules={[{ required: true, message: 'Veuillez sélectionner votre date de naissance' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="YYYY-MM-DD"
                                    placeholder="Sélectionner la Date de Naissance"
                                    className="rounded-lg w-full"
                                />
                            </Form.Item>

                            <Form.Item
                                name="bio"
                                label="Biographie"
                                rules={[{ required: true, message: 'Veuillez entrer votre biographie' }]}
                            >
                                <TextArea 
                                    rows={4} 
                                    placeholder="Parlez-nous de vous" 
                                    className="rounded-lg"
                                />
                            </Form.Item>

                            {/* Social Links Section */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="text-center mb-4 font-semibold text-blue-800">Social Links</h4>
                                <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                        {renderSocialLink(
                                            <LinkedinOutlined />, 
                                            'LinkedIn Username', 
                                            'linkedin'
                                        )}
                                    </Col>
                                    <Col xs={24} md={12}>
                                        {renderSocialLink(
                                            <TwitterOutlined />, 
                                            'Twitter Handle', 
                                            'twitter'
                                        )}
                                    </Col>
                                    <Col xs={24} md={12}>
                                        {renderSocialLink(
                                            <GlobalOutlined />, 
                                            'Personal Website', 
                                            'website'
                                        )}
                                    </Col>
                                </Row>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default ClientPlusInfo;
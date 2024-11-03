// Login.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, Space, Divider, Radio } from 'antd';
import { UserOutlined, LockOutlined, BankOutlined } from '@ant-design/icons';
import { NavLink } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

const { Title, Text, Link } = Typography;

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState('client');
    const navigate = useNavigate();

    const onFinish = (values) => {
        setLoading(true);
        console.log('Succès:', { ...values, userType });
        // Simulation d'appel API
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <Card
                style={{
                    maxWidth: '400px',
                    width: '100%',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <Title level={2} style={{ marginBottom: '8px' }}>Bienvenue</Title>
                    <Text type="secondary">Connectez-vous à votre compte</Text>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <Radio.Group
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        buttonStyle="solid"
                        style={{ width: '100%' }}
                    >
                        <Radio.Button
                            value="client"
                            style={{ width: '50%', textAlign: 'center' }}
                        >
                            Client
                        </Radio.Button>
                        <Radio.Button
                            value="societe"
                            style={{ width: '50%', textAlign: 'center' }}
                        >
                            Société
                        </Radio.Button>
                    </Radio.Group>
                </div>

                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    size="large"
                    layout="vertical"
                >
                    {userType === 'client' ? (
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Veuillez saisir votre email!' },
                                { type: 'email', message: 'Veuillez saisir un email valide!' }
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Adresse email"
                            />
                        </Form.Item>
                    ) : (
                        <Form.Item
                            name="siret"
                            rules={[
                                { required: true, message: 'Veuillez saisir votre numéro SIRET!' },
                                { len: 14, message: 'Le numéro SIRET doit contenir 14 chiffres!' }
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Adresse email"
                                maxLength={14}
                            />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Veuillez saisir votre mot de passe!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Mot de passe"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space style={{ width: '100%' }} justify="space-between">
                            <Checkbox name="remember">Se souvenir de moi</Checkbox>
                            <Link>Mot de passe oublié ?</Link>
                        </Space>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            style={{
                                height: '40px',
                                borderRadius: '6px',
                                background: '#1890ff'
                            }}
                        >
                            Se connecter
                        </Button>
                    </Form.Item>

                    <Divider plain>
                        <Text type="secondary">OU</Text>
                    </Divider>

                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <Button
                            block
                            icon={<img
                                src="https://img.icons8.com/fluency/48/google-logo.png"
                                alt="Google"
                                style={{ marginRight: '8px' }}
                                width={28}
                            />}
                            style={{
                                height: '40px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            Continuer avec Google
                        </Button>
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary">
                                Vous n'avez pas de compte ? <Link onClick={() => { navigate('/regester') }}>S'inscrire</Link>
                            </Text>
                        </div>
                    </Space>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;
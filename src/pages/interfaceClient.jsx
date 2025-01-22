import React, { useState, useMemo , useEffect} from "react";
import {
  LogoutOutlined,
  UserOutlined,
  FileOutlined,
  NotificationOutlined,
  ShoppingOutlined,
  TeamOutlined,
  DashboardOutlined,
  ProfileOutlined,
  SearchOutlined,
  FileSearchOutlined,
  UsergroupAddOutlined,
  FileDoneOutlined,
  BankOutlined,
  ProjectOutlined,
  SolutionOutlined,
  BuildOutlined,
  PartitionOutlined
} from "@ant-design/icons";
import { Menu, Tag, AutoComplete, Input, Breadcrumb } from "antd";
import ClientPlusInfo from "../components/cl-interface/plus-info";
import EntrepriseServices from "../components/cl-interface/en-list";
import Listconsultant from "../components/en-interface/list-consultant";
import DocumentManagement from "../components/cl-interface/document";
import AppelDOffreInterface from "../components/cl-interface/ad-interface";
import CandidatureInterface from "../components/cl-interface/list-condi";
import NotificationInterfaceClient from "../components/cl-interface/noti-list";
import PurchaseOrderInterface from "../components/cl-interface/bd-list";
import ContractSignature from "../components/cl-interface/contart-cl";
import PartenariatInterface from "../components/cl-interface/partenariat-list";
import ContractList from "../components/cl-interface/contart-cl";
import ConsultantManagement from "../components/cl-interface/list-consultant";
import { isClientLoggedIn, logoutEsn } from "../helper/db";
import { useNavigate } from "react-router-dom";

const ClientProfile = () => {
  const [current, setCurrent] = useState("dashboard");
  const [searchValue, setSearchValue] = useState("");
  const [breadcrumbItems, setBreadcrumbItems] = useState(['Tableau de Bord']);
  const navigate = useNavigate();

  useEffect(() => {
      const auth = isClientLoggedIn();
      if (auth === false) {
        navigate("/Login");
      }
    }, [navigate]);

  const menuItems = [
    {
      label: "Tableau de Bord",
      key: "dashboard",
      icon: <DashboardOutlined />,
    },
    {
      label: "Mon Espace",
      key: "mon-espace",
      icon: <UserOutlined />,
      group: "Gestion du Compte",
      children: [
        {
          label: "Mon Profil Client",
          key: "Mon-Profil",
          icon: <ProfileOutlined />,
        }
      ]
    },
    {
      label: "Prestataires",
      key: "prestataires",
      icon: <BuildOutlined />,
      group: "Gestion des Services",
      children: [
        {
          label: "ESN Partenaires",
          key: "Entreprise-de-Services",
          icon: <BankOutlined />,
        },
        {
          label: "Consultants",
          key: "consultant",
          icon: <TeamOutlined />,
        },
        {
          label: "Partenariats",
          key: "Partenariat",
          icon: <PartitionOutlined />,
        }
      ]
    },
    {
      label: "Appels d'Offres",
      key: "appels-offres",
      icon: <ProjectOutlined />,
      group: "Gestion Commerciale",
      children: [
        {
          label: "Mes offers",
          key: "Appel-d'offres",
          icon: <FileSearchOutlined />,
        },
        {
          label: "Candidatures",
          key: "Liste-Candidature",
          icon: <UsergroupAddOutlined />,
        },
        {
          label: "Bons de Commande",
          key: "Liste-BDC",
          icon: <ShoppingOutlined />,
        },
        {
          label: "Contrats",
          key: "Contart",
          icon: <FileDoneOutlined />,
        }
      ]
    },
    {
      label: "Documents",
      key: "documents-section",
      icon: <FileOutlined />,
      group: "Documentation",
      children: [
        {
          label: "Gestion Documentaire",
          key: "documents",
          icon: <SolutionOutlined />,
        }
      ]
    },
    {
      label: "Notifications",
      key: "notification",
      icon: <NotificationOutlined />,
    }
  ];

  // Group menu items for the main menu
  const groupedMenuItems = useMemo(() => {
    const mainItems = menuItems.filter(item => !item.group);
    const groupedItems = menuItems.reduce((acc, item) => {
      if (item.group && !acc.find(i => i.label === item.group)) {
        acc.push({
          label: item.group,
          key: item.group.toLowerCase().replace(/\s+/g, '-'),
          children: menuItems.filter(i => i.group === item.group).map(i => ({
            ...i,
            group: undefined // Remove group property from children
          }))
        });
      }
      return acc;
    }, []);
    
    return [...mainItems, ...groupedItems];
  }, []);

  const findMenuPath = (key) => {
    for (const item of menuItems) {
      if (item.key === key) {
        return [item.label];
      }
      if (item.children) {
        const childPath = item.children.find(child => child.key === key);
        if (childPath) {
          return [item.label, childPath.label];
        }
      }
    }
    return ['Tableau de Bord'];
  };

  const getSearchOptions = (searchText) => {
    if (!searchText) return [];

    const search = searchText.toLowerCase();
    const flattenedItems = menuItems.reduce((acc, item) => {
      if (item.children) {
        return [...acc, ...item.children];
      }
      return [...acc, item];
    }, []);

    return flattenedItems
      .filter(item => item.label.toLowerCase().includes(search))
      .map(item => ({
        value: item.key,
        label: (
          <div className="flex items-center gap-2 py-2">
            {item.icon}
            <span>{item.label}</span>
          </div>
        ),
      }));
  };

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const handleSelect = (value) => {
    setCurrent(value);
    setSearchValue("");
    setBreadcrumbItems(findMenuPath(value));
  };

  const handleMenuClick = (e) => {
    setCurrent(e.key);
    setBreadcrumbItems(findMenuPath(e.key));
  };

  const renderComponent = () => {
    switch (current) {
      case "Mon-Profil":
        return <ClientPlusInfo />;
      case "Entreprise-de-Services":
        return <EntrepriseServices />;
      case "documents":
        return <DocumentManagement />;
      case "consultant":
        return <ConsultantManagement />;
      case "Appel-d'offres":
        return <AppelDOffreInterface />;
      case "Liste-Candidature":
        return <CandidatureInterface />;
      case "notification":
        return <NotificationInterfaceClient />;
      case "Contart":
        return <ContractList />;
      case "Liste-BDC":
        return <PurchaseOrderInterface />;
      case "Partenariat":
        return <PartenariatInterface />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="w-full flex items-center p-4 justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Menu
              onClick={handleMenuClick}
              selectedKeys={[current]}
              mode="horizontal"
              items={groupedMenuItems}
              className="border-none flex-1"
            />
          </div>
          <div className="flex space-x-6 items-center">
            <AutoComplete
              value={searchValue}
              options={getSearchOptions(searchValue)}
              onSelect={handleSelect}
              onChange={handleSearch}
              className="w-64"
            >
              <Input
                className="w-full rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                placeholder="Rechercher une interface..."
                suffix={<SearchOutlined className="text-gray-400" />}
              />
            </AutoComplete>
            <Tag color="green">Espace client</Tag>
            <LogoutOutlined
              onClick={() => {
                logoutEsn();
                navigate("/Login");
              }}
              className="text-red-500 cursor-pointer text-base hover:text-red-600"
              title="Déconnexion"
            />
          </div>
        </div>
      </div>
      <div className="pt-20 px-5 mt-5">
        <Breadcrumb className="mb-4">
          {breadcrumbItems.map((item, index) => (
            <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>
          ))}
        </Breadcrumb>
        <div className="mt-3">{renderComponent()}</div>
      </div>
    </div>
  );
};

export default ClientProfile;
import React, { useState, useEffect , useMemo  } from "react";
import {
  LogoutOutlined,
  MacCommandOutlined,
  NotificationOutlined,
  UserOutlined,
  FileOutlined,
  UsergroupAddOutlined,
  DashboardOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  SearchOutlined,
  FileDoneOutlined,
  UserSwitchOutlined,
  SettingOutlined,
  SolutionOutlined,
  BankOutlined,
  ProjectOutlined,
  
} from "@ant-design/icons";
import { Menu, Tag, AutoComplete, Input, Breadcrumb } from "antd";
import { ClientList } from "../components/en-interface/gestionClient";
import EmployeeManagement from "../components/en-interface/collaborateur";
import ClientDocumentManagement from "../components/en-interface/clientDocumen";
import AppelDOffreInterface from "../components/en-interface/add-condi";
import NotificationInterface from "../components/en-interface/noti-list";
import BonDeCommandeInterface from "../components/en-interface/bdc-list";
import ClientPartenariatInterface from "../components/en-interface/partenariat-list";
import ContractList from "../components/en-interface/contart-en";
import { isEsnLoggedIn, logoutEsn } from "../helper/db";
import { useNavigate } from "react-router-dom";
import ESNCandidatureInterface from "../components/en-interface/me-codi";
import ESNProfilePageFrancais from "../components/en-interface/profile";

const InterfaceEn = () => {
  const [current, setCurrent] = useState("dashboard");
  const [searchValue, setSearchValue] = useState("");
  const [breadcrumbItems, setBreadcrumbItems] = useState(["Tableau de Bord"]);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = isEsnLoggedIn();
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
      label: "Administration",
      key: "administration",
      icon: <SettingOutlined />,
      children: [
        {
          label: "Mon Profil ESN",
          key: "Profile",
          icon: <UserOutlined />,
        },
        {
          label: "Gestion des Collaborateurs",
          key: "collaborateur",
          icon: <UsergroupAddOutlined />,
        },
      ],
    },
    {
      label: "Gestion Client",
      key: "client-management",
      icon: <TeamOutlined />,
      children: [
        {
          label: "Répertoire Clients",
          key: "Liste-des-Clients",
          icon: <SolutionOutlined />,
        },
        {
          label: "Partenariats",
          key: "Partenariat",
          icon: <BankOutlined />,
        },
      ],
    },
    {
      label: "Gestion Commerciale",
      key: "commercial-management",
      icon: <ShoppingCartOutlined />,
      children: [
        {
          label: "Appels d'Offres",
          key: "Liste-des-Appels-d'Offres",
          icon: <ProjectOutlined />,
        },
        {
          label: "Mes Candidatures",
          key: "Mes-condidateur",
          icon: <UserSwitchOutlined />,
        },
        {
          label: "Bons de Commande",
          key: "Bon-de-Commande",
          icon: <MacCommandOutlined />,
        },
        {
          label: "Contrats",
          key: "Contart",
          icon: <FileDoneOutlined />,
        },
      ],
    },
    {
      label: "Documentation",
      key: "documentation",
      icon: <FileOutlined />,
      children: [
        {
          label: "Documents Clients",
          key: "documents",
          icon: <FileTextOutlined />,
        },
      ],
    },
    {
      label: "Notifications",
      key: "notification",
      icon: <NotificationOutlined />,
    },
  ];

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

  const findMenuPath = (key, items, path = []) => {
    for (const item of items) {
      if (item.key === key) {
        return [...path, item.label];
      }
      if (item.children) {
        const result = findMenuPath(key, item.children, [...path, item.label]);
        if (result) return result;
      }
    }
    return null;
  };

  const flattenMenuItems = (items) => {
    return items.reduce((acc, item) => {
      if (item.children) {
        return [...acc, ...flattenMenuItems(item.children)];
      }
      return [...acc, { key: item.key, label: item.label, icon: item.icon }];
    }, []);
  };

  const getSearchOptions = (searchText) => {
    if (!searchText) return [];
    const search = searchText.toLowerCase();
    const flatItems = flattenMenuItems(menuItems);
    return flatItems
      .filter((item) => item.label.toLowerCase().includes(search))
      .map((item) => ({
        value: item.key,
        label: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 0",
            }}
          >
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
    const path = findMenuPath(value, menuItems);
    if (path) {
      setBreadcrumbItems(path);
    }
  };

  const handleMenuClick = (e) => {
    setCurrent(e.key);
    const path = findMenuPath(e.key, menuItems);
    if (path) {
      setBreadcrumbItems(path);
    }
  };

  const renderComponent = () => {
    switch (current) {
      case "dashboard":
        return null;
      case "Liste-des-Clients":
        return <ClientList />;
      case "Liste-des-Appels-d'Offres":
        return <AppelDOffreInterface />;
      case "collaborateur":
        return <EmployeeManagement />;
      case "documents":
        return <ClientDocumentManagement />;
      case "notification":
        return <NotificationInterface />;
      case "Mes-condidateur":
        return <ESNCandidatureInterface />;
      case "Bon-de-Commande":
        return <BonDeCommandeInterface />;
      case "Contart":
        return <ContractList />;
      case "Partenariat":
        return <ClientPartenariatInterface />;
      case "Profile":
        return <ESNProfilePageFrancais />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="w-full flex items-center justify-between p-4">
          <div className="flex items-center flex-grow">
            <Menu
              onClick={handleMenuClick}
              selectedKeys={[current]}
              mode="horizontal"
              items={groupedMenuItems}
              className="flex-grow border-none"
            />
            <AutoComplete
              value={searchValue}
              options={getSearchOptions(searchValue)}
              onSelect={handleSelect}
              onChange={handleSearch}
              className="w-64"
            >
              <Input
                className="w-32 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                placeholder="Rechercher dans le menu..."
                suffix={<SearchOutlined className="text-gray-400" />}
              />
            </AutoComplete>
          </div>
          <div className="flex space-x-3 items-center ml-4">
            {/* <Tag color="blue">ESN</Tag> */}
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

export default InterfaceEn;

import React, { useState, useMemo, useEffect } from "react";
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
} from "@ant-design/icons";
import { Menu, Tag, AutoComplete, Input } from "antd";
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
  const navigate = useNavigate();

  useEffect(() => {
    {
      const auth = isEsnLoggedIn();
      if (auth == false) {
        navigate("/Login");
      }
    }
  }, []);

  const menuItems = [
    {
      label: "Tableau de Bord",
      key: "dashboard",
      icon: <DashboardOutlined />,
    },
    {
      label: "Gestion Clients",
      key: "client-management",
      icon: <TeamOutlined />,
      children: [
        {
          label: "Profile",
          key: "Profile",
          icon: <UserOutlined />,
        },
        {
          label: "Liste des Clients",
          key: "Liste-des-Clients",
          icon: <UserOutlined />,
        },
        {
          label: "Collaborateurs",
          key: "collaborateur",
          icon: <UsergroupAddOutlined />,
        },
      ],
    },
    {
      label: "Appels d'Offres",
      key: "offers-management",
      icon: <ShoppingCartOutlined />,
      children: [
        {
          label: "Liste des Appels d'Offres",
          key: "Liste-des-Appels-d'Offres",
        },
        {
          label: "Bon de Commande",
          key: "Bon-de-Commande",
          icon: <MacCommandOutlined />,
        },
        {
          label: "Contrats",
          key: "Contart",
          icon: <FileDoneOutlined />,
        },
        {
          label: "Mes condidateur",
          key: "Mes-condidateur",
          icon: <UserSwitchOutlined />,
        },
      ],
    },
    {
      label: "Ressources",
      key: "resources",
      icon: <FileOutlined />,
      children: [
        {
          label: "Documents",
          key: "documents",
          icon: <FileTextOutlined />,
        },
        {
          label: "Partenariat",
          key: "Partenariat",
          icon: <FileOutlined />,
        },
      ],
    },
    {
      label: "Notifications",
      key: "notification",
      icon: <NotificationOutlined />,
    },
  ];

  // Flatten menu items for search options
  const flattenMenuItems = (items) => {
    return items.reduce((acc, item) => {
      if (item.children) {
        return [...acc, ...flattenMenuItems(item.children)];
      }
      return [...acc, { key: item.key, label: item.label, icon: item.icon }];
    }, []);
  };

  // Get search options based on input
  const getSearchOptions = (searchText) => {
    if (!searchText) return [];

    const search = searchText.toLowerCase();
    const flatItems = flattenMenuItems(menuItems);

    return flatItems
      .filter((item) => item.label.toLowerCase().includes(search))
      .map((item) => ({
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
  };

  const handleMenuClick = (e) => {
    setCurrent(e.key);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchValue) {
      const flatItems = flattenMenuItems(menuItems);
      const matchingItem = flatItems.find((item) =>
        item.label.toLowerCase().includes(searchValue.toLowerCase())
      );
      if (matchingItem) {
        setCurrent(matchingItem.key);
        setSearchValue("");
      }
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
              items={menuItems}
              className="flex-grow border-none mr-4"
            />
            <AutoComplete
              value={searchValue}
              options={getSearchOptions(searchValue)}
              onSelect={handleSelect}
              onChange={handleSearch}
              onKeyPress={handleKeyPress}
              className="w-64"
            >
              <Input
                className="w-full rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                placeholder="Rechercher dans le menu..."
                suffix={<SearchOutlined className="text-gray-400" />}
              />
            </AutoComplete>
          </div>
          <div className="flex space-x-3 items-center ml-4">
            <Tag color="blue">Espace de l'ENS</Tag>
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
        <div className="p-1 text-sm">
          {current.replaceAll("-", " ").charAt(0).toUpperCase() +
            current.replaceAll("-", " ").slice(1)}
        </div>
        <div className="mt-3">{renderComponent()}</div>
      </div>
    </div>
  );
};

export default InterfaceEn;

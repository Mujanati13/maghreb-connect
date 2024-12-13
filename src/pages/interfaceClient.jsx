import React, { useState, useMemo } from "react";
import {
  LogoutOutlined,
  RiseOutlined,
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
} from "@ant-design/icons";
import { Menu, Tag, AutoComplete, Input } from "antd";
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
import { logoutEsn } from "../helper/db";
import { useNavigate } from "react-router-dom";

const ClientProfile = () => {
  const [current, setCurrent] = useState("dashboard");
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Tableau de Bord",
      key: "dashboard",
      icon: <DashboardOutlined />,
    },
    {
      label: "Mon Profil",
      key: "Mon-Profil",
      icon: <ProfileOutlined />,
      group: "Gestion de Profil",
    },
    {
      label: "Entreprise de Services",
      key: "Entreprise-de-Services",
      icon: <RiseOutlined />,
      group: "Ressources",
    },
    {
      label: "Appel d'offres",
      key: "Appel-d'offres",
      icon: <FileSearchOutlined />,
      group: "Appels d'Offres",
    },
    {
      label: "Liste Candidature",
      key: "Liste-Candidature",
      icon: <UsergroupAddOutlined />,
      group: "Appels d'Offres",
    },
    {
      label: "Liste BDC",
      key: "Liste-BDC",
      icon: <ProfileOutlined />,
      group: "Appels d'Offres",
    },
    {
      label: "Contrat",
      key: "Contart",
      icon: <FileDoneOutlined />,
      group: "Appels d'Offres",
    },
    {
      label: "Documents",
      key: "documents",
      icon: <FileOutlined />,
      group: "Ressources",
    },
    {
      label: "Partenariat",
      key: "Partenariat",
      icon: <FileOutlined />,
      group: "Ressources",
    },
    {
      label: "Consultants",
      key: "consultant",
      icon: <TeamOutlined />,
      group: "Ressources",
    },
    {
      label: "Notification",
      key: "notification",
      icon: <NotificationOutlined />,
    },
  ];

  // Group menu items for the main menu
  const groupedMenuItems = useMemo(() => {
    return menuItems.reduce((acc, item) => {
      if (item.group) {
        const groupIndex = acc.findIndex((i) => i.key === item.group);
        if (groupIndex === -1) {
          acc.push({
            label: item.group,
            key: item.group,
            icon: item.groupIcon || <UserOutlined />,
            children: [item],
          });
        } else {
          acc[groupIndex].children.push(item);
        }
      } else {
        acc.push(item);
      }
      return acc;
    }, []);
  }, []);

  // Filter search options based on input
  const getSearchOptions = (searchText) => {
    if (!searchText) return [];

    const search = searchText.toLowerCase();
    return menuItems
      .filter(
        (item) =>
          item.label.toLowerCase().includes(search) ||
          (item.group && item.group.toLowerCase().includes(search))
      )
      .map((item) => ({
        value: item.key,
        label: (
          <div className="flex items-center gap-2 py-2">
            {item.icon}
            <span>{item.label}</span>
            {item.group && (
              <span className="text-gray-400 text-sm ml-2">({item.group})</span>
            )}
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
    setSearchValue("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchValue) {
      const matchingItem = menuItems.find((item) =>
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
              onKeyPress={handleKeyPress}
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
            onClick={()=>{logoutEsn();navigate("/Login");}}
              style={{
                fontSize: "16px",
                cursor: "pointer",
                color: "#ff4d4f",
              }}
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

export default ClientProfile;

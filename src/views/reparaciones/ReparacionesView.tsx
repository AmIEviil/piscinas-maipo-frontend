import { useState } from "react";
import BodyRevestimiento from "../../components/revestimiento/BodyRevestimiento";
import { Tabs } from "../../components/ui/Tab/Tabs";
import BodyRepairs from "../../components/repairs/BodyRepairs";

export const ReparacionesView = () => {
  const options = [
    {
      label: "Revestimientos",
      onClick: () => setSelectedIndex(0),
    },
    {
      label: "Reparaciones",
      onClick: () => setSelectedIndex(1),
    },
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);

  const renderContent = () => {
    switch (selectedIndex) {
      case 0:
        return <BodyRevestimiento />;
      case 1:
        return <BodyRepairs />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div>
        <Tabs options={options} selectedIndex={selectedIndex} />
      </div>
      {renderContent()}
    </div>
  );
};

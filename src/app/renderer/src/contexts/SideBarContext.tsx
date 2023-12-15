import React from "react";

const SideBarContext = React.createContext({
    isExpanded: true,
    setIsExpanded: (isExpanded: boolean) => {},
});

export default SideBarContext;

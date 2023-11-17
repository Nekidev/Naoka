import React from "react";


const NavigationBarContext = React.createContext({
    extraComponent: <></>,
    setExtraComponent: (extraComponent: JSX.Element) => {},
});


export default NavigationBarContext;

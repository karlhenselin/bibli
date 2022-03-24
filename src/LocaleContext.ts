import React from "react";

interface Ilocale {
    locale: string,
    setLocale: Function
}

const defaultValue: Ilocale = {
    locale: 'en',
    setLocale: () => { }
}

export default React.createContext(defaultValue);
import React, { createContext, useContext } from 'react';
import { App } from 'obsidian';
import FurionPlugin from '../../main';

interface AppContextType {
    app: App;
    plugin: FurionPlugin;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ 
    app: App; 
    plugin: FurionPlugin; 
    children: React.ReactNode 
}> = ({ app, plugin, children }) => {
    return (
        <AppContext.Provider value={{ app, plugin }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

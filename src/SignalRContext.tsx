import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

interface SignalRContextType {
  connection: HubConnection | null;
}

const SignalRConnectionContext = createContext<SignalRContextType | null>(null);

interface SignalRConnectionProviderProps {
  children: ReactNode; // Explicitly type the children prop
}

export const SignalRConnectionProvider: React.FC<SignalRConnectionProviderProps> = ({ children }) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5168/chathub')
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    const startConnection = async () => {
      try {
        await newConnection.start();
        console.log("SignalR Connected.");

        newConnection.on("ReceiveMessage", (user, message) => {
          console.log(`Message from ${user}: ${message}`);
          // Additional logic to handle the message goes here
        });

      } catch (err) {
        console.error('Error establishing SignalR connection:', err);
      }
    };

    startConnection();

    return () => {
      newConnection.off("ReceiveMessage");
      newConnection.stop();
    };
  }, []);

  return (
    <SignalRConnectionContext.Provider value={{ connection }}>
      {children}
    </SignalRConnectionContext.Provider>
  );
};

export const useSignalRConnection = (): SignalRContextType | null => useContext(SignalRConnectionContext);

import React, { createContext, useContext, useState } from 'react';
import { Location } from './location-context';

export type RequestStatus = 'idle' | 'waiting' | 'accepted' | 'completed' | 'cancelled';

export interface IceCreamRequest {
  id: string;
  customerId: string;
  driverId?: string;
  location: Location;
  status: RequestStatus;
  createdAt: number;
  acceptedAt?: number;
  completedAt?: number;
  price: number;
  estimatedArrivalTime?: number;
}

interface RequestContextType {
  currentRequest: IceCreamRequest | null;
  requests: IceCreamRequest[];
  createRequest: (customerId: string, location: Location) => Promise<IceCreamRequest>;
  acceptRequest: (requestId: string, driverId: string) => Promise<void>;
  completeRequest: (requestId: string) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
  getAvailableRequests: () => IceCreamRequest[];
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export function RequestProvider({ children }: { children: React.ReactNode }) {
  const [currentRequest, setCurrentRequest] = useState<IceCreamRequest | null>(null);
  const [requests, setRequests] = useState<IceCreamRequest[]>([]);

  const createRequest = async (customerId: string, location: Location): Promise<IceCreamRequest> => {
    try {
      const newRequest: IceCreamRequest = {
        id: `req_${Date.now()}`,
        customerId,
        location,
        status: 'waiting',
        createdAt: Date.now(),
        price: 5.0,
      };

      // TODO: Call backend API to create request
      setCurrentRequest(newRequest);
      setRequests([...requests, newRequest]);
      return newRequest;
    } catch (error) {
      console.error('Failed to create request:', error);
      throw error;
    }
  };

  const acceptRequest = async (requestId: string, driverId: string): Promise<void> => {
    try {
      // TODO: Call backend API to accept request
      setRequests(
        requests.map((req) =>
          req.id === requestId
            ? { ...req, status: 'accepted' as RequestStatus, driverId, acceptedAt: Date.now() }
            : req,
        ),
      );
    } catch (error) {
      console.error('Failed to accept request:', error);
      throw error;
    }
  };

  const completeRequest = async (requestId: string): Promise<void> => {
    try {
      // TODO: Call backend API to complete request
      setRequests(
        requests.map((req) =>
          req.id === requestId
            ? { ...req, status: 'completed' as RequestStatus, completedAt: Date.now() }
            : req,
        ),
      );
      if (currentRequest?.id === requestId) {
        setCurrentRequest(null);
      }
    } catch (error) {
      console.error('Failed to complete request:', error);
      throw error;
    }
  };

  const cancelRequest = async (requestId: string): Promise<void> => {
    try {
      // TODO: Call backend API to cancel request
      setRequests(
        requests.map((req) =>
          req.id === requestId ? { ...req, status: 'cancelled' as RequestStatus } : req,
        ),
      );
      if (currentRequest?.id === requestId) {
        setCurrentRequest(null);
      }
    } catch (error) {
      console.error('Failed to cancel request:', error);
      throw error;
    }
  };

  const getAvailableRequests = (): IceCreamRequest[] => {
    return requests.filter((req) => req.status === 'waiting');
  };

  return (
    <RequestContext.Provider
      value={{
        currentRequest,
        requests,
        createRequest,
        acceptRequest,
        completeRequest,
        cancelRequest,
        getAvailableRequests,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
}

export function useRequest() {
  const context = useContext(RequestContext);
  if (context === undefined) {
    throw new Error('useRequest must be used within a RequestProvider');
  }
  return context;
}

import api from "./api";

export interface SystemAlert {
  id: string;
  type: 'warning' | 'info' | 'error';
  module: string;
  title: string;
  message: string;
  actionPath: string;
  timestamp: string;
}

export const getSystemAlerts = async (): Promise<SystemAlert[]> => {
  const response = await api.get("/dashboard/alerts");
  return response.data;
};

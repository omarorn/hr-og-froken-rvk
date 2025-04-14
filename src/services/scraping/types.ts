
export interface SmitheryServer {
  qualifiedName: string;
  name: string;
  description: string;
  version: string;
  owner: string;
}

export interface ServerDetails {
  qualifiedName: string;
  name: string;
  description: string;
  version: string;
  owner: string;
  connectionInfo: {
    url: string;
    apiKey?: string;
  };
}

export interface ScrapingResult {
  success: boolean;
  data?: any;
  error?: string;
}

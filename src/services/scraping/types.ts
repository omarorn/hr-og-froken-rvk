
import { ScrapedDataRecord } from "@/integrations/supabase/client";

export interface ScrapingResult {
  success: boolean;
  data?: {
    domain: string;
    pagesScraped: number;
    data: any[];
    recordId?: string;
  };
  error?: string;
}

export interface ServerDetails {
  qualifiedName: string;
  displayName: string;
  deploymentUrl: string;
  connections: Array<{
    type: string;
    url?: string;
    configSchema: any;
  }>;
}

export interface SmitheryServer {
  qualifiedName: string;
  displayName: string;
  description: string;
  homepage: string;
  useCount: string;
  isDeployed: boolean;
  createdAt: string;
}

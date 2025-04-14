
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface HealthStatus {
  supabase: boolean;
  assistant: boolean;
  speechService: boolean;
  localServer: boolean;
  mcpServer: boolean;
}

export const useHealthCheck = () => {
  const checkAllServices = async (): Promise<HealthStatus> => {
    const healthStatus: HealthStatus = {
      supabase: false,
      assistant: false,
      speechService: false,
      localServer: false,
      mcpServer: false
    };
    
    // Check Supabase connection
    try {
      // Use the scraped_data table for health check
      const { data, error } = await supabase.from('scraped_data').select('count(*)').limit(1);
      healthStatus.supabase = !error;
    } catch (error) {
      console.error('Supabase health check failed:', error);
    }
    
    // Check Assistant Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('assistants', {
        body: { action: 'status' }
      });
      healthStatus.assistant = !error && data?.status === 'ok';
    } catch (error) {
      console.error('Assistant health check failed:', error);
    }
    
    // Check Speech Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('speech', {
        body: { action: 'status' }
      });
      healthStatus.speechService = !error && data?.status === 'ok';
    } catch (error) {
      console.error('Speech service health check failed:', error);
    }
    
    // Check local server
    try {
      const response = await fetch('/ai-phone-agent/health-check');
      healthStatus.localServer = response.ok;
    } catch (error) {
      console.error('Local server health check failed:', error);
    }
    
    // Check MCP server
    try {
      const response = await fetch('http://localhost:8000/ping');
      healthStatus.mcpServer = response.ok;
    } catch (error) {
      console.error('MCP server health check failed:', error);
    }
    
    // Log health check results to diagnostic file
    try {
      fetch('/ai-phone-agent/logs.nd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Health check results',
          status: healthStatus,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {
        // Silently fail if server logging fails
      });
    } catch (_) {
      // Ignore logging errors
    }
    
    return healthStatus;
  };
  
  const diagnoseAndReport = async (): Promise<void> => {
    const status = await checkAllServices();
    
    const failures = Object.entries(status)
      .filter(([_, isHealthy]) => !isHealthy)
      .map(([service]) => service);
    
    if (failures.length === 0) {
      toast.success('Allar þjónustur eru virkar.', { duration: 3000 });
      return;
    }
    
    toast.error(`${failures.length} þjónustur eru ekki virkar: ${failures.join(', ')}`, {
      duration: 5000,
      action: {
        label: 'Skoða nánar',
        onClick: () => {
          // Could open a modal with detailed diagnostics in the future
          console.log('Detailed health status:', status);
        }
      }
    });
  };
  
  return {
    checkAllServices,
    diagnoseAndReport
  };
};

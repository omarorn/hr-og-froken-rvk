
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Basic scraping function using fetch and regex
async function scrapeUrl(url: string, maxPages = 20) {
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }

  try {
    console.log(`Starting scrape of: ${url}`);
    const baseUrl = new URL(url).origin;
    const domain = new URL(url).hostname;
    
    const visited = new Set<string>();
    const toVisit = [url];
    const results = [];
    
    while (toVisit.length > 0 && results.length < maxPages) {
      const currentUrl = toVisit.shift() as string;
      
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);
      
      try {
        console.log(`Fetching: ${currentUrl}`);
        const response = await fetch(currentUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ReykjavikBot/1.0; +https://reykjavik.is/bot)'
          }
        });
        
        if (!response.ok) {
          console.log(`Failed to fetch ${currentUrl}: ${response.status}`);
          continue;
        }
        
        const html = await response.text();
        
        // Extract title
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : 'No title';
        
        // Basic content extraction - strip tags, normalize whitespace
        let content = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
        content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
        content = content.replace(/<[^>]+>/g, ' ');
        content = content.replace(/\s+/g, ' ').trim();
        
        // Extract links for further crawling
        const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*?)"/gi;
        let match;
        while (results.length < maxPages && (match = linkRegex.exec(html)) !== null) {
          let newUrl = match[1];
          
          // Skip anchors, javascript, mailto, etc.
          if (newUrl.startsWith('#') || 
              newUrl.startsWith('javascript:') || 
              newUrl.startsWith('mailto:') ||
              newUrl.startsWith('tel:')) {
            continue;
          }
          
          // Convert relative URLs to absolute
          if (newUrl.startsWith('/')) {
            newUrl = baseUrl + newUrl;
          } else if (!newUrl.startsWith('http')) {
            continue; // Skip other protocol links
          }
          
          // Only follow links on the same domain
          if (new URL(newUrl).hostname === domain && !visited.has(newUrl) && !toVisit.includes(newUrl)) {
            toVisit.push(newUrl);
          }
        }
        
        // Add this page to results
        results.push({
          url: currentUrl,
          title,
          content: content.substring(0, 1000) + '...', // Limit content size
          extractedAt: new Date().toISOString()
        });
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Error processing ${currentUrl}:`, error);
      }
    }
    
    return {
      domain,
      pagesScraped: results.length,
      data: results
    };
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error(`Failed to scrape URL: ${error.message}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, maxPages } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }
    
    console.log(`Scraping request received for: ${url}`);
    
    // Perform the scraping
    const scrapedData = await scrapeUrl(url, maxPages || 20);
    
    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    
    if (supabaseUrl && supabaseServiceKey) {
      // Initialize Supabase client with service role key (only in edge function)
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Save scraped data to Supabase
      const { data: savedData, error } = await supabase
        .from('scraped_data')
        .insert({
          url,
          domain: scrapedData.domain,
          pages_scraped: scrapedData.pagesScraped,
          scraped_at: new Date().toISOString(),
          data: scrapedData.data
        })
        .select();
      
      if (error) {
        console.error('Error saving to database:', error);
      } else {
        console.log('Scraped data saved to database');
        // Return the database record ID along with the scraped data
        scrapedData.recordId = savedData?.[0]?.id;
      }
    } else {
      console.warn('Supabase credentials not available, skipping database storage');
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: scrapedData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in scraper endpoint:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

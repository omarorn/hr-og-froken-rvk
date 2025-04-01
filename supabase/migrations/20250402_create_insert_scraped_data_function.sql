
-- Create a stored procedure for inserting scraped data
CREATE OR REPLACE FUNCTION public.insert_scraped_data(
  p_url TEXT,
  p_domain TEXT,
  p_pages_scraped INTEGER,
  p_data JSONB
) RETURNS public.scraped_data AS $$
DECLARE
  v_result public.scraped_data;
BEGIN
  INSERT INTO public.scraped_data(url, domain, pages_scraped, data)
  VALUES (p_url, p_domain, p_pages_scraped, p_data)
  RETURNING * INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

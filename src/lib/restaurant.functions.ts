import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export const getRestaurantContent = createServerFn({ method: 'GET' }).handler(async () => {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('Restaurant content is unavailable');
  const db = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
      headers.set('apikey', key);
      return fetch(input, { ...init, headers });
    } },
  });
  const [categories, items, gallery, reviews] = await Promise.all([
    db.from('menu_categories').select('id,name,slug,sort_order').eq('is_active', true).order('sort_order'),
    db.from('menu_items').select('id,category_id,name,description,price,image_url,is_featured,sort_order').eq('is_active', true).order('sort_order'),
    db.from('gallery_images').select('id,title,category,image_url,alt_text,sort_order').eq('is_active', true).order('sort_order'),
    db.from('reviews').select('id,customer_name,rating,review_text,source,review_date').eq('is_active', true),
  ]);
  for (const result of [categories, items, gallery, reviews]) if (result.error) throw new Error(result.error.message);
  return { categories: categories.data ?? [], items: items.data ?? [], gallery: gallery.data ?? [], reviews: reviews.data ?? [] };
});

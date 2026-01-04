import { createClient } from '@supabase/supabase-js';

// 优先读取 Vite/EdgeOne 环境变量
const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY';

if (!env.VITE_SUPABASE_URL) {
  console.log('Supabase: 云端连接失败。');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

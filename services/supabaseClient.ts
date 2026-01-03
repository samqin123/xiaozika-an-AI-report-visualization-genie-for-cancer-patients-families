import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

/**
 * Supabase 客户端初始化
 * 修复 EdgeOne 部署时 Rollup 无法解析 @supabase/supabase-js 的问题。
 * 统一使用直接 URL 导入并保留环境变量支持。
 */
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wpgsdyiwzfcsfyimmbje.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_p3ccwxyoDqO6wBqcemVK7A_RWVNQ3HR';

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '未检测到完整的 Supabase 配置。' +
    '请在部署平台的设置中配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
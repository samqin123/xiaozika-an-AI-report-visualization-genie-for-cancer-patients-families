
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.45.4';

/**
 * Supabase 客户端初始化
 * 优先从环境变量获取，同时保留项目特定的默认值作为回退
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wpgsdyiwzfcsfyimmbje.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_p3ccwxyoDqO6wBqcemVK7A_RWVNQ3HR';

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '未检测到完整的 Supabase 配置。请确保环境变量已设置，或使用有效的默认参数。'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

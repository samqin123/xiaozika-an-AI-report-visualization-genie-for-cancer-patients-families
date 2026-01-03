import { supabase } from './supabaseClient';
import { IndicatorDefinition, MedicalRecord, TreatmentPhase, UserProfile } from '../types';

export class DBService {
  /**
   * 保存或更新个人资料
   */
  static async updateProfile(profile: Partial<UserProfile>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase
      .from('profiles')
      .upsert({ id: user.id, ...profile, updated_at: new Date().toISOString() });
  }

  /**
   * 获取个人资料
   */
  static async getProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    return data;
  }

  /**
   * 保存病历记录到 Supabase
   */
  static async saveMedicalRecord(record: any) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.warn('用户未登录，数据仅保留在本地会话中');
        return { success: true, localOnly: true };
      }
      
      const { data, error } = await supabase
        .from('medical_records')
        .insert({ 
          date: record.date,
          type: record.type,
          hospital: record.hospital || '',
          indicators: record.indicators,
          user_id: user.id
        });
        
      if (error) {
        console.error('Supabase 写入失败:', error.message);
        return { success: false, error };
      }
      return { success: true };
    } catch (e) {
      console.error('DBService.saveMedicalRecord 异常:', e);
      return { success: false, error: e };
    }
  }

  /**
   * 获取所有历史记录
   */
  static async getRecords(): Promise<MedicalRecord[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return [];

      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Supabase 读取失败:', JSON.stringify(error));
        return [];
      }
      return data || [];
    } catch (e) {
      console.error('DBService.getRecords 异常:', e);
      return [];
    }
  }

  /**
   * 获取治疗进程
   */
  static async getTreatmentPhases(): Promise<TreatmentPhase[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from('treatment_phases').select('*').eq('user_id', user.id);
      return data || [];
    } catch (e) {
      return [];
    }
  }

  /**
   * 获取指标定义
   */
  static async getIndicatorDefinitions(): Promise<IndicatorDefinition[]> {
    try {
      const { data } = await supabase.from('indicator_definitions').select('*');
      return data || [];
    } catch (e) {
      return [];
    }
  }
}
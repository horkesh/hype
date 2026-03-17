import { supabase } from '@/integrations/supabase/client';
import type { EveningPlan } from './planGenerator';

export async function savePlan(plan: EveningPlan, params: {
  moods: string[];
  groupSize: number;
  budget: string;
  language: string;
}): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data, error } = await supabase
    .from('ai_plans')
    .insert({
      user_id: session.user.id,
      moods: params.moods,
      group_size: params.groupSize,
      budget: params.budget,
      plan_json: plan,
      language: params.language,
    })
    .select('id')
    .single();
  if (error) { console.warn('Failed to save plan:', error); return null; }
  return data?.id ?? null;
}

export async function loadLatestPlan(): Promise<{ plan: EveningPlan; id: string } | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data, error } = await supabase
    .from('ai_plans')
    .select('id, plan_json')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error || !data) return null;
  return { plan: data.plan_json as EveningPlan, id: data.id };
}

import { supabase } from '../../lib/supabase';
import type { ExperimentType } from '../types/lab';
import { apiBaseUrl } from './apiClient';

export async function requireSupabase() {
  if (!supabase) {
    return null;
  }
  return supabase;
}

export async function getCurrentProfile() {
  const client = await requireSupabase();
  if (!client) return null;

  const { data: sessionData } = await client.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return null;

  const { data, error } = await client.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function listLabsForCurrentUser() {
  const client = await requireSupabase();
  if (!client) return [];

  const { data, error } = await client.from('labs').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createLabRecord({
  title,
  description,
  category,
  type,
}: {
  title: string;
  description?: string;
  category?: string;
  type: ExperimentType;
}) {
  const client = await requireSupabase();
  const labCode = Math.random().toString(36).slice(2, 10).toUpperCase();
  if (!client) return { id: crypto.randomUUID(), title, description, category, type, lab_code: labCode };

  const { data: sessionData } = await client.auth.getSession();
  const teacherId = sessionData.session?.user.id ?? null;
  const { data, error } = await client
    .from('labs')
    .insert({
      teacher_id: teacherId,
      title,
      description,
      category,
      type,
      lab_code: labCode,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function joinLabByCode(labCode: string) {
  const client = await requireSupabase();
  if (!client) return { mocked: true };

  const { data: sessionData } = await client.auth.getSession();
  const studentId = sessionData.session?.user.id;
  const { data: lab, error: labError } = await client.from('labs').select('*').eq('lab_code', labCode).single();
  if (labError) throw labError;

  if (studentId) {
    const { error } = await client.from('lab_enrollments').upsert({
      lab_id: lab.id,
      student_id: studentId,
    });
    if (error) throw error;
  }

  return { mocked: false, lab };
}

export async function createExperimentRecord({
  labId,
  title,
  description,
  type,
  editorMode,
  difficulty,
  points,
  testCases,
  knowledgeFiles,
}: {
  labId: string;
  title: string;
  description: string;
  type: ExperimentType;
  editorMode?: string;
  difficulty?: string;
  points: number;
  testCases: Array<{ input: string; expectedOutput: string }>;
  knowledgeFiles: Array<{ name: string; type: string; size: string }>;
}) {
  const client = await requireSupabase();
  if (!client) return { mocked: true };

  const { data, error } = await client
    .from('experiments')
    .insert({
      lab_id: labId,
      title,
      description,
      type,
      editor_mode: editorMode,
      difficulty,
      points,
      test_cases: testCases,
      knowledge_files: knowledgeFiles,
      status: 'published',
    })
    .select()
    .single();

  if (error) throw error;
  return { mocked: false, data };
}

export async function uploadKnowledgeDocument({
  file,
  labId,
  experimentId,
}: {
  file: File;
  labId: string;
  experimentId: string;
}) {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await fetch(
      `${apiBaseUrl}/documents/upload?lab_id=${encodeURIComponent(labId)}&experiment_id=${encodeURIComponent(experimentId)}`,
      {
        method: 'POST',
        body: formData,
      },
    );
    if (response.ok) return response.json();
  } catch {
    // Fall back to browser Supabase storage below.
  }

  const client = await requireSupabase();
  if (!client) return { mocked: true, path: `${labId}/${experimentId}/${file.name}` };

  const path = `${labId}/${experimentId}/${crypto.randomUUID()}-${file.name}`;
  const { error } = await client.storage.from('knowledge-base').upload(path, file);
  if (error) throw error;
  return { mocked: false, path };
}

import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export async function saveUser({
  parentName,
  kidName,
  kidAge,
  email,
  parentAudio,
  kidAudio,
}: {
  parentName: string;
  kidName: string;
  kidAge: number;
  email: string;
  parentAudio: File;
  kidAudio: File;
}) {
  // Generate unique filenames
  const parentAudioFilename = `parent-audio-${uuidv4()}`;
  const kidAudioFilename = `kid-audio-${uuidv4()}`;

  // Upload parent audio
  const { data: _parentAudioData, error: parentAudioError } = await supabase.storage
    .from('audio')
    .upload(parentAudioFilename, parentAudio);
  if (parentAudioError) throw parentAudioError;

  // Upload kid audio
  const { data: _kidAudioData, error: kidAudioError } = await supabase.storage
    .from('audio')
    .upload(kidAudioFilename, kidAudio);
  if (kidAudioError) throw kidAudioError;

  // Get public URLs
  const parentAudioUrl = supabase.storage.from('audio').getPublicUrl(parentAudioFilename).data.publicUrl;
  const kidAudioUrl = supabase.storage.from('audio').getPublicUrl(kidAudioFilename).data.publicUrl;

  // Insert user row
  const { data, error } = await supabase.from('users').insert([
    {
      parent_name: parentName,
      kid_name: kidName,
      kid_age: kidAge,
      email,
      parent_audio_url: parentAudioUrl,
      kid_audio_url: kidAudioUrl,
      lesson_progress: {},
      lesson_feedback: {},
    },
  ]);
  if (error) throw error;
  return data;
} 
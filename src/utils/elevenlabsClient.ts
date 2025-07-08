// Utility for generating personalized audio using ElevenLabs (Chris, v2)


const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const CHRIS_VOICE_ID = 'iP95p4xoKVk53GoZ742B';
const ELEVENLABS_API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${CHRIS_VOICE_ID}`;

/**
 * Generates audio for the given text using ElevenLabs (Chris, v2).
 * @param text The text to synthesize (e.g., a name)
 * @returns Promise<Blob> (audio/mpeg)
 */
export async function generateAudioForName(text: string): Promise<Blob> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('Missing ElevenLabs API key');
  }

  const response = await fetch(ELEVENLABS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
  }

  return await response.blob();
} 
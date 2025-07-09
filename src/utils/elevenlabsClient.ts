// Utility for generating personalized audio using ElevenLabs (Chris, v2)

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const CHRIS_VOICE_ID = 'iP95p4xoKVk53GoZ742B';
const ELEVENLABS_API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${CHRIS_VOICE_ID}`;

/**
 * Generates audio for a combined message with parent and kid names using ElevenLabs (Chris, v2).
 * @param parentName The parent's name
 * @param kidName The kid's name
 * @param timeoutMs Timeout in milliseconds (default: 10000)
 * @returns Promise<Blob | null> (audio/mpeg) or null if timeout
 */
export async function generateWelcomeAudio(parentName: string, kidName: string, timeoutMs: number = 10000): Promise<Blob | null> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('Missing ElevenLabs API key');
  }

  const text = `<speak>We're good to go ${parentName}!<break time="0.5s"/>Looking forward to working with ${kidName}.</speak>`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
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
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    return await response.blob();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('ElevenLabs request timed out');
      return null;
    }
    throw error;
  }
}

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
/**
 * Microphone recorder — thin wrapper over expo-av for capturing a single audio
 * clip at a time. Used by the pronunciation-scoring flow in Spelling Bee.
 * Holds one active recording in module scope; callers must stop before starting
 * a new one.
 */
import { Audio } from 'expo-av';

let recording: Audio.Recording | null = null;

export async function startRecording(): Promise<void> {
  await Audio.requestPermissionsAsync();
  await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

  const { recording: rec } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY,
  );
  recording = rec;
}

// Returns the local URI of the recorded audio file
export async function stopRecording(): Promise<string | null> {
  if (!recording) return null;
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  recording = null;
  return uri ?? null;
}

export function isRecording(): boolean {
  return recording !== null;
}

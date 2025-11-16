import crypto from 'crypto';

export type VideoProvider = 'jitsi' | 'none' | 'custom';

/**
 * Generate a stable but opaque room name for a session
 * Format: mg-{sessionKey}-{hash}
 */
export function buildJitsiRoomName(sessionKey: string): string {
  const prefix = 'mg';
  
  // Hash the session key to avoid predictable patterns
  const hash = crypto
    .createHash('sha256')
    .update(sessionKey)
    .digest('hex')
    .slice(0, 16); // 16 hex chars = 64 bits
  
  return `${prefix}-${sessionKey}-${hash}`;
}

/**
 * Build the full Jitsi URL from a room name
 */
export function buildJitsiUrlFromRoomName(roomName: string, baseUrl?: string): string {
  const base = baseUrl || process.env.JITSI_BASE_URL || 'https://meet.jit.si';
  // Remove trailing slashes and encode room name
  const cleanBase = base.replace(/\/+$/, '');
  return `${cleanBase}/${encodeURIComponent(roomName)}`;
}

/**
 * Generate Jitsi room name and URL for a session
 */
export function generateJitsiMeeting(sessionKey: string, baseUrl?: string): {
  videoProvider: VideoProvider;
  videoRoomName: string;
  videoJoinUrl: string;
} {
  const roomName = buildJitsiRoomName(sessionKey);
  const joinUrl = buildJitsiUrlFromRoomName(roomName, baseUrl);
  
  return {
    videoProvider: 'jitsi',
    videoRoomName: roomName,
    videoJoinUrl: joinUrl,
  };
}


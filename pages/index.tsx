import React, { useEffect, useState } from 'react';

export default function Home() {
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => setProfiles(data.entities || []))
      .catch(err => {
        console.error('Error fetching profiles:', err);
        setProfiles([]);
      });
  }, []);

  return (
    <main style={{ padding: '20px' }}>
      <h1>MentorGraph</h1>
      <h2>Profiles ({profiles.length})</h2>
      {profiles.map((entity: any) => {
        let payload: any = {};
        try {
          if (entity.payload) {
            const decoded = entity.payload instanceof Uint8Array 
              ? new TextDecoder().decode(entity.payload)
              : typeof entity.payload === 'string' 
              ? entity.payload 
              : JSON.stringify(entity.payload);
            payload = JSON.parse(decoded);
          }
        } catch (e) {
          console.error('Error decoding payload:', e);
        }
        return (
          <div key={entity.key} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc' }}>
            <div><strong>Key:</strong> {entity.key}</div>
            <div><strong>Name:</strong> {payload.name || 'N/A'}</div>
            <div><strong>Bio:</strong> {payload.bio || 'N/A'}</div>
          </div>
        );
      })}
    </main>
  );
}


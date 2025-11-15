import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [connecting, setConnecting] = useState(false);
  const router = useRouter();

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await fetch('/api/wallet');
      if (res.ok) {
        const data = await res.json();
        console.log('Connected wallet:', data.address);
        router.push('/me');
      } else {
        console.error('Failed to connect wallet');
        setConnecting(false);
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setConnecting(false);
    }
  };

  return (
    <main style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <h1 style={{ marginBottom: '40px' }}>MentorGraph</h1>
      <button
        onClick={handleConnect}
        disabled={connecting}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: connecting ? '#ccc' : '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: connecting ? 'not-allowed' : 'pointer',
        }}
      >
        {connecting ? 'Connecting...' : 'Connect with Wallet'}
      </button>
    </main>
  );
}


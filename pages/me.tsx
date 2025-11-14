import React, { useEffect, useState } from 'react';

type Profile = {
  key: string;
  wallet: string;
  displayName: string;
  skills: string;
  timezone: string;
  spaceId: string;
  createdAt?: string;
};

type Ask = {
  key: string;
  wallet: string;
  skill: string;
  spaceId: string;
  createdAt: string;
  status: string;
  message: string;
};

type Offer = {
  key: string;
  wallet: string;
  skill: string;
  spaceId: string;
  createdAt: string;
  status: string;
  message: string;
  availabilityWindow: string;
};

type MeData = {
  wallet: string;
  profile: Profile | null;
  asks: Ask[];
  offers: Offer[];
};

export default function Me() {
  const [data, setData] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await fetch('/api/me');
      const meData = await res.json();
      setData(meData);
    } catch (err) {
      console.error('Error fetching /api/me:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const displayName = formData.get('displayName') as string;
    const skills = formData.get('skills') as string;
    const timezone = formData.get('timezone') as string;

    try {
      const res = await fetch('/api/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createProfile',
          displayName,
          skills,
          timezone,
        }),
      });
      if (res.ok) {
        fetchMe();
      }
    } catch (err) {
      console.error('Error creating profile:', err);
    }
  };

  const handleCreateAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const skill = formData.get('skill') as string;
    const message = formData.get('message') as string;

    try {
      const res = await fetch('/api/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createAsk',
          skill,
          message,
        }),
      });
      if (res.ok) {
        (e.target as HTMLFormElement).reset();
        fetchMe();
      }
    } catch (err) {
      console.error('Error creating ask:', err);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const skill = formData.get('skill') as string;
    const message = formData.get('message') as string;
    const availabilityWindow = formData.get('availabilityWindow') as string;

    try {
      const res = await fetch('/api/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createOffer',
          skill,
          message,
          availabilityWindow,
        }),
      });
      if (res.ok) {
        (e.target as HTMLFormElement).reset();
        fetchMe();
      }
    } catch (err) {
      console.error('Error creating offer:', err);
    }
  };

  if (loading) {
    return <main style={{ padding: '20px' }}>Loading...</main>;
  }

  if (!data) {
    return <main style={{ padding: '20px' }}>Error loading data</main>;
  }

  return (
    <main style={{ padding: '20px' }}>
      <h1>My Dashboard</h1>

      <section style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h2>Wallet & Profile</h2>
        <div style={{ marginBottom: '10px' }}>
          <strong>Wallet:</strong> {data.wallet}
        </div>

        {data.profile ? (
          <div>
            <div><strong>Display Name:</strong> {data.profile.displayName}</div>
            <div><strong>Skills:</strong> {data.profile.skills}</div>
            <div><strong>Timezone:</strong> {data.profile.timezone}</div>
            <div><strong>Space ID:</strong> {data.profile.spaceId}</div>
            {data.profile.createdAt && (
              <div><strong>Created:</strong> {data.profile.createdAt}</div>
            )}
          </div>
        ) : (
          <form onSubmit={handleCreateProfile}>
            <div style={{ marginBottom: '10px' }}>
              <label>
                Display Name:
                <input type="text" name="displayName" required style={{ marginLeft: '10px' }} />
              </label>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>
                Skills:
                <input type="text" name="skills" style={{ marginLeft: '10px' }} />
              </label>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>
                Timezone:
                <input type="text" name="timezone" style={{ marginLeft: '10px' }} />
              </label>
            </div>
            <button type="submit">Create Profile</button>
          </form>
        )}
      </section>

      <section style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h2>My Asks</h2>
        <form onSubmit={handleCreateAsk} style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5' }}>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Skill:
              <input type="text" name="skill" required style={{ marginLeft: '10px' }} />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Message:
              <input type="text" name="message" required style={{ marginLeft: '10px' }} />
            </label>
          </div>
          <button type="submit">Create Ask</button>
        </form>

        <div>
          <h3>Existing Asks ({data.asks.length})</h3>
          {data.asks.length === 0 ? (
            <div>No asks yet</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {data.asks.map((ask) => (
                <li key={ask.key} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ddd' }}>
                  <div><strong>Skill:</strong> {ask.skill || 'N/A'}</div>
                  <div><strong>Message:</strong> {ask.message}</div>
                  <div><strong>Status:</strong> {ask.status}</div>
                  {ask.createdAt && <div><strong>Created:</strong> {ask.createdAt}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h2>My Offers</h2>
        <form onSubmit={handleCreateOffer} style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5' }}>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Skill:
              <input type="text" name="skill" required style={{ marginLeft: '10px' }} />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Message:
              <input type="text" name="message" required style={{ marginLeft: '10px' }} />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Availability Window:
              <input type="text" name="availabilityWindow" required style={{ marginLeft: '10px' }} />
            </label>
          </div>
          <button type="submit">Create Offer</button>
        </form>

        <div>
          <h3>Existing Offers ({data.offers.length})</h3>
          {data.offers.length === 0 ? (
            <div>No offers yet</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {data.offers.map((offer) => (
                <li key={offer.key} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ddd' }}>
                  <div><strong>Skill:</strong> {offer.skill || 'N/A'}</div>
                  <div><strong>Message:</strong> {offer.message}</div>
                  <div><strong>Availability:</strong> {offer.availabilityWindow}</div>
                  <div><strong>Status:</strong> {offer.status}</div>
                  {offer.createdAt && <div><strong>Created:</strong> {offer.createdAt}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}


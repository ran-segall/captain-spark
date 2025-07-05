import AppLayout from '../../components/ScreenLayout';

function Intro() {
  return (
    <AppLayout>
      <div
        style={{
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#1f2d3d' }}>
          Captain Spark
        </h1>

        <img
          src="/images/onboarding/captain-intro.jpg"
          alt="Captain Spark"
          style={{
            maxWidth: '80%',
            maxHeight: '40vh',
            objectFit: 'contain',
            margin: '1rem 0',
          }}
        />

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2d3d', margin: '0 0' }}>
          Where Smart Kids Level Up
        </h2>

        <p style={{ maxWidth: 300, fontSize: '1rem', color: '#555', margin: '0.5rem 0rem 2rem 0px' }}>
          Fun learning adventures in life skills, money smarts, and confident thinking.
        </p>

        <div style={{ marginTop: 'auto', width: '100%' }}>
          <button
            style={{
              background: '#FFA927',
              border: 'none',
              color: 'white',
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              borderRadius: '9999px',
              marginBottom: '1rem',
              cursor: 'pointer',
            }}
          >
            Get Started
          </button>

          <button
            style={{
              background: '#f8f4f1',
              border: 'none',
              color: '#1f2d3d',
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              borderRadius: '9999px',
              cursor: 'pointer',
            }}
          >
            Log In
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

export default Intro;

import AppLayout from '../../components/ScreenLayout';

const StartLater = () => {
  return (
    <AppLayout>
      <div style={{ 
        padding: '2rem', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#163657', marginBottom: '1rem' }}>
          Start Later
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#222' }}>
          This page will be implemented soon.
        </p>
      </div>
    </AppLayout>
  );
};

export default StartLater; 
export function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, border: '3px solid var(--gray-200)',
          borderTopColor: 'var(--primary-500)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
        }} />
        <p style={{ color: 'var(--gray-700)', fontSize: 14 }}>Cargando...</p>
      </div>
    </div>
  );
}

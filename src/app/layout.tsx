import React from 'react';


interface LayoutProps {
  children: React.ReactNode;
}


const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <header style={{ background: '#f5f5f5', padding: '1rem' , textAlign: 'center' }}>
        <h1>Cronómetro de Productividad</h1>
      </header>
      {children}
      <footer style={{ background: '#f5f5f5', padding: '1rem', textAlign: 'center' }}>
        <p>&copy; {new Date().getFullYear()} Cronómetro de Productividad.</p>
      </footer>
    </>
  );
};


export default Layout;


import { useState } from 'react';
import { NoboriEstimator } from './components/NoboriEstimator';
import { ProductList } from './components/ProductList';
import { AdminDashboard } from './components/AdminDashboard';
import { Header } from './components/Header';
import { Cart } from './components/Cart';
import { DeliveryEntry } from './components/DeliveryEntry';

type ViewState = 'list' | 'nobori' | 'admin' | 'cart' | 'delivery_info';

function App() {
  const [view, setView] = useState<ViewState>('list');

  if (view === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onCartClick={() => setView('cart')}
        onHomeClick={() => setView('list')}
      />

      {view === 'list' && (
        <ProductList onSelectProduct={(id) => {
          if (id === 'nobori') setView('nobori');
          if (id === 'admin') setView('admin');
        }} />
      )}

      {view === 'nobori' && (
        <NoboriEstimator onAddToCart={() => setView('cart')} />
      )}

      {view === 'cart' && (
        <Cart
          onContinueShopping={() => setView('list')}
          onProceedToDelivery={() => setView('delivery_info')}
        />
      )}

      {view === 'delivery_info' && (
        <DeliveryEntry
          onBack={() => setView('cart')}
          onComplete={() => alert('注文受け付け完了：本日はここまでとなります。')}
        />
      )}
    </div>
  );
}

export default App;


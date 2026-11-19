import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import OfflineNotice from './components/OfflineNotice';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import AppointmentsPage from './pages/AppointmentsPage';
import DiaryPage from './pages/DiaryPage';
import PhotosPage from './pages/PhotosPage';

export default function App() {
  return (
    <div className="app">
      <a href="#main" className="skip-link">Skip to content</a>
      <ScrollToTop />
      <Header />
      <OfflineNotice />
      <main id="main" className="content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/diary" element={<DiaryPage />} />
          <Route path="/photos" element={<PhotosPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

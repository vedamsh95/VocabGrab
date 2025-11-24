import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import JsonImporter from './components/Import/JsonImporter';
import VocabTable from './components/Vocab/VocabTable';
import FlashcardDeck from './components/Flashcards/FlashcardDeck';
import PracticeArena from './components/Practice/PracticeArena';
import AppLayout from './components/Layout/AppLayout';

import Library from './components/Library/Library';
import ReadingPage from './components/Reading/ReadingPage';
import GuidePage from './components/Guide/GuidePage';

import { useEffect } from 'react';
import { useProgressStore } from './store/useProgressStore';

function App() {
  const checkStreak = useProgressStore(state => state.checkStreak);

  useEffect(() => {
    checkStreak();
  }, [checkStreak]);

  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/library" element={<Library />} />
          <Route path="/import" element={<JsonImporter />} />
          <Route path="/vocab" element={<VocabTable />} />
          <Route path="/flashcards" element={<FlashcardDeck />} />
          <Route path="/practice" element={<PracticeArena />} />
          <Route path="/reading" element={<ReadingPage />} />
          <Route path="/guide" element={<GuidePage />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;

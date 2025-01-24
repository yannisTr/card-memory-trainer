import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Les 52 cartes dans l'ordre correct
const CARDS_ORDER = [
  { position: 1, card: 'a♥', name: "As de Coeur" },
  { position: 2, card: 'k♠', name: "Roi de Pique" },
  { position: 3, card: 'a♦', name: "As de Carreau" },
  { position: 4, card: 'k♣', name: "Roi de Trèfle" },
  { position: 5, card: '2♥', name: "2 de Coeur" },
  { position: 6, card: 'q♠', name: "Reine de Pique" },
  { position: 7, card: '2♦', name: "2 de Carreau" },
  { position: 8, card: 'q♣', name: "Reine de Trèfle" },
  { position: 9, card: '3♥', name: "3 de Coeur" },
  { position: 10, card: 'j♠', name: "Valet de Pique" },
  { position: 11, card: '3♦', name: "3 de Carreau" },
  { position: 12, card: 'j♣', name: "Valet de Trèfle" },
  { position: 13, card: '4♥', name: "4 de Coeur" },
  { position: 14, card: '10♠', name: "10 de Pique" },
  { position: 15, card: '4♦', name: "4 de Carreau" },
  { position: 16, card: '10♣', name: "10 de Trèfle" },
  { position: 17, card: '5♥', name: "5 de Coeur" },
  { position: 18, card: '9♠', name: "9 de Pique" },
  { position: 19, card: '5♦', name: "5 de Carreau" },
  { position: 20, card: '9♣', name: "9 de Trèfle" },
  { position: 21, card: '6♥', name: "6 de Coeur" },
  { position: 22, card: '8♠', name: "8 de Pique" },
  { position: 23, card: '6♦', name: "6 de Carreau" },
  { position: 24, card: '8♣', name: "8 de Trèfle" },
  { position: 25, card: '7♥', name: "7 de Coeur" },
  { position: 26, card: '7♠', name: "7 de Pique" },
  { position: 27, card: '7♦', name: "7 de Carreau" },
  { position: 28, card: '7♣', name: "7 de Trèfle" },
  { position: 29, card: '8♥', name: "8 de Coeur" },
  { position: 30, card: '6♠', name: "6 de Pique" },
  { position: 31, card: '8♦', name: "8 de Carreau" },
  { position: 32, card: '6♣', name: "6 de Trèfle" },
  { position: 33, card: '9♥', name: "9 de Coeur" },
  { position: 34, card: '5♠', name: "5 de Pique" },
  { position: 35, card: '9♦', name: "9 de Carreau" },
  { position: 36, card: '5♣', name: "5 de Trèfle" },
  { position: 37, card: '10♥', name: "10 de Coeur" },
  { position: 38, card: '4♠', name: "4 de Pique" },
  { position: 39, card: '10♦', name: "10 de Carreau" },
  { position: 40, card: '4♣', name: "4 de Trèfle" },
  { position: 41, card: 'j♥', name: "Valet de Coeur" },
  { position: 42, card: '3♠', name: "3 de Pique" },
  { position: 43, card: 'j♦', name: "Valet de Carreau" },
  { position: 44, card: '3♣', name: "3 de Trèfle" },
  { position: 45, card: 'q♥', name: "Reine de Coeur" },
  { position: 46, card: '2♠', name: "2 de Pique" },
  { position: 47, card: 'q♦', name: "Reine de Carreau" },
  { position: 48, card: '2♣', name: "2 de Trèfle" },
  { position: 49, card: 'k♥', name: "Roi de Coeur" },
  { position: 50, card: 'a♠', name: "As de Pique" },
  { position: 51, card: 'k♦', name: "Roi de Carreau" },
  { position: 52, card: 'a♣', name: "As de Trèfle" }
];

// Fonctions utilitaires pour le localStorage
const STORAGE_KEY = 'cardTrainerStats';

const saveStats = (stats) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};

const loadStats = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const calculateGlobalStats = (stats) => {
  if (!stats.length) return null;

  const allTimings = stats.flatMap(session => session.timings);
  const cardStats = CARDS_ORDER.map(card => {
    const cardTimings = allTimings.filter(t => t.card === card.card);
    const avgTime = cardTimings.length ? 
      cardTimings.reduce((acc, curr) => acc + curr.time, 0) / cardTimings.length : 
      0;
    return { ...card, avgTime };
  }).sort((a, b) => b.avgTime - a.avgTime);

  return {
    totalSessions: stats.length,
    avgErrorsPerSession: stats.reduce((acc, s) => acc + s.errors, 0) / stats.length,
    globalAvgTime: allTimings.reduce((acc, t) => acc + t.time, 0) / allTimings.length,
    avgTimeForPosition: allTimings
      .filter(t => !t.showPosition)
      .reduce((acc, t) => acc + t.time, 0) / allTimings.filter(t => !t.showPosition).length,
    avgTimeForCard: allTimings
      .filter(t => t.showPosition)
      .reduce((acc, t) => acc + t.time, 0) / allTimings.filter(t => t.showPosition).length,
    cardStats
  };
};

const CustomKeyboard = ({ onKeyPress, currentMode }) => {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const figures = ['a', 'k', 'q', 'j'];
  const suits = ['♥', '♦', '♠', '♣'];

  return (
    <div className="grid gap-2">
      {currentMode === 'position' ? (
        <div className="grid grid-cols-5 gap-2">
          {numbers.map(num => (
            <Button 
              key={num}
              onClick={() => onKeyPress(num)}
              className="p-2"
            >
              {num}
            </Button>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2">
            {figures.map(fig => (
              <Button 
                key={fig}
                onClick={() => onKeyPress(fig)}
                className="p-2"
              >
                {fig.toUpperCase()}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {numbers.map(num => (
              <Button 
                key={num}
                onClick={() => onKeyPress(num)}
                className="p-2"
              >
                {num}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {suits.map(suit => (
              <Button 
                key={suit}
                onClick={() => onKeyPress(suit)}
                className="p-2 text-lg"
              >
                {suit}
              </Button>
            ))}
          </div>
        </>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Button 
          onClick={() => onKeyPress('backspace')}
          variant="outline"
        >
          Effacer
        </Button>
        <Button 
          onClick={() => onKeyPress('enter')}
          variant="default"
        >
          Valider
        </Button>
      </div>
    </div>
  );
};
const GlobalStats = ({ stats }) => {
  if (!stats) return <p>Aucune statistique disponible</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Statistiques Globales</h2>
      <div className="space-y-2">
        <p>Sessions totales : {stats.totalSessions}</p>
        <p>Erreurs moyennes par session : {stats.avgErrorsPerSession.toFixed(1)}</p>
        <p>Temps moyen global : {(stats.globalAvgTime / 1000).toFixed(1)}s</p>
        <p>Temps moyen pour trouver la position : {(stats.avgTimeForPosition / 1000).toFixed(1)}s</p>
        <p>Temps moyen pour trouver la carte : {(stats.avgTimeForCard / 1000).toFixed(1)}s</p>
        
        <h3 className="font-semibold mt-4">Cartes les plus lentes :</h3>
        <div className="max-h-96 overflow-y-auto">
          {stats.cardStats.map((card, idx) => (
            <div key={idx} className="flex justify-between py-1">
              <span>{card.name}</span>
              <span>{(card.avgTime / 1000).toFixed(1)}s</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CardTrainer = () => {
  const [maxCards, setMaxCards] = useState(52);
  const [currentSession, setCurrentSession] = useState(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [allStats, setAllStats] = useState([]);
  const [focusMode, setFocusMode] = useState(false);
  
  useEffect(() => {
    setAllStats(loadStats());
  }, []);

  const initializeSession = () => {
    let selectedCards = CARDS_ORDER.slice(0, maxCards);
    
    if (focusMode && allStats.length > 0) {
      const globalStats = calculateGlobalStats(allStats);
      selectedCards = globalStats.cardStats.slice(0, maxCards);
    }
    
    const shuffledCards = [...selectedCards].sort(() => Math.random() - 0.5);
    const cardsWithMode = shuffledCards.map(card => ({
      ...card,
      showPosition: Math.random() < 0.5
    }));

    return {
      cards: cardsWithMode,
      currentIndex: 0,
      errors: 0,
      startTime: Date.now(),
      timings: [],
      cardStartTime: Date.now()
    };
  };

  const handleStart = () => {
    setCurrentSession(initializeSession());
    setAnswer('');
    setError('');
    setSuccess('');
    setShowStats(false);
  };

  const handleReset = () => {
    setCurrentSession(null);
    setAnswer('');
    setError('');
    setSuccess('');
    setShowStats(false);
    setAllStats([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleKeyPress = (key) => {
    if (key === 'backspace') {
      setAnswer(prev => prev.slice(0, -1));
    } else if (key === 'enter') {
      handleSubmit();
    } else {
      setAnswer(prev => prev + key);
    }
  };

  const handleSubmit = () => {
    if (!currentSession) return;

    const currentCard = currentSession.cards[currentSession.currentIndex];
    const normalizedAnswer = answer.toLowerCase();
    const currentTime = Date.now();
    const responseTime = currentTime - currentSession.cardStartTime;

    const isCorrect = currentCard.showPosition
      ? normalizedAnswer === currentCard.card
      : normalizedAnswer === currentCard.position.toString();

    if (isCorrect) {
      const newSession = {
        ...currentSession,
        currentIndex: currentSession.currentIndex + 1,
        timings: [...currentSession.timings, { 
          card: currentCard.card,
          name: currentCard.name,
          time: responseTime,
          isCorrect: true,
          showPosition: currentCard.showPosition
        }],
        cardStartTime: currentTime
      };

      setCurrentSession(newSession);
      setAnswer('');
      setError('');

      if (newSession.currentIndex >= newSession.cards.length) {
        const sessionStats = {
          date: new Date().toISOString(),
          errors: currentSession.errors,
          timings: currentSession.timings
        };

        const newAllStats = [...allStats, sessionStats];
        setAllStats(newAllStats);
        saveStats(newAllStats);
        setShowStats(true);
        setSuccess('Session terminée !');
      }
    } else {
      setError('Erreur');
      setCurrentSession({
        ...currentSession,
        errors: currentSession.errors + 1,
        timings: [...currentSession.timings, {
          card: currentCard.card,
          name: currentCard.name,
          time: responseTime,
          isCorrect: false,
          showPosition: currentCard.showPosition
        }],
        cardStartTime: currentTime
      });
      setAnswer('');
    }
  };

  const getPrompt = () => {
    if (!currentSession || currentSession.currentIndex >= currentSession.cards.length) return '';
    const currentCard = currentSession.cards[currentSession.currentIndex];
    return currentCard.showPosition 
      ? `Position ${currentCard.position} ?`
      : `Où se trouve ${currentCard.name} ?`;
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Tabs defaultValue="training">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="training" className="flex-1">Entraînement</TabsTrigger>
          <TabsTrigger value="stats" className="flex-1">Statistiques Globales</TabsTrigger>
        </TabsList>

        <TabsContent value="training">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Entraîneur de Mémorisation</h1>
            <Button onClick={handleReset} variant="secondary">Réinitialiser</Button>
          </div>

          {!currentSession || showStats ? (
            <div className="space-y-4">
              <div className="flex gap-4 items-center mb-4">
                <input
                  type="number"
                  min="1"
                  max="52"
                  className="w-20 p-2 border rounded"
                  defaultValue={maxCards}
                  onChange={(e) => {
                    const value = Math.min(52, Math.max(1, parseInt(e.target.value) || 1));
                    setMaxCards(value);
                  }}
                />
                <span className="text-gray-700">cartes</span>
                <div className="flex items-center gap-2 ml-4">
                  <input
                    type="checkbox"
                    id="focusMode"
                    checked={focusMode}
                    onChange={(e) => setFocusMode(e.target.checked)}
                  />
                  <label htmlFor="focusMode">Mode cartes lentes</label>
                </div>
              </div>
              <Button onClick={handleStart} className="w-full">Commencer</Button>

              {showStats && (
                <Card className="mt-4">
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">Statistiques de la session</h2>
                    <div className="space-y-2">
                      <p>Erreurs: {currentSession.errors}</p>
                      <p>Temps moyen: {(currentSession.timings.reduce((acc, curr) => acc + curr.time, 0) / currentSession.timings.length / 1000).toFixed(1)}s</p>
                      <h3 className="font-semibold mt-4">Temps par carte :</h3>
                      <div className="space-y-1 max-h-96 overflow-y-auto">
                        {currentSession.timings
                          .sort((a, b) => b.time - a.time)
                          .map((timing, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{timing.name}</span>
                              <span>{(timing.time / 1000).toFixed(1)}s</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xl font-bold text-center mb-4">{getPrompt()}</div>
              
              <div className="h-12 flex items-center justify-center mb-4">
                <span className="text-xl font-mono">{answer}</span>
              </div>

              <CustomKeyboard 
                onKeyPress={handleKeyPress}
                currentMode={currentSession.cards[currentSession.currentIndex].showPosition ? 'card' : 'position'}
              />
              
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>{error}</AlertTitle>
                </Alert>
              )}
              
              <div className="mt-4">
                <p>Cartes restantes: {currentSession.cards.length - currentSession.currentIndex}</p>
                <p>Erreurs: {currentSession.errors}</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats">
          <GlobalStats stats={calculateGlobalStats(allStats)} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CardTrainer;

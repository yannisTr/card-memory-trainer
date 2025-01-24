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
  
  // Charger les stats au démarrage
  useEffect(() => {
    setAllStats(loadStats());
  }, []);

  const initializeSession = () => {
    let selectedCards = CARDS_ORDER.slice(0, maxCards);
    
    if (focusMode && allStats.length > 0) {
      // Utiliser les statistiques globales pour sélectionner les cartes les plus lentes
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
            <Button onClick={handleReset} variant="destructive">Réinitialiser</Button>
          </div>

          {!currentSession || showStats ? (
            <div className="space-y-4">
              <div className="flex gap-4 items-center mb-4">
                <input
                  type="number"
                  min="1"
                  max="52"
                  className="w-20 p-2 border rounded"
                  defaultValue="52"
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
                      <p>Cartes étudiées: {maxCards}</p>
                      <p>Erreurs: {currentSession.errors}</p>
                      <p>Temps moyen global: {(currentSession.timings.reduce((acc, curr) => acc + curr.time, 0) / currentSession.timings.length / 1000).toFixed(1)}s</p>
                      <p>Temps moyen pour trouver la position: {
                        (() => {
                          const positionTimings = currentSession.timings.filter(t => !t.showPosition);
                          return positionTimings.length ? 
                            (positionTimings.reduce((acc, curr) => acc + curr.time, 0) / positionTimings.length / 1000).toFixed(1) + 's' : 
                            'N/A';
                        })()
                      }</p>
                      <p>Temps moyen pour trouver la carte: {
                        (() => {
                          const cardTimings = currentSession.timings.filter(t => t.showPosition);
                          return cardTimings.length ? 
                            (cardTimings.reduce((acc, curr) => acc + curr.time, 0) / cardTimings.length / 1000).toFixed(1) + 's' : 
                            'N/A';
                        })()
                      }</p>

                      <h3 className="font-semibold mt-4">Temps de réponse par carte :</h3>
                      <div className="space-y-1">
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
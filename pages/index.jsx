import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Import dynamique du composant CardTrainer pour éviter les problèmes de localStorage côté serveur
const CardTrainer = dynamic(() => import('../components/CardTrainer'), {
  ssr: false
});

export default function Home() {
  return (
    <>
      <Head>
        <title>Entraîneur de Mémorisation de Cartes</title>
        <meta name="description" content="Application d'entraînement à la mémorisation des cartes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main>
        <CardTrainer />
      </main>
    </>
  );
}
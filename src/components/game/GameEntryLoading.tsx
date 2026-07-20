interface GameEntryLoadingProps {
  gameName: string;
  description: string;
  theme: 'significant' | 'ship-it' | 'exception-room';
}

export function GameEntryLoading({ gameName, description, theme }: GameEntryLoadingProps) {
  return (
    <main
      className={`game-entry-loading game-entry-loading-${theme}`}
      aria-busy="true"
      aria-labelledby={`${theme}-loading-title`}
    >
      <section>
        <p>Field test loading</p>
        <h1 id={`${theme}-loading-title`}>{gameName}</h1>
        <p>{description}</p>
        <span role="status">Checking saved progress...</span>
      </section>
    </main>
  );
}

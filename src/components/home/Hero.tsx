export const Hero = () => {
  return (
    <section className="flex flex-col items-center py-12 text-center md:py-16">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-[hsl(45,100%,50%)]" />
        <span className="h-3 w-3 rounded-full bg-[hsl(200,100%,50%)]" />
        <span className="h-3 w-3 rounded-full bg-[hsl(15,100%,50%)]" />
      </div>
      <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        TOOLWEB
      </h1>
      <p className="max-w-md text-base text-muted-foreground md:text-lg">
        Ferramentas online para vídeo, áudio, PDF e conversão de arquivos
      </p>
    </section>
  );
};

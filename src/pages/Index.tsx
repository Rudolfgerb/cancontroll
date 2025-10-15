import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SprayCan, Map, Users, Trophy, Palette, Zap } from "lucide-react";
import { Sidebar, SidebarContent, SidebarProvider } from '@/components/ui/sidebar';

const Index = () => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate('/game');
  };

  const features = [
    {
      icon: SprayCan,
      title: "Spray & Style",
      description: "Male mit dem Finger - von simplen Tags bis zu komplexen Pieces",
      color: "neon-pink",
    },
    {
      icon: Map,
      title: "Urbane Welt",
      description: "Erkunde die Stadt, finde die besten Spots und hinterlasse deine Spur",
      color: "neon-cyan",
    },
    {
      icon: Users,
      title: "Crew System",
      description: "Gründe deine Crew oder tritt einer bei - gemeinsam zur Legende",
      color: "neon-lime",
    },
    {
      icon: Trophy,
      title: "Fame & Ruhm",
      description: "Verdiene Respekt durch riskante Spots und krasse Pieces",
      color: "neon-orange",
    },
    {
      icon: Palette,
      title: "Blackbook",
      description: "Schalte neue Designs, Farben und Styles frei",
      color: "neon-pink",
    },
    {
      icon: Zap,
      title: "Live Action",
      description: "Risk & Reward - male schnell bevor dich die Cops erwischen",
      color: "neon-cyan",
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
      </Sidebar>
      <SidebarContent>
      <div className="min-h-screen bg-background overflow-hidden">
        {/* Background Pattern */}
        <div className="fixed inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
          <div className="absolute inset-0 bg-gradient-hero opacity-30" />
          
          <div className="relative z-10 max-w-6xl mx-auto text-center">
            {/* Main Title */}
            <div className="mb-8 animate-glow">
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-4 bg-gradient-neon bg-clip-text text-transparent uppercase">
                CanControl
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-bold uppercase tracking-wide">
                The Ultimate Graffiti Game
              </p>
            </div>

            {/* Tagline */}
            <div className="mb-12 space-y-4">
              <p className="text-lg md:text-xl text-foreground/90 max-w-2xl mx-auto">
                Werde zur Legende der Streets. Male, renne, verstecke dich - und hinterlasse deine Spur in der Stadt.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 shadow-neon" onClick={handleStartGame}>
                Start Painting
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-bold text-lg px-8 py-6">
                Watch Trailer
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="space-y-1">
                <div className="text-3xl md:text-4xl font-black text-neon-pink">500+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Spots</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl md:text-4xl font-black text-neon-cyan">100+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Designs</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl md:text-4xl font-black text-neon-lime">∞</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Style</div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center p-2">
              <div className="w-1 h-3 bg-muted-foreground rounded-full" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tight">
                Game Features
              </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Von der ersten Dose bis zur Crew-Legende - alles was du brauchst für Street Fame
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-card/50 backdrop-blur border-2 border-border hover:border-primary/50 transition-all duration-300 p-6 group hover:shadow-neon cursor-pointer"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-lg bg-${feature.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Game Loop Section */}
      <section className="relative py-20 px-4 bg-card/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-12 uppercase tracking-tight">
            Der Core Loop
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Planen", desc: "Wähle Farben & Designs" },
              { step: "02", title: "Erkunden", desc: "Finde die besten Spots" },
              { step: "03", title: "Malen", desc: "Hinterlasse dein Piece" },
              { step: "04", title: "Fliehen", desc: "Entkommen & Fame kassieren" },
            ].map((item, i) => (
              <div key={i} className="space-y-3">
                <div className="text-5xl font-black text-primary/20">{item.step}</div>
                <div className="text-xl font-bold">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight">
            Ready to be a{" "}
            <span className="bg-gradient-neon bg-clip-text text-transparent">
              Legend
            </span>
            ?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Die Stadt wartet auf deine Kunst. Werde Teil der Crew und zeig der Welt deinen Style.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl px-12 py-7 shadow-neon" onClick={handleStartGame}>
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
     </SidebarContent>
    </SidebarProvider>
  );
};

export default Index;

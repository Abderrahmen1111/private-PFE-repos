import { getFriendSuggestions } from '@/lib/suggestions';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { SuggestionCard } from "@/components/messaging/SuggestionCard";

export const dynamic = 'force-dynamic';

export default async function SuggestionsPage() {
  const suggestions = await getFriendSuggestions();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between border-b pb-4 border-border/50">
            <div className="flex items-center gap-4">
              <Link href="/messages">
                <Button variant="ghost" size="icon" className="group">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Suggestions d'amis
                </h1>
                <p className="text-muted-foreground">
                  Découvrez de nouvelles personnes avec qui discuter
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {suggestions.length} suggestions
              </span>
            </div>
          </div>

          {suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/20 rounded-3xl border border-dashed border-border">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Aucune suggestion pour le moment</h3>
                <p className="text-muted-foreground max-w-md">
                  Nous avons déjà exploré toute la communauté ! Revenez plus tard pour découvrir de nouveaux membres.
                </p>
              </div>
              <Link href="/messages">
                <Button variant="outline">Retour aux messages</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((user) => (
                <SuggestionCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

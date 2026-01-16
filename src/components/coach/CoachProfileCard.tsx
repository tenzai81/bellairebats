import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, DollarSign, Clock } from 'lucide-react';
import type { CoachProfile } from '@/hooks/useCoachDashboard';

interface CoachProfileCardProps {
  profile: CoachProfile;
}

const CoachProfileCard = ({ profile }: CoachProfileCardProps) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-20 h-20 border-2 border-accent">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name} />
            <AvatarFallback className="bg-accent text-accent-foreground text-xl">
              {profile.display_name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-foreground text-xl">{profile.display_name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              {profile.location && (
                <>
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </>
              )}
            </CardDescription>
            <div className="flex items-center gap-4 mt-2">
              {profile.rating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-foreground font-medium">{profile.rating}</span>
                  <span className="text-muted-foreground">({profile.review_count} reviews)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.bio && (
          <p className="text-muted-foreground text-sm">{profile.bio}</p>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-accent" />
            <span className="text-foreground font-medium">${profile.hourly_rate}/hr</span>
          </div>
          {profile.experience_years && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-accent" />
              <span className="text-foreground font-medium">{profile.experience_years} years exp.</span>
            </div>
          )}
        </div>
        
        {profile.specialty && profile.specialty.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.specialty.map((spec) => (
              <Badge key={spec} variant="secondary" className="bg-accent/10 text-accent">
                {spec}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="pt-2">
          <Badge 
            variant="outline" 
            className={profile.is_active 
              ? 'bg-green-500/10 text-green-600 border-green-500/30' 
              : 'bg-red-500/10 text-red-600 border-red-500/30'
            }
          >
            {profile.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoachProfileCard;

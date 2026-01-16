import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Clock, Save } from 'lucide-react';
import type { Availability } from '@/hooks/useCoachDashboard';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DayAvailability {
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

interface AvailabilityManagerProps {
  availability: Availability[];
  onUpdateAvailability: (
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    isAvailable: boolean
  ) => Promise<boolean>;
}

const AvailabilityManager = ({ availability, onUpdateAvailability }: AvailabilityManagerProps) => {
  const [saving, setSaving] = useState<number | null>(null);
  
  // Initialize local state from props
  const initializeDay = (dayIndex: number): DayAvailability => {
    const existing = availability.find(a => a.day_of_week === dayIndex);
    return {
      isAvailable: existing?.is_available ?? false,
      startTime: existing?.start_time ?? '09:00',
      endTime: existing?.end_time ?? '17:00',
    };
  };

  const [localAvailability, setLocalAvailability] = useState<DayAvailability[]>(
    DAYS_OF_WEEK.map((_, i) => initializeDay(i))
  );

  const handleToggle = (dayIndex: number) => {
    setLocalAvailability(prev => prev.map((day, i) => 
      i === dayIndex ? { ...day, isAvailable: !day.isAvailable } : day
    ));
  };

  const handleTimeChange = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setLocalAvailability(prev => prev.map((day, i) => 
      i === dayIndex ? { ...day, [field]: value } : day
    ));
  };

  const handleSave = async (dayIndex: number) => {
    setSaving(dayIndex);
    const day = localAvailability[dayIndex];
    await onUpdateAvailability(dayIndex, day.startTime, day.endTime, day.isAvailable);
    setSaving(null);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-accent" />
          <div>
            <CardTitle className="text-foreground">Weekly Availability</CardTitle>
            <CardDescription>
              Set your available hours for each day of the week
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {DAYS_OF_WEEK.map((day, index) => (
          <div
            key={day}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border border-border"
          >
            <div className="flex items-center gap-4 min-w-[140px]">
              <Switch
                id={`day-${index}`}
                checked={localAvailability[index].isAvailable}
                onCheckedChange={() => handleToggle(index)}
              />
              <Label htmlFor={`day-${index}`} className="font-medium text-foreground">
                {day}
              </Label>
            </div>
            
            <div className="flex items-center gap-2 flex-1 justify-center">
              <input
                type="time"
                value={localAvailability[index].startTime}
                onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                disabled={!localAvailability[index].isAvailable}
                className="px-3 py-2 rounded-md bg-background border border-input text-foreground text-sm disabled:opacity-50"
              />
              <span className="text-muted-foreground">to</span>
              <input
                type="time"
                value={localAvailability[index].endTime}
                onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                disabled={!localAvailability[index].isAvailable}
                className="px-3 py-2 rounded-md bg-background border border-input text-foreground text-sm disabled:opacity-50"
              />
            </div>
            
            <Button
              size="sm"
              onClick={() => handleSave(index)}
              disabled={saving === index}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Save className="w-4 h-4 mr-1" />
              {saving === index ? 'Saving...' : 'Save'}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AvailabilityManager;

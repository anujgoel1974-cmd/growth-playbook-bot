import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar } from 'lucide-react';
import { analyticsTemplates } from '@/utils/mockAnalyticsData';
import { TemplateCard } from './TemplateCard';
import { AnalyticsSession } from '@/types/analytics';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';

interface TemplateGalleryProps {
  onRunTemplate: (templateId: string, platforms: string[], dateRange: string) => void;
  recentSessions?: AnalyticsSession[];
  onLoadSession?: (session: AnalyticsSession) => void;
}

export function TemplateGallery({ onRunTemplate, recentSessions = [], onLoadSession }: TemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('7');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Google', 'Meta', 'Bing']);
  
  const platforms = ['Google', 'Meta', 'Bing'];
  
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const filteredTemplates = analyticsTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRunTemplate = (templateId: string) => {
    onRunTemplate(templateId, selectedPlatforms, `${dateRange} days`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-1">Analytics Templates</h2>
        <p className="text-sm text-muted-foreground">
          Start with a prebuilt analysis, then dig deeper with questions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Date Range */}
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>

        {/* Platform Filters */}
        <div className="flex gap-1.5">
          {platforms.map(platform => (
            <Badge
              key={platform}
              variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
              className="cursor-pointer transition-colors px-3"
              onClick={() => togglePlatform(platform)}
            >
              {platform}
            </Badge>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 grid-cols-1">
        {filteredTemplates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onRun={handleRunTemplate}
          />
        ))}
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="pt-6 border-t">
          <h3 className="text-sm font-semibold mb-3">Recent Analyses</h3>
          <div className="space-y-2">
            {recentSessions.map(session => (
              <Card
                key={session.sessionId}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onLoadSession?.(session)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{session.templateName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {session.timeRange} • {session.platforms.join(', ')}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(session.timestamp, 'MMM d, h:mm a')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

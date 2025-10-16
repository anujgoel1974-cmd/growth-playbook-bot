import { 
  Briefcase, 
  Megaphone, 
  TrendingUp, 
  Palette, 
  Building2, 
  Users, 
  Sparkles 
} from "lucide-react";

export const roles = [
  {
    value: 'Founder/CEO',
    label: 'Founder / CEO',
    description: 'Building and growing my business',
    icon: Briefcase
  },
  {
    value: 'Marketing Manager',
    label: 'Marketing Manager',
    description: 'Managing marketing strategy and campaigns',
    icon: Megaphone
  },
  {
    value: 'Marketing Analyst',
    label: 'Marketing Analyst',
    description: 'Analyzing data and optimizing performance',
    icon: TrendingUp
  },
  {
    value: 'Content Creator',
    label: 'Content Creator',
    description: 'Creating ads and creative content',
    icon: Palette
  },
  {
    value: 'Agency Professional',
    label: 'Agency Professional',
    description: 'Managing campaigns for clients',
    icon: Building2
  },
  {
    value: 'Freelancer',
    label: 'Freelancer',
    description: 'Running campaigns for multiple clients',
    icon: Users
  },
  {
    value: 'Other',
    label: 'Other',
    description: 'Just getting started with advertising',
    icon: Sparkles
  }
];

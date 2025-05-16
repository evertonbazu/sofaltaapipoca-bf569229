
import { 
  Monitor, 
  Music, 
  BookOpen, 
  File, 
  Video, 
  Mail, 
  Database, 
  Film,
  Code,
  MessageSquare,
  Image,
  Gamepad2,
  LucideIcon
} from "lucide-react";

// Map icon names to Lucide React components
export const getIconByName = (iconName?: string): LucideIcon | null => {
  if (!iconName) return Monitor;

  const iconMap: Record<string, LucideIcon> = {
    monitor: Monitor,
    music: Music,
    book: BookOpen,
    file: File,
    video: Video,
    mail: Mail,
    database: Database,
    film: Film,
    code: Code,
    chat: MessageSquare,
    image: Image,
    game: Gamepad2
  };

  return iconMap[iconName.toLowerCase()] || Monitor;
};

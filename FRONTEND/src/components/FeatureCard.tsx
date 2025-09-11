import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight?: string;
}

const FeatureCard = ({ icon: Icon, title, description, highlight }: FeatureCardProps) => {
  return (
    <Card className="consultation-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <CardTitle className="text-lg font-semibold text-foreground">
          {title}
        </CardTitle>
        {highlight && (
          <div className="feature-highlight text-xs font-medium text-success">
            {highlight}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <CardDescription className="trust-text leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
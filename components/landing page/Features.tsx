import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, MessageSquare, Shield } from "lucide-react";

// Feature data with icons
interface FeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const featuresList: FeatureItem[] = [
  {
    title: "Multiple Models",
    description:
      "Chat with different Mistral AI models and easily switch between them.",
    icon: <MessageSquare size={18} className="text-muted-foreground" />,
  },
  {
    title: "Simple Authentication",
    description: "Secure and easy authentication via Google OAuth.",
    icon: <Shield size={18} className="text-muted-foreground" />,
  },
  {
    title: "Chat History",
    description:
      "Your conversations are saved so you can revisit them anytime.",
    icon: <History size={18} className="text-muted-foreground" />,
  },
];

/**
 * Features component displays the application features in a responsive grid
 * With subtle icons for visual hierarchy
 */
const Features = () => {
  return (
    <div className="container mx-auto mt-24 max-w-5xl">
      <h2 className="mb-12 text-center text-3xl font-bold">Features</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featuresList.map((feature) => (
          <Card
            key={feature.title}
            className="border-muted/40 bg-background/80 backdrop-blur transition-all hover:shadow-md"
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                {feature.icon}
                <CardTitle>{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Features;

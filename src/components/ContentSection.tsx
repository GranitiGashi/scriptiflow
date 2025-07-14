import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ContentSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  contentType?: "cards" | "features" | "form" | "text";
  items?: {
    title: string;
    description: string;
    icon?: React.ReactNode;
    image?: string;
    cta?: {
      text: string;
      href: string;
    };
  }[];
  className?: string;
  children?: React.ReactNode;
}

const ContentSection = ({
  id,
  title,
  subtitle,
  description,
  contentType = "text",
  items = [
    {
      title: "Feature 1",
      description:
        "Description of feature 1 and its benefits for car dealerships.",
      image:
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80",
    },
    {
      title: "Feature 2",
      description:
        "Description of feature 2 and its benefits for car dealerships.",
      image:
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80",
    },
    {
      title: "Feature 3",
      description:
        "Description of feature 3 and its benefits for car dealerships.",
      image:
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80",
    },
  ],
  className,
  children,
}: ContentSectionProps) => {
  return (
    <section
      id={id}
      className={cn(
        "py-20 px-4 md:px-8 lg:px-16 min-h-[700px] flex flex-col justify-center bg-background",
        className,
      )}
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
            {title}
          </h2>
          {subtitle && (
            <h3 className="text-xl md:text-2xl text-purple-300 mb-4">
              {subtitle}
            </h3>
          )}
          {description && (
            <p className="text-gray-300 max-w-3xl mx-auto">{description}</p>
          )}
        </div>

        {contentType === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, index) => (
              <Card
                key={index}
                className="bg-black/50 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group"
              >
                {item.image && (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-white">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    {item.description}
                  </CardDescription>
                </CardContent>
                {item.cta && (
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
                      asChild
                    >
                      <a href={item.cta.href}>{item.cta.text}</a>
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}

        {contentType === "features" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-4 p-6 rounded-lg border border-purple-500/20 hover:border-purple-500/50 bg-black/50 transition-all duration-300"
              >
                {item.icon && (
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
                    {item.icon}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-300">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {contentType === "text" && (
          <div className="prose prose-invert max-w-3xl mx-auto">
            {children || (
              <p className="text-gray-300 text-center">
                Content goes here. Replace this with your actual content.
              </p>
            )}
          </div>
        )}

        {contentType === "form" && (
          <div className="max-w-2xl mx-auto bg-black/50 p-8 rounded-lg border border-purple-500/20">
            {children || (
              <p className="text-gray-300 text-center">
                Form content goes here. Replace this with your actual form.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute -z-10 top-1/4 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
      <div className="absolute -z-10 bottom-1/4 right-0 w-96 h-96 bg-purple-800/20 rounded-full blur-3xl"></div>
    </section>
  );
};

export default ContentSection;

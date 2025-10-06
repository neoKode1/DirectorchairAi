"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { button as Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function RecraftModelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="outline" 
          onClick={() => router.push('/models')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Models
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Recraft Model
            </CardTitle>
            <CardDescription>
              Use the chat interface on the timeline page to generate content with Recraft.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Simplified Interface
              </h3>
              <p className="text-gray-600 mb-6">
                Our new streamlined interface automatically selects the best model for your content.
              </p>
              <Button 
                onClick={() => router.push('/timeline')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Go to Timeline
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
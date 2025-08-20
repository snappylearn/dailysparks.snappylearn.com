import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { ExaminationSystem, Level } from "@shared/schema";
import { GraduationCap } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  // Fetch examination systems
  const { data: systems, isLoading: systemsLoading } = useQuery<ExaminationSystem[]>({
    queryKey: ['/api/examination-systems'],
  });

  // Fetch levels for selected system
  const { data: levels, isLoading: levelsLoading } = useQuery<Level[]>({
    queryKey: ['/api/levels', selectedSystem],
    enabled: !!selectedSystem,
  });

  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async (data: { examinationSystemId: string; levelId: string }) => {
      console.log("Creating profile with data:", data);
      const response = await apiRequest("/api/profiles", "POST", data);
      console.log("Profile creation response:", response);
      return response;
    },
    onSuccess: () => {
      console.log("Profile created successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      // Force a page reload to redirect to the dashboard
      window.location.reload();
    },
    onError: (error) => {
      console.error("Profile creation failed:", error);
    },
  });

  const handleSubmit = () => {
    if (selectedSystem && selectedLevel) {
      createProfileMutation.mutate({
        examinationSystemId: selectedSystem,
        levelId: selectedLevel,
      });
    }
  };

  const selectedSystemData = systems?.find(s => s.id === selectedSystem);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg border-0">
        <CardHeader className="text-center pb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full mx-auto flex items-center justify-center mb-6">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Welcome to Daily Sparks!
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 mt-2">
            Let's set up your learning profile to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Examination System Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Which exam are you preparing for?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {systemsLoading ? (
                <>
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </>
              ) : (
                systems?.map((system) => (
                  <Button
                    key={system.id}
                    variant={selectedSystem === system.id ? "default" : "outline"}
                    onClick={() => {
                      setSelectedSystem(system.id);
                      setSelectedLevel(""); // Reset level when system changes
                    }}
                    className={`h-16 p-4 text-left flex flex-col items-start justify-center ${
                      selectedSystem === system.id
                        ? "bg-gradient-to-r from-orange-500 to-yellow-400 text-white border-0"
                        : "hover:border-orange-300 hover:bg-orange-50"
                    }`}
                  >
                    <span className="font-semibold text-sm">{system.code}</span>
                    <span className="text-xs opacity-80 truncate w-full">{system.name}</span>
                  </Button>
                ))
              )}
            </div>
          </div>

          {/* Level Selection */}
          {selectedSystem && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-lg font-semibold text-gray-900">
                What's your current level in {selectedSystemData?.code}?
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {levelsLoading ? (
                  <>
                    <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  </>
                ) : (
                  levels?.map((level) => (
                    <Button
                      key={level.id}
                      variant={selectedLevel === level.id ? "default" : "outline"}
                      onClick={() => setSelectedLevel(level.id)}
                      className={`h-16 p-4 text-left flex flex-col items-start justify-center ${
                        selectedLevel === level.id
                          ? "bg-gradient-to-r from-orange-500 to-yellow-400 text-white border-0"
                          : "hover:border-orange-300 hover:bg-orange-50"
                      }`}
                    >
                      <span className="font-semibold">{level.title}</span>
                      {level.description && (
                        <span className="text-xs opacity-80">{level.description}</span>
                      )}
                    </Button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Create Profile Button */}
          <div className="pt-6">
            <Button
              onClick={(e) => {
                e.preventDefault();
                console.log("Button clicked!", { selectedSystem, selectedLevel });
                handleSubmit();
              }}
              disabled={!selectedSystem || !selectedLevel || createProfileMutation.isPending}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white font-semibold py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createProfileMutation.isPending ? "Setting up..." : "Create My Profile"}
            </Button>
            
            <p className="text-xs text-gray-500 text-center mt-3">
              You can add more profiles later to study for different exams
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
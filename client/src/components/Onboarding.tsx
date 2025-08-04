import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { ExaminationSystem, Level } from "@shared/schema";

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
      const response = await apiRequest("/api/profiles", "POST", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      onComplete();
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
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full mx-auto flex items-center justify-center mb-4">
            <i className="fas fa-graduation-cap text-white text-2xl"></i>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to Daily Sparks!
          </CardTitle>
          <CardDescription className="text-gray-600">
            Let's set up your learning profile to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Examination System Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Which exam are you preparing for?
            </label>
            <Select value={selectedSystem} onValueChange={setSelectedSystem}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your examination system" />
              </SelectTrigger>
              <SelectContent>
                {systems?.map((system) => (
                  <SelectItem key={system.id} value={system.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{system.code}</span>
                      <span className="text-xs text-gray-500">{system.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level Selection */}
          {selectedSystem && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                What's your current level?
              </label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder={`Choose your ${selectedSystemData?.code} level`} />
                </SelectTrigger>
                <SelectContent>
                  {levels?.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{level.title}</span>
                        {level.description && (
                          <span className="text-xs text-gray-500">{level.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!selectedSystem || !selectedLevel || createProfileMutation.isPending}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white font-semibold py-3"
            >
              {createProfileMutation.isPending ? "Setting up..." : "Create My Profile"}
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              You can add more profiles later to study for different exams
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
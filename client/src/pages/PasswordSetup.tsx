import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, KeyRound } from "lucide-react";
import { passwordSetupSchema, type PasswordSetupData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface PasswordSetupProps {
  email: string;
  onComplete: () => void;
}

export default function PasswordSetup({ email, onComplete }: PasswordSetupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordSetupData>({
    resolver: zodResolver(passwordSetupSchema),
    defaultValues: {
      email,
      password: "",
      confirmPassword: "",
    },
  });

  const setupPasswordMutation = useMutation({
    mutationFn: async (data: PasswordSetupData) => {
      const response = await apiRequest("POST", "/api/auth/setup-password", data);
      return response.json();
    },
    onSuccess: () => {
      onComplete();
    },
    onError: (error: any) => {
      console.error("Password setup failed:", error);
    },
  });

  const onSubmit = (data: PasswordSetupData) => {
    setupPasswordMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Set Up Your Password</CardTitle>
          <CardDescription>
            Welcome back! Please create a password to secure your account and continue using Daily Sparks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {setupPasswordMutation.error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {(setupPasswordMutation.error as any)?.message || "Failed to set up password"}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  data-testid="input-password"
                  {...form.register("password")}
                  className={form.formState.errors.password ? "border-red-500" : ""}
                  placeholder="Choose a secure password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  data-testid="input-confirmPassword"
                  {...form.register("confirmPassword")}
                  className={form.formState.errors.confirmPassword ? "border-red-500" : ""}
                  placeholder="Confirm your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  data-testid="button-toggle-confirmPassword"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={setupPasswordMutation.isPending}
              data-testid="button-setup-password"
            >
              {setupPasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting Up Password...
                </>
              ) : (
                "Set Up Password"
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              <p>
                This is a one-time setup to secure your existing Daily Sparks account.
                Your progress and data will be preserved.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
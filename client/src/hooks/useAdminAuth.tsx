import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { AdminUser } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type AdminAuthContextType = {
  adminUser: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<AdminUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

type LoginData = {
  email: string;
  password: string;
};

export const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const {
    data: adminUser,
    error,
    isLoading,
  } = useQuery<AdminUser | null, Error>({
    queryKey: ["/admin/api/user"],
    queryFn: async () => {
      try {
        const response = await fetch("/admin/api/user", {
          credentials: 'include',
        });
        
        if (response.status === 401) {
          return null; // Not authenticated
        }
        
        if (!response.ok) {
          throw new Error("Failed to fetch admin user");
        }
        
        return await response.json();
      } catch (error) {
        return null; // Return null on error instead of throwing
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const response = await apiRequest("POST", "/admin/api/login", credentials);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      return await response.json();
    },
    onSuccess: (adminUser: AdminUser) => {
      queryClient.setQueryData(["/admin/api/user"], adminUser);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${adminUser.firstName} ${adminUser.lastName}`,
      });
      setLocation("/admin"); // Redirect to admin dashboard
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/admin/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/admin/api/user"], null);
      queryClient.clear(); // Clear all cached data
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      setLocation("/admin/login"); // Redirect to admin login
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isLoading,
        isAuthenticated: !!adminUser,
        error,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
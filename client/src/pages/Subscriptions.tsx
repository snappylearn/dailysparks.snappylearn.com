import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { MainLayout } from "@/components/MainLayout";
import { 
  Check, 
  Crown, 
  Star, 
  Zap, 
  CreditCard, 
  Coins, 
  Calendar, 
  TrendingUp,
  CheckCircle,
  XCircle
} from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description: string;
  price: string;
  currency: string;
  billingCycle: string;
  dailyQuizLimit: number | null;
  questionBankSize: number;
  features: string[];
  hasAIPersonalization: boolean;
  supportLevel: string;
  isActive: boolean;
  sortOrder: number;
}

interface UserSubscription {
  id: string;
  planName: string;
  planCode: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: string;
  dailyQuizLimit: number | null;
  questionBankSize: number;
  hasAIPersonalization: boolean;
  supportLevel: string;
}

function SubscriptionsContent() {
  const [topUpAmount, setTopUpAmount] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plans, isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription/plans"],
  });

  const { data: currentSubscription, isLoading: subscriptionLoading } = useQuery<UserSubscription>({
    queryKey: ["/api/subscription/current"],
  });

  const { data: userCredits, isLoading: creditsLoading } = useQuery<{ credits: number }>({
    queryKey: ["/api/user/credits"],
  });

  const { data: paymentHistory, isLoading: historyLoading } = useQuery<any[]>({
    queryKey: ["/api/payment/history"],
  });

  const subscribeWithCreditsMutation = useMutation({
    mutationFn: (data: { planId: string; paymentMethod: string }) =>
      fetch("/api/subscription/create-with-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      toast({ title: "Subscription activated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/credits"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Subscription failed", 
        description: error.message || "An error occurred",
        variant: "destructive" 
      });
    },
  });

  const handleSubscribe = (plan: SubscriptionPlan, paymentMethod: string) => {
    if (paymentMethod === 'credits') {
      subscribeWithCreditsMutation.mutate({
        planId: plan.id,
        paymentMethod: 'credits'
      });
    } else {
      // Handle Paystack payment
      initiatePaystackPayment(plan);
    }
  };

  const initiatePaystackPayment = (plan: SubscriptionPlan) => {
    // This would integrate with Paystack popup
    toast({ 
      title: "Paystack Integration", 
      description: "Direct payment integration coming soon. Please use credits for now.",
      variant: "destructive" 
    });
  };

  const planIcons = {
    basic: <Coins className="h-6 w-6" />,
    premium: <Crown className="h-6 w-6" />,
    premium_plus: <Star className="h-6 w-6" />
  };

  const planColors = {
    basic: "bg-blue-50 border-blue-200",
    premium: "bg-purple-50 border-purple-200 relative",
    premium_plus: "bg-yellow-50 border-yellow-200"
  };

  if (plansLoading || subscriptionLoading || creditsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">
          Choose a plan that fits your learning needs
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Billing Overview Section */}
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Billing Overview
                </CardTitle>
                <CardDescription>
                  Your current subscription status and available credits
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => toast({ title: "Top up feature coming soon!" })}
                data-testid="button-topup-credits"
              >
                <Coins className="h-4 w-4 mr-2" />
                Top Up Credits
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Current Plan</Label>
                  <div className="flex items-center gap-2">
                    {currentSubscription ? (
                      <>
                        <Badge variant="default" className="capitalize">
                          {currentSubscription.planName}
                        </Badge>
                        <Badge variant="outline" className="text-green-600">
                          Active
                        </Badge>
                      </>
                    ) : (
                      <Badge variant="secondary">No Active Plan</Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Available Credits</Label>
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-yellow-600" />
                    <span className="text-2xl font-bold">
                      KES {userCredits?.credits?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>

                {currentSubscription && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Next Billing</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">
                        {new Date(currentSubscription.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {currentSubscription && (
                <div className="pt-4 border-t">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Daily Quiz Limit</Label>
                      <p className="font-medium">
                        {currentSubscription.dailyQuizLimit || 'Unlimited'} quizzes
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Question Bank Size</Label>
                      <p className="font-medium">{currentSubscription.questionBankSize}+ questions</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">AI Personalization</Label>
                      <p className="font-medium">
                        {currentSubscription.hasAIPersonalization ? 'Enabled' : 'Not Available'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Support Level</Label>
                      <p className="font-medium capitalize">{currentSubscription.supportLevel}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Plans Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Subscription Plans</h2>
              <p className="text-muted-foreground">
                Choose the perfect plan for your learning journey
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {plans?.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative ${planColors[plan.code as keyof typeof planColors] || 'bg-gray-50'}`}
                  data-testid={`plan-card-${plan.code}`}
                >
                  {plan.code === 'premium' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                      {planIcons[plan.code as keyof typeof planIcons]}
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="space-y-1">
                        <div className="text-3xl font-bold">
                          KES {plan.price}
                          <span className="text-sm font-normal text-muted-foreground">/week</span>
                        </div>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          {plan.dailyQuizLimit ? `${plan.dailyQuizLimit} daily quizzes` : 'Unlimited quizzes'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{plan.questionBankSize}K+ questions</span>
                      </div>
                      {plan.hasAIPersonalization && (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm">AI Personalization</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm capitalize">{plan.supportLevel} support</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      {currentSubscription?.planCode === plan.code ? (
                        <Button disabled className="w-full" data-testid={`button-current-${plan.code}`}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Current Plan
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Button 
                            className="w-full" 
                            variant={plan.code === 'premium' ? 'default' : 'outline'}
                            onClick={() => handleSubscribe(plan, 'credits')}
                            disabled={subscribeWithCreditsMutation.isPending || (userCredits?.credits || 0) < parseFloat(plan.price)}
                            data-testid={`button-subscribe-credits-${plan.code}`}
                          >
                            <Coins className="h-4 w-4 mr-2" />
                            Subscribe with Credits
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleSubscribe(plan, 'paystack')}
                            data-testid={`button-subscribe-paystack-${plan.code}`}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay Directly
                          </Button>
                        </div>
                      )}
                      
                      {(userCredits?.credits || 0) < parseFloat(plan.price) && currentSubscription?.planCode !== plan.code && (
                        <Alert>
                          <AlertDescription className="text-xs">
                            Insufficient credits. Need KES {(parseFloat(plan.price) - (userCredits?.credits || 0)).toFixed(2)} more.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Payment History
              </CardTitle>
              <CardDescription>
                All your subscription payments and credit transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded">
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : paymentHistory && paymentHistory.length > 0 ? (
                <div className="space-y-3">
                  {paymentHistory.map((transaction: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-50">
                          {transaction.source === 'credit' ? (
                            <Coins className="h-4 w-4 text-blue-600" />
                          ) : (
                            <CreditCard className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {transaction.description || 
                             (transaction.type === 'topup' ? 'Credit Top-up' : 
                              transaction.type === 'deduction' ? 'Credit Deduction' : 
                              transaction.type)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString()} at{' '}
                            {new Date(transaction.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === 'topup' || transaction.type === 'subscription' 
                            ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deduction' ? '-' : '+'}KES {Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                        </p>
                        <div className="flex items-center gap-1">
                          {transaction.status === 'success' ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : transaction.status === 'failed' ? (
                            <XCircle className="h-3 w-3 text-red-600" />
                          ) : (
                            <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                          )}
                          <span className="text-xs capitalize">{transaction.status || 'completed'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No payment history yet</p>
                  <p className="text-sm text-muted-foreground">
                    Your transactions will appear here once you make a payment
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Subscriptions() {
  return (
    <MainLayout>
      <SubscriptionsContent />
    </MainLayout>
  );
}
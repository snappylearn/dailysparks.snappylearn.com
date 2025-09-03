import { useState, useEffect } from "react";
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
import { useAuth } from "@/hooks/useAuth";
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

// Paystack type declarations
declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        callback: (response: any) => void;
        onClose: () => void;
        metadata?: any;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

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

export default function Subscriptions() {
  const [topUpAmount, setTopUpAmount] = useState("20.00");
  const [billingPeriod, setBillingPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Price calculation functions
  const calculatePrice = (basePrice: number, period: 'weekly' | 'monthly' | 'yearly') => {
    switch (period) {
      case 'weekly':
        return (basePrice / 4.33).toFixed(2); // Monthly price / 4.33 weeks
      case 'yearly':
        return (basePrice * 10).toFixed(2); // 10 months for yearly (2 months free)
      default:
        return basePrice.toFixed(2);
    }
  };

  const getPeriodLabel = (period: 'weekly' | 'monthly' | 'yearly') => {
    switch (period) {
      case 'weekly': return '/week';
      case 'yearly': return '/year';
      default: return '/month';
    }
  };

  // Load Paystack inline script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const { data: plans, isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription/plans"],
  });

  const { data: currentSubscription, isLoading: subscriptionLoading, refetch: refetchSubscription } = useQuery<UserSubscription>({
    queryKey: ["/api/subscription/current"],
  });

  const { data: userCredits, isLoading: creditsLoading } = useQuery<{ credits: number }>({
    queryKey: ["/api/user/credits"],
  });

  const { data: paymentHistory, isLoading: historyLoading } = useQuery<any[]>({
    queryKey: ["/api/payment/history"],
  });

  const subscribeWithCreditsMutation = useMutation({
    mutationFn: (data: { planId: string; paymentMethod: string; billingCycle?: string }) =>
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
        paymentMethod: 'credits',
        billingCycle: billingPeriod
      });
    } else {
      // Handle Paystack payment
      initiatePaystackPayment(plan);
    }
  };

  const createPaymentTransactionMutation = useMutation({
    mutationFn: (data: { amount: number; planId: string; type: string; description: string; billingCycle?: string }) =>
      fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: (data: { transactionId: string; paystackReference: string }) =>
      fetch("/api/payment/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      toast({ title: "Payment successful! Subscription activated." });
      // Force a complete refresh of subscription data
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/current"] });
      queryClient.refetchQueries({ queryKey: ["/api/subscription/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payment/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/credits"] });
      // Also manually trigger refetch
      setTimeout(() => refetchSubscription(), 1000);
    },
  });

  const confirmCreditTopupMutation = useMutation({
    mutationFn: (data: { transactionId: string; paystackReference: string; amount: number }) =>
      fetch("/api/payment/confirm-topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      toast({ title: "Credit top-up successful!" });
      queryClient.invalidateQueries({ queryKey: ["/api/user/credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payment/history"] });
    },
  });

  const initiatePaystackPayment = async (plan: SubscriptionPlan) => {
    if (!user?.email) {
      toast({ title: "Error", description: "User email not found", variant: "destructive" });
      return;
    }

    try {
      // Create payment transaction record
      const periodPrice = calculatePrice(parseFloat(plan.price), billingPeriod);
      const transaction = await createPaymentTransactionMutation.mutateAsync({
        amount: parseFloat(periodPrice),
        planId: plan.id,
        type: 'subscription',
        description: `Subscription: ${plan.name} (${billingPeriod})`,
        billingCycle: billingPeriod
      });

      // Convert calculated price to cents for Paystack
      const amountInCents = Math.round(parseFloat(periodPrice) * 100); // Convert USD to cents
      const reference = `DS_${Date.now()}_${transaction.id}`;

      if (!window.PaystackPop) {
        toast({ 
          title: "Payment Error", 
          description: "Paystack not loaded. Please refresh the page and try again.",
          variant: "destructive" 
        });
        return;
      }

      // Hardcode the key temporarily for testing
      const paystackKey = "pk_test_a011e6944b1013f457c3164066c77fd4b489d7bc";
      console.log("Paystack Key Available:", !!paystackKey);
      console.log("Payment Details:", { 
        amount: amountInCents, 
        email: user.email, 
        ref: reference,
        currency: 'USD',
        emailValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)
      });

      if (!paystackKey) {
        toast({ 
          title: "Configuration Error", 
          description: "Paystack public key not configured. Please contact support.",
          variant: "destructive" 
        });
        return;
      }

      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: user.email,
        amount: amountInCents,
        ref: reference,
        currency: 'USD',
        // Simplified metadata
        metadata: {
          plan_name: plan.name,
          user_id: user.id
        },
        callback: function(response: any) {
          console.log("Payment callback:", response);
          toast({ title: "Processing payment..." });
          confirmPaymentMutation.mutate({
            transactionId: transaction.id,
            paystackReference: response.reference,
          });
        },
        onClose: function() {
          console.log("Payment modal closed");
          toast({ 
            title: "Payment cancelled", 
            description: "You can try again anytime",
            variant: "destructive" 
          });
        },
      });

      handler.openIframe();
    } catch (error: any) {
      toast({ 
        title: "Payment setup failed", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    }
  };

  const initiateTopUpPayment = async () => {
    if (!user?.email) {
      toast({ title: "Error", description: "User email not found", variant: "destructive" });
      return;
    }

    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    try {
      // Create payment transaction record
      const transaction = await createPaymentTransactionMutation.mutateAsync({
        amount: amount,
        planId: null,
        type: 'credit_topup',
        description: `Credit Top-up: $${amount}`,
      });

      const amountInCents = Math.round(amount * 100); // Convert USD to cents
      const reference = `DS_TOPUP_${Date.now()}_${transaction.id}`;

      if (!window.PaystackPop) {
        toast({ 
          title: "Payment Error", 
          description: "Paystack not loaded. Please refresh the page and try again.",
          variant: "destructive" 
        });
        return;
      }

      const paystackKey = "pk_test_a011e6944b1013f457c3164066c77fd4b489d7bc";

      if (!paystackKey) {
        toast({ 
          title: "Configuration Error", 
          description: "Paystack public key not configured. Please contact support.",
          variant: "destructive" 
        });
        return;
      }

      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: user.email,
        amount: amountInCents,
        ref: reference,
        currency: 'USD',
        metadata: {
          type: 'credit_topup',
          amount: amount,
          user_id: user.id
        },
        callback: function(response: any) {
          console.log("Credit top-up payment callback:", response);
          toast({ title: "Processing credit top-up..." });
          confirmCreditTopupMutation.mutate({
            transactionId: transaction.id,
            paystackReference: response.reference,
            amount: amount
          });
        },
        onClose: function() {
          console.log("Credit top-up payment modal closed");
          toast({ 
            title: "Payment cancelled", 
            description: "You can try again anytime",
            variant: "destructive" 
          });
        },
      });

      handler.openIframe();
    } catch (error: any) {
      toast({ 
        title: "Credit top-up setup failed", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    }
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
    <MainLayout>
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
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="topup-amount" className="text-sm">$</Label>
                  <Input
                    id="topup-amount"
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="20.00"
                    min="1"
                    max="1000"
                    step="0.01"
                    className="w-24"
                    data-testid="input-topup-amount"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={initiateTopUpPayment}
                  disabled={confirmCreditTopupMutation.isPending}
                  data-testid="button-topup-credits"
                >
                  <Coins className="h-4 w-4 mr-2" />
                  {confirmCreditTopupMutation.isPending ? "Processing..." : "Top Up Credits"}
                </Button>
              </div>
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
${userCredits?.credits?.toFixed(2) || '0.00'}
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
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Subscription Plans</h2>
              <p className="text-muted-foreground">
                Choose the perfect plan for your learning journey
              </p>
              
              {/* Billing Period Toggle */}
              <div className="flex justify-center">
                <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
                  <button
                    onClick={() => setBillingPeriod('weekly')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      billingPeriod === 'weekly' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    data-testid="billing-period-weekly"
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setBillingPeriod('monthly')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      billingPeriod === 'monthly' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    data-testid="billing-period-monthly"
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingPeriod('yearly')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      billingPeriod === 'yearly' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    data-testid="billing-period-yearly"
                  >
                    Yearly
                    <span className="ml-1 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                      Save 17%
                    </span>
                  </button>
                </div>
              </div>
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
                          ${calculatePrice(parseFloat(plan.price), billingPeriod)}
                          <span className="text-sm font-normal text-muted-foreground">{getPeriodLabel(billingPeriod)}</span>
                        </div>
                        {billingPeriod === 'yearly' && (
                          <div className="text-sm text-green-600 font-medium">
                            Save ${(parseFloat(plan.price) * 2).toFixed(2)} per year
                          </div>
                        )}
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
                            Insufficient credits. Need ${(parseFloat(plan.price) - (userCredits?.credits || 0)).toFixed(2)} more.
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
                          {transaction.type === 'deduction' ? '-' : '+'}${Math.abs(parseFloat(transaction.amount)).toFixed(2)}
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
    </MainLayout>
  );
}
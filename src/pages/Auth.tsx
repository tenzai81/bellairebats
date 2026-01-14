import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { User, Users, Dumbbell, ArrowLeft } from 'lucide-react';

type AppRole = 'athlete' | 'parent' | 'coach';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(1, 'This field is required');

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<AppRole>('athlete');

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: err.errors[0].message,
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
    }

    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password. Please try again.' 
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/');
    }
    
    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
      nameSchema.parse(firstName);
      nameSchema.parse(lastName);
      
      if (signupPassword !== signupConfirmPassword) {
        throw new Error('Passwords do not match');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: err.errors[0].message,
          variant: 'destructive',
        });
      } else if (err instanceof Error) {
        toast({
          title: 'Validation Error',
          description: err.message,
          variant: 'destructive',
        });
      }
      setIsSubmitting(false);
      return;
    }

    const { error } = await signUp(signupEmail, signupPassword, {
      first_name: firstName,
      last_name: lastName,
      // Note: Role selection is for UX purposes only - all users start as 'athlete'
      // Role is assigned server-side and can only be changed by an admin
    });
    
    if (error) {
      let message = error.message;
      if (error.message.includes('already registered')) {
        message = 'This email is already registered. Please log in instead.';
      }
      toast({
        title: 'Signup Failed',
        description: message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account created!',
        description: 'Welcome to DiamondPro. Your account has been created successfully.',
      });
      navigate('/');
    }
    
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  const roleOptions = [
    { value: 'athlete', label: 'Athlete', icon: Dumbbell, description: 'I want to book training sessions' },
    { value: 'parent', label: 'Parent', icon: Users, description: 'I want to manage my child\'s training' },
    { value: 'coach', label: 'Coach', icon: User, description: 'I want to offer coaching services' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-field flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <Button
          variant="ghost"
          className="text-cream/80 hover:text-cream mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Button>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
            <span className="font-display text-2xl text-accent-foreground">D</span>
          </div>
          <span className="font-display text-3xl text-cream tracking-wide">
            DIAMOND<span className="text-accent">PRO</span>
          </span>
        </div>

        <Card className="bg-cream/5 border-cream/10 backdrop-blur-sm">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2 bg-primary/50">
                <TabsTrigger 
                  value="login" 
                  className="text-cream/70 data-[state=active]:text-cream data-[state=active]:bg-accent"
                >
                  Log In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="text-cream/70 data-[state=active]:text-cream data-[state=active]:bg-accent"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              {/* Login Tab */}
              <TabsContent value="login" className="mt-0">
                <CardTitle className="text-cream text-xl mb-2">Welcome back</CardTitle>
                <CardDescription className="text-cream/60 mb-6">
                  Enter your credentials to access your account
                </CardDescription>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-cream/80">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="bg-cream/10 border-cream/20 text-cream placeholder:text-cream/40"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-cream/80">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="bg-cream/10 border-cream/20 text-cream placeholder:text-cream/40"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="accent" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Logging in...' : 'Log In'}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup" className="mt-0">
                <CardTitle className="text-cream text-xl mb-2">Create account</CardTitle>
                <CardDescription className="text-cream/60 mb-6">
                  Join DiamondPro and start your training journey
                </CardDescription>
                
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name" className="text-cream/80">First Name</Label>
                      <Input
                        id="first-name"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-cream/10 border-cream/20 text-cream placeholder:text-cream/40"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name" className="text-cream/80">Last Name</Label>
                      <Input
                        id="last-name"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-cream/10 border-cream/20 text-cream placeholder:text-cream/40"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-cream/80">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="bg-cream/10 border-cream/20 text-cream placeholder:text-cream/40"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-cream/80">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="bg-cream/10 border-cream/20 text-cream placeholder:text-cream/40"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-cream/80">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      className="bg-cream/10 border-cream/20 text-cream placeholder:text-cream/40"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-cream/80">I am a...</Label>
                    <RadioGroup
                      value={role}
                      onValueChange={(value) => setRole(value as AppRole)}
                      className="space-y-2"
                    >
                      {roleOptions.map((option) => (
                        <div
                          key={option.value}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                            role === option.value
                              ? 'border-accent bg-accent/10'
                              : 'border-cream/20 bg-cream/5 hover:border-cream/40'
                          }`}
                          onClick={() => setRole(option.value)}
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                            className="border-cream/40 text-accent"
                          />
                          <option.icon className={`w-5 h-5 ${role === option.value ? 'text-accent' : 'text-cream/60'}`} />
                          <div className="flex-1">
                            <Label
                              htmlFor={option.value}
                              className={`cursor-pointer font-medium ${role === option.value ? 'text-cream' : 'text-cream/80'}`}
                            >
                              {option.label}
                            </Label>
                            <p className="text-xs text-cream/50">{option.description}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <Button 
                    type="submit" 
                    variant="accent" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <p className="text-cream/40 text-xs text-center mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;

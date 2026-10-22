import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout, { PasswordInput } from '../components/AuthLayout';
import { Button, Field, Input } from '../components/ui';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      // Shown under the password field
      setError(result.message);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your kitchen."
      footer={
        <>
          New to ChefAI?{' '}
          <Link to="/signup" className="font-medium text-brand hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email">
          {(p) => (
            <Input
              {...p}
              type="email"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          )}
        </Field>
        <Field label="Password" error={error || undefined}>
          {(p) => <PasswordInput {...p} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />}
        </Field>
        <Button type="submit" size="lg" block loading={loading} className="mt-2">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Login;

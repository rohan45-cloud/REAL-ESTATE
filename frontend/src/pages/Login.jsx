import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/Authcontext';
import FormField from '../components/FormField';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPw, setShowPw] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (values) => {
    try {
      const user = await login(values.email, values.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.userMessage || 'Login failed');
    }
  };

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-16">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Log in to manage listings, chats and favorites.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Email" error={errors.email?.message}>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              {...register('email', { required: 'Email is required' })}
            />
          </FormField>

          <FormField label="Password" error={errors.password?.message}>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="input pr-10"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormField>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            <LogIn size={16} />
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600 dark:text-stone-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
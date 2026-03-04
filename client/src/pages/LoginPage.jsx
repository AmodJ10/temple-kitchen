import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../api/endpoints';
import useAuthStore from '../store/authStore';
import { connectSocket } from '../utils/socket';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const LoginPage = () => {
    const navigate = useNavigate();
    const setUser = useAuthStore((s) => s.setUser);
    const [isRegister, setIsRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = isRegister
                ? await authAPI.register(form)
                : await authAPI.login({ email: form.email, password: form.password });
            setUser(res.data.data.user);
            connectSocket();
            toast.success(isRegister ? 'Welcome to Temple Kitchen!' : 'Namaste! Welcome back 🙏');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-bg-primary)] via-[var(--color-bg-secondary)] to-[var(--color-bg-primary)] p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] mb-4 shadow-lg">
                        <span className="text-4xl">🙏</span>
                    </div>
                    <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)]">Temple Kitchen</h1>
                    <p className="text-[var(--color-text-muted)] mt-2">Seva Management System</p>
                </div>

                {/* Form Card */}
                <div className="bg-[var(--color-bg-card)] rounded-2xl shadow-card border border-[var(--color-border)] p-8">
                    <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)] mb-6 text-center">
                        {isRegister ? 'Create Account' : 'Welcome Back'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <Input
                                label="Full Name"
                                placeholder="Enter your name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        )}

                        <Input
                            label="Email"
                            type="email"
                            placeholder="sevekari@temple.org"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[38px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <Button type="submit" className="w-full" size="lg" loading={loading}>
                            <LogIn size={18} />
                            {isRegister ? 'Create Account' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="text-center mt-6">
                        <button
                            onClick={() => setIsRegister(!isRegister)}
                            className="text-sm text-[var(--color-primary)] hover:underline font-medium"
                        >
                            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
                    🙏 In service of the Divine Kitchen
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;

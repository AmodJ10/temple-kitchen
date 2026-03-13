import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../api/endpoints';
import useAuthStore from '../store/authStore';
import { connectSocket } from '../utils/socket';
import Button from '../components/ui/Button';

const LoginPage = () => {
    const navigate = useNavigate();
    const setUser = useAuthStore((s) => s.setUser);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });

    useEffect(() => { document.title = 'Sign In — MSM Kitchen'; }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authAPI.login({ email: form.email, password: form.password });
            setUser(res.data.data.user);
            connectSocket();
            toast.success('Namaste! Welcome back 🙏');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[var(--color-bg-primary)]">
            {/* Left Side - Content & Form */}
            <div className="w-full lg:w-[55%] xl:w-1/2 flex flex-col p-6 sm:p-12 md:p-20 relative z-10 min-h-screen">
                {/* App Name Top Left */}
                <div className="sm:absolute sm:top-12 sm:left-12 flex items-center gap-2.5 mb-10 sm:mb-0 pt-4 sm:pt-0">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-[var(--text-xs)] shrink-0">M</div>
                    <span className="text-[var(--text-lg)] font-bold tracking-wide text-[var(--color-text-primary)]">MSM Kitchen</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-md w-full mx-auto my-auto pb-10 sm:pb-0"
                >
                    {/* Headlines — Instrument Serif */}
                    <div className="mb-10 lg:mb-14">
                        <h1 className="text-[var(--text-3xl)] leading-tight mb-5 text-[var(--color-text-primary)]">
                            Manage fast,<br />
                            serve faster.
                        </h1>
                        <p className="text-[var(--text-base)] text-[var(--color-text-secondary)] max-w-sm leading-relaxed">
                            Streamline catering and operations seamlessly with MSM Kitchen.
                        </p>
                    </div>

                    {/* Login Form Box */}
                    <div className="bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)] p-6 sm:p-8 relative overflow-hidden" id="login-form">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    autoComplete="email"
                                    placeholder="Email address"
                                    className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-4 py-3.5 min-h-[44px] text-[var(--text-sm)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] transition-[border-color,box-shadow] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-expo)]"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-4 py-3.5 min-h-[44px] text-[var(--text-sm)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] transition-[border-color,box-shadow] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-expo)] pr-12"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors duration-[var(--duration-fast)] min-h-[44px] min-w-[44px] flex items-center justify-center -mr-4"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full py-3.5"
                                    loading={loading}
                                >
                                    {!loading && <LogIn size={18} />}
                                    Sign In
                                </Button>
                            </div>
                        </form>
                    </div>

                    <p className="text-center text-[var(--text-xs)] text-[var(--color-text-muted)] mt-4">
                        Forgot your password? Contact your administrator.
                    </p>

                    <div className="mt-6 text-center text-[var(--text-sm)] text-[var(--color-text-muted)]">
                        🙏 In service of the Divine Kitchen
                    </div>
                </motion.div>
            </div>

            {/* Right Side - Image Background */}
            <div className="hidden lg:block lg:w-[45%] xl:w-1/2 relative bg-[var(--color-bg-card)] overflow-hidden border-l border-[var(--color-border)]">
                <img
                    src="/login-bg.png"
                    alt="Kitchen Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    style={{ objectPosition: 'center' }}
                />

                {/* Left gradient blend */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--color-bg-primary)] to-transparent"></div>
            </div>
        </div>
    );
};

export default LoginPage;

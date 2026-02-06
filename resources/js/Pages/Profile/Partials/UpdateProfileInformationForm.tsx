import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextFieldCustom from '@/Components/TextFieldCustom';
import { Switch, Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { getBackgroundVariant } from '@/lib/colorUtils';

const VALID_COLORS = [
    '#3B82F6', // Blue (Default)
    '#EAB308', // Yellow
    '#EF4444', // Red
    '#22C55E', // Green
    '#A855F7', // Purple
];
import { FormEventHandler } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            avatar_color: user.avatar_color || '#3b82f6',
            dark_mode: user.dark_mode || false,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Profile Information
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextFieldCustom
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextFieldCustom
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {/* Avatar Color */}
                {/* Avatar Color */}
                <div>
                    <InputLabel htmlFor="avatar_color" value="Avatar Color" />
                    <div className="flex items-center gap-3 mt-2">
                        {VALID_COLORS.map((color) => (
                            <button
                                key={color}
                                type="button" // Prevent form submission
                                onClick={() => setData('avatar_color', color)}
                                className={`h-8 w-8 rounded-full border-2 focus:outline-none transition-transform active:scale-95 ${data.avatar_color === color
                                    ? 'scale-110 ring-2 ring-app-accent ring-offset-2 dark:ring-offset-app-background'
                                    : 'border-transparent hover:scale-105 hover:ring-2 hover:ring-app-accent/50 hover:ring-offset-1 dark:ring-offset-app-background'
                                    }`}
                                style={{
                                    backgroundColor: color,
                                    borderColor: data.avatar_color === color ? 'var(--color-primary)' : 'transparent',
                                }}
                                aria-label={`Select color ${color}`}
                            />
                        ))}
                    </div>
                    <InputError className="mt-2" message={errors.avatar_color} />
                </div>

                {/* Dark Mode */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Switch
                            checked={data.dark_mode}
                            onChange={(checked: boolean) => {
                                setData('dark_mode', checked);
                                // Real-time preview
                                if (checked) document.documentElement.classList.add('dark');
                                else document.documentElement.classList.remove('dark');
                            }}
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-app-accent focus:ring-offset-2 dark:focus:ring-offset-app-background"
                            style={{
                                backgroundColor: data.dark_mode ? 'var(--color-primary)' : '#E5E7EB',
                            }}
                        >
                            <span className="sr-only">Enable Dark Mode</span>
                            <span
                                className={`${data.dark_mode ? 'translate-x-6' : 'translate-x-1'
                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </Switch>
                        <InputLabel htmlFor="dark_mode" value="Dark Mode" className="mb-0" />
                    </div>
                    <InputError className="mt-2" message={errors.dark_mode} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-app-accent underline hover:text-app-accent-hover focus:outline-none focus:ring-2 focus:ring-app-accent focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}

"use client"
import Link from 'next/link';
import styles from '../page.module.css'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import mind from '../../../public/mind.png'

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
   
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Register the user
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log('Registration response:', data);

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // If registration successful, log them in
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      console.log('Sign in result:', result);

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard'); // Redirect to dashboard after successful registration and login
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          <img src={mind.src} alt="Mind Garden" className={styles.mindImage} />
          Sign Up
        </h1>
        <form className={styles.form} autoComplete="off" onSubmit={handleSubmit}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Name
            </label>
            <input 
              className={styles.input}
              type="text" 
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="off"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Email
            </label>
            <input 
              className={styles.input}
              type="email" 
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input 
              className={styles.input}
              type="password" 
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              disabled={loading}
            /> 
          </div>

         
          
          
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
          <Link href={'/'} className={styles.link}>
            Already have an account? Login
          </Link>
        </form>
      </div>
    </div>
  );
}
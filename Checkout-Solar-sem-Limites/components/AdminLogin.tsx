import React, { useState } from 'react';
import { Icons } from '../constants';

interface AdminLoginProps {
  onLogin: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '3284') {
      onLogin();
    } else {
      setError('Senha incorreta');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="text-gold-500 flex justify-center mb-4">
            <Icons.Lock className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-serif text-brand-dark font-bold">Acesso Restrito</h2>
          <p className="text-gray-500 text-sm mt-2">Área Administrativa Hotel Solar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Senha de Acesso</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full p-4 border border-gray-300 rounded focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none transition-all text-center text-2xl tracking-widest"
              placeholder="••••"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2 text-center font-bold">{error}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              className="w-full bg-brand-dark text-white font-bold py-4 rounded hover:bg-brand-green transition-colors uppercase tracking-wide"
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded hover:bg-gray-200 transition-colors"
            >
              Voltar ao Site
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
"use client";
import { useState, useEffect } from 'react';
import { updateDisclosure } from '@/lib/supabase';

export default function DisclosureControls({ commitment }: { commitment: string }) {
  const [settings, setSettings] = useState({
    reveal_wallet: false,
    reveal_holdings: false,
    reveal_identity: false
  });
  const [saving, setSaving] = useState(false);

  const toggleSetting = async (key: keyof typeof settings) => {
    setSaving(true);
    try {
      const newSettings = { ...settings, [key]: !settings[key] };
      await updateDisclosure(commitment, { [key]: newSettings[key] });
      setSettings(newSettings);
    } catch (err) {
      console.error('Failed to update disclosure:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">🔐 Selective Disclosure</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Control what information is revealed in your badge
      </p>

      <div className="space-y-3">
        <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
          <div>
            <div className="font-medium">Wallet Address</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {settings.reveal_wallet ? 'Visible to everyone' : 'Hidden (ZK proof only)'}
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.reveal_wallet}
            onChange={() => toggleSetting('reveal_wallet')}
            disabled={saving}
            className="w-5 h-5"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
          <div>
            <div className="font-medium">Holdings Amount</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {settings.reveal_holdings ? 'Exact amount shown' : 'Hidden (proof only)'}
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.reveal_holdings}
            onChange={() => toggleSetting('reveal_holdings')}
            disabled={saving}
            className="w-5 h-5"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
          <div>
            <div className="font-medium">Identity</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {settings.reveal_identity ? 'Linked to your account' : 'Anonymous'}
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.reveal_identity}
            onChange={() => toggleSetting('reveal_identity')}
            disabled={saving}
            className="w-5 h-5"
          />
        </label>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded text-sm">
        <p className="font-medium mb-1">🎯 Zero-Knowledge Proof</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Even with everything hidden, your badge still proves you're a top holder.
          The cryptographic commitment validates your claim without revealing details.
        </p>
      </div>
    </div>
  );
}

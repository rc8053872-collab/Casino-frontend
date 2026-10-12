import { useCallback, useEffect, useState } from 'react';
import { getBalance, getPaymentSettings, getTransactions, PaymentSettings, Transaction, submitDeposit } from '../api/wallet';

interface DepositWorkflowProps {
  onClose: () => void;
  onRequestLogin: () => void;
  user: { id: string; phone: string | null; email?: string | null; balance: number } | null;
  onBalanceUpdate: (balance: number) => void;
}

function errorMessage(error: unknown) {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const response = error as { error?: unknown; message?: unknown };
    if (typeof response.error === 'string') return response.error;
    if (typeof response.message === 'string') return response.message;
  }
  return 'The request could not be completed. Please try again.';
}

export function DepositWorkflow({ onClose, onRequestLogin, user, onBalanceUpdate }: DepositWorkflowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState('');
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activityError, setActivityError] = useState('');
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const [qrLoadError, setQrLoadError] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const userId = user?.id;
  const amountNumber = Number(amount);
  const amountIsValid = Number.isInteger(amountNumber) && amountNumber >= 100 && amountNumber <= 10000;

  useEffect(() => {
    let active = true;
    const loadSettings = async () => {
      try {
        const result = await getPaymentSettings();
        if (active) setSettings(result);
      } catch (error) {
        if (active) setSettingsError(errorMessage(error));
      } finally {
        if (active) setSettingsLoading(false);
      }
    };
    void loadSettings();
    return () => { active = false; };
  }, []);

  const refreshActivity = useCallback(async () => {
    if (!userId) return;
    try {
      const [recentTransactions, wallet] = await Promise.all([
        getTransactions(20, 0),
        getBalance()
      ]);
      setTransactions(recentTransactions.filter(transaction => transaction.type === 'DEPOSIT'));
      onBalanceUpdate(wallet.balance);
      setActivityError('');
    } catch (error) {
      setActivityError(errorMessage(error));
    }
  }, [onBalanceUpdate, userId]);

  useEffect(() => {
    if (!userId) return;
    void refreshActivity();
    const interval = window.setInterval(() => { void refreshActivity(); }, 10000);
    return () => window.clearInterval(interval);
  }, [refreshActivity, userId]);

  const submit = async () => {
    if (!user) {
      setMessage('Please log in before requesting a deposit.');
      setMessageIsError(true);
      return;
    }

    if (!amountIsValid) {
      setMessage('Enter a whole amount from ₹100 to ₹10,000.');
      setMessageIsError(true);
      return;
    }
    if (!proofFile || !proofPreview) {
      setMessage('Upload a screenshot of your completed payment.');
      setMessageIsError(true);
      return;
    }
    if (!/^[a-z\d]{6,22}$/i.test(utr.trim())) {
      setMessage('Enter a valid UTR/reference number (6–22 letters or digits).');
      setMessageIsError(true);
      return;
    }
    if (!settings?.configured) {
      setMessage('Deposits are unavailable until payment details are configured.');
      setMessageIsError(true);
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitDeposit(amountNumber, utr.trim(), proofPreview);
      setMessage(result.message);
      setMessageIsError(false);
      setTransactions(current => [
        result.transaction,
        ...current.filter(transaction => transaction.id !== result.transaction.id)
      ]);
      setAmount('');
      setUtr('');
      setProofFile(null);
      setProofPreview('');
      setStep(3);
      await refreshActivity();
    } catch (error) {
      setMessage(errorMessage(error));
      setMessageIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProofFile = (file?: File) => {
    setMessage('');
    if (!file) {
      setProofFile(null);
      setProofPreview('');
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setProofFile(null);
      setProofPreview('');
      setMessage('Choose a PNG, JPEG, or WebP payment screenshot.');
      setMessageIsError(true);
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setProofFile(null);
      setProofPreview('');
      setMessage('Screenshot must be 1.5 MB or smaller.');
      setMessageIsError(true);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProofFile(file);
        setProofPreview(reader.result);
      } else {
        setMessage('Could not read this screenshot. Please select it again.');
        setMessageIsError(true);
      }
    };
    reader.onerror = () => {
      setMessage('Could not read this screenshot. Please select it again.');
      setMessageIsError(true);
    };
    reader.readAsDataURL(file);
  };

  const copyUpi = async () => {
    if (!settings?.upiId) return;
    try {
      await navigator.clipboard.writeText(settings.upiId);
      setCopiedUpi(true);
      window.setTimeout(() => setCopiedUpi(false), 1800);
    } catch {
      setMessage('Could not copy the UPI ID. Please copy it manually.');
      setMessageIsError(true);
    }
  };

  return (
    <div className="deposit-workflow">
      <p className="eyebrow">DEPOSIT INR</p>
      <h2>Add Funds to Wallet</h2>
      <p className="deposit-balance">Available balance: <b>₹{Number(user?.balance || 0).toFixed(2)}</b></p>

      {settingsLoading ? <p className="deposit-notice">Loading payment details…</p>
        : settingsError ? <p role="alert" className="deposit-notice deposit-error">{settingsError}</p>
        : <>
          {settings?.isDemo && <div className="deposit-demo-warning" role="note">
            TEST MODE ONLY — this QR cannot be scanned. {settings.demoSubmissionsEnabled
              ? 'Approved demo requests use an isolated local development database.'
              : 'Demo submission is disabled until the backend uses an isolated local development database.'}
          </div>}
          {step === 1 ? <>
            <p className="deposit-limits">Choose an amount: ₹100 minimum · ₹10,000 maximum</p>
            <div className="deposit-quick-amounts" aria-label="Choose deposit amount">
              {[100, 500, 1000, 2000, 5000, 10000].map(value => (
                <button type="button" key={value} className={Number(amount) === value ? 'active' : ''} onClick={() => setAmount(String(value))}>
                  ₹{value.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
            <label>Amount (₹)<input type="number" min="100" max="10000" step="1" inputMode="numeric" placeholder="100–10,000" value={amount} onChange={event => setAmount(event.target.value)} /></label>
            {!user && <div className="deposit-login-prompt">
              <span>Log in to submit a deposit request and view its status.</span>
              <button type="button" onClick={onRequestLogin}>Log in</button>
            </div>}
            {message && <p role="status" className={`deposit-message${messageIsError ? ' deposit-error' : ''}`}>{message}</p>}
            <button
              className="gold-button full"
              disabled={!user || settingsLoading}
              onClick={() => {
                setMessage('');
                if (!user) {
                  setMessage('Please log in before requesting a deposit.');
                  setMessageIsError(true);
                  return;
                }
                if (!amountIsValid) {
                  setMessage('Enter a whole amount from ₹100 to ₹10,000.');
                  setMessageIsError(true);
                  return;
                }
                setStep(2);
              }}
            >
              Continue to payment · ₹{amountIsValid ? amountNumber.toLocaleString('en-IN') : '0'}
            </button>
          </> : step === 2 && settings?.configured ? <>
            <div className="deposit-step-heading">
              <button type="button" onClick={() => { setMessage(''); setStep(1); }}>← Change amount</button>
              <b>Deposit ₹{amountNumber.toLocaleString('en-IN')}</b>
            </div>
            <div className="deposit-payment-details">
              {settings.qrCodeUrl && !qrLoadError
                ? <img className="deposit-qr" src={settings.qrCodeUrl} alt={settings.isDemo ? 'Demo-only payment QR mockup, not scannable' : 'Admin-provided UPI payment QR code'} onError={() => setQrLoadError(true)} />
                : <div className="deposit-qr-missing">QR code unavailable. You can still pay using the UPI ID.</div>}
              <p className="deposit-instruction">
                {settings.isDemo ? 'This mock QR is not scannable. Use this screen only to test the review workflow.' : 'Scan this QR or pay to the UPI ID below. After paying, upload your payment app screenshot.'}
              </p>
              <div className="deposit-upi-row">
                <span><small>UPI ID</small><b>{settings.upiId}</b></span>
                <button type="button" onClick={() => void copyUpi()}>{copiedUpi ? 'Copied' : 'Copy'}</button>
              </div>
            </div>
            <label>UTR / payment reference<input type="text" maxLength={22} autoComplete="off" placeholder="Enter reference number after payment" value={utr} onChange={event => setUtr(event.target.value)} /></label>
            <label>Payment screenshot<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => handleProofFile(event.target.files?.[0])} /></label>
            {proofPreview && <div className="deposit-proof-preview">
              <img src={proofPreview} alt="Preview of uploaded payment screenshot" />
              <button type="button" onClick={() => handleProofFile()}>Remove screenshot</button>
              <small>{proofFile?.name}</small>
            </div>}
            <p className="deposit-proof-hint">PNG, JPEG, or WebP · maximum 1.5 MB. The screenshot will be visible to admins reviewing this request.</p>
            {message && <p role="status" className={`deposit-message${messageIsError ? ' deposit-error' : ''}`}>{message}</p>}
            <button className="gold-button full" onClick={() => void submit()} disabled={submitting || settingsLoading || !user || !proofFile || (settings.isDemo && !settings.demoSubmissionsEnabled)}>
              {submitting ? 'Submitting…' : 'Submit payment proof for review'}
            </button>
            <p className="deposit-review-note">Your wallet is credited only after admin approval. Keep the original receipt.</p>
          </> : step === 2 ? <div className="deposit-notice">
            Payment details are not configured yet. Ask an administrator to add the QR and UPI ID before continuing.
            <button type="button" className="deposit-step-back" onClick={() => setStep(1)}>Change amount</button>
          </div> : <>
            <div className="deposit-submitted">
              <span aria-hidden="true">✓</span>
              <h3>Payment proof submitted</h3>
              <p>Your request is now in payment history. Wallet credit will appear after admin approval.</p>
            </div>
            <section className="deposit-history">
              <h3>Payment history</h3>
              {transactions.length === 0
                ? <p>Your request is being saved. Refresh this view in a moment.</p>
                : transactions.map(transaction => (
                  <div className="deposit-history-row" key={transaction.id}>
                    <span>
                      <b>₹{Number(transaction.amount).toLocaleString('en-IN')}</b>
                      <small>{transaction.referenceId ? `UTR ${transaction.referenceId} · ` : ''}{new Date(transaction.createdAt).toLocaleString()}</small>
                    </span>
                    <strong className={`deposit-status status-${transaction.status.toLowerCase()}`}>
                      {transaction.status === 'COMPLETED' ? 'Approved' : transaction.status === 'PENDING' ? 'Pending' : 'Rejected'}
                    </strong>
                  </div>
                ))}
            </section>
            <button type="button" className="gold-button full" onClick={onClose}>Done</button>
          </>}
        </>}

      {user && activityError && step !== 3 && <p role="alert" className="deposit-message deposit-error">{activityError}</p>}

      {step !== 3 && <button type="button" className="deposit-close-action" onClick={onClose}>Close</button>}
    </div>
  );
}

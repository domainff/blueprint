import React, { useState, FormEvent } from 'react';
import styles from './BlueprintDownloader.module.css';
import { logo } from '../consts/images';

const WEB_APP = 'https://script.google.com/macros/s/AKfycbzywyA1Xq_kpLKylsqwV_uOSnG7RUYfuIqjeeBVITm8fST12z-ajrmMF_A-8ADTwruYBw/exec';

interface FileData {
  id: string;
  name: string;
  url: string;
}

const BlueprintDownloader: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [status, setStatus] = useState<{ text: string; kind: '' | 'success' | 'error' }>({ text: '', kind: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<FileData[] | null>(null);

  const setStatusMessage = (text: string, kind: '' | 'success' | 'error' = '') => {
    setStatus({ text, kind });
  };

  const clearList = () => {
    setFiles(null);
  };

  const lookup = async (emailVal: string): Promise<{ ok: boolean; files?: FileData[]; error?: string }> => {
    const url = `${WEB_APP}?u=${encodeURIComponent(emailVal)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  };

  const downloadSequential = async (urls: string[], delayMs = 900) => {
    const dlframe = document.getElementById('dlframe') as HTMLIFrameElement;
    if (!dlframe) return;

    for (const url of urls) {
      dlframe.src = url;
      await new Promise(r => setTimeout(r, delayMs));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatusMessage('');
    clearList();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setStatusMessage('Please enter a valid email address.', 'error');
      return;
    }

    setLoading(true);
    setStatusMessage('Searching for your files…');

    try {
      const data = await lookup(trimmedEmail);
      if (!data.ok) {
        const errorText = data.error === 'not_found' ? 'No files found for that email.' : `Error: ${data.error || 'unknown'}`;
        setStatusMessage(errorText, 'error');
        return;
      }

      const foundFiles = data.files || [];
      if (foundFiles.length === 0) {
        setStatusMessage('No files found for that email.', 'error');
        return;
      }

      setFiles(foundFiles);

      if (foundFiles.length === 1) {
        setStatusMessage('Found 1 file. Starting download…', 'success');
        const a = document.createElement('a');
        a.href = foundFiles[0].url;
        a.download = foundFiles[0].name || '';
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }

      setStatusMessage(`Found ${foundFiles.length} files. Starting downloads… If prompted, allow multiple downloads.`, 'success');
      await downloadSequential(foundFiles.map(f => f.url), 1000);
      setStatusMessage('All downloads initiated. If some were blocked, use the links above.', 'success');
    } catch (_err) {
      setStatusMessage('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.wrap}>
      <section className={styles.card} aria-labelledby="title">
        <div className={styles.brand}>
          <img src={logo} alt="Company logo" />
          <h1 id="title">Infinite Blueprint Download</h1>
        </div>
        <p className={styles.lede}>Enter the email you used to sign up for Infinite Blueprint. If multiple files exist, we’ll download them all for you automatically.</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <input
            className={styles.input}
            id="email"
            type="email"
            inputMode="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading && <span className={styles.spinner} aria-hidden="true"></span>}
            <span className={styles.btnText}>Find & Download</span>
          </button>
        </form>

        <div className={styles.hint}>Tip: If your browser asks, allow multiple downloads for this site. You can also click files below manually.</div>

        {status.text && (
          <div className={`${styles.status} ${styles[status.kind]}`} role="status" aria-live="polite">
            {status.text}
          </div>
        )}

        {files && files.length > 0 && (
          <div className={styles.list}>
            <h3>Matches</h3>
            <ul className={styles.fileList}>
              {files.map((f, index) => (
                <li key={index}>
                  <a href={f.url} target="_blank" rel="noopener noreferrer">
                    {f.name || f.id}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <footer>© 2025 Domain Fantasy Football LLC. Files are secured and linked only to your email.</footer>
      <iframe id="dlframe" sandbox="allow-scripts allow-downloads" style={{ display: 'none' }}></iframe>
    </main>
  );
};

export default BlueprintDownloader;
import { useState, useEffect } from 'react';
import { getVersion } from '@tauri-apps/api/app';
import { open } from '@tauri-apps/plugin-shell';

const GITHUB_REPO = 'gl11tchy/levaia';
const RELEASES_URL = `https://github.com/${GITHUB_REPO}/releases`;

interface UpdateState {
  updateAvailable: boolean;
  latestVersion: string | null;
  currentVersion: string | null;
  checking: boolean;
}

function compareVersions(current: string, latest: string): boolean {
  const parse = (v: string) => v.replace(/^v/, '').split('.').map(Number);
  const [cMajor, cMinor, cPatch] = parse(current);
  const [lMajor, lMinor, lPatch] = parse(latest);

  if (lMajor > cMajor) return true;
  if (lMajor === cMajor && lMinor > cMinor) return true;
  if (lMajor === cMajor && lMinor === cMinor && lPatch > cPatch) return true;
  return false;
}

export function useUpdateChecker() {
  const [state, setState] = useState<UpdateState>({
    updateAvailable: false,
    latestVersion: null,
    currentVersion: null,
    checking: true,
  });

  useEffect(() => {
    async function checkForUpdates() {
      try {
        const currentVersion = await getVersion();

        const response = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch releases');
        }

        const data = await response.json();
        const latestVersion = data.tag_name?.replace(/^v/, '') || null;

        setState({
          updateAvailable: latestVersion ? compareVersions(currentVersion, latestVersion) : false,
          latestVersion,
          currentVersion,
          checking: false,
        });
      } catch (error) {
        console.error('Update check failed:', error);
        setState(prev => ({ ...prev, checking: false }));
      }
    }

    checkForUpdates();
  }, []);

  const openReleases = () => {
    open(RELEASES_URL);
  };

  return { ...state, openReleases };
}

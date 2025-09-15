// enhanced-deep-linking.js
// 🔗 ENHANCED DEEP LINKING SYSTEM
// Extends existing deep linking with more wallets and better fallbacks

class EnhancedDeepLinking {
  constructor() {
    this.additionalWallets = this.getAdditionalWallets();
    this.retryAttempts = 0;
    this.maxRetries = 3;
    this.fallbackTimeout = 3000;
    
    console.log('🔗 Enhanced Deep Linking initialized');
  }

  // Additional wallets not in your current list
  getAdditionalWallets() {
    return {
      // More Ethereum wallets
      'OKX Wallet': {
        deepLink: (url, hostname) => `okex://main/dapp?dappUrl=${encodeURIComponent(url)}`,
        universalLink: (url) => `https://www.okx.com/web3/dapp?dappUrl=${encodeURIComponent(url)}`,
        chains: ['ethereum', 'base']
      },
      'Rabby Wallet': {
        deepLink: (url, hostname) => `rabby://dapp/${hostname}`,
        universalLink: (url) => `https://rabby.io/?dapp=${encodeURIComponent(url)}`,
        chains: ['ethereum', 'base']
      },
      'Wallet Connect': {
        deepLink: (url) => `wc://wc?uri=${encodeURIComponent(url)}`,
        universalLink: (url) => `https://walletconnect.com/registry?search=${encodeURIComponent(url)}`,
        chains: ['ethereum', 'base', 'solana']
      },
      
      // More Solana wallets  
      'Backpack': {
        deepLink: (url) => `backpack://browse/${encodeURIComponent(url)}`,
        universalLink: (url) => `https://backpack.app/browse?url=${encodeURIComponent(url)}`,
        chains: ['solana']
      },
      'Glow Wallet': {
        deepLink: (url) => `glow://browse/${encodeURIComponent(url)}`,
        universalLink: (url) => `https://glow.app/browse?url=${encodeURIComponent(url)}`,
        chains: ['solana']
      },
      'Slope Wallet': {
        deepLink: (url) => `slope://browse/${encodeURIComponent(url)}`,
        universalLink: (url) => `https://slope.finance/browse?url=${encodeURIComponent(url)}`,
        chains: ['solana']
      }
    };
  }

  // Enhanced deep link with better error handling
  async openEnhancedDeepLink(walletName, network = 'ethereum') {
    const currentUrl = window.location.href;
    const hostname = window.location.hostname;
    
    // Normalize wallet names to match existing system
    const normalizedWalletName = this.normalizeWalletName(walletName);
    
    try {
      // Try your existing system first
      if (window.mobileWalletBridge) {
        const existingLink = window.mobileWalletBridge.generateDeepLink(network, normalizedWalletName);
        if (existingLink) {
          console.log(`🔗 Using existing deep link for ${normalizedWalletName}:`, existingLink);
          return this.attemptDeepLinkWithFallback(existingLink, normalizedWalletName, currentUrl);
        }
      }
      
      // Try additional wallets
      const wallet = this.additionalWallets[normalizedWalletName];
      if (wallet && wallet.chains.includes(network)) {
        const deepLink = wallet.deepLink(currentUrl, hostname);
        const universalLink = wallet.universalLink(currentUrl);
        console.log(`🔗 Using additional wallet deep link for ${normalizedWalletName}:`, deepLink);
        
        return this.attemptDeepLinkWithFallback(deepLink, normalizedWalletName, currentUrl, universalLink);
      }
      
      throw new Error(`Wallet ${normalizedWalletName} not supported for ${network}`);
      
    } catch (error) {
      console.error('🔴 Enhanced deep linking failed:', error);
      return this.showFallbackOptions(normalizedWalletName, currentUrl);
    }
  }

  normalizeWalletName(walletName) {
    // Map common wallet name variations to exact names expected by existing system
    const nameMap = {
      'MetaMask': 'MetaMask',
      'Phantom': 'Phantom', 
      'Coinbase': 'Coinbase Wallet',
      'Coinbase Wallet': 'Coinbase Wallet',
      'Trust': 'Trust Wallet',
      'Trust Wallet': 'Trust Wallet',
      'Rainbow': 'Rainbow Wallet',
      'Rainbow Wallet': 'Rainbow Wallet',
      'Solflare': 'Solflare'
    };
    
    return nameMap[walletName] || walletName;
  }

  async attemptDeepLinkWithFallback(deepLink, walletName, currentUrl, universalLink = null) {
    return new Promise((resolve) => {
      let resolved = false;
      
      // Track if user left the page (wallet opened)
      const handleVisibilityChange = () => {
        if (document.hidden && !resolved) {
          resolved = true;
          console.log(`✅ Deep link successful for ${walletName}`);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          resolve({ success: true, method: 'deeplink' });
        }
      };
      
      // Track if user comes back (deep link failed)
      const handleFocus = () => {
        setTimeout(() => {
          if (!resolved) {
            console.log(`⚠️ Deep link may have failed for ${walletName}, trying fallback`);
            if (universalLink) {
              window.open(universalLink, '_blank');
              resolved = true;
              resolve({ success: true, method: 'universal' });
            } else {
              resolved = true;
              resolve({ success: false, error: 'No fallback available' });
            }
          }
        }, 1000);
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      
      // Attempt deep link
      this.openDeepLink(deepLink);
      
      // Cleanup after timeout
      setTimeout(() => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
        if (!resolved) {
          resolved = true;
          resolve({ success: false, error: 'Timeout' });
        }
      }, this.fallbackTimeout);
    });
  }

  openDeepLink(deepLink) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // iOS method with better error handling
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.src = deepLink;
      
      document.body.appendChild(iframe);
      
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (e) {
          console.log('Iframe cleanup failed:', e);
        }
      }, 2000);
    } else {
      // Android method with fallback
      try {
        window.location.href = deepLink;
      } catch (error) {
        console.error('Deep link failed:', error);
        // Try opening in new tab as fallback
        window.open(deepLink, '_blank');
      }
    }
  }

  showFallbackOptions(walletName, currentUrl) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
      box-sizing: border-box;
    `;
    
    modal.innerHTML = `
      <div style="
        background: #1a1a1a;
        border-radius: 16px;
        padding: 24px;
        max-width: 400px;
        width: 100%;
        text-align: center;
        border: 1px solid #333;
      ">
        <h3 style="color: #fff; margin: 0 0 16px 0;">Connect ${walletName}</h3>
        <p style="color: #ccc; margin: 0 0 24px 0; line-height: 1.5;">
          Choose how you'd like to connect to ${walletName}:
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button onclick="window.open('https://metamask.app.link/dapp/${window.location.hostname}', '_blank')" 
                  style="
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                  ">
            Open in ${walletName}
          </button>
          
          <button onclick="navigator.clipboard.writeText('${currentUrl}').then(() => alert('URL copied! Paste it in your wallet browser.'))" 
                  style="
                    background: #374151;
                    color: white;
                    border: 1px solid #4b5563;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                  ">
            Copy URL
          </button>
          
          <button onclick="this.closest('[style*=\\'position: fixed\\']').remove()" 
                  style="
                    background: transparent;
                    color: #9ca3af;
                    border: 1px solid #4b5563;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                  ">
            Cancel
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    return { success: true, method: 'manual' };
  }

  // QR Code generation for desktop users
  generateQRCode(url, walletName) {
    // Using QR.js library (you can add this via CDN)
    if (typeof QR !== 'undefined') {
      const qr = QR(url);
      return qr;
    }
    
    // Fallback to qr-server.com API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    return qrUrl;
  }
}

// Initialize enhanced deep linking
window.EnhancedDeepLinking = EnhancedDeepLinking;

// Auto-initialize if not in a module environment
if (typeof module === 'undefined') {
  window.enhancedDeepLinking = new EnhancedDeepLinking();
}

console.log('🔗 Enhanced Deep Linking loaded successfully');

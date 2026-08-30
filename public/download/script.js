/**
 * OHKNEE REWARD ARSENAL - COMPLETE STANDALONE SCRIPT (JAVASCRIPT)
 * Vanilla JavaScript (No dependencies required)
 */

(function () {
  'use strict';

  // Master Arsenal Dataset
  const CARDS_DATA = [
    // --- Fast Easy Money ($100-$150) ---
    {
      id: 'fast-stake',
      name: 'Stake.us',
      domain: 'stake.us',
      payout: '$100–$150 Fast',
      payoutTag: 'INSTANT',
      signupUrl: 'https://stake.us/?c=20ae01b862',
      signupLabel: 'SIGN UP',
      tabId: 'fast-easy-money',
      orderNumber: 1,
      showStarsTopper: true,
      note: 'Stake.us daily reload & level-up bonus strategy. Log in daily to claim your free $1 SC + Gold Coins. Wager smart on high RTP originals (Dice/Plinko 99% RTP) to cash out crypto instantly.',
      images: [
        'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1605870445919-838d190e8e1b?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      id: 'fast-gemsloot',
      name: 'Gemsloot',
      domain: 'gemsloot.com',
      payout: '24 Free Spins / Bonus',
      payoutTag: 'FREE START',
      code: 'ohknee',
      signupUrl: 'https://gemsloot.com/?aff=ohknee',
      signupLabel: 'SIGN UP',
      tabId: 'fast-easy-money',
      orderNumber: 2,
      showStarsTopper: true,
      note: 'Use code "ohknee" during registration. Complete the starter offerwall tasks and spin the daily reward wheel for instant withdrawals.',
      images: [
        'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      id: 'fast-freecash',
      name: 'Freecash',
      domain: 'freecash.com',
      payout: 'Prize Wheel / Bonus',
      payoutTag: 'FREE START',
      code: 'Mula20',
      signupUrl: 'https://freecash.com/r/Mula20',
      signupLabel: 'SIGN UP',
      tabId: 'fast-easy-money',
      orderNumber: 3,
      showStarsTopper: true,
      note: 'Enter bonus code "Mula20" on signup to unlock the free prize wheel (up to $250). Complete 2 quick app download offers to cash out $20+ instantly to PayPal, Crypto, or Visa.',
      images: [
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      id: 'fast-kalshi',
      name: 'Kalshi',
      domain: 'kalshi.com',
      payout: '$25–$100 Fast',
      payoutTag: 'TOP PICK',
      signupUrl: 'https://kalshi.com',
      signupLabel: 'SIGN UP',
      tabId: 'fast-easy-money',
      orderNumber: 4,
      showStarsTopper: true,
      note: 'Regulated prediction marketplace. Sign up and fund $100 to receive instant trade credits. Trade high-probability contracts to lock in profit.',
      images: [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      id: 'fast-coinbase',
      name: 'Coinbase',
      domain: 'coinbase.com',
      payout: '$30–$100 Crypto',
      payoutTag: 'EASY FAST',
      signupUrl: 'https://www.coinbase.com',
      signupLabel: 'SIGN UP',
      tabId: 'fast-easy-money',
      orderNumber: 5,
      showStarsTopper: true,
      note: 'Coinbase Learn & Earn quizzes give you $30–$50 in crypto within 15 minutes. Take each 1-minute quiz and convert all rewards into USDC or cash out instantly.',
      images: [
        'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=80'
      ]
    },

    // --- Casino Codes ---
    {
      id: '30',
      name: 'Zula Casino',
      domain: 'zulacasino.com',
      payout: '$10 Free SC',
      payoutTag: 'DAILY BONUS',
      signupUrl: 'https://www.zulacasino.com/signup/d04ec73e-fd45-482d-8355-7048698f7d89',
      signupLabel: 'SIGN UP',
      tabId: 'casino-codes',
      note: 'Claim $10 free Sweeps Coins upon phone verification + daily login bonuses.'
    },
    {
      id: '19',
      name: 'Real Prize',
      domain: 'realprize.com',
      payout: 'Free SC Package',
      payoutTag: 'NEW CASINO',
      signupUrl: 'https://realprize.com/refer/2615334',
      signupLabel: 'SIGN UP',
      tabId: 'casino-codes',
      note: 'Top rated sweeps casino with fast redemptions directly to bank account.'
    },
    {
      id: '13',
      name: 'Modo Casino',
      domain: 'modo.us',
      payout: 'Free Daily SC',
      payoutTag: 'TOP TIER',
      code: '7UFM7O',
      signupUrl: 'https://modo.us?referralCode=7UFM7O',
      signupLabel: 'SIGN UP',
      tabId: 'casino-codes',
      note: 'Code: 7UFM7O. Streak reward system gives escalating daily bonus up to 1 SC per day.'
    },
    {
      id: '11',
      name: 'Luck Party',
      domain: 'luckparty.com',
      payout: 'Welcome Match',
      payoutTag: 'CASINO BONUS',
      signupUrl: 'https://luckparty.com/signup/4fe04bf8-d210-4143-bc98-178a7a0dfa80',
      signupLabel: 'SIGN UP',
      tabId: 'casino-codes',
      note: 'Instant sweeps reload bonus for active players.'
    },
    {
      id: '15',
      name: 'MyPrize US',
      domain: 'myprize.us',
      payout: 'Multiplayer Casino',
      payoutTag: 'HOT',
      code: 'ONIAMAYA',
      signupUrl: 'https://myprize.us/invite/ONIAMAYA',
      signupLabel: 'SIGN UP',
      tabId: 'casino-codes',
      note: 'Referral code: ONIAMAYA. Play multiplayer sweeps casino tables with streamers and friends.'
    },
    {
      id: '10',
      name: 'Lonestar',
      domain: 'lonestar.com',
      payout: 'Free SC Coins',
      payoutTag: 'VERIFIED',
      signupUrl: 'https://lonestarcasino.com/refer/1589659',
      signupLabel: 'SIGN UP',
      tabId: 'casino-codes',
      note: 'Sign up through referral link for enhanced starter balance.'
    },
    {
      id: '4',
      name: 'Crown Coins',
      domain: 'crowncoinscasino.com',
      payout: 'Free Crown Coins',
      payoutTag: 'INSTANT BONUS',
      signupUrl: 'https://crowncoinscasino.com/?utm_campaign=f2828b01-a3b2-4575-8b47-08b95afe3c5e&utm_source=friends',
      signupLabel: 'SIGN UP',
      tabId: 'casino-codes',
      note: 'Daily login rewards and fast sweepstakes spins.'
    },

    // --- Literal Free Money ---
    {
      id: 'free-swagbucks',
      name: 'Swagbucks',
      domain: 'swagbucks.com',
      payout: '$10 Bonus',
      payoutTag: 'INSTANT',
      signupUrl: 'https://www.swagbucks.com',
      signupLabel: 'SIGN UP',
      tabId: 'free-money',
      note: 'Get $10 welcome bonus when you earn 300 SB in your first 30 days. Complete quick surveys and search rewards.'
    },
    {
      id: 'free-kashkick',
      name: 'KashKick',
      domain: 'kashkick.com',
      payout: '$50+ Payouts',
      payoutTag: 'DIRECT DEPOSIT',
      signupUrl: 'https://kashkick.com',
      signupLabel: 'SIGN UP',
      tabId: 'free-money',
      note: 'Earn real cash by testing mobile games and reaching level milestones. Direct PayPal payout.'
    },
    {
      id: 'free-inboxdollars',
      name: 'InboxDollars',
      domain: 'inboxdollars.com',
      payout: '$5 Free Cash',
      payoutTag: 'SIGNUP BONUS',
      signupUrl: 'https://www.inboxdollars.com',
      signupLabel: 'SIGN UP',
      tabId: 'free-money',
      note: 'Instant $5 signup reward. Read paid emails, watch short clips, and complete scratch-off games.'
    },
    {
      id: 'free-rakuten',
      name: 'Rakuten',
      domain: 'rakuten.com',
      payout: '$30 Cash Back',
      payoutTag: 'PROMO BONUS',
      signupUrl: 'https://www.rakuten.com',
      signupLabel: 'SIGN UP',
      tabId: 'free-money',
      note: 'Spend $30 on any store you already shop at (Walmart, Target, Nike) and get $30 cash back check or PayPal.'
    },

    // --- Referrals / Signup / Bonuses ---
    {
      id: 'ref-robinhood',
      name: 'Robinhood',
      domain: 'robinhood.com',
      payout: 'Free Stock ($5–$200)',
      payoutTag: 'GUARANTEED',
      signupUrl: 'https://join.robinhood.com',
      signupLabel: 'SIGN UP',
      tabId: 'referrals',
      note: 'Sign up and link your bank account to receive 100% free fractional stock (valued up to $200).'
    },
    {
      id: 'ref-webull',
      name: 'Webull',
      domain: 'webull.com',
      payout: 'Up to 12 Free Stocks',
      payoutTag: 'HOT PROMO',
      signupUrl: 'https://www.webull.com',
      signupLabel: 'SIGN UP',
      tabId: 'referrals',
      note: 'Deposit any amount (even $1) to receive multiple free stock slices.'
    },
    {
      id: 'ref-sofi',
      name: 'SoFi Bank',
      domain: 'sofi.com',
      payout: '$25–$300 Bonus',
      payoutTag: 'BANK BONUS',
      signupUrl: 'https://www.sofi.com',
      signupLabel: 'SIGN UP',
      tabId: 'referrals',
      note: 'Open a fee-free checking & savings account to claim $25 instant bonus or up to $300 with direct deposit.'
    },
    {
      id: 'ref-chime',
      name: 'Chime',
      domain: 'chime.com',
      payout: '$100 Referral',
      payoutTag: 'CASH BONUS',
      signupUrl: 'https://www.chime.com',
      signupLabel: 'SIGN UP',
      tabId: 'referrals',
      note: 'Receive $100 free cash bonus after your first qualifying direct deposit of $200+ within 45 days.'
    }
  ];

  let currentTab = 'fast-easy-money';
  let activeDrawerId = null;

  // DOM Elements
  const gridEl = document.getElementById('cards-grid');
  const tabsNav = document.getElementById('site-navigation');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const toastEl = document.getElementById('toast');

  // Helper: Show Toast
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-show');
    setTimeout(() => {
      toastEl.classList.remove('is-show');
    }, 2500);
  }

  // Helper: Copy to Clipboard
  function copyCode(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Copied: ' + text);
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast('Copied: ' + text);
  }

  // Render Cards for Active Tab
  function renderCards() {
    if (!gridEl) return;
    gridEl.innerHTML = '';

    const tabCards = CARDS_DATA.filter((c) => c.tabId === currentTab);
    tabCards.sort((a, b) => (a.orderNumber || 999) - (b.orderNumber || 999));

    tabCards.forEach((card) => {
      // Create Card Item
      const cardEl = document.createElement('div');
      cardEl.className = 'card' + (activeDrawerId === card.id ? ' is-expanded' : '');
      cardEl.id = 'card-' + card.id;

      // Stars Topper
      let starsHtml = '';
      if (card.showStarsTopper) {
        starsHtml = `
          <div class="stars-topper" title="5 Star Top Pick">
            <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
        `;
      }

      // Rank Badge
      let rankHtml = '';
      if (card.orderNumber) {
        rankHtml = `<div class="rank-badge">#${card.orderNumber}</div>`;
      }

      // Logo or Avatar
      const logoUrl = card.domain ? `https://logo.clearbit.com/${card.domain}` : '';
      const initials = card.name ? card.name.substring(0, 2).toUpperCase() : 'OK';

      // Promo Code Row
      let codeRowHtml = '';
      if (card.code) {
        codeRowHtml = `
          <div class="code-row">
            <span class="code-key">CODE:</span>
            <span class="code-value">${card.code}</span>
            <button class="code-copy" type="button" data-code="${card.code}">COPY</button>
          </div>
        `;
      }

      cardEl.innerHTML = `
        ${rankHtml}
        <div class="card-top">
          ${starsHtml}
          <div class="logo-tile">
            <img src="${logoUrl}" alt="${card.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div class="avatar" style="display:none;">${initials}</div>
          </div>
          <div class="card-meta">
            <div class="card-name" title="${card.name}">${card.name}</div>
          </div>
          <div class="payout">
            <div class="payout-amt">${card.payout || '$100+ Free'}</div>
            <span class="payout-tag">${card.payoutTag || 'VERIFIED'}</span>
          </div>
          ${codeRowHtml}
        </div>
        <div class="card-cta">
          <div class="card-cta-row">
            <a href="${card.signupUrl}" target="_blank" rel="noopener noreferrer" class="signup-btn">${card.signupLabel || 'SIGN UP'}</a>
            <button type="button" class="secret-btn" data-card-id="${card.id}">SECRET SAUCE</button>
          </div>
        </div>
      `;

      // Event listeners on card
      cardEl.querySelector('.secret-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDrawer(card.id);
      });

      const copyBtn = cardEl.querySelector('.code-copy');
      if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          copyCode(copyBtn.getAttribute('data-code'));
        });
      }

      gridEl.appendChild(cardEl);

      // If this card is active, render its Secret Sauce Drawer inline
      if (activeDrawerId === card.id) {
        const drawerEl = createDrawerElement(card);
        gridEl.appendChild(drawerEl);
      }
    });
  }

  // Create Secret Sauce Drawer Element
  function createDrawerElement(card) {
    const drawer = document.createElement('div');
    drawer.className = 'ohk-drawer';
    drawer.id = 'drawer-' + card.id;

    // Gallery of Proof Images
    let galleryHtml = '';
    if (card.images && card.images.length > 0) {
      const imgItems = card.images
        .map(
          (imgUrl) => `
          <div class="ohk-drawer-img" data-img-src="${imgUrl}">
            <img src="${imgUrl}" alt="Proof Note" />
          </div>
        `
        )
        .join('');
      galleryHtml = `
        <div style="margin-top: 14px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-dim); margin-bottom: 6px;">Proof Pictures & Guide Notes:</div>
          <div class="ohk-drawer-gallery">${imgItems}</div>
        </div>
      `;
    }

    drawer.innerHTML = `
      <button class="ohk-drawer-close" type="button">&times;</button>
      <div class="ohk-drawer-title">${card.name} - Secret Sauce Strategy</div>
      <div class="ohk-drawer-sub">Pro Guide & Step-by-Step Profit Walkthrough</div>
      <div class="ohk-drawer-note">${card.note || 'Follow the sign-up link, complete instant verification, and apply promotional codes for full bonus allocation.'}</div>
      ${galleryHtml}
      <div style="margin-top: 18px; display: flex; justify-content: flex-end; gap: 8px;">
        <a href="${card.signupUrl}" target="_blank" rel="noopener noreferrer" class="signup-btn" style="min-width: 140px; text-align: center;">VISIT ${card.name.toUpperCase()}</a>
      </div>
    `;

    // Close Button
    drawer.querySelector('.ohk-drawer-close').addEventListener('click', () => {
      closeDrawer();
    });

    // Gallery Image Lightbox Clicks
    drawer.querySelectorAll('.ohk-drawer-img').forEach((el) => {
      el.addEventListener('click', () => {
        const src = el.getAttribute('data-img-src');
        openLightbox(src);
      });
    });

    return drawer;
  }

  // Toggle Drawer
  function toggleDrawer(cardId) {
    if (activeDrawerId === cardId) {
      closeDrawer();
    } else {
      activeDrawerId = cardId;
      if (drawerBackdrop) drawerBackdrop.classList.add('is-open');
      renderCards();
      const el = document.getElementById('drawer-' + cardId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  function closeDrawer() {
    activeDrawerId = null;
    if (drawerBackdrop) drawerBackdrop.classList.remove('is-open');
    renderCards();
  }

  // Lightbox
  function openLightbox(src) {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxModal.classList.add('is-open');
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('is-open');
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  // Tab Switching
  if (tabsNav) {
    tabsNav.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab');
      if (!btn) return;
      const tabId = btn.getAttribute('data-tab');
      if (!tabId || tabId === currentTab) return;

      currentTab = tabId;
      activeDrawerId = null;
      if (drawerBackdrop) drawerBackdrop.classList.remove('is-open');

      // Update active class on tab buttons
      tabsNav.querySelectorAll('.tab').forEach((t) => {
        const isActive = t.getAttribute('data-tab') === currentTab;
        t.classList.toggle('is-active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      renderCards();
    });
  }

  // Initial render on load
  document.addEventListener('DOMContentLoaded', () => {
    renderCards();
  });

  // Render immediately if DOM already loaded
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    renderCards();
  }
})();

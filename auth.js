/**
 * AGRATHA 2K26 - Auth Logic
 * Login, Register, Forgot Password handlers
 * With comprehensive error handling and diagnostics
 */

// ===== ERROR DISPLAY HELPER =====
function showAuthError(message, details) {
  console.error('🔐 Auth Error:', message);
  if (details) console.error('   Details:', details);

  // Show toast
  if (typeof showToast === 'function') {
    showToast(message, 'error');
  }

  // Also show inline error if container exists
  const errorEl = document.getElementById('auth-error');
  if (errorEl) {
    errorEl.style.display = 'block';
    errorEl.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:8px">
        <span style="font-size:1.1rem;flex-shrink:0">⚠️</span>
        <div>
          <strong style="display:block;margin-bottom:4px">${message}</strong>
          ${details ? `<span style="font-size:0.8rem;opacity:0.8">${details}</span>` : ''}
        </div>
      </div>
    `;
  }
}

function clearAuthError() {
  const errorEl = document.getElementById('auth-error');
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.innerHTML = '';
  }
}

// ===== DIAGNOSE AUTH ERROR =====
function diagnoseAuthError(error) {
  const msg = (error.message || '').toLowerCase();
  const status = error.status || error.statusCode || 0;

  console.log('🔍 Diagnosing auth error...');
  console.log('   Status:', status);
  console.log('   Message:', error.message);
  console.log('   Full error:', JSON.stringify(error, null, 2));

  // Common Supabase auth errors
  if (msg.includes('email logins are disabled') || msg.includes('email provider is disabled')) {
    return {
      message: 'Email authentication is disabled',
      details: 'Go to Supabase Dashboard → Authentication → Providers → Enable Email provider'
    };
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return {
      message: 'Invalid email or password',
      details: 'Check your credentials and try again. If you don\'t have an account, register first.'
    };
  }
  if (msg.includes('email not confirmed')) {
    return {
      message: 'Email not confirmed',
      details: 'Check your inbox for a confirmation email, or disable email confirmation in Supabase Dashboard → Authentication → Settings.'
    };
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return {
      message: 'Account already exists',
      details: 'An account with this email already exists. Try logging in instead.'
    };
  }
  if (msg.includes('signup is disabled') || msg.includes('signups not allowed')) {
    return {
      message: 'Registration is currently disabled',
      details: 'Go to Supabase Dashboard → Authentication → Settings → Enable "Allow new users to sign up"'
    };
  }
  if (msg.includes('password') && msg.includes('least')) {
    return {
      message: 'Password too short',
      details: 'Password must be at least 6 characters long.'
    };
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return {
      message: 'Too many attempts',
      details: 'Please wait a moment before trying again.'
    };
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    return {
      message: 'Network error',
      details: 'Cannot reach Supabase server. Check your internet connection.'
    };
  }
  if (status === 400) {
    return {
      message: error.message || 'Authentication request failed (400)',
      details: 'This usually means email auth is disabled or credentials are invalid. Check Supabase Dashboard → Authentication → Providers.'
    };
  }
  if (status === 422) {
    return {
      message: error.message || 'Invalid input (422)',
      details: 'The email or password format is invalid.'
    };
  }

  // Generic fallback
  return {
    message: error.message || 'Authentication failed',
    details: status ? `HTTP Status: ${status}` : 'Check browser console (F12) for details.'
  };
}

// ===== LOGIN HANDLER =====
async function handleLogin(e) {
  e.preventDefault();
  clearAuthError();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn = e.target.querySelector('button[type="submit"]');

  console.log('🔐 Login attempt for:', email);

  // Validate inputs
  if (!email || !password) {
    showAuthError('Please enter both email and password');
    return;
  }

  // Check Supabase client
  if (!window.supabase || !window.supabase.auth) {
    showAuthError('Supabase client not initialized', 'Check browser console for initialization errors.');
    console.error('❌ window.supabase:', window.supabase);
    return;
  }


  btn.disabled = true;
  btn.textContent = 'Signing in...';

  try {
    console.log('📡 Calling supabase.auth.signInWithPassword...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error('❌ signInWithPassword returned error:', error);
      const diagnosed = diagnoseAuthError(error);
      showAuthError(diagnosed.message, diagnosed.details);
      btn.disabled = false;
      btn.textContent = 'Sign In';
      return;
    }

    if (!data || !data.user) {
      showAuthError('Login returned no user data', 'The response was empty. This is unusual.');
      btn.disabled = false;
      btn.textContent = 'Sign In';
      return;
    }

    console.log('✅ Login successful! User ID:', data.user.id);
    console.log('📧 Email:', data.user.email);

    // Try to get user profile for role-based redirect
    let userRole = 'participant';
    try {
      const { data: profile, error: profileErr } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileErr) {
        console.warn('⚠️ Could not fetch user profile:', profileErr.message);
        console.log('   This is OK — user may not have a profile row yet.');
      } else if (profile) {
        userRole = profile.role || 'participant';
        console.log('👤 User role:', userRole);
      }
    } catch (profileErr) {
      console.warn('⚠️ Profile fetch failed (non-critical):', profileErr);
    }

    showToast('Welcome back! 🎉', 'success');
    setTimeout(() => {
      window.location.href = (userRole === 'admin') ? 'admin.html' : 'dashboard.html';
    }, 600);

  } catch (err) {
    console.error('❌ Login exception:', err);
    const diagnosed = diagnoseAuthError(err);
    showAuthError(diagnosed.message, diagnosed.details);
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

// ===== REGISTER HANDLER =====
async function handleRegister(e) {
  e.preventDefault();
  clearAuthError();

  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const phone = document.getElementById('phone')?.value?.trim() || '';
  const college = document.getElementById('college')?.value?.trim() || '';
  const department = document.getElementById('department')?.value?.trim() || '';
  const btn = e.target.querySelector('button[type="submit"]');

  console.log('🔐 Registration attempt for:', email);

  // Validate inputs
  if (!fullName || !email || !password) {
    showAuthError('Please fill in all required fields (Name, Email, Password)');
    return;
  }
  if (password.length < 6) {
    showAuthError('Password too short', 'Password must be at least 6 characters long.');
    return;
  }

  // Check Supabase client
  if (!window.supabase || !window.supabase.auth) {
    showAuthError('Supabase client not initialized', 'Check browser console for initialization errors.');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Creating Account...';

  try {
    console.log('📡 Calling supabase.auth.signUp...');
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      console.error('❌ signUp returned error:', error);
      const diagnosed = diagnoseAuthError(error);
      showAuthError(diagnosed.message, diagnosed.details);
      btn.disabled = false;
      btn.textContent = 'Create Account';
      return;
    }

    if (!data || !data.user) {
      showAuthError('Registration returned no user data', 'The response was empty.');
      btn.disabled = false;
      btn.textContent = 'Create Account';
      return;
    }

    console.log('✅ SignUp successful! User ID:', data.user.id);

    // Check if email confirmation is required
    if (data.user.identities && data.user.identities.length === 0) {
      showAuthError(
        'Account already exists',
        'An account with this email is already registered. Try logging in instead.'
      );
      btn.disabled = false;
      btn.textContent = 'Create Account';
      return;
    }

    // Check if session was created (no email confirmation needed)
    const hasSession = !!data.session;
    console.log('🔑 Session created:', hasSession);
    console.log('📧 Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No (needs confirmation)');

    // Try to insert/upsert user profile (non-blocking)
    try {
      console.log('👤 Creating user profile...');
      const { error: profileErr } = await supabase.from('users').upsert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        phone: phone,
        college: college,
        department: department,
        role: 'participant',
      });

      if (profileErr) {
        console.warn('⚠️ Profile creation failed (non-critical):', profileErr.message);
        console.log('   The user account was still created in Supabase Auth.');
        console.log('   Profile can be created later on first login.');
      } else {
        console.log('✅ User profile created successfully');
      }
    } catch (profileErr) {
      console.warn('⚠️ Profile insert exception (non-critical):', profileErr);
    }

    // Handle based on whether session exists
    if (hasSession) {
      showToast('Account created! Welcome to AGRATHA 2K26! 🎉', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    } else {
      // Email confirmation required
      showToast('Account created! Check your email to confirm.', 'info');
      showAuthError(
        'Email confirmation required ✉️',
        'We sent a confirmation link to ' + email + '. Click it to activate your account, then come back to login.'
      );
      // Style the error as info, not error
      const errorEl = document.getElementById('auth-error');
      if (errorEl) {
        errorEl.style.background = 'rgba(0, 212, 255, 0.08)';
        errorEl.style.borderColor = 'rgba(0, 212, 255, 0.2)';
        errorEl.style.color = 'var(--accent-cyan)';
      }
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }

  } catch (err) {
    console.error('❌ Registration exception:', err);
    const diagnosed = diagnoseAuthError(err);
    showAuthError(diagnosed.message, diagnosed.details);
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
}

// ===== FORGOT PASSWORD HANDLER =====
async function handleForgotPassword(e) {
  e.preventDefault();
  clearAuthError();

  const email = document.getElementById('email').value.trim();
  const btn = e.target.querySelector('button[type="submit"]');

  console.log('🔐 Password reset request for:', email);

  if (!email) {
    showAuthError('Please enter your email address');
    return;
  }

  if (!window.supabase || !window.supabase.auth) {
    showAuthError('Supabase client not initialized');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Sending...';

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      console.error('❌ Reset password error:', error);
      const diagnosed = diagnoseAuthError(error);
      showAuthError(diagnosed.message, diagnosed.details);
    } else {
      console.log('✅ Password reset email sent');
      showToast('Password reset link sent to your email!', 'success');
      clearAuthError();
    }
  } catch (err) {
    console.error('❌ Reset password exception:', err);
    showAuthError(err.message || 'Failed to send reset email');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send Reset Link';
  }
}

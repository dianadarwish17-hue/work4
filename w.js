document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');
  const modal = document.getElementById('success-modal');
  const modalDataOutput = document.getElementById('modal-data-output');
  let lastActiveElement = null;

  /* ==========================================================================
     1. التبديل بين التبويبات ودعم لوحة المفاتيح
     ========================================================================== */
  tabs.forEach(tab => {
    tab.setAttribute('role', 'button');
    tab.setAttribute('tabindex', '0');
    
    const handleTabSwitch = () => {
      const target = tab.dataset.target;
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      panels.forEach(p => {
        if (p.id === target) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });
    };

    tab.addEventListener('click', handleTabSwitch);
    tab.addEventListener('keydown', (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleTabSwitch();
      }
    });
  });

  /* ==========================================================================
     2. دوال معالجة أخطاء المدخلات وعرض رسائل التنبيه العالية التسهيلية
     ========================================================================== */
  const showError = (input, message) => {
    const container = input.closest('.form-group') || input.parentElement;
    const errorDiv = container.querySelector('.error-msg');
    input.classList.add('invalid-input');
    input.setAttribute('aria-invalid', 'true');
    if (errorDiv) {
      errorDiv.textContent = message;
      input.setAttribute('aria-describedby', errorDiv.id);
    }
  };

  const clearError = (input) => {
    const container = input.closest('.form-group') || input.parentElement;
    const errorDiv = container.querySelector('.error-msg');
    input.classList.remove('invalid-input');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    if (errorDiv) {
      errorDiv.textContent = '';
    }
  };

  // صيغ الفحص المنتظم (Regex Formats)
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) => /^\+?[0-9\s\-]{7,15}$/.test(phone);
  const isValidExpiry = (expiry) => /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiry);
  const isValidCard = (card) => /^[0-9\s]{16,19}$/.test(card.replace(/\s+/g, ''));

  // ربط الفحص المباشر بعد مغادرة الحقل أو عند التعديل التصحيحي
  const applyLiveValidation = (input, validationCheckFn) => {
    input.addEventListener('blur', () => validationCheckFn(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('invalid-input')) {
        validationCheckFn(input);
      }
    });
  };

  /* --- فحص استمارة Login --- */
  const validateLoginForm = (form) => {
    let valid = true;
    const username = form.querySelector('#login-username');
    const password = form.querySelector('#login-password');

    if (!username.value.trim()) { showError(username, 'Username or Email is required.'); valid = false; } else { clearError(username); }
    if (password.value.length < 6) { showError(password, 'Password must be at least 6 characters.'); valid = false; } else { clearError(password); }

    return valid;
  };

  /* --- فحص استمارة Signup --- */
  const validateSignupForm = (form) => {
    let valid = true;
    const fields = ['firstname', 'lastname', 'dob', 'email', 'confirm-email', 'password', 'confirm-password'];
    const elements = {};
    fields.forEach(f => elements[f] = form.querySelector(`#signup-${f}`));

    if (!elements['firstname'].value.trim()) { showError(elements['firstname'], 'First name is required.'); valid = false; } else { clearError(elements['firstname']); }
    if (!elements['lastname'].value.trim()) { showError(elements['lastname'], 'Last name is required.'); valid = false; } else { clearError(elements['lastname']); }
    if (!elements['dob'].value) { showError(elements['dob'], 'Date of birth is required.'); valid = false; } else { clearError(elements['dob']); }
    
    if (!isValidEmail(elements['email'].value)) { showError(elements['email'], 'Please enter a valid email address.'); valid = false; } else { clearError(elements['email']); }
    if (elements['email'].value !== elements['confirm-email'].value) { showError(elements['confirm-email'], 'Emails do not match.'); valid = false; } else { clearError(elements['confirm-email']); }

    if (elements['password'].value.length < 8) { showError(elements['password'], 'Password must be at least 8 characters.'); valid = false; } else { clearError(elements['password']); }
    if (elements['password'].value !== elements['confirm-password'].value) { showError(elements['confirm-password'], 'Passwords do not match.'); valid = false; } else { clearError(elements['confirm-password']); }

    return valid;
  };

  /* --- فحص استمارة Checkout --- */
  const validateCheckoutForm = (form) => {
    let valid = true;
    const fullname = form.querySelector('#checkout-fullname');
    const email = form.querySelector('#checkout-email');
    const phone = form.querySelector('#checkout-phone');
    const country = form.querySelector('#checkout-country');
    const terms = form.querySelector('#checkout-terms');
    const payment = form.querySelector('input[name="payment"]:checked').value;

    if (!fullname.value.trim()) { showError(fullname, 'Full name is required.'); valid = false; } else { clearError(fullname); }
    if (!isValidEmail(email.value)) { showError(email, 'Valid email is required.'); valid = false; } else { clearError(email); }
    if (!isValidPhone(phone.value)) { showError(phone, 'Enter a valid phone number.'); valid = false; } else { clearError(phone); }
    if (!country.value) { showError(country, 'Please select your country.'); valid = false; } else { clearError(country); }
    if (!terms.checked) { showError(terms, 'You must accept the terms.'); valid = false; } else { clearError(terms); }

    if (payment === 'credit-card') {
      const card = form.querySelector('#checkout-card');
      const expiry = form.querySelector('#checkout-expiry');
      const cvv = form.querySelector('#checkout-cvv');

      if (!isValidCard(card.value)) { showError(card, 'Enter a valid 16-digit card number.'); valid = false; } else { clearError(card); }
      if (!isValidExpiry(expiry.value)) { showError(expiry, 'Expiry date must be MM/YY.'); valid = false; } else { clearError(expiry); }
      if (cvv.value.length < 3) { showError(cvv, 'CVV must be 3 digits.'); valid = false; } else { clearError(cvv); }
    }

    return valid;
  };

  // التحكم الديناميكي بإظهار وإخفاء حقول الكريديت كارد
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const ccFields = document.getElementById('credit-card-fields');
      if (e.target.value === 'paypal') {
        ccFields.style.display = 'none';
      } else {
        ccFields.style.display = 'block';
      }
    });
  });

  // التحكم في الإرسال (Submit Handles)
  document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (validateLoginForm(this)) openSuccessModal(this);
  });

  document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (validateSignupForm(this)) openSuccessModal(this);
  });

  document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (validateCheckoutForm(this)) openSuccessModal(this);
  });

  /* ==========================================================================
     3. إدارة المودال المنبثق (Modal Management & Focus Trap)
     ========================================================================== */
  function openSuccessModal(formElement) {
    lastActiveElement = document.activeElement;
    const formData = new FormData(formElement);
    let displayString = '';

    for (let [key, value] of formData.entries()) {
      // إخفاء كلمات المرور للحفاظ على الأمان والخصوصية عند عرض البيانات
      if (key.toLowerCase().includes('password')) value = '••••••••';
      displayString += `${key}: ${value}\n`;
    }

    modalDataOutput.textContent = displayString;
    modal.classList.remove('hidden');
    document.getElementById('close-modal-ok').focus();
  }

  function closeSuccessModal() {
    modal.classList.add('hidden');
    if (lastActiveElement) lastActiveElement.focus();
  }

  document.getElementById('close-modal-x').onclick = closeSuccessModal;
  document.getElementById('close-modal-ok').onclick = closeSuccessModal;

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeSuccessModal();
    }
  });

  // تطبيق حبس التركيز (Focus Trap) داخل المودال لمنع الخروج بلوحة المفاتيح
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusableElements = modal.querySelectorAll('button, [tabindex="0"]');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      lastElement.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      firstElement.focus();
      e.preventDefault();
    }
  });
});
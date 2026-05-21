document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');
  const modal = document.getElementById('success-modal');
  const modalDataOutput = document.getElementById('modal-data-output');
  let lastActiveElement = null;

  /* ==========================================================================
     1. منطق التبديل بين الألسنة والتبويبات (Tabs with Keyboard Navigation)
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
     2. دوال التحقق المخصصة وقواعد الـ JavaScript Validation
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

  // دوال التحقق من الصيغ
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) => /^\+?[0-9\s\-]{7,15}$/.test(phone);
  const isValidExpiry = (expiry) => /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiry);
  const isValidCard = (card) => /^[0-9\s]{16,19}$/.test(card.replace(/\s+/g, ''));

  // التحقق الفوري عند الخروج من الحقل (On Blur) وعند الكتابة (Input)
  const attachLiveValidation = (input, validateFn) => {
    input.addEventListener('blur', () => validateFn(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('invalid-input')) {
        validateFn(input);
      }
    });
  };

  /* --- استمارة تسجيل الدخول (Login Form Validation) --- */
  const validateLoginForm = (form) => {
    let isValid = true;
    const username = form.querySelector('#login-username');
    const password = form.querySelector('#login-password');

    if (!username.value.trim()) {
      showError(username, 'Username or Email is required.');
      isValid = false;
    } else { clearError(username); }

    if (password.value.length < 6) {
      showError(password, 'Password must be at least 6 characters.');
      isValid = false;
    } else { clearError(password); }

    return isValid;
  };

  /* --- استمارة إنشاء الحساب (Signup Form Validation) --- */
  const validateSignupForm = (form) => {
    let isValid = true;
    const fields = ['firstname', 'lastname', 'dob', 'email', 'confirm-email', 'password', 'confirm-password'];
    const elements = {};
    fields.forEach(f => elements[f] = form.querySelector(`#signup-${f}`));

    // الحقول النصية العادية
    ['firstname', 'lastname'].forEach(f => {
      if (!elements[f].value.trim()) {
        showError(elements[f], `${f.charAt(0).toUpperCase() + f.slice(1)} is required.`);
        isValid = false;
      } else { clearError(elements[f]); }
    });

    // تاريخ الميلاد
    if (!elements['dob'].value) {
      showError(elements['dob'], 'Date of birth is required.');
      isValid = false;
    } else { clearError(elements['dob']); }

    // البريد الإلكتروني وتأكيده
    if (!isValidEmail(elements['email'].value)) {
      showError(elements['email'], 'Please enter a valid email address.');
      isValid = false;
    } else { clearError(elements['email']); }

    if (elements['email'].value !== elements['confirm-email'].value) {
      showError(elements['confirm-email'], 'Emails do not match.');
      isValid = false;
    } else { clearError(elements['confirm-email']); }

    // كلمة المرور وتأكيدها
    if (elements['password'].value.length < 8) {
      showError(elements['password'], 'Password must be at least 8 characters.');
      isValid = false;
    } else { clearError(elements['password']); }

    if (elements['password'].value !== elements['confirm-password'].value) {
      showError(elements['confirm-password'], 'Passwords do not match.');
      isValid = false;
    } else { clearError(elements['confirm-password']); }

    return isValid;
  };

  /* --- استمارة الدفع (Checkout Form Validation) --- */
  const validateCheckoutForm = (form) => {
    let isValid = true;
    const fullname = form.querySelector('#checkout-fullname');
    const email = form.querySelector('#checkout-email');
    const phone = form.querySelector('#checkout-phone');
    const country = form.querySelector('#checkout-country');
    const terms = form.querySelector('#checkout-terms');
    const payment = form.querySelector('input[name="payment"]:checked').value;

    if (!fullname.value.trim()) { showError(fullname, 'Full name is required.'); isValid = false; } else { clearError(fullname); }
    if (!isValidEmail(email.value)) { showError(email, 'Valid email is required.'); isValid = false; } else { clearError(email); }
    if (!isValidPhone(phone.value)) { showError(phone, 'Enter a valid phone number.'); isValid = false; } else { clearError(phone); }
    if (!country.value) { showError(country, 'Please select your country.'); isValid = false; } else { clearError(country); }
    if (!terms.checked) { showError(terms, 'You must accept the terms.'); isValid = false; } else { clearError(terms); }

    if (payment === 'credit-card') {
      const card = form.querySelector('#checkout-card');
      const expiry = form.querySelector('#checkout-expiry');
      const cvv = form.querySelector('#checkout-cvv');

      if (!isValidCard(card.value)) { showError(card, 'Enter a valid 16-digit card number.'); isValid = false; } else { clearError(card); }
      if (!isValidExpiry(expiry.value)) { showError(expiry, 'Expiry date must be MM/YY.'); isValid = false; } else { clearError(expiry); }
      if (cvv.value.length < 3) { showError(cvv, 'CVV must be 3 digits.'); isValid = false; } else { clearError(cvv); }
    }

    return isValid;
  };

  // ربط الاستمارات بموجهات الفحص
  document.getElementById('login-form').onsubmit = (e) => {
    e.preventDefault();
    if (validateLoginForm(e.target)) openSuccessModal(e.target);
  };

  document.getElementById('signup-form').onsubmit = (e) => {
    e.preventDefault();
    if (validateSignupForm(e.target)) openSuccessModal(e.target);
  };

  document.getElementById('checkout-form').onsubmit = (e) => {
    e.preventDefault();
    if (validateCheckoutForm(e.target)) openSuccessModal(e.target);
  };

  /* ==========================================================================
     3. إدارة المودال (Modal Display & Focus Management / Trap Focus)
     ========================================================================== */
  function openSuccessModal(formElement) {
    lastActiveElement = document.activeElement;
    const formData = new FormData(formElement);
    let outputString = '';
    
    for (let [key, value] of formData.entries()) {
      if (key.toLowerCase().includes('password')) value = '********'; // حماية الخصوصية والأمان
      outputString += `${key}: ${value}\n`;
    }

    modalDataOutput.textContent = outputString;
    modal.classList.remove('hidden');
    document.getElementById('close-modal-ok').focus();
  }

  function closeSuccessModal() {
    modal.classList.add('hidden');
    if (lastActiveElement) lastActiveElement.focus();
  }

  // مستمعات المودال
  document.getElementById('close-modal-x').onclick = closeSuccessModal;
  document.getElementById('close-modal-ok').onclick = closeSuccessModal;
  
  window.onkeydown = (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeSuccessModal();
    }
  };

  // Focus Trap داخل المودال لمنع Keyboard Leak
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = modal.querySelectorAll('button, [tabindex="0"]');
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  });

  // التحكم الديناميكي في إظهار حقول الكريديت كارد
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
});
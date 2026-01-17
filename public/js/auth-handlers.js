import {
    loginBtn,
    logoutBtn,
    loginModal,
    registerModal,
    loginForm,
    registerForm,
    loginUsername,
    loginPassword,
    registerUsername,
    registerPassword,
    registerConfirmPassword,
    cancelLogin,
    cancelRegister,
    loginError,
    registerError,
    registerFromLoginBtn,
    userMenuTrigger,
    userDropdownMenu,
    changePasswordBtn,
    changePasswordModal,
    changePasswordForm,
    currentPasswordInput,
    newPasswordInput,
    confirmNewPasswordInput,
    changePasswordError,
    cancelChangePassword
} from './ui-elements.js';
import {
    updateUIForUser
} from './auth-ui-helper.js';
import {
    fetchAndRenderMessages
} from './api-rendering-logic.js';
import {
    showError,
    clearError,
    checkAuthStatus
} from './utils.js';


// Initialize authentication event handlers and listeners
export const initAuthHandlers = () => {
    // Login button
    loginBtn.addEventListener('click', () => {
        clearError(loginError);
        loginUsername.value = '';
        loginPassword.value = '';
        loginModal.showModal();
    });

    // Register from login button (in login modal)
    registerFromLoginBtn.addEventListener('click', () => {
        // Close login modal
        loginModal.close();
        // Clear any errors
        clearError(registerError);
        // Clear form fields
        registerUsername.value = '';
        registerPassword.value = '';
        registerConfirmPassword.value = '';
        // Show register modal
        registerModal.showModal();
    });

    // Logout button
    logoutBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST'
            });

            if (response.ok) {
                updateUIForUser(null);
                fetchAndRenderMessages(); // 重新加载消息（不再显示私有消息）
            } else {
                const errorData = await response.json();
                alert(`登出失败: ${errorData.error || '未知错误'}`);
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('登出失败，请重试');
        }
    });

    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError(loginError);

        const username = loginUsername.value.trim();
        const password = loginPassword.value.trim();

        if (!username || !password) {
            showError(loginError, 'Username and password cannot be empty');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                loginModal.close();
                updateUIForUser(data.user);
                fetchAndRenderMessages(); // 重新加载消息（显示用户的私有消息）
            } else {
                showError(loginError, data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError(loginError, 'Network error, please try again');
        }
    });

    // Register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError(registerError);

        const username = registerUsername.value.trim();
        const password = registerPassword.value.trim();
        const confirmPassword = registerConfirmPassword.value.trim();

        if (!username || !password || !confirmPassword) {
            showError(registerError, 'All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            showError(registerError, 'Passwords do not match');
            return;
        }

        if (username.length < 3 || username.length > 20) {
            showError(registerError, 'Username must be between 3-20 characters');
            return;
        }

        if (password.length < 6) {
            showError(registerError, 'Password must be at least 6 characters');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                registerModal.close();
                // Clear login form errors
                clearError(loginError);
                loginUsername.value = '';
                loginPassword.value = '';
                updateUIForUser(data.user);
                fetchAndRenderMessages(); // 重新加载消息
            } else {
                showError(registerError, data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Register error:', error);
            showError(registerError, 'Network error, please try again');
        }
    });

    // Cancel login
    cancelLogin.addEventListener('click', () => {
        loginModal.close();
    });

    // Cancel register
    cancelRegister.addEventListener('click', () => {
        registerModal.close();
        // Clear login form errors and show login modal
        clearError(loginError);
        loginModal.showModal();
    });

    // Close modals when clicking outside
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.close();
        }
    });

    registerModal.addEventListener('click', (e) => {
        if (e.target === registerModal) {
            registerModal.close();
            // Clear login form errors and show login modal
            clearError(loginError);
            loginModal.showModal();
        }
    });

    // Check authentication status on page load
    checkAuthStatus().then(user => {
        if (user) {
            console.log('User is logged in:', user.username);
        }
    });

    // User dropdown menu toggle
    userMenuTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdownMenu.classList.toggle('hidden');
        // Rotate arrow icon
        const arrow = userMenuTrigger.querySelector('svg:last-child');
        arrow.style.transform = userDropdownMenu.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        if (!userDropdownMenu.classList.contains('hidden')) {
            userDropdownMenu.classList.add('hidden');
            const arrow = userMenuTrigger.querySelector('svg:last-child');
            arrow.style.transform = 'rotate(0deg)';
        }
    });

    // Prevent dropdown from closing when clicking inside
    userDropdownMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Change password button
    changePasswordBtn.addEventListener('click', () => {
        // Close dropdown
        userDropdownMenu.classList.add('hidden');
        const arrow = userMenuTrigger.querySelector('svg:last-child');
        arrow.style.transform = 'rotate(0deg)';

        // Clear form and show modal
        clearError(changePasswordError);
        currentPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmNewPasswordInput.value = '';
        changePasswordModal.showModal();
    });

    // Change password form submission
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError(changePasswordError);

        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmNewPassword = confirmNewPasswordInput.value.trim();

        // Validation
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showError(changePasswordError, 'All fields are required');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showError(changePasswordError, 'New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            showError(changePasswordError, 'New password must be at least 6 characters');
            return;
        }

        if (currentPassword === newPassword) {
            showError(changePasswordError, 'New password must be different from current password');
            return;
        }

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                changePasswordModal.close();
                // Show success message
                alert('Password changed successfully!');
            } else {
                showError(changePasswordError, data.error || 'Failed to change password');
            }
        } catch (error) {
            console.error('Change password error:', error);
            showError(changePasswordError, 'Network error, please try again');
        }
    });

    // Cancel change password
    cancelChangePassword.addEventListener('click', () => {
        changePasswordModal.close();
    });

    // Close change password modal when clicking outside
    changePasswordModal.addEventListener('click', (e) => {
        if (e.target === changePasswordModal) {
            changePasswordModal.close();
        }
    });
};
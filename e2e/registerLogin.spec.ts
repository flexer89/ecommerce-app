import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });

// Function for logging in
async function login(page, email, password) {
  console.log('Initiating login process...');
  
  // Navigate to login and fill in credentials
  await page.getByRole('button', { name: 'login' }).click();
  console.log('Filling in login credentials...');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);

  // Submit login form
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Verify successful login
  console.log('Verifying successful login...');
  await expect(page.getByLabel('user'), 'User label should be visible after login').toBeVisible();
  console.log('Login process completed successfully.');
}

// Function for logging out
async function logout(page) {
  console.log('Initiating logout process...');

  // Verify and click the logout button
  await expect(page.getByRole('button', { name: 'logout' }), 'Logout button should be visible').toBeVisible();
  await page.getByRole('button', { name: 'logout' }).click();

  // Confirm successful logout
  console.log('Verifying successful logout...');
  await expect(page.locator('.header-action-btn[aria-label="login"]'), 'Login label should be visible after logout').toBeVisible();
  console.log('Logout process completed successfully.');
}

// Function for registration with field validation
async function register(page) {
  console.log('Starting registration process...');
  
  // Navigate to the registration form
  console.log('Navigating to registration form...');
  await page.getByRole('button', { name: 'login' }).click();
  await page.getByRole('link', { name: 'Register' }).click();

  // Fill in the registration form
  console.log('Filling in registration form...');
  await page.getByLabel('Email').fill('test14@jolszak.com');
  await page.getByLabel('Password', { exact: true }).fill('Password123!');
  await page.getByLabel('Confirm password').fill('Password123!');
  await page.getByLabel('First name').fill('Konto');
  await page.getByLabel('Last name').fill('Testowe');
  await page.getByLabel('Phone number').fill('123456789');
  await page.getByLabel('Address').fill('Warszawska 24');
  await page.getByLabel('Post code').fill('31-155');
  await page.getByLabel('City').fill('Kraków');
  await page.getByLabel('voivodeship').selectOption('małopolskie');

  // Validate the password field
  console.log('Validating password field...');
  const passwordInput = page.getByLabel('Password', { exact: true });
  await expect(passwordInput, 'Password input should have type "password"').toHaveAttribute('type', 'password');
  await expect(passwordInput, 'Password input should have the correct value').toHaveValue('Password123!');

  // Submit the registration form
  console.log('Submitting the registration form...');
  await page.getByRole('button', { name: 'Register' }).click();

  // Wait for navigation and confirm successful registration
  console.log('Waiting for registration confirmation...');
  await page.waitForNavigation();
  await expect(page.locator('.header-action-btn[aria-label="logout"]'), 'Logout button should be visible after successful registration').toBeVisible();
  console.log('Registration process completed successfully.');
}

test('Registration, login, and logout functionality', async ({ page }) => {
  // Load the homepage
  console.log('Navigating to the homepage...');
  await page.goto('https://jolszak.test');

  // Registration
  console.log('Starting the full flow test...');
  console.log('Step 1: Register a new user...');
  await register(page);

  // Logout after registration
  console.log('Step 2: Log out after registration...');
  await logout(page);

  // Login with the new account
  console.log('Step 3: Log in with the newly registered account...');
  await login(page, 'test11@jolszak.com', 'Password123!');

  // Navigate to orders (dummy verification example, add real checks here)
  console.log('Step 4: Navigating to orders...');
  await page.getByLabel('user').click();
  await page.getByRole('button', { name: 'Zamówienia' }).click();
  console.log('Verified navigation to orders (you can add further validations if required).');

  // Logout
  console.log('Step 5: Log out after checking orders...');
  await logout(page);

  console.log('Full flow test completed successfully.');
});

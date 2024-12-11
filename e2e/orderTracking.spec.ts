import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });

// Funkcja logowania
async function login(page, email, password) {
  await page.getByRole('button', { name: 'login' }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Weryfikacja poprawnego przekierowania na stronę główną po zalogowaniu
  await expect(page).toHaveURL(/home/);
  await expect(page.getByLabel('user')).toBeVisible();
}

// Funkcja wylogowania
async function logout(page) {
  await expect(page.getByRole('button', { name: 'logout' })).toBeVisible();
  await page.getByRole('button', { name: 'logout' }).click();

  // Potwierdzenie wylogowania przez sprawdzenie przycisku logowania
  await expect(page.getByRole('button', { name: 'login' })).toBeVisible();
}

test('Śledzenie zamówień i przesyłek', async ({ page }) => {
  // Przejdź na stronę główną
  await page.goto('https://jolszak.test');

  // Logowanie na istniejące konto
  await login(page, 'test@jolszak.com', 'Password123!');

  // Nawigacja do zamówień
  await page.getByLabel('user').click();
  await page.getByRole('button', { name: 'Zamówienia' }).click();

  // Sprawdzenie listy zamówień (jeśli istnieje)
  const orders = page.locator('.order-item');
  if (await orders.count() > 0) {
    await expect(orders.first()).toBeVisible();
  } else {
    await expect(page.getByText('Brak zamówień')).toBeVisible();
  }

  // Nawigacja do wysyłek
  await page.getByRole('button', { name: 'Wysyłki' }).click();
  await expect(page).toHaveURL(/shipments/); // Sprawdzenie URL

  // Sprawdzenie listy wysyłek (jeśli istnieje)
  const shipments = page.locator('.shipment-item');
  if (await shipments.count() > 0) {
    await expect(shipments.first()).toBeVisible();
  } else {
    await expect(page.getByText('Brak wysyłek')).toBeVisible();
  }

  // Wylogowanie po weryfikacji
  await logout(page);
});

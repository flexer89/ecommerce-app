import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });

test('Logowanie do panelu administratora i zarządzanie użytkownikami, zamówieniami, przesyłkami i statystykami', async ({ page }) => {
  // Logowanie do panelu administratora
  await page.goto('https://jolszak-admin.test');
  await page.getByLabel('Email').fill('admin@jolszak.com');
  await page.getByLabel('Password').fill('AdminPassword123!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Weryfikacja, że logowanie się powiodło
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByText('Panel Administratora')).toBeVisible();

  // Przegląd listy użytkowników
  await page.getByRole('link', { name: 'Użytkownicy' }).click();
  await expect(page).toHaveURL(/users/);

  // Weryfikacja danych użytkownika oraz blokowanie konta
  const userRow = page.locator('.user-item').first();
  await expect(userRow).toBeVisible();
  await userRow.click();
  const userStatus = await page.getByRole('button', { name: 'Blokuj konto' });
  await expect(userStatus).toBeVisible();
  await userStatus.click();
  await expect(page.getByText('Konto zablokowane')).toBeVisible();

  // Przegląd zamówień
  await page.getByRole('link', { name: 'Zamówienia' }).click();
  await expect(page).toHaveURL(/orders/);
  const orderRow = page.locator('.order-item').first();
  await expect(orderRow).toBeVisible();
  await orderRow.click();

  // Zmiana statusu zamówienia i weryfikacja w historii
  const statusButton = page.getByRole('button', { name: 'Zmień status zamówienia' });
  await statusButton.click();
  await page.getByRole('option', { name: 'Wysłane' }).click();
  await expect(statusButton).toHaveText('Status: Wysłane');
  
  await page.getByRole('link', { name: 'Historia zamówień' }).click();
  await expect(page).toHaveURL(/order-history/);
  const historyOrderRow = page.locator('.order-item').first();
  await expect(historyOrderRow).toBeVisible();
  await expect(historyOrderRow.getByText('Status: Wysłane')).toBeVisible();

  // Przegląd przesyłek
  await page.getByRole('link', { name: 'Przesyłki' }).click();
  await expect(page).toHaveURL(/shipments/);
  const shipmentRow = page.locator('.shipment-item').first();
  await expect(shipmentRow).toBeVisible();
  await shipmentRow.click();

  // Zmiana statusu przesyłki i weryfikacja w historii zamówień
  const shipmentStatusButton = page.getByRole('button', { name: 'Zmień status przesyłki' });
  await shipmentStatusButton.click();
  await page.getByRole('option', { name: 'Dostarczona' }).click();
  await expect(shipmentStatusButton).toHaveText('Status: Dostarczona');

  await page.getByRole('link', { name: 'Historia zamówień' }).click();
  await expect(page).toHaveURL(/order-history/);
  const historyShipmentRow = page.locator('.order-item').first();
  await expect(historyShipmentRow).toBeVisible();
  await expect(historyShipmentRow.getByText('Status przesyłki: Dostarczona')).toBeVisible();

  // Sprawdzenie, czy panel statystyk działa poprawnie
  await page.getByRole('link', { name: 'Statystyki' }).click();
  await expect(page).toHaveURL(/stats/);
  await expect(page.getByText('Panel Statystyk')).toBeVisible();
  await expect(page.locator('.stats-chart')).toBeVisible(); // Weryfikacja, że wykresy są widoczne
  await expect(page.locator('.stats-summary')).toContainText('Łączna liczba zamówień');
});

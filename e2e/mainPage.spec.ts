import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });

test('Homepage - check all main sections and links', async ({ page }) => {
  // Load the homepage
  await page.goto('https://jolszak.test');

  // 1. Verify the Header section
  console.log('Verifying the Header section...');
  await expect(page.locator('.header'), 'Header should be visible').toBeVisible();
  await expect(page.locator('text=Darmowa wysyłka powyżej 200 złotych'), 'Free shipping banner should be visible').toBeVisible();
  await expect(page.locator('.header-actions [aria-label="login"]'), 'Login button should be visible in header actions').toBeVisible();
  await expect(page.locator('.header-actions [aria-label="cart item"]'), 'Cart item button should be visible in header actions').toBeVisible();

  // Check navigation links in header
  console.log('Verifying header navigation links...');
  const navLinks = [
    { locator: page.locator('.navbar a:has-text("Strona główna")'), message: 'Home link should be visible' },
    { locator: page.locator('.navbar a:has-text("Bestsellery")'), message: 'Bestsellers link should be visible' },
    { locator: page.locator('.navbar a:has-text("Oferta")'), message: 'Offer link should be visible' },
    { locator: page.locator('.navbar a:has-text("O nas")'), message: 'About us link should be visible' },
  ];
  for (const { locator, message } of navLinks) {
    await expect(locator, message).toBeVisible();
  }

  // 2. Verify the Hero section and its carousel
  console.log('Verifying the Hero section and carousel...');
  await expect(page.locator('.hero'), 'Hero section should be visible').toBeVisible();
  await expect(page.locator('.hero-carousel .carousel-item').nth(0).locator('.hero-title'), 'First carousel title should be visible').toBeVisible();
  await expect(page.locator('.hero-carousel .carousel-item').nth(1).locator('.hero-title'), 'Second carousel title should be visible').toBeVisible();

  // 3. Verify the Collection section
  console.log('Verifying the Collection section...');
  await expect(page.locator('.collection'), 'Collection section should be visible').toBeVisible();
  await expect(page.locator('.collection .collection-card'), 'There should be 3 collection cards').toHaveCount(3);

  const collectionItems = [
    { text: 'Ekskluzywne Produkty', message: 'Exclusive Products card should be visible' },
    { text: 'Nowości', message: 'New Products card should be visible' },
    { text: 'Promocje', message: 'Promotions card should be visible' },
  ];
  for (const { text, message } of collectionItems) {
    await expect(page.locator(`.collection .collection-card:has-text("${text}")`), message).toBeVisible();
  }

  // 4. Verify the Shop (Bestsellers) section
  console.log('Verifying the Shop section (Bestsellers)...');
  await expect(page.locator('.shop'), 'Shop section should be visible').toBeVisible();
  await expect(page.locator('.shop .shop-card'), 'There should be 3 bestseller cards').toHaveCount(3);

  // 5. Verify the Banner section
  console.log('Verifying the Banner section...');
  await expect(page.locator('.banner'), 'Banner section should be visible').toBeVisible();
  await expect(page.locator('.banner-card:has-text("Stworzone z pasją")'), 'First banner (Stworzone z pasją) should be visible').toBeVisible();
  await expect(page.locator('.banner-card:has-text("Idealne rozwiązania")'), 'Second banner (Idealne rozwiązania) should be visible').toBeVisible();

  // 6. Verify the Feature section
  console.log('Verifying the Feature section...');
  await expect(page.locator('.feature'), 'Feature section should be visible').toBeVisible();

  const featureItems = [
    { text: 'Innowacyjne Podejście', message: 'Innovative Approach feature should be visible' },
    { text: 'Szybka Dostawa', message: 'Fast Delivery feature should be visible' },
    { text: 'Szeroki Asortyment', message: 'Wide Assortment feature should be visible' },
  ];
  for (const { text, message } of featureItems) {
    await expect(page.locator(`.feature-card:has-text("${text}")`), message).toBeVisible();
  }

  // 7. Verify the About Us section
  console.log('Verifying the About Us section...');
  await expect(page.locator('.about-us-container'), 'About Us section should be visible').toBeVisible();
  await expect(page.locator('.about-us-container:has-text("Naprawdę kochamy to, co robimy")'), 'About Us title should be visible').toBeVisible();
  await expect(page.locator('.about-us-container a[href="#footer"]'), 'Link to footer should be visible').toBeVisible();

  // 8. Verify the Footer section
  console.log('Verifying the Footer section...');
  await expect(page.locator('.footer'), 'Footer section should be visible').toBeVisible();

  const footerItems = [
    { locator: page.locator('.footer .footer-list:has-text("Kontakt")'), message: 'Contact section in footer should be visible' },
    { locator: page.locator('.footer .footer-list:has-text("Regulamin")'), message: 'Regulations link in footer should be visible' },
    { locator: page.locator('.footer .footer-link[href="/regulations"]'), message: 'Link to regulations should be visible' },
  ];
  for (const { locator, message } of footerItems) {
    await expect(locator, message).toBeVisible();
  }

  // Check social media links
  console.log('Verifying social media links in the footer...');
  const socialMediaLinks = [
    { name: 'logo-tiktok', message: 'TikTok logo should be visible' },
    { name: 'logo-instagram', message: 'Instagram logo should be visible' },
    { name: 'logo-facebook', message: 'Facebook logo should be visible' },
    { name: 'logo-youtube', message: 'YouTube logo should be visible' },
  ];
  for (const { name, message } of socialMediaLinks) {
    await expect(page.locator(`.footer .footer-link [name="${name}"]`), message).toBeVisible();
  }

  console.log('Homepage sections loaded and displayed correctly.');
});

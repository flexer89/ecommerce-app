import { test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true, timeout: 15000 });

test.describe('E2E Workflow: Filtering, Adding to Cart, and Checkout', () => {
  
  test.describe('Authentication', () => {
    test('User Login', async ({ page }) => {
      console.log('Navigating to the homepage...');
      await page.goto('https://jolszak.test');
      await expect(page, 'Homepage should load successfully').toHaveURL('https://jolszak.test');

      console.log('Initiating login process...');
      await page.getByRole('button', { name: 'login' }).click();

      console.log('Filling in login credentials...');
      await page.getByLabel('Email').fill('test14@jolszak.com');
      await page.getByLabel('Password', { exact: true }).fill('Password123!');
      await page.getByRole('button', { name: 'Sign In' }).click();

      console.log('Verifying successful login...');
      await expect(page.getByLabel('user'), 'User label should be visible after login').toBeVisible();
      console.log('Login process completed successfully.');
    });
  });

  test.describe('Product Selection and Filtering', () => {
    test('Select Category and Apply Filters', async ({ page }) => {
      console.log('Selecting the "Oferta" category...');
      await page.getByRole('link', { name: 'Oferta' }).click();
      await expect(page.getByRole('heading', { name: 'Lista produktów' }), 'Products page heading should be visible').toBeVisible();

      console.log('Opening the filter modal...');
      const filterButton = page.getByRole('button', { name: 'Otwórz Filtry' });
      await expect(filterButton, 'Filter button should be visible').toBeVisible();
      await filterButton.click();

      console.log('Applying filters...');
      const categoryCombobox = page.getByRole('combobox');
      await expect(categoryCombobox, 'Category combobox should be visible').toBeVisible();
      await categoryCombobox.selectOption('robusta'); // Select "Robusta" category

      const applyFiltersButton = page.getByRole('button', { name: 'Zastosuj filtry' });
      await expect(applyFiltersButton, 'Apply filters button should be visible').toBeVisible();
      await applyFiltersButton.click();

      console.log('Waiting for filtered products to load...');
      const productList = page.locator('.product-list'); // Adjust selector as needed
      await expect(productList, 'Product list should be visible').toBeVisible();
    });
  });

  test.describe('Product Details and Cart Management', () => {
    test('Add Product to Cart', async ({ page }) => {
      console.log('Waiting for "SL28" to appear...');
      const productItem = page.getByRole('img', { name: 'SL28' });
      await expect(productItem, 'Filtered product "SL28" should be visible').toBeVisible();

      console.log('Viewing product details...');
      await productItem.click();
      const productDetails = page.locator('h2').filter({ hasText: 'SL28' }).first();
      await expect(productDetails, 'Product details page heading should be visible').toBeVisible();

      console.log('Closing the product modal...');
      const closeModalButton = page.getByRole('button', { name: '×' });
      await expect(closeModalButton, 'Close modal button should be visible').toBeVisible();
      await closeModalButton.click();

      console.log('Adding the product to the cart...');
      const productLink = page
        .locator('div')
        .filter({ hasText: /^SL2899\.90 złPodgląd$/ })
        .getByRole('link');
      await expect(productLink, 'Product link should be visible').toBeVisible();
      await productLink.click();

      const sizeButton = page.getByRole('button', { name: '250g' });
      await expect(sizeButton, 'Size button should be visible').toBeVisible();
      await sizeButton.click();

      const addToCartButton = page.getByRole('button', { name: 'Dodaj do koszyka' });
      await expect(addToCartButton, 'Add to cart button should be visible').toBeVisible();
      await addToCartButton.click();

      console.log('Opening the cart...');
      const cartButton = page.getByLabel('cart item');
      await expect(cartButton, 'Cart item button should be visible').toBeVisible();
      await cartButton.click();

      const cartPage = page.locator('.cart-page');
      await expect(cartPage, 'Cart page should be visible').toBeVisible();

      console.log('Increasing product quantity in the cart...');
      const increaseQuantityButton = page.getByRole('button', { name: 'Dodaj' });
      await expect(increaseQuantityButton, 'Increase quantity button should be visible').toBeVisible();
      await increaseQuantityButton.click();
    });
  });

  test.describe('Checkout Process', () => {
    test('Complete the Purchase', async ({ page }) => {
      console.log('Proceeding to checkout...');
      const proceedToCheckoutButton = page.getByRole('button', { name: 'Przejdź do zapłaty' });
      await expect(proceedToCheckoutButton, 'Proceed to checkout button should be visible').toBeVisible();
      await proceedToCheckoutButton.click();

      console.log('Selecting delivery method...');
      const courierOption = page.getByLabel('Kurier - 9.99 zł (Dostawa w');
      await expect(courierOption, 'Courier delivery option should be visible').toBeVisible();
      await courierOption.check();

      console.log('Proceeding to payment...');
      const proceedToPaymentButton = page.getByRole('button', { name: 'Przejdź do płatności' });
      await expect(proceedToPaymentButton, 'Proceed to payment button should be visible').toBeVisible();
      await proceedToPaymentButton.click();

      console.log('Selecting payment method...');
      const iframeLocator = page.locator('iframe[name^="__privateStripeFrame"]').first();
      await iframeLocator.waitFor({ state: 'attached', timeout: 10000 }); // Wait for iframe to attach
      await expect(iframeLocator, 'Payment iframe should be visible').toBeVisible();

      const frame = await iframeLocator.contentFrame();
      await expect(frame, 'Iframe content should be accessible').not.toBeNull(); // Ensure iframe content is loaded
      const paypalOption = frame.getByTestId('paypal');
      await expect(paypalOption, 'PayPal option should be visible inside iframe').toBeVisible();
      await paypalOption.click();

      console.log('Confirming payment...');
      const payNowButton = page.getByRole('button', { name: 'Zapłać teraz' });
      await expect(payNowButton, 'Pay now button should be visible').toBeVisible();
      await payNowButton.click();

      console.log('Authorizing test payment...');
      const authorizePaymentLink = page.getByRole('link', { name: 'Authorize Test Payment' });
      await expect(authorizePaymentLink, 'Authorize test payment link should be visible').toBeVisible();
      await authorizePaymentLink.click();

      console.log('Verifying order confirmation...');
      const confirmationHeading = page.getByRole('heading', { name: 'Potwierdzenie zamówienia' });
      await expect(confirmationHeading, 'Order confirmation heading should be visible').toBeVisible();
      const thankYouMessage = page.getByText('Dziękujemy za zakup! Zamó');
      await expect(thankYouMessage, 'Thank you message should be visible').toBeVisible();

      console.log('Continuing shopping...');
      const continueShoppingButton = page.getByRole('button', { name: 'Kontynuuj Zakupy' });
      await expect(continueShoppingButton, 'Continue shopping button should be visible').toBeVisible();
      await continueShoppingButton.click();

      const homepageHeading = page.getByRole('heading', { name: 'Wyjątkowy wybór. Każde zamó' });
      await expect(homepageHeading, 'Homepage heading should be visible').toBeVisible();

      console.log('Test completed successfully!');
    });
  });
});

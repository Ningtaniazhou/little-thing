import { test, expect, type Page, type Locator } from '@playwright/test';

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
}
async function insideViewport(page: Page, locator: Locator) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  const viewport = page.viewportSize()!;
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.y).toBeGreaterThanOrEqual(-1);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
}
async function coreFits(page: Page) {
  await page.evaluate(() => scrollTo(0, 0));
  for (const selector of ['.chirpy-stage', '.stage-actions', '.chirpy-panel h1', '.chirpy-message']) {
    await insideViewport(page, page.locator(selector));
  }
  await noOverflow(page);
}

test('3D: one-screen layout, theme selection, repeat draw, celebration, like and navigation', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/3d');
  const twist = page.getByRole('button', {name:'扭一下',exact:true});
  await expect(twist).toBeEnabled();
  // Stabilize content only after GLTF/Three initialization (never duplicate model UUIDs).
  await page.evaluate(() => { Math.random = () => .5; });
  await coreFits(page);
  await expect(page).toHaveScreenshot('3d-idle.png', {mask:[page.locator('canvas')], animations:'disabled'});
  await page.getByRole('button', {name:'关闭音乐和音效',exact:true}).click();
  await expect(page.getByRole('button', {name:'开启音乐和音效',exact:true})).toHaveAttribute('aria-pressed','false');
  await page.getByRole('button', {name:'开启音乐和音效',exact:true}).click();
  // This fieldset is the app's actual selection form, submitted by the twist button.
  const reading = page.getByRole('button', {name:/读点东西/});
  await reading.click();
  await expect(reading).toHaveAttribute('aria-pressed','true');
  await twist.click();
  await expect(page.getByRole('button',{name:'扭蛋中…',exact:true})).toBeDisabled();
  const again = page.getByRole('button',{name:'再扭一颗',exact:true});
  await expect(again).toBeEnabled();
  await expect(page.locator('.message-label')).toHaveText(/^(读书|读诗|学习)$/);
  await coreFits(page);
  await expect(page).toHaveScreenshot('3d-result.png', {animations:'disabled'});
  await page.screenshot({path:testInfo.outputPath('3d-result-actual.png'),fullPage:true});
  await again.click();
  await expect(page.getByRole('button',{name:'扭蛋中…',exact:true})).toBeVisible();
  await expect(again).toBeEnabled();
  await coreFits(page);
  await page.getByRole('button',{name:'我去做了',exact:true}).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await insideViewport(page, dialog);
  await insideViewport(page, page.getByRole('button',{name:'点赞',exact:true}));
  expect(await dialog.evaluate(el => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
  await expect(page.locator('.cheer-flight-scene')).toHaveAttribute('data-phase','holding');
  await expect(dialog.locator('canvas')).toBeVisible();
  await expect(dialog.locator('img')).toHaveCount(0);
  await expect(page).toHaveScreenshot('3d-celebration.png',{animations:'disabled'});
  await page.getByRole('button',{name:'点赞',exact:true}).click();
  await expect(page.getByRole('button',{name:'已点赞',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(dialog).not.toBeVisible();
  await expect(twist).toBeEnabled();
  await expect(page.locator('.is-revealed')).toHaveCount(0);
  await coreFits(page);
  await expect(page).toHaveScreenshot('3d-reset.png',{mask:[page.locator('canvas')],animations:'disabled'});
  // Real browser history navigation, since this single-screen app has no nav menu.
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'啾啾小事',exact:true})).toBeVisible();
  await page.goBack();
  await expect(twist).toBeEnabled();
  await coreFits(page);
  expect(errors).toEqual([]);
});

test('legacy: category form, task submission, done and route history', async ({page}) => {
  // Keep API integration deterministic and offline; the UI still submits a real POST.
  let submitted: string[] | undefined;
  await page.route('**/api/generate-task', async route => {
    submitted = route.request().postDataJSON().categories;
    await route.fulfill({json:{task:{id:9001,category:'写作',minutes:'5',text:'写下今天的一件小事。',soft:'每一步都算数。'}}});
  });
  await page.goto('/');
  await page.evaluate(() => { Math.random = () => .5; });
  await noOverflow(page);
  await page.getByRole('button',{name:/挑选你想要的小事种类/}).click();
  await page.getByRole('button',{name:'写作',exact:true}).click();
  await expect(page.getByRole('button',{name:/已选 1 种蛋/})).toBeVisible();
  await page.getByRole('button',{name:/已选 1 种蛋/}).click();
  await page.getByRole('button',{name:'扭一下 🌀',exact:true}).click();
  await expect(page.getByRole('button',{name:'我去做了 ✓',exact:true})).toBeEnabled();
  expect(submitted).toEqual(['写作']);
  await noOverflow(page);
  await expect(page.getByText('写下今天的一件小事。',{exact:true})).toBeVisible();
  // Older API responses may still include minutes; never display the estimate.
  await expect(page.getByText(/5分钟/)).toHaveCount(0);
  await page.getByRole('button',{name:'我去做了 ✓',exact:true}).click();
  await expect(page.getByRole('button',{name:'扭一下 🌀',exact:true})).toBeEnabled();
  await page.reload();
  await expect(page.getByRole('button',{name:/已选 1 种蛋/})).toBeVisible();
  await page.goto('/3d');
  await expect(page.getByRole('button',{name:'扭一下',exact:true})).toBeEnabled();
  await page.goBack();
  await expect(page.getByRole('heading',{name:'啾啾小事',exact:true})).toBeVisible();
  await noOverflow(page);
});

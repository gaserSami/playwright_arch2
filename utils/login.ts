import { Page } from '@playwright/test';

export async function login(page: Page){
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  if(!email || !password){
    throw new Error('Email or password is not defined in environment variables');
  }

  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Continue with email' }).click();
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
}
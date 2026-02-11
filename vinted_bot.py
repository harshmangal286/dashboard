
import asyncio
import json
import os
import logging
import random
import time
import re
from typing import Optional, Tuple, List, Dict
from playwright.async_api import async_playwright, Page, BrowserContext
from PIL import Image, ImageEnhance

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("vinted_bot")

class ImageProcessor:
    @staticmethod
    def optimize_for_vinted(image_path: str, output_path: str = None) -> str:
        if not output_path:
            base, ext = os.path.splitext(image_path)
            output_path = f"{base}_optimized{ext}"
        
        img = Image.open(image_path)
        img.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.1)
        img.save(output_path, 'JPEG', quality=85, optimize=True)
        return output_path

class VintedBot:
    def __init__(self, account_id: str, username: str, password: str, domain: str = "vinted.co.uk"):
        self.account_id = account_id
        self.username = username
        self.password = password
        self.domain = domain
        self.cookies_path = f"cookies/cookies_{account_id}.json"
        os.makedirs("cookies", exist_ok=True)

    async def _handle_interstitials(self, page: Page):
        """Observer: Detecting and resolving Vinted security and selection overlays"""
        url = page.url.lower()
        
        # 1. Handle Cookies
        cookie_btns = ['button:has-text("Accept all")', '#onetrust-accept-btn-handler', '[data-testid="cookie-accept-all"]']
        for btn in cookie_btns:
            try:
                if await page.is_visible(btn, timeout=1000):
                    await page.click(btn)
                    logger.info("Observer: Cookie consent resolved.")
            except: pass

        # 2. Handle 'select_type' (Personal vs Pro) registration wall
        if "select_type" in url or "signup" in url:
            logger.info(f"Observer: Intercepted registration wall at {url}")
            # The page provided by user has 'Log in' links for existing users
            selectors = [
                'a:has-text("Log in")', 
                'button:has-text("Log in")', 
                'a[href*="/login"]',
                'xpath=//span[contains(text(), "Already have an account?")]/following-sibling::a'
            ]
            for sel in selectors:
                try:
                    if await page.is_visible(sel, timeout=2000):
                        await page.click(sel)
                        logger.info("Performer: Bypassing registration wall to reach login gate.")
                        await page.wait_for_load_state("networkidle")
                        return True
                except: pass
            
            # Fallback: Force jump to login
            logger.warning("Observer: Selection links not found. Forcing navigation to auth login.")
            await page.goto(f"https://www.{self.domain}/auth/login")
            return True
        return False

    async def login(self, page: Page) -> bool:
        logger.info(f"Performer: Authenticating @{self.username} on {self.domain}...")
        
        # Navigate to the specific URL provided if we are starting fresh
        start_url = f"https://www.{self.domain}/auth/login"
        await page.goto(start_url)
        await page.wait_for_load_state("networkidle")
        
        await self._handle_interstitials(page)
        
        # Check if we are at the login form
        try:
            # Vinted often uses a 'Continue with email' step first
            email_option = 'button:has-text("email"), a:has-text("email")'
            if await page.is_visible(email_option, timeout=2000):
                await page.click(email_option)
                await page.wait_for_timeout(1000)

            await page.fill('input[name="username"]', self.username)
            await page.fill('input[name="password"]', self.password)
            await page.click('button[type="submit"]')
            logger.info("Performer: Authentication sequence injected.")
        except Exception as e:
            logger.error(f"Observer: Login interaction failure: {e}")
            return False

        # Observe for success or MFA
        for _ in range(30):
            await asyncio.sleep(1)
            if "/member/" in page.url or await page.query_selector('[data-testid="user-menu"]'):
                await page.context.storage_state(path=self.cookies_path)
                logger.info("Observer: Session verified. State persisted.")
                return True
            if "captcha" in page.url:
                logger.warning("Observer: CAPTCHA block detected. Performer halted.")
                return False
        return False

    async def publish_listing(self, page: Page, details: dict) -> bool:
        logger.info(f"Performer: Deploying listing '{details.get('title')}'")
        await page.goto(f"https://www.{self.domain}/items/new")
        await self._handle_interstitials(page)
        
        if details.get('image'):
            logger.info("Performer: Injecting media stream...")
            await page.set_input_files('input[type="file"]', details['image'])
            await page.wait_for_timeout(3000)
        
        logger.info("Performer: Populating listing metadata...")
        await page.fill('input[data-testid="item-title"]', details.get('title', ''))
        await page.fill('textarea[data-testid="item-description"]', details.get('description', ''))
        
        # Price and simple attributes
        await page.fill('input[data-testid="item-price"]', str(details.get('price', '')))
        
        # Click Publish
        logger.info("Performer: Triggering publication broadcast...")
        await page.click('button[data-testid="item-upload-button"]')
        
        # Observe result
        await page.wait_for_timeout(5000)
        success = "/items/" in page.url
        if success:
            logger.info(f"Observer: Asset live at {page.url}")
        return success

    async def run(self, mode: str = "publish", **kwargs) -> bool:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=kwargs.get('headless', True))
            context = await browser.new_context(viewport={'width': 1280, 'height': 800})
            
            if os.path.exists(self.cookies_path):
                await context.add_cookies(json.load(open(self.cookies_path)))
            
            page = await context.new_page()
            
            success = False
            if mode == "login":
                success = await self.login(page)
            elif mode == "publish":
                # Ensure logged in
                await page.goto(f"https://www.{self.domain}/")
                if not await page.query_selector('[data-testid="user-menu"]'):
                    await self.login(page)
                success = await self.publish_listing(page, kwargs)
            
            await browser.close()
            return success

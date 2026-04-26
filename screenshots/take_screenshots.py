import asyncio
from playwright.async_api import async_playwright
import os

BASE = 'http://localhost:3003'
OUT_DIR = os.path.join(os.path.dirname(__file__))

pages = [
    ('/#/workbench',         'workbench.png'),
    ('/#/',                  'case-archive.png'),
    ('/#/evidence',          'evidence.png'),
    ('/#/mail',              'mail.png'),
    ('/#/response',          'response.png'),
    ('/#/relief',            'relief.png'),
    ('/#/finance',           'finance.png'),
    ('/#/reminders',         'reminders.png'),
    ('/#/templates',         'templates.png'),
    ('/#/settings-center',   'settings-center.png'),
    ('/#/case/new',          'case-new.png'),
    ('/#/case/test-id',      'case-detail.png'),
]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-dev-shm-usage']
        )
        context = await browser.new_context(viewport={'width': 1440, 'height': 900})
        page = await context.new_page()
        
        errors = []
        page.on('console', lambda msg: errors.append(f"[{msg.type}] {msg.text}") if msg.type == 'error' else None)
        page.on('pageerror', lambda err: errors.append(f"[pageerror] {err}"))
        
        # Warmup: load base URL first
        print('Warming up...')
        await page.goto(BASE + '/', wait_until='load', timeout=20000)
        await asyncio.sleep(5)
        
        for i, (route, name) in enumerate(pages):
            url = BASE + route
            print(f'[{i+1}/{len(pages)}] {route}')
            try:
                await page.goto(url, wait_until='load', timeout=20000)
                await asyncio.sleep(4)
                body_text = await page.inner_text('body')
                print(f'  body={len(body_text)} chars')
                
                file_path = os.path.join(OUT_DIR, name)
                await page.screenshot(path=file_path, full_page=False)
                size = os.path.getsize(file_path)
                print(f'  saved {size} bytes')
            except Exception as e:
                print(f'  ERROR: {e}')
        
        print('\nConsole errors:')
        for e in errors[:20]:
            print(f'  {e}')
        
        await browser.close()
    print('Done.')

asyncio.run(main())
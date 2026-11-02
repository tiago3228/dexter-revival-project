from pathlib import Path
import subprocess
import time
import urllib.request

from playwright.sync_api import expect, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "http://127.0.0.1:4173"


def wait_for_server() -> None:
    deadline = time.time() + 30
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(BASE_URL, timeout=1):
                return
        except Exception:
            time.sleep(0.25)
    raise RuntimeError("Servidor Vite não ficou disponível em 30 segundos")


def solve_level(page, pairs: list[str]) -> None:
    for pair in pairs:
        button = page.get_by_role("button", name=pair, exact=True)
        button.click()
        button.click()
    page.get_by_role("button", name="Conferir rota", exact=True).click()


def main() -> None:
    server = subprocess.Popen(
        [
            "npm",
            "exec",
            "--yes",
            "bun@1.3.3",
            "--",
            "run",
            "dev",
            "--",
            "--host",
            "127.0.0.1",
            "--port",
            "4173",
        ],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        wait_for_server()
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(
                executable_path="/usr/bin/chromium",
                headless=True,
                args=["--no-sandbox"],
            )
            context = browser.new_context(viewport={"width": 1440, "height": 1100})
            context.add_init_script(
                "window.localStorage.setItem('vivian-map-target', 'e2e-murdle-route');"
            )
            page = context.new_page()
            page.goto(f"{BASE_URL}/?resumePainscreek=true", wait_until="domcontentloaded")
            page.wait_for_timeout(1000)
            page.evaluate("window.localStorage.setItem('vivian-map-target', 'e2e-murdle-route')")
            page.reload(wait_until="domcontentloaded")
            page.wait_for_timeout(500)

            start_investigation = page.get_by_role("button", name="Iniciar investigação", exact=True)
            start_investigation.click(timeout=15000)
            puzzle = page.get_by_role("region", name="Minigame de rota dos depoimentos")
            expect(puzzle).to_be_visible()
            expect(page.get_by_role("button", name="Nível 2 · Rota cruzada")).to_be_disabled()

            solve_level(
                page,
                [
                    "Scott e Cais",
                    "Scott e Fita",
                    "Dorothy e Arquivo",
                    "Dorothy e Recibo",
                    "Wanda e Igreja",
                    "Wanda e Carta",
                ],
            )
            expect(page.get_by_text("Nível 1 concluído", exact=False)).to_be_visible()
            expect(page.get_by_role("button", name="Avançar para o nível 2", exact=True)).to_be_visible()
            page.get_by_role("button", name="Avançar para o nível 2", exact=True).click()

            expect(page.get_by_text("Scott não aparece no hospital nem associado à fotografia.")).to_be_visible()
            solve_level(
                page,
                [
                    "Scott e Lago",
                    "Scott e Fita",
                    "Dorothy e Arquivo",
                    "Dorothy e Recibo",
                    "Wanda e Igreja",
                    "Wanda e Carta",
                    "Mary e Hospital",
                    "Mary e Fotografia",
                ],
            )
            expect(page.get_by_text("Nível 2 concluído", exact=False)).to_be_visible()
            expect(page.get_by_text("Conferido", exact=True)).to_be_visible()

            stored_level = page.evaluate(
                "JSON.parse(localStorage.getItem('vivian-playable-investigation-v1')).murdleWitnessRouteLevel"
            )
            assert stored_level == 2, f"nível persistido inesperado: {stored_level}"
            print("E2E aprovado: os níveis 1 e 2 foram resolvidos no navegador e o nível 2 foi persistido.")
            browser.close()
    finally:
        server.terminate()
        try:
            server.wait(timeout=10)
        except subprocess.TimeoutExpired:
            server.kill()
            server.wait(timeout=5)


if __name__ == "__main__":
    main()

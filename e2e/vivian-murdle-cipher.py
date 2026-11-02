from pathlib import Path
import os
import signal
import subprocess
import time
import urllib.request

from playwright.sync_api import expect, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "http://127.0.0.1:4174"


def wait_for_server() -> None:
    deadline = time.time() + 30
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(BASE_URL, timeout=1):
                return
        except Exception:
            time.sleep(0.25)
    raise RuntimeError("Servidor Vite não ficou disponível em 30 segundos")


def solve_basic(page, shift: str, answer: str) -> None:
    page.get_by_role("combobox", name="Chave do anel").select_option(shift)
    page.get_by_role("textbox", name="Resposta do bilhete").fill(answer)
    page.get_by_role("button", name="Decifrar bilhete", exact=True).click()


def solve_advanced(page, shift: str, phrase: str) -> None:
    page.get_by_role("combobox", name="Chave dinâmica do anel").select_option(shift)
    page.get_by_role("textbox", name="Frase completa do bilhete").fill(phrase)
    page.get_by_role("button", name="Decifrar bilhete", exact=True).click()


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
            "4174",
        ],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        preexec_fn=os.setsid,
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
            expect(start_investigation).to_be_visible(timeout=15000)
            start_investigation.click()

            puzzle = page.get_by_role("region", name="Minigame do decodificador Murdle")
            expect(puzzle).to_be_visible()
            expect(page.get_by_role("button", name="Nível 2 · Cifra avançada")).to_be_disabled()

            solve_basic(page, "3", "LAGO")
            solve_basic(page, "5", "ARQUIVO")
            solve_basic(page, "2", "HOSPITAL")
            expect(page.get_by_text("Nível básico concluído", exact=False)).to_be_visible()
            page.get_by_role("button", name="Avançar para a cifra avançada", exact=True).click()

            expect(page.get_by_role("combobox", name="Chave dinâmica do anel")).to_be_visible()
            solve_advanced(page, "7", "A FITA FOI ESCONDIDA NO LAGO")
            solve_advanced(page, "11", "A CARTA DEVE VOLTAR AO ARQUIVO")
            solve_advanced(page, "4", "A FOTOGRAFIA SEGUE PARA O HOSPITAL")

            expect(page.get_by_text("Código completo", exact=False)).to_be_visible()
            expect(page.get_by_text("Conferido", exact=True)).to_be_visible()
            stored_level = page.evaluate(
                "JSON.parse(localStorage.getItem('vivian-playable-investigation-v1')).murdleCipherLevel"
            )
            assert stored_level == 2, f"nível persistido inesperado: {stored_level}"
            print("E2E aprovado: os seis bilhetes foram decifrados e o nível avançado foi persistido.")
            browser.close()
    finally:
        os.killpg(server.pid, signal.SIGTERM)
        try:
            server.wait(timeout=10)
        except subprocess.TimeoutExpired:
            os.killpg(server.pid, signal.SIGKILL)
            server.wait(timeout=5)


if __name__ == "__main__":
    main()

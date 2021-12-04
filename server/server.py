"""
This module is where the application is configured.

To run with uvicorn cli, with hot reload:
    $ uvicorn server:app --reload --log-level info
"""
from app.program import build_app

try:
    import uvloop
except ModuleNotFoundError:
    print("[*] Running without `uvloop`")
else:
    uvloop.install()

app = build_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8080, log_level="debug")

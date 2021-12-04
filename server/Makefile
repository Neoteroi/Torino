.PHONY: test check-isort check-black


test:
	pytest tests/



test-cov:
	pytest --cov-report html --cov=blacksheep --disable-warnings


lint: check-flake8 check-isort check-black

format:
	@isort blacksheep 2>&1
	@isort tests 2>&1
	@isort itests 2>&1
	@black blacksheep 2>&1
	@black tests 2>&1
	@black itests 2>&1

check-flake8:
	@echo "$(BOLD)Checking flake8$(RESET)"
	@flake8 blacksheep 2>&1
	@flake8 tests 2>&1


check-isort:
	@echo "$(BOLD)Checking isort$(RESET)"
	@isort --check-only blacksheep 2>&1
	@isort --check-only tests 2>&1
	@isort --check-only itests 2>&1


check-black:  ## Run the black tool in check mode only (won't modify files)
	@echo "$(BOLD)Checking black$(RESET)"
	@black --check blacksheep 2>&1
	@black --check tests 2>&1
	@black --check itests 2>&1
